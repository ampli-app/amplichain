
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface OrderReservationProps {
  productId: string;
  isTestMode?: boolean;
}

interface PaymentIntentResponse {
  payment_intent_id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export function useOrderReservation({ productId, isTestMode = false }: OrderReservationProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [reservationData, setReservationData] = useState<any>(null);
  const [reservationExpiresAt, setReservationExpiresAt] = useState<Date | null>(null);
  const [paymentDeadline, setPaymentDeadline] = useState<Date | null>(null);
  const [paymentIntentData, setPaymentIntentData] = useState<any>(null);
  
  const checkExpiredReservations = async () => {
    if (!user) return;
    
    try {
      console.log('Wywołuję procedurę cleanup_expired_orders...');
      const { data, error } = await supabase.rpc('cleanup_expired_orders');
      
      if (error) {
        console.error('Błąd podczas sprawdzania wygasłych rezerwacji:', error);
      } else {
        console.log('Sprawdzenie wygasłych rezerwacji zakończone pomyślnie', data);
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas sprawdzania wygasłych rezerwacji:', err);
    }
  };
  
  const checkExistingReservation = async () => {
    if (!user || !productId) return null;
    
    try {
      setIsLoading(true);
      
      await checkExpiredReservations();
      
      const { data, error } = await supabase
        .from('product_orders')
        .select(`
          *,
          stripe_payments(*)
        `)
        .eq('product_id', productId)
        .eq('buyer_id', user.id)
        .in('status', ['reserved', 'confirmed', 'oczekujące', 'pending_payment'])
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Błąd podczas sprawdzania istniejącej rezerwacji:', error);
        return null;
      }
      
      if (data && data.length > 0) {
        const order = data[0];
        setReservationData(order);
        
        if (order.reservation_expires_at) {
          setReservationExpiresAt(new Date(order.reservation_expires_at));
        }
        
        if (order.payment_deadline) {
          setPaymentDeadline(new Date(order.payment_deadline));
        }
        
        if (order.stripe_payments && order.stripe_payments.length > 0) {
          setPaymentIntentData(order.stripe_payments[0]);
        }
        
        return order;
      }
      
      return null;
    } catch (err) {
      console.error('Nieoczekiwany błąd:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const cancelPreviousReservations = async () => {
    if (!user || !productId) return;
    
    try {
      console.log('Anulowanie poprzednich rezerwacji dla produktu:', productId);
      
      const { error } = await supabase
        .from('product_orders')
        .update({ 
          status: 'reservation_expired',
          updated_at: new Date().toISOString()
        })
        .eq('product_id', productId)
        .eq('buyer_id', user.id)
        .in('status', ['reserved', 'confirmed'])
        .is('payment_status', null);
      
      if (error) {
        console.error('Błąd podczas anulowania poprzednich rezerwacji:', error);
      } else {
        console.log('Poprzednie rezerwacje oznaczone jako wygasłe pomyślnie');
      }
      
      setReservationData(null);
      setReservationExpiresAt(null);
      setPaymentDeadline(null);
      setPaymentIntentData(null);
      
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas anulowania rezerwacji:', err);
    }
  };
  
  const markReservationAsExpired = async (orderId: string) => {
    if (!user || !orderId) return false;
    
    try {
      console.log('Oznaczanie rezerwacji jako wygasłej, ID:', orderId);
      
      const { error } = await supabase
        .from('product_orders')
        .update({ 
          status: 'reservation_expired',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) {
        console.error('Błąd podczas oznaczania rezerwacji jako wygasłej:', error);
        return false;
      } else {
        console.log('Rezerwacja oznaczona jako wygasła pomyślnie');
        return true;
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas oznaczania rezerwacji jako wygasłej:', err);
      return false;
    }
  };
  
  const initiateOrder = async (product: any, testMode: boolean = false) => {
    if (!user || !productId || !product) {
      toast({
        title: "Błąd",
        description: "Nie można utworzyć rezerwacji. Brak wymaganych danych.",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      setIsLoading(true);
      
      await checkExpiredReservations();
      
      const existingReservation = await checkExistingReservation();
      
      if (existingReservation) {
        const now = new Date();
        const expiresAt = existingReservation.reservation_expires_at 
          ? new Date(existingReservation.reservation_expires_at) 
          : null;
        
        if (expiresAt && expiresAt > now) {
          return existingReservation;
        }
        
        await cancelPreviousReservations();
      }
      
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      
      const { data: deliveryOptions, error: deliveryError } = await supabase
        .from('delivery_options')
        .select('*')
        .eq('name', 'Kurier')
        .limit(1);
      
      if (deliveryError || !deliveryOptions || deliveryOptions.length === 0) {
        console.error('Błąd podczas pobierania opcji dostawy:', deliveryError);
        toast({
          title: "Błąd",
          description: "Nie można pobrać opcji dostawy.",
          variant: "destructive",
        });
        return null;
      }
      
      const productPrice = testMode && product.testing_price 
        ? parseFloat(product.testing_price) 
        : parseFloat(product.price);
      
      const totalAmount = productPrice + deliveryOptions[0].price;
      
      console.log("Tworzę zamówienie z parametrami:", {
        product_id: productId,
        buyer_id: user.id,
        seller_id: product.user_id,
        total_amount: totalAmount,
        delivery_option_id: deliveryOptions[0].id,
        status: 'reserved',
        reservation_expires_at: expiresAt.toISOString(),
        order_type: testMode ? 'test' : 'purchase'
      });
      
      const { data, error } = await supabase
        .from('product_orders')
        .insert([{
          product_id: productId,
          buyer_id: user.id,
          seller_id: product.user_id,
          total_amount: totalAmount,
          delivery_option_id: deliveryOptions[0].id,
          status: 'reserved',
          reservation_expires_at: expiresAt.toISOString(),
          order_type: testMode ? 'test' : 'purchase'
        }])
        .select();
      
      if (error) {
        console.error('Błąd podczas tworzenia rezerwacji:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się utworzyć rezerwacji.",
          variant: "destructive",
        });
        return null;
      }
      
      if (data && data.length > 0) {
        const reservation = data[0];
        setReservationData(reservation);
        setReservationExpiresAt(new Date(reservation.reservation_expires_at));
        
        toast({
          title: "Rezerwacja utworzona",
          description: "Masz 10 minut na dokończenie zamówienia.",
        });
        
        return reservation;
      }
      
      return null;
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas tworzenia rezerwacji:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas tworzenia rezerwacji.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const confirmOrder = async (formData: any) => {
    if (!reservationData || !reservationData.id) {
      toast({
        title: "Błąd",
        description: "Brak aktywnej rezerwacji do potwierdzenia.",
        variant: "destructive",
      });
      return false;
    }
    
    const now = new Date();
    if (reservationExpiresAt && reservationExpiresAt < now) {
      toast({
        title: "Rezerwacja wygasła",
        description: "Czas na wypełnienie formularza upłynął. Rozpocznij proces od nowa.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsLoading(true);
      
      const paymentDeadlineDate = new Date();
      paymentDeadlineDate.setHours(paymentDeadlineDate.getHours() + 24);
      
      const { error } = await supabase
        .from('product_orders')
        .update({
          status: 'confirmed',
          payment_deadline: paymentDeadlineDate.toISOString(),
          shipping_address: `${formData.address}, ${formData.postalCode} ${formData.city}`,
          shipping_method: reservationData.delivery_option_id,
          payment_method: formData.paymentMethod || 'card',
          notes: formData.comments || null
        })
        .eq('id', reservationData.id);
      
      if (error) {
        console.error('Błąd podczas potwierdzania zamówienia:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się potwierdzić zamówienia.",
          variant: "destructive",
        });
        return false;
      }
      
      setPaymentDeadline(paymentDeadlineDate);
      setReservationData({
        ...reservationData,
        status: 'confirmed',
        payment_deadline: paymentDeadlineDate.toISOString()
      });
      
      toast({
        title: "Zamówienie potwierdzone",
        description: "Masz 24 godziny na dokonanie płatności.",
      });
      
      return true;
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas potwierdzania zamówienia:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas potwierdzania zamówienia.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
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
      
      const { error: updateError } = await supabase
        .from('product_orders')
        .update({
          status: 'pending_payment'
        })
        .eq('id', reservationData.id);
      
      if (updateError) {
        console.error('Błąd podczas aktualizacji statusu płatności:', updateError);
        return null;
      }
      
      console.log('Status zamówienia zaktualizowany na pending_payment');
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();
        
      if (profileError) {
        console.error('Błąd podczas pobierania profilu użytkownika:', profileError);
      }
        
      const customerEmail = user?.email || '';
      const customerName = profileData?.full_name || '';
      
      // Użyj edge function zamiast RPC
      const response = await supabase.functions.invoke<PaymentIntentResponse>('stripe-payment', {
        body: {
          action: 'create_payment',
          data: {
            orderId: reservationData.id,
            amount: Math.round(reservationData.total_amount * 100),
            currency: 'pln',
            description: `Zamówienie #${reservationData.id.substring(0, 8)}`,
            email: customerEmail,
            name: customerName
          }
        }
      });
      
      if (response.error) {
        console.error('Błąd podczas tworzenia intencji płatności Stripe:', response.error);
        toast({
          title: "Błąd płatności",
          description: "Nie udało się zainicjować płatności przez Stripe.",
          variant: "destructive",
        });
        return null;
      }
      
      const paymentIntent = response.data;
      console.log('Utworzono intencję płatności Stripe:', paymentIntent);
      
      if (paymentIntent) {
        setPaymentIntentData({
          payment_intent_id: paymentIntent.payment_intent_id,
          client_secret: paymentIntent.client_secret,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        });
        
        setReservationData({
          ...reservationData,
          status: 'pending_payment',
          payment_intent_id: paymentIntent.payment_intent_id
        });
        
        return paymentIntent;
      }
      
      return null;
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
      console.log(`Aktualizacja statusu zamówienia na: ${newStatus}`);
      
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
      
      if (paymentIntentData && paymentIntentData.payment_intent_id) {
        // Użyj edge function zamiast RPC do aktualizacji statusu płatności
        const response = await supabase.functions.invoke('stripe-payment', {
          body: {
            action: success ? 'check_payment_status' : 'cancel_payment',
            data: {
              paymentIntentId: paymentIntentData.payment_intent_id
            }
          }
        });
        
        if (response.error) {
          console.error('Błąd podczas aktualizacji statusu płatności w Stripe:', response.error);
        } else {
          console.log('Status płatności Stripe zaktualizowany pomyślnie');
        }
      }
      
      setReservationData({
        ...reservationData,
        status: success ? 'zaakceptowane' : newStatus,
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
  
  useEffect(() => {
    if (user && productId) {
      checkExpiredReservations().then(() => {
        checkExistingReservation();
      });
      
      const intervalId = setInterval(() => {
        checkExpiredReservations().then(() => {
          checkExistingReservation();
        });
      }, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, [user, productId]);
  
  return {
    isLoading,
    reservationData,
    reservationExpiresAt,
    paymentDeadline,
    paymentIntentData,
    initiateOrder,
    confirmOrder,
    initiatePayment,
    handlePaymentResult,
    checkExistingReservation,
    cancelPreviousReservations,
    markReservationAsExpired,
    checkExpiredReservations
  };
}
