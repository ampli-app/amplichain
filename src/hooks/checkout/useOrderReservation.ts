
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrderData, OrderDetails } from './useOrderReservationType';
import { isValidUUID } from '@/utils/orderUtils';
import { toast } from '@/components/ui/use-toast';

export * from './useOrderReservationType';

export const useOrderReservation = ({ productId, isTestMode = false }: { productId: string, isTestMode?: boolean }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [reservationData, setReservationData] = useState<OrderData | null>(null);
  const [reservationExpiresAt, setReservationExpiresAt] = useState<string | null>(null);
  
  // Funkcja inicjująca nowe zamówienie
  const initiateOrder = useCallback(async (product: any) => {
    if (!product || !product.id) {
      console.error("Brak danych produktu");
      return null;
    }
    
    // Sprawdź poprawność ID produktu
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
      // Pobierz ID aktualnie zalogowanego użytkownika
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("Użytkownik nie jest zalogowany");
        toast({
          title: "Wymagane logowanie",
          description: "Aby dokonać zakupu, musisz być zalogowany.",
          variant: "destructive",
        });
        return null;
      }
      
      // Sprawdź, czy produkt istnieje w bazie
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', product.id)
        .single();
      
      if (productError || !productData) {
        console.error("Błąd podczas pobierania produktu:", productError);
        toast({
          title: "Błąd produktu",
          description: "Nie udało się pobrać informacji o produkcie. Spróbuj ponownie.",
          variant: "destructive",
        });
        return null;
      }
      
      // Określenie ID sprzedawcy
      const sellerId = productData.user_id;
      
      if (!sellerId) {
        console.error("Brak ID właściciela produktu");
        toast({
          title: "Błąd produktu",
          description: "Nie można określić właściciela produktu. Spróbuj ponownie.",
          variant: "destructive",
        });
        return null;
      }
      
      // Sprawdź, czy sprzedawca nie jest kupującym
      if (sellerId === user.id) {
        console.error("Użytkownik próbuje kupić własny produkt");
        toast({
          title: "Operacja niemożliwa",
          description: "Nie możesz kupić własnego produktu.",
          variant: "destructive",
        });
        return null;
      }
      
      // Anuluj wszystkie poprzednie rezerwacje tego produktu dla tego użytkownika
      await supabase
        .from('product_orders')
        .update({ 
          status: 'reservation_expired',
          updated_at: new Date().toISOString()
        })
        .eq('buyer_id', user.id)
        .eq('product_id', product.id)
        .eq('status', 'reserved');
      
      // Określ cenę na podstawie trybu (testowego lub normalnego)
      const price = isTestMode && productData.testing_price 
        ? parseFloat(productData.testing_price) 
        : parseFloat(productData.price);
      
      // Oblicz czas wygaśnięcia rezerwacji (10 minut od teraz)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      
      // Utwórz nową rezerwację
      const { data: orderData, error: orderError } = await supabase
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
      
      if (orderError || !orderData) {
        console.error("Błąd tworzenia rezerwacji:", orderError);
        toast({
          title: "Błąd rezerwacji",
          description: "Nie udało się utworzyć rezerwacji. Spróbuj ponownie.",
          variant: "destructive",
        });
        return null;
      }
      
      console.log("Utworzono rezerwację:", orderData);
      setReservationData(orderData);
      setReservationExpiresAt(orderData.reservation_expires_at);
      
      return orderData;
    } catch (err) {
      console.error("Nieoczekiwany błąd podczas tworzenia rezerwacji:", err);
      toast({
        title: "Błąd systemu",
        description: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isTestMode]);
  
  // Funkcja sprawdzająca istniejącą rezerwację
  const checkExistingReservation = useCallback(async () => {
    if (!productId || !isValidUUID(productId)) {
      console.log("Brak prawidłowego ID produktu");
      return null;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("Użytkownik nie jest zalogowany");
        return null;
      }
      
      console.log(`Sprawdzam istniejące rezerwacje dla produktu ${productId} i użytkownika ${user.id}`);
      
      const { data, error } = await supabase
        .from('product_orders')
        .select('*')
        .eq('buyer_id', user.id)
        .eq('product_id', productId)
        .eq('status', 'reserved')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
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
  }, [productId]);
  
  // Funkcja oznaczająca rezerwację jako wygasłą
  const markReservationAsExpired = useCallback(async (orderId: string) => {
    try {
      console.log(`Oznaczam rezerwację ${orderId} jako wygasłą`);
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
  
  // Funkcja potwierdzająca zamówienie
  const confirmOrder = async (orderDetails: OrderDetails) => {
    if (!reservationData) {
      console.error("Brak danych rezerwacji przy potwierdzaniu zamówienia");
      return false;
    }
    
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
  
  // Funkcja inicjująca płatność
  const initiatePayment = async () => {
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
          client_secret: 'mock_secret_' + Date.now().toString(),
          payment_intent_id: 'mock_intent_' + Date.now().toString()
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
  };
  
  // Funkcja obsługująca wynik płatności
  const handlePaymentResult = async (success: boolean) => {
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
  };
  
  // Sprawdzenie rezerwacji przy montowaniu komponentu
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
  
  return {
    isLoading,
    reservationData,
    reservationExpiresAt,
    initiateOrder,
    checkExistingReservation,
    markReservationAsExpired,
    confirmOrder,
    initiatePayment,
    handlePaymentResult,
    checkExpiredReservations
  };
};
