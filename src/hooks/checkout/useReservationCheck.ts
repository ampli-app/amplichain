
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrderData } from './useOrderReservationType';
import { isValidUUID } from '@/utils/orderUtils';

export const useReservationCheck = ({
  productId,
  setReservationData,
  setReservationExpiresAt,
  markReservationAsExpired
}: {
  productId: string,
  setReservationData: (data: OrderData | null) => void,
  setReservationExpiresAt: (date: string | null) => void,
  markReservationAsExpired: (orderId: string) => Promise<boolean>
}) => {
  
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
  }, [productId, setReservationData, setReservationExpiresAt, markReservationAsExpired]);
  
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
    checkExistingReservation,
    checkExpiredReservations
  };
};
