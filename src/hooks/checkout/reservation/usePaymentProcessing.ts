
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ReservationData } from './types';

export function usePaymentProcessing({
  reservationData,
  paymentDeadline,
  setReservationData,
  setIsLoading
}: {
  reservationData: ReservationData | null;
  paymentDeadline: Date | null;
  setReservationData: (data: ReservationData | null) => void;
  setIsLoading: (loading: boolean) => void;
}) {

  const initiatePayment = async () => {
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
      setIsLoading(true);
      
      // Najpierw pobierzmy aktualny stan zamówienia, aby mieć wszystkie informacje
      const { data: currentOrder, error: fetchError } = await supabase
        .from('product_orders')
        .select('*')
        .eq('id', reservationData.id)
        .single();
      
      if (fetchError) {
        console.error('Błąd podczas pobierania aktualnych danych zamówienia:', fetchError);
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać aktualnych danych zamówienia.",
          variant: "destructive",
        });
        return null;
      }
      
      // Aktualizujemy status na pending_payment
      const { error } = await supabase
        .from('product_orders')
        .update({
          status: 'pending_payment'
        })
        .eq('id', reservationData.id);
      
      if (error) {
        console.error('Błąd podczas aktualizacji statusu płatności:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się zaktualizować statusu płatności.",
          variant: "destructive",
        });
        return null;
      }
      
      // Używamy aktualnej kwoty z bazy danych, która powinna zawierać wszystkie składniki ceny
      const totalAmount = currentOrder.total_amount;
      
      // Pobierz dane użytkownika do przekazania do Stripe
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', currentOrder.buyer_id)
        .single();
      
      if (userError) {
        console.error('Błąd podczas pobierania danych użytkownika:', userError);
      }
      
      // Tworzenie sesji płatności Stripe przez edge function
      try {
        console.log('Rozpoczynam tworzenie sesji płatności Stripe dla zamówienia:', reservationData.id);
        console.log('Kwota płatności (w groszach):', Math.round(totalAmount * 100));
        console.log('Metoda płatności:', currentOrder.payment_method || 'card');
        
        const stripeResponse = await supabase.functions.invoke('stripe-payment', {
          body: {
            orderId: reservationData.id,
            amount: Math.round(totalAmount * 100), // Stripe wymaga kwoty w groszach
            currency: 'pln',
            paymentMethod: currentOrder.payment_method || 'card',
            customerEmail: userData?.email || '',
            customerName: userData?.full_name || '',
            description: `Zamówienie #${reservationData.id.substring(0, 8)}`
          }
        });
        
        if (stripeResponse.error) {
          console.error('Błąd odpowiedzi ze Stripe:', stripeResponse.error);
          throw new Error(stripeResponse.error.message || 'Błąd podczas tworzenia sesji płatności');
        }
        
        console.log('Odpowiedź ze Stripe:', stripeResponse.data);
        
        if (!stripeResponse.data || !stripeResponse.data.url) {
          console.error('Nieprawidłowa odpowiedź ze Stripe - brak URL:', stripeResponse.data);
          throw new Error('Nieprawidłowa odpowiedź ze Stripe - brak URL do płatności');
        }
        
        // Aktualizuj dane zamówienia z informacjami ze Stripe
        await supabase
          .from('product_orders')
          .update({
            payment_intent_id: stripeResponse.data.payment_intent_id,
            stripe_session_id: stripeResponse.data.session_id,
            stripe_checkout_url: stripeResponse.data.url
          })
          .eq('id', reservationData.id);
        
        setReservationData({
          ...reservationData,
          status: 'pending_payment',
          payment_intent_id: stripeResponse.data.payment_intent_id,
          stripe_session_id: stripeResponse.data.session_id,
          stripe_checkout_url: stripeResponse.data.url
        });
        
        // Dodaję bezpośrednie przekierowanie zamiast przypisania do window.location.href
        // co może być blokowane przez niektóre przeglądarki
        console.log('Przekierowuję użytkownika do strony płatności Stripe:', stripeResponse.data.url);
        window.open(stripeResponse.data.url, '_self');
        
        return stripeResponse.data;
      } catch (stripeError) {
        console.error('Błąd podczas integracji ze Stripe:', stripeError);
        toast({
          title: "Błąd płatności",
          description: `Nie udało się uruchomić płatności: ${stripeError instanceof Error ? stripeError.message : 'Nieznany błąd'}`,
          variant: "destructive",
        });
        return null;
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas inicjowania płatności:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas inicjowania płatności.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePaymentResult = async (success: boolean) => {
    if (!reservationData || !reservationData.id) {
      return false;
    }
    
    try {
      setIsLoading(true);
      
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
      
      setReservationData({
        ...reservationData,
        status: newStatus,
        payment_status: success ? 'paid' : 'failed'
      });
      
      return true;
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas aktualizacji wyniku płatności:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkPaymentStatus = async () => {
    if (!reservationData || !reservationData.id || !reservationData.payment_intent_id) {
      return null;
    }
    
    try {
      setIsLoading(true);
      
      // Sprawdź status płatności przez funkcję edge
      const statusResponse = await supabase.functions.invoke('stripe-payment', {
        body: {
          action: 'check_status',
          paymentIntentId: reservationData.payment_intent_id
        }
      });
      
      if (statusResponse.error) {
        console.error('Błąd podczas sprawdzania statusu płatności:', statusResponse.error);
        return null;
      }
      
      const paymentStatus = statusResponse.data?.status;
      
      // Aktualizuj status płatności w bazie danych
      if (paymentStatus) {
        if (paymentStatus === 'succeeded') {
          await handlePaymentResult(true);
        } else if (paymentStatus === 'canceled' || paymentStatus === 'failed') {
          await handlePaymentResult(false);
        }
        
        return paymentStatus;
      }
      
      return null;
    } catch (err) {
      console.error('Błąd podczas sprawdzania statusu płatności:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    initiatePayment,
    handlePaymentResult,
    checkPaymentStatus
  };
}
