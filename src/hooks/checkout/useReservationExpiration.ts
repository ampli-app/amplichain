
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useReservationExpiration = () => {
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
      
      return true;
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas oznaczania rezerwacji jako wygasłej:', err);
      return false;
    }
  }, []);
  
  return {
    markReservationAsExpired
  };
};
