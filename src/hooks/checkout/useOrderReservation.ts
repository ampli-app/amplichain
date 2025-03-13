
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface OrderReservationProps {
  productId: string;
  isTestMode?: boolean;
}

export interface OrderData {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  reservation_expires_at?: string;
}

export interface PaymentIntentResponse {
  payment_intent_id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status?: string;
}

// Helper function to validate UUID format
const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const useOrderReservation = ({ productId, isTestMode = false }: OrderReservationProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [reservationData, setReservationData] = useState<OrderData | null>(null);
  const [reservationExpiresAt, setReservationExpiresAt] = useState<string | null>(null);
  const [paymentIntentData, setPaymentIntentData] = useState<PaymentIntentResponse | null>(null);
  
  // Sprawdź istniejącą rezerwację przy montowaniu komponentu
  useEffect(() => {
    if (user && productId && isValidUUID(productId)) {
      console.log("Sprawdzam istniejącą rezerwację dla:", productId);
      checkExistingReservation().then(data => {
        if (data) {
          console.log("Znaleziono istniejącą rezerwację po załadowaniu:", data);
        }
      });
    } else if (productId && !isValidUUID(productId)) {
      console.error("Nieprawidłowy format ID produktu:", productId);
    }
  }, [user?.id, productId]);
  
  const initiateOrder = useCallback(async (product: any, isTestMode: boolean) => {
    if (!user || !product) {
      console.error("Brak użytkownika lub produktu!");
      return null;
    }
    
    if (!isValidUUID(product.id)) {
      console.error("Nieprawidłowy format ID produktu:", product.id);
      toast({
        title: "Błąd produktu",
        description: "Nieprawidłowy format ID produktu. Prosimy o kontakt z administracją.",
        variant: "destructive",
      });
      return null;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Inicjowanie zamówienia dla produktu:", product.id);
      
      // Najpierw sprawdźmy, czy już istnieje aktywna rezerwacja dla tego użytkownika i produktu
      const existingReservation = await checkExistingReservation();
      if (existingReservation) {
        console.log("Używam istniejącej rezerwacji:", existingReservation);
        setIsLoading(false);
        return existingReservation;
      }
      
      // Najpierw upewnijmy się, że mamy ID właściciela produktu
      if (!product.user_id) {
        console.error('Brak ID właściciela produktu!');
        toast({
          title: "Błąd",
          description: "Nie można określić sprzedawcy dla tego produktu. Prosimy o kontakt z administracją.",
          variant: "destructive",
        });
        setIsLoading(false);
        return null;
      }
      
      const sellerId = product.user_id;
      const price = isTestMode && product.testing_price 
        ? parseFloat(product.testing_price) 
        : parseFloat(product.price);
      
      // Oblicz czas wygaśnięcia rezerwacji (15 minut od teraz)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);
      
      console.log("Tworzenie rezerwacji z parametrami:", {
        product_id: product.id,
        buyer_id: user.id,
        seller_id: sellerId,
        total_amount: price,
        status: 'reserved',
        order_type: isTestMode ? 'test' : 'purchase',
        reservation_expires_at: expiresAt.toISOString()
      });
      
      // Utwórz rezerwację zamówienia
      const { data, error } = await supabase
        .from('product_orders')
        .insert({
          product_id: product.id,
          buyer_id: user.id,
          seller_id: sellerId,
          total_amount: price,
          status: 'reserved',
          order_type: isTestMode ? 'test' : 'purchase',
          reservation_expires_at: expiresAt.toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Błąd tworzenia zamówienia:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się utworzyć zamówienia. Spróbuj ponownie.",
          variant: "destructive",
        });
        setIsLoading(false);
        return null;
      }
      
      console.log("Utworzono zamówienie:", data);
      
      setReservationData(data);
      if (data.reservation_expires_at) {
        setReservationExpiresAt(data.reservation_expires_at);
      }
      
      return data;
    } catch (err) {
      console.error('Nieoczekiwany błąd:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas tworzenia zamówienia.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, checkExistingReservation]);
  
  const checkExistingReservation = useCallback(async () => {
    if (!user || !productId || !isValidUUID(productId)) return null;
    
    try {
      const { data, error } = await supabase
        .from('product_orders')
        .select('*')
        .eq('buyer_id', user.id)
        .eq('product_id', productId)
        .eq('status', 'reserved')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log("Brak istniejących rezerwacji dla tego produktu");
          return null;
        }
        
        console.error('Błąd sprawdzania rezerwacji:', error);
        return null;
      }
      
      if (data) {
        console.log("Znaleziono istniejącą rezerwację:", data);
        
        // Sprawdź, czy rezerwacja nie wygasła
        const expiresAt = new Date(data.reservation_expires_at);
        const now = new Date();
        
        if (expiresAt > now) {
          console.log("Rezerwacja jest nadal aktywna, wygasa:", expiresAt);
          setReservationData(data);
          setReservationExpiresAt(data.reservation_expires_at);
          return data;
        } else {
          console.log("Rezerwacja wygasła, oznaczam jako nieaktywną");
          await markReservationAsExpired(data.id);
          return null;
        }
      }
      
      return null;
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas sprawdzania rezerwacji:', err);
      return null;
    }
  }, [user, productId, markReservationAsExpired]);
  
  const cancelPreviousReservations = useCallback(async () => {
    if (!user || !productId || !isValidUUID(productId)) return;
    
    try {
      const { error } = await supabase
        .from('product_orders')
        .update({ 
          status: 'reservation_expired',
          updated_at: new Date().toISOString()
        })
        .eq('buyer_id', user.id)
        .eq('product_id', productId)
        .eq('status', 'reserved');
      
      if (error) {
        console.error('Błąd anulowania poprzednich rezerwacji:', error);
      } else {
        console.log("Anulowano poprzednie rezerwacje");
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas anulowania rezerwacji:', err);
    }
  }, [user, productId]);
  
  const checkExpiredReservations = useCallback(async () => {
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
  }, []);
  
  const markReservationAsExpired = useCallback(async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('product_orders')
        .update({ 
          status: 'reservation_expired',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) {
        console.error('Błąd oznaczania rezerwacji jako wygasłej:', error);
        return false;
      }
      
      setReservationData(null);
      setReservationExpiresAt(null);
      return true;
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas oznaczania rezerwacji jako wygasłej:', err);
      return false;
    }
  }, []);
  
  const confirmOrder = async (orderDetails: {
    address: string;
    city: string;
    postalCode: string;
    comments?: string;
    paymentMethod: string;
  }) => {
    if (!reservationData || !user) return false;
    
    try {
      const { error } = await supabase
        .from('product_orders')
        .update({ 
          address: orderDetails.address,
          city: orderDetails.city,
          postal_code: orderDetails.postalCode,
          comments: orderDetails.comments,
          payment_method: orderDetails.paymentMethod,
          status: 'pending_payment',
          updated_at: new Date().toISOString()
        })
        .eq('id', reservationData.id);
      
      if (error) {
        console.error('Błąd potwierdzania zamówienia:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się potwierdzić zamówienia. Spróbuj ponownie.",
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas potwierdzania zamówienia:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas potwierdzania zamówienia.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const initiatePayment = async () => {
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
      const amount = order.total_amount * 100; // Stripe używa najmniejszych jednostek waluty (grosze)
      
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
  
  const handlePaymentResult = async (success: boolean) => {
    if (!reservationData || !paymentIntentData) return false;
    
    try {
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
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas obsługi wyniku płatności:', err);
      return false;
    }
  };
  
  const cancelPayment = async () => {
    if (!paymentIntentData) return false;
    
    try {
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
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas anulowania płatności:', err);
      return false;
    }
  };
  
  return {
    isLoading,
    reservationData,
    reservationExpiresAt,
    paymentIntentData,
    initiateOrder,
    confirmOrder,
    cancelPreviousReservations,
    markReservationAsExpired,
    checkExpiredReservations,
    checkExistingReservation,
    initiatePayment,
    handlePaymentResult,
    cancelPayment
  };
};
