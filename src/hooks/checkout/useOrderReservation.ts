import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface OrderReservationProps {
  productId: string;
  isTestMode?: boolean;
}

export function useOrderReservation({ productId, isTestMode = false }: OrderReservationProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [reservationData, setReservationData] = useState<any>(null);
  const [reservationExpiresAt, setReservationExpiresAt] = useState<Date | null>(null);
  const [paymentDeadline, setPaymentDeadline] = useState<Date | null>(null);
  const [paymentIntentData, setPaymentIntentData] = useState<any>(null);
  
  // Funkcja do sprawdzania i aktualizacji wygasłych rezerwacji
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
  
  // Sprawdzenie, czy istnieje aktywna rezerwacja
  const checkExistingReservation = async () => {
    if (!user || !productId) return null;
    
    try {
      setIsLoading(true);
      
      // Najpierw sprawdź i zaktualizuj wygasłe rezerwacje
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
        
        // Jeśli istnieją dane płatności Stripe
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
  
  // Anulowanie poprzednich rezerwacji, które mogły wygasnąć
  const cancelPreviousReservations = async () => {
    if (!user || !productId) return;
    
    try {
      console.log('Anulowanie poprzednich rezerwacji dla produktu:', productId);
      
      // Anuluj wszystkie poprzednie rezerwacje dla tego produktu
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
      
      // Resetujemy lokalne dane rezerwacji
      setReservationData(null);
      setReservationExpiresAt(null);
      setPaymentDeadline(null);
      setPaymentIntentData(null);
      
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas anulowania rezerwacji:', err);
    }
  };
  
  // Oznaczenie rezerwacji jako wygasłej
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
  
  // Inicjowanie nowej rezerwacji
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
      
      // Najpierw sprawdź i zaktualizuj wygasłe rezerwacje
      await checkExpiredReservations();
      
      // Sprawdź, czy istnieje aktywna rezerwacja
      const existingReservation = await checkExistingReservation();
      
      // Jeśli istnieje rezerwacja, sprawdź czy wygasła
      if (existingReservation) {
        const now = new Date();
        const expiresAt = existingReservation.reservation_expires_at 
          ? new Date(existingReservation.reservation_expires_at) 
          : null;
        
        // Jeśli rezerwacja jeszcze nie wygasła, zwróć ją
        if (expiresAt && expiresAt > now) {
          return existingReservation;
        }
        
        // Jeśli rezerwacja wygasła, anuluj ją
        await cancelPreviousReservations();
      }
      
      // Ustaw czas wygaśnięcia rezerwacji (10 minut)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      
      // Pobierz opcję dostawy (zakładamy, że istnieje domyślna opcja)
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
      
      // Oblicz cenę produktu w zależności od trybu
      const productPrice = testMode && product.testing_price 
        ? parseFloat(product.testing_price) 
        : parseFloat(product.price);
      
      // Oblicz łączną kwotę
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
      
      // Utwórz nowe zamówienie ze statusem "reserved"
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
  
  // Potwierdzenie zamówienia po wypełnieniu formularza
  const confirmOrder = async (formData: any) => {
    if (!reservationData || !reservationData.id) {
      toast({
        title: "Błąd",
        description: "Brak aktywnej rezerwacji do potwierdzenia.",
        variant: "destructive",
      });
      return false;
    }
    
    // Sprawdź, czy rezerwacja nie wygasła
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
      
      // Ustaw termin płatności (24 godziny)
      const paymentDeadlineDate = new Date();
      paymentDeadlineDate.setHours(paymentDeadlineDate.getHours() + 24);
      
      // Aktualizuj zamówienie
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
      
      // Aktualizuj lokalne dane
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
  
  // Inicjowanie płatności - teraz używamy funkcji Stripe
  const initiatePayment = async () => {
    if (!reservationData || !reservationData.id) {
      toast({
        title: "Błąd",
        description: "Brak aktywnego zamówienia do opłacenia.",
        variant: "destructive",
      });
      return null;
    }
    
    // Sprawdź, czy termin płatności nie upłynął
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
      
      // Aktualizacja statusu zamówienia na pending_payment
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
      
      // Pobranie profilu użytkownika dla email
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
      
      // Wywołanie funkcji do utworzenia intencji płatności Stripe
      const { data: paymentIntent, error: stripeError } = await supabase.rpc(
        'create_stripe_payment_intent',
        {
          p_order_id: reservationData.id,
          p_amount: Math.round(reservationData.total_amount * 100), // W groszach dla Stripe
          p_currency: 'pln',
          p_payment_method: reservationData.payment_method || 'card',
          p_description: `Zamówienie #${reservationData.id.substring(0, 8)}`,
          p_customer_email: customerEmail,
          p_customer_name: customerName
        }
      );
      
      if (stripeError) {
        console.error('Błąd podczas tworzenia intencji płatności Stripe:', stripeError);
        toast({
          title: "Błąd płatności",
          description: "Nie udało się zainicjować płatności przez Stripe.",
          variant: "destructive",
        });
        return null;
      }
      
      console.log('Utworzono intencję płatności Stripe:', paymentIntent);
      
      // Zapisz dane płatności lokalnie
      if (paymentIntent && typeof paymentIntent === 'object') {
        setPaymentIntentData({
          payment_intent_id: paymentIntent.payment_intent_id,
          client_secret: paymentIntent.client_secret,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        });
        
        // Aktualizuj lokalne dane rezerwacji
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
  
  // Obsługa wyniku płatności
  const handlePaymentResult = async (success: boolean) => {
    if (!reservationData || !reservationData.id) {
      return false;
    }
    
    try {
      setIsLoading(true);
      
      const newStatus = success ? 'payment_succeeded' : 'payment_failed';
      console.log(`Aktualizacja statusu zamówienia na: ${newStatus}`);
      
      // Aktualizacja statusu zamówienia
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
      
      // Jeśli istnieją dane płatności, aktualizuj status w tabeli stripe_payments
      if (paymentIntentData && paymentIntentData.payment_intent_id) {
        const { error: paymentError } = await supabase.rpc(
          'update_payment_status',
          {
            p_payment_intent_id: paymentIntentData.payment_intent_id,
            p_status: success ? 'succeeded' : 'failed'
          }
        );
        
        if (paymentError) {
          console.error('Błąd podczas aktualizacji statusu płatności w Stripe:', paymentError);
        } else {
          console.log('Status płatności Stripe zaktualizowany pomyślnie');
        }
      }
      
      // Aktualizuj lokalne dane
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
  
  // Sprawdź istniejącą rezerwację przy inicjalizacji
  useEffect(() => {
    if (user && productId) {
      // Najpierw sprawdź wygasłe rezerwacje, a następnie pobierz aktualne rezerwacje
      checkExpiredReservations().then(() => {
        checkExistingReservation();
      });
      
      // Ustawienie interwału sprawdzającego wygasłe rezerwacje co 30 sekund
      const intervalId = setInterval(() => {
        checkExpiredReservations().then(() => {
          checkExistingReservation();
        });
      }, 30000); // 30 sekund
      
      // Czyszczenie interwału po odmontowaniu komponentu
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
