
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrderData } from './useOrderReservationType';
import { toast } from '@/components/ui/use-toast';

export const usePaymentInitiation = (reservationData: OrderData | null) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Funkcja inicjująca płatność
  const initiatePayment = useCallback(async () => {
    if (!reservationData) {
      console.error("Brak danych rezerwacji przy inicjowaniu płatności");
      return null;
    }
    
    setIsLoading(true);
    
    try {
      // Pobierz aktualne dane użytkownika
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("Użytkownik nie jest zalogowany");
        toast({
          title: "Wymagane logowanie",
          description: "Aby dokonać płatności, musisz być zalogowany.",
          variant: "destructive",
        });
        return null;
      }
      
      // Przygotuj dane dla płatności
      const amountInSmallestUnit = Math.round(reservationData.total_amount * 100); // Konwersja na grosze
      
      // Tworzenie intencji płatności
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: reservationData.id,
          amount: reservationData.total_amount,
          payment_method: 'stripe',
          status: 'created',
          client_secret: 'mock_secret_' + Date.now().toString(), // Konwersja na string
          payment_intent_id: 'mock_intent_' + Date.now().toString() // Konwersja na string
        })
        .select()
        .single();
      
      if (paymentError || !paymentData) {
        console.error('Błąd tworzenia intencji płatności:', paymentError);
        toast({
          title: "Błąd płatności",
          description: "Nie udało się zainicjować płatności. Spróbuj ponownie.",
          variant: "destructive",
        });
        return null;
      }
      
      return paymentData;
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas inicjowania płatności:', err);
      toast({
        title: "Błąd systemu",
        description: "Wystąpił nieoczekiwany błąd podczas inicjowania płatności.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [reservationData]);
  
  // Funkcja obsługująca wynik płatności
  const handlePaymentResult = useCallback(async (success: boolean) => {
    if (!reservationData) {
      console.error("Brak danych rezerwacji przy aktualizacji płatności");
      return false;
    }
    
    try {
      if (success) {
        // Aktualizacja statusu zamówienia
        const { error } = await supabase
          .from('product_orders')
          .update({
            status: 'payment_succeeded',
            payment_status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('id', reservationData.id);
        
        if (error) {
          console.error('Błąd aktualizacji statusu zamówienia:', error);
          return false;
        }
        
        return true;
      } else {
        // Aktualizacja statusu przy niepowodzeniu
        const { error } = await supabase
          .from('product_orders')
          .update({
            status: 'payment_failed',
            payment_status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', reservationData.id);
        
        if (error) {
          console.error('Błąd aktualizacji statusu zamówienia przy niepowodzeniu:', error);
        }
        
        return false;
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas aktualizacji statusu płatności:', err);
      return false;
    }
  }, [reservationData]);
  
  return {
    isLoading,
    initiatePayment,
    handlePaymentResult
  };
};
