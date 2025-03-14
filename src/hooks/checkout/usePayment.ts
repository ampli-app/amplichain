
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ReservationData, PaymentIntent, PaymentResult, PaymentFormData } from './reservation/types';

export function usePayment() {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  const initiatePayment = async (
    reservationData: ReservationData | null,
    paymentDeadline: Date | null
  ): Promise<PaymentIntent | null> => {
    if (!reservationData || !reservationData.id) {
      toast({
        title: "Błąd",
        description: "Brak aktywnego zamówienia do opłacenia.",
        variant: "destructive",
      });
      return null;
    }
    
    const now = new Date();
    if (paymentDeadline && paymentDeadline < now) {
      toast({
        title: "Termin płatności upłynął",
        description: "Czas na dokonanie płatności upłynął. Rozpocznij proces od nowa.",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      setIsProcessingPayment(true);
      setPaymentError(null);
      
      // Pobieranie aktualnego stanu zamówienia
      const { data: currentOrder, error: fetchError } = await supabase
        .from('product_orders')
        .select('*')
        .eq('id', reservationData.id)
        .single();
      
      if (fetchError) {
        console.error('Błąd podczas pobierania aktualnych danych zamówienia:', fetchError);
        setPaymentError('Nie udało się pobrać aktualnych danych zamówienia.');
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać aktualnych danych zamówienia.",
          variant: "destructive",
        });
        return null;
      }
      
      // Aktualizacja statusu zamówienia na awaiting_payment
      const { error } = await supabase
        .from('product_orders')
        .update({
          status: 'awaiting_payment'
        })
        .eq('id', reservationData.id);
      
      if (error) {
        console.error('Błąd podczas aktualizacji statusu płatności:', error);
        setPaymentError('Nie udało się zaktualizować statusu płatności.');
        toast({
          title: "Błąd",
          description: "Nie udało się zaktualizować statusu płatności.",
          variant: "destructive",
        });
        return null;
      }
      
      // Używamy aktualnej kwoty z bazy danych
      const totalAmount = currentOrder.total_amount;
      
      // Tworzymy tymczasowy payment intent (w przyszłości będzie to Stripe PaymentIntent)
      const paymentIntent: PaymentIntent = {
        id: `pi_${Math.random().toString(36).substring(2, 15)}`,
        client_secret: `cs_${Math.random().toString(36).substring(2, 15)}`,
        amount: totalAmount * 100,
        currency: 'pln'
      };
      
      // Zapisujemy informacje o płatności
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert([{
          order_id: reservationData.id,
          payment_intent_id: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
          amount: totalAmount,
          status: 'pending',
          payment_method: currentOrder.payment_method
        }])
        .select();
      
      if (paymentError) {
        console.error('Błąd podczas zapisywania informacji o płatności:', paymentError);
      }
      
      return paymentIntent;
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas inicjowania płatności:', err);
      setPaymentError('Wystąpił nieoczekiwany błąd podczas inicjowania płatności.');
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas inicjowania płatności.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessingPayment(false);
    }
  };
  
  const handlePaymentResult = async (
    success: boolean,
    reservationData: ReservationData | null
  ): Promise<boolean> => {
    if (!reservationData || !reservationData.id) {
      return false;
    }
    
    try {
      setIsProcessingPayment(true);
      setPaymentError(null);
      
      const newStatus = success ? 'payment_succeeded' : 'payment_failed';
      
      const { error } = await supabase
        .from('product_orders')
        .update({
          status: newStatus,
          payment_status: success ? 'paid' : 'failed'
        })
        .eq('id', reservationData.id);
      
      if (error) {
        console.error('Błąd podczas aktualizacji statusu płatności:', error);
        setPaymentError('Nie udało się zaktualizować statusu płatności.');
        return false;
      }
      
      if (reservationData.payment_intent_id) {
        await supabase
          .from('payments')
          .update({
            status: success ? 'succeeded' : 'failed'
          })
          .eq('payment_intent_id', reservationData.payment_intent_id);
      }
      
      return true;
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas aktualizacji wyniku płatności:', err);
      setPaymentError('Wystąpił nieoczekiwany błąd podczas aktualizacji wyniku płatności.');
      return false;
    } finally {
      setIsProcessingPayment(false);
    }
  };
  
  // Symulacja procesu płatności (do zastąpienia przez Stripe)
  const simulatePaymentProcessing = async (
    paymentData: PaymentFormData,
    reservationData: ReservationData | null,
    onComplete: (result: PaymentResult) => void
  ) => {
    if (!reservationData) {
      onComplete({
        success: false,
        message: "Brak aktywnego zamówienia"
      });
      return;
    }
    
    setIsProcessingPayment(true);
    
    // W kontekście integracji z rzeczywistym systemem płatności,
    // tutaj następowałoby przekierowanie do strony płatności
    // lub przetwarzanie płatności przez Stripe, Przelewy24, itp.
    
    // Symulujemy opóźnienie przetwarzania płatności
    setTimeout(() => {
      // W symulacji zakładamy udaną płatność (w rzeczywistym przypadku będzie to odpowiedź z Stripe)
      const success = true;
      
      handlePaymentResult(success, reservationData).then(() => {
        setIsProcessingPayment(false);
        
        if (success) {
          onComplete({
            success: true,
            message: "Płatność zakończona pomyślnie",
            redirectUrl: `/checkout/success/${reservationData.product_id}`
          });
        } else {
          onComplete({
            success: false,
            message: "Błąd płatności. Spróbuj ponownie."
          });
        }
      });
    }, 2000);
  };
  
  return {
    initiatePayment,
    handlePaymentResult,
    simulatePaymentProcessing,
    isProcessingPayment,
    paymentError
  };
}
