
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
      
      const paymentIntent = {
        id: `pi_${Math.random().toString(36).substring(2, 15)}`,
        client_secret: `cs_${Math.random().toString(36).substring(2, 15)}`,
        amount: reservationData.total_amount * 100,
        currency: 'pln'
      };
      
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert([{
          order_id: reservationData.id,
          payment_intent_id: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
          amount: reservationData.total_amount,
          status: 'pending',
          payment_method: reservationData.payment_method
        }])
        .select();
      
      if (paymentError) {
        console.error('Błąd podczas zapisywania informacji o płatności:', paymentError);
      }
      
      setReservationData({
        ...reservationData,
        status: 'pending_payment',
        payment_intent_id: paymentIntent.id
      });
      
      return paymentIntent;
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
  
  return {
    initiatePayment,
    handlePaymentResult
  };
}
