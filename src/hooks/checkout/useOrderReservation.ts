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
  
  // Sprawdzenie, czy istnieje aktywna rezerwacja
  const checkExistingReservation = async () => {
    if (!user || !productId) return null;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('product_orders')
        .select('*')
        .eq('product_id', productId)
        .eq('buyer_id', user.id)
        .in('status', ['reserved', 'confirmed'])
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Błąd podczas sprawdzania istniejącej rezerwacji:', error);
        return null;
      }
      
      if (data && data.length > 0) {
        setReservationData(data[0]);
        
        if (data[0].reservation_expires_at) {
          setReservationExpiresAt(new Date(data[0].reservation_expires_at));
        }
        
        if (data[0].payment_deadline) {
          setPaymentDeadline(new Date(data[0].payment_deadline));
        }
        
        return data[0];
      }
      
      return null;
    } catch (err) {
      console.error('Nieoczekiwany błąd:', err);
      return null;
    } finally {
      setIsLoading(false);
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
      
      // Sprawdź, czy istnieje aktywna rezerwacja
      const existingReservation = await checkExistingReservation();
      if (existingReservation) {
        return existingReservation;
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
  
  // Inicjowanie płatności
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
      
      // Aktualizacja statusu zamówienia
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
      
      // W rzeczywistym systemie, tutaj nastąpiłoby wywołanie API Stripe
      // dla uproszczenia, symulujemy proces płatności
      
      // Symulacja PaymentIntent
      const paymentIntent = {
        id: `pi_${Math.random().toString(36).substring(2, 15)}`,
        client_secret: `cs_${Math.random().toString(36).substring(2, 15)}`,
        amount: reservationData.total_amount * 100, // Stripe używa jednostek (grosze)
        currency: 'pln'
      };
      
      // Zapisz informację o płatności
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
      
      // Aktualizuj lokalne dane
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
  
  // Obsługa wyniku płatności
  const handlePaymentResult = async (success: boolean) => {
    if (!reservationData || !reservationData.id) {
      return false;
    }
    
    try {
      setIsLoading(true);
      
      const newStatus = success ? 'payment_succeeded' : 'payment_failed';
      
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
      
      // Aktualizacja statusu płatności
      if (reservationData.payment_intent_id) {
        await supabase
          .from('payments')
          .update({
            status: success ? 'succeeded' : 'failed'
          })
          .eq('payment_intent_id', reservationData.payment_intent_id);
      }
      
      // Aktualizuj lokalne dane
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
  
  // Sprawdź istniejącą rezerwację przy inicjalizacji
  useEffect(() => {
    if (user && productId) {
      checkExistingReservation();
    }
  }, [user, productId]);
  
  return {
    isLoading,
    reservationData,
    reservationExpiresAt,
    paymentDeadline,
    initiateOrder,
    confirmOrder,
    initiatePayment,
    handlePaymentResult,
    checkExistingReservation
  };
}
