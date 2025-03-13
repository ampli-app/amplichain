
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrderData, OrderDetails } from './useOrderReservationType';
import { isValidUUID } from '@/utils/orderUtils';
import { toast } from '@/components/ui/use-toast';

export const useReservationManagement = (userId: string | undefined) => {
  const [reservationData, setReservationData] = useState<OrderData | null>(null);
  const [reservationExpiresAt, setReservationExpiresAt] = useState<string | null>(null);
  
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
  
  // Funkcja sprawdzająca wygasłe rezerwacje
  const checkExpiredReservations = useCallback(async () => {
    if (!userId) {
      console.log("Brak ID użytkownika, pomijam sprawdzanie wygasłych rezerwacji");
      return;
    }
    
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
  }, [userId]);
  
  // Funkcja sprawdzająca istniejące rezerwacje
  const checkExistingReservation = useCallback(async (productId: string) => {
    if (!userId || !productId || !isValidUUID(productId)) {
      console.log("Brak użytkownika lub nieprawidłowy ID produktu");
      return null;
    }
    
    try {
      console.log(`Sprawdzam istniejące rezerwacje dla produktu ${productId} i użytkownika ${userId}`);
      
      // Używam maybeSingle() zamiast single() - nie zwraca błędu gdy nie ma danych
      const { data, error } = await supabase
        .from('product_orders')
        .select('*')
        .eq('buyer_id', userId)
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
      } else {
        console.log("Brak istniejących rezerwacji dla tego produktu");
      }
      
      return null;
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas sprawdzania rezerwacji:', err);
      return null;
    }
  }, [userId, markReservationAsExpired]);
  
  // Funkcja anulująca poprzednie rezerwacje
  const cancelPreviousReservations = useCallback(async (productId: string) => {
    if (!userId || !productId || !isValidUUID(productId)) return;
    
    try {
      console.log(`Anuluję poprzednie rezerwacje dla produktu ${productId} i użytkownika ${userId}`);
      const { error } = await supabase
        .from('product_orders')
        .update({ 
          status: 'reservation_expired',
          updated_at: new Date().toISOString()
        })
        .eq('buyer_id', userId)
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
  }, [userId]);

  // Funkcja inicjująca zamówienie
  const initiateOrder = useCallback(async (product: any, isTestMode: boolean) => {
    if (!userId || !product) {
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
    
    try {
      console.log("Inicjowanie zamówienia dla produktu:", product.id);
      console.log("Dane produktu:", product);
      
      // Najpierw sprawdźmy, czy już istnieje aktywna rezerwacja dla tego użytkownika i produktu
      const existingReservation = await checkExistingReservation(product.id);
      if (existingReservation) {
        console.log("Używam istniejącej rezerwacji:", existingReservation);
        setReservationData(existingReservation);
        setReservationExpiresAt(existingReservation.reservation_expires_at);
        return existingReservation;
      }
      
      // Upewnijmy się, że mamy ID właściciela produktu
      let sellerId = null;
      if (product.user_id) {
        sellerId = product.user_id;
      } else if (product.owner_id) {
        sellerId = product.owner_id;
      } else {
        // Jeśli nie mamy ID właściciela, spróbujmy pobrać produkt z bazy danych
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('user_id')
          .eq('id', product.id)
          .single();
          
        if (productError) {
          console.error('Błąd pobierania informacji o produkcie:', productError);
          toast({
            title: "Błąd",
            description: "Nie można określić sprzedawcy dla tego produktu. Prosimy o kontakt z administracją.",
            variant: "destructive",
          });
          return null;
        }
        
        if (productData) {
          sellerId = productData.user_id;
        }
      }
      
      if (!sellerId) {
        console.error('Brak ID właściciela produktu!', product);
        toast({
          title: "Błąd",
          description: "Nie można określić sprzedawcy dla tego produktu. Prosimy o kontakt z administracją.",
          variant: "destructive",
        });
        return null;
      }
      
      const price = isTestMode && product.testing_price 
        ? parseFloat(product.testing_price) 
        : parseFloat(product.price);
      
      // Oblicz czas wygaśnięcia rezerwacji (15 minut od teraz)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);
      
      console.log("Tworzenie rezerwacji z parametrami:", {
        product_id: product.id,
        buyer_id: userId,
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
          buyer_id: userId,
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
        return null;
      }
      
      console.log("Utworzono zamówienie:", data);
      
      setReservationData(data);
      if (data.reservation_expires_at) {
        setReservationExpiresAt(data.reservation_expires_at);
      }
      
      return data;
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas tworzenia zamówienia:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas tworzenia zamówienia.",
        variant: "destructive",
      });
      return null;
    }
  }, [userId, checkExistingReservation]);
  
  // Funkcja potwierdzająca zamówienie
  const confirmOrder = async (orderDetails: OrderDetails) => {
    if (!reservationData) return false;
    
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

  return {
    reservationData,
    reservationExpiresAt,
    setReservationData,
    setReservationExpiresAt,
    markReservationAsExpired,
    checkExpiredReservations,
    checkExistingReservation,
    cancelPreviousReservations,
    initiateOrder,
    confirmOrder
  };
};
