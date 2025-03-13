
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrderData } from './useOrderReservationType';
import { toast } from '@/components/ui/use-toast';

export const usePaymentInitiation = (reservationData: OrderData | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const initiatePayment = useCallback(async (paymentMethod: string) => {
    if (!reservationData) {
      console.error("Brak danych rezerwacji do zainicjowania płatności");
      setPaymentError("Brak danych rezerwacji");
      return null;
    }
    
    setIsLoading(true);
    setPaymentError(null);
    
    try {
      // Pobranie użytkownika
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setPaymentError("Użytkownik nie jest zalogowany");
        return null;
      }
      
      // Pobranie profilu użytkownika dla danych kontaktowych
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();
      
      // Utwórz intencję płatności w Stripe poprzez RPC
      const { data, error } = await supabase.rpc(
        'create_stripe_payment_intent',
        {
          p_order_id: reservationData.id,
          p_amount: Math.round(reservationData.total_amount * 100), // Konwersja na najmniejsze jednostki (grosze)
          p_currency: 'pln',
          p_payment_method: paymentMethod,
          p_description: `Zamówienie #${reservationData.id.substring(0, 8)}`,
          p_customer_email: user.email,
          p_customer_name: profileData?.full_name || ''
        }
      );
      
      if (error) {
        console.error("Błąd inicjacji płatności:", error);
        setPaymentError("Nie udało się zainicjować płatności");
        return null;
      }
      
      console.log("Utworzono intencję płatności:", data);
      
      // Aktualizuj zamówienie z danymi płatności
      await supabase
        .from('product_orders')
        .update({
          payment_method: paymentMethod,
          payment_intent_id: data.payment_intent_id,
          updated_at: new Date().toISOString(),
          status: 'pending_payment'
        })
        .eq('id', reservationData.id);
      
      return data;
      
    } catch (err) {
      console.error("Nieoczekiwany błąd podczas inicjowania płatności:", err);
      setPaymentError("Wystąpił nieoczekiwany błąd");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [reservationData]);
  
  const handlePaymentResult = useCallback(async (result: any) => {
    if (!reservationData) return;
    
    if (result.error) {
      console.error("Błąd płatności:", result.error);
      setPaymentError(result.error.message || "Wystąpił błąd podczas przetwarzania płatności");
      
      await supabase
        .from('product_orders')
        .update({
          status: 'payment_failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', reservationData.id);
      
      toast({
        title: "Błąd płatności",
        description: result.error.message || "Wystąpił błąd podczas przetwarzania płatności",
        variant: "destructive",
      });
      
      return false;
    }
    
    // Płatność zakończona sukcesem
    setPaymentSuccess(true);
    
    await supabase
      .from('product_orders')
      .update({
        status: 'payment_succeeded',
        updated_at: new Date().toISOString()
      })
      .eq('id', reservationData.id);
    
    toast({
      title: "Płatność zakończona",
      description: "Twoja płatność została zrealizowana pomyślnie",
    });
    
    return true;
  }, [reservationData]);
  
  return {
    isLoading,
    paymentError,
    paymentSuccess,
    initiatePayment,
    handlePaymentResult
  };
};
