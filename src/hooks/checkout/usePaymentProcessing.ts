
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { PaymentIntentResponse, OrderData } from './useOrderReservationType';
import { formatAmount } from '@/utils/orderUtils';

export const usePaymentProcessing = () => {
  const [paymentIntentData, setPaymentIntentData] = useState<PaymentIntentResponse | null>(null);

  // Funkcja inicjująca płatność
  const initiatePayment = async (reservationData: OrderData | null, user: any) => {
    if (!reservationData || !user) return null;
    
    try {
      const { data: order, error: orderError } = await supabase
        .from('product_orders')
        .select(`
          *,
          products:product_id (
            title,
            image_url,
            price,
            testing_price
          )
        `)
        .eq('id', reservationData.id)
        .single();
      
      if (orderError) {
        console.error('Błąd pobierania danych zamówienia:', orderError);
        return null;
      }
      
      const productData = order.products as any;
      const productTitle = productData?.title || 'Produkt';
      const amount = parseFloat(order.total_amount) * 100; // Konwersja string na number i przeliczenie na grosze
      
      // Symulacja odpowiedzi z serwera płatności
      console.log('Symulacja płatności dla zamówienia:', order.id);
      
      const simulatedPayment = {
        payment_intent_id: `sim_${Math.random().toString(36).substring(2, 15)}`,
        client_secret: `sim_secret_${Math.random().toString(36).substring(2, 15)}`,
        amount: Math.round(amount),
        currency: 'pln'
      };
      
      console.log('Symulowana odpowiedź płatności:', simulatedPayment);
      
      setPaymentIntentData(simulatedPayment);
      return simulatedPayment as PaymentIntentResponse;
      
      /* 
      // ZAKOMENTOWANA INTEGRACJA ZE STRIPE
      
      // Wywołaj funkcję edge do obsługi płatności Stripe
      const { data, error } = await supabase.functions.invoke('stripe-payment', {
        body: {
          action: 'create_payment',
          data: {
            orderId: order.id,
            amount: Math.round(amount),
            currency: 'pln',
            description: `Zamówienie: ${productTitle}`,
            email: user.email,
            name: user.user_metadata?.full_name || user.email
          }
        }
      });
      
      if (error) {
        console.error('Błąd inicjowania płatności Stripe:', error);
        toast({
          title: "Błąd płatności",
          description: "Nie udało się zainicjować płatności Stripe.",
          variant: "destructive",
        });
        return null;
      }
      
      console.log("Odpowiedź z inicjowania płatności:", data);
      
      setPaymentIntentData(data);
      return data as PaymentIntentResponse;
      */
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas inicjowania płatności:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas inicjowania płatności.",
        variant: "destructive",
      });
      return null;
    }
  };
  
  // Funkcja obsługująca wynik płatności
  const handlePaymentResult = async (success: boolean, reservationData: OrderData | null, paymentIntentData: PaymentIntentResponse | null) => {
    if (!reservationData || !paymentIntentData) return false;
    
    try {
      // Symulacja sprawdzenia statusu płatności
      console.log('Symulacja sprawdzenia statusu płatności:', success ? 'succeeded' : 'failed');
      
      // Aktualizacja statusu zamówienia w bazie danych
      const { error } = await supabase
        .from('product_orders')
        .update({
          status: success ? 'payment_succeeded' : 'payment_failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', reservationData.id);
      
      if (error) {
        console.error('Błąd aktualizacji statusu zamówienia:', error);
        return false;
      }
      
      return true;
      
      /*
      // ZAKOMENTOWANA INTEGRACJA ZE STRIPE
      
      // Wywołanie funkcji edge do sprawdzenia statusu płatności
      const { data, error } = await supabase.functions.invoke('stripe-payment', {
        body: {
          action: 'check_payment_status',
          data: {
            paymentIntentId: paymentIntentData.payment_intent_id
          }
        }
      });
      
      if (error) {
        console.error('Błąd sprawdzania statusu płatności:', error);
        return false;
      }
      
      console.log("Status płatności:", data);
      
      return true;
      */
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas obsługi wyniku płatności:', err);
      return false;
    }
  };
  
  // Funkcja anulująca płatność
  const cancelPayment = async (paymentIntentData: PaymentIntentResponse | null) => {
    if (!paymentIntentData) return false;
    
    try {
      console.log('Symulacja anulowania płatności:', paymentIntentData.payment_intent_id);
      return true;
      
      /*
      // ZAKOMENTOWANA INTEGRACJA ZE STRIPE
      
      const { data, error } = await supabase.functions.invoke('stripe-payment', {
        body: {
          action: 'cancel_payment',
          data: {
            paymentIntentId: paymentIntentData.payment_intent_id
          }
        }
      });
      
      if (error) {
        console.error('Błąd anulowania płatności:', error);
        return false;
      }
      
      console.log("Anulowano płatność:", data);
      return true;
      */
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas anulowania płatności:', err);
      return false;
    }
  };

  return {
    paymentIntentData,
    initiatePayment,
    handlePaymentResult,
    cancelPayment
  };
};
