
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function useReservationCleanup({ productId }: { productId: string }) {
  const { user } = useAuth();
  
  const checkExpiredReservations = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase.rpc('cleanup_expired_orders');
      
      if (error) {
        console.error('Błąd podczas sprawdzania wygasłych rezerwacji:', error);
      } else {
        console.log('Sprawdzenie wygasłych rezerwacji zakończone pomyślnie');
      }

      // Dodatkowo sprawdzamy i aktualizujemy status produktów, których rezerwacje wygasły
      const { data: expiredOrders, error: expiredError } = await supabase
        .from('product_orders')
        .select('product_id')
        .eq('status', 'reservation_expired');
        
      if (!expiredError && expiredOrders && expiredOrders.length > 0) {
        const productIds = expiredOrders.map(order => order.product_id);
        
        // Aktualizuj produkty związane z wygasłymi rezerwacjami
        const { error: updateError } = await supabase
          .from('products')
          .update({ status: 'available' })
          .in('id', productIds)
          .eq('status', 'reserved');
          
        if (updateError) {
          console.error('Błąd podczas aktualizacji statusów produktów:', updateError);
        } else {
          console.log(`Zaktualizowano statusy ${productIds.length} produktów na "available"`);
        }
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas sprawdzania wygasłych rezerwacji:', err);
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
        
        // Przywróć status produktu na "available"
        const { error: productUpdateError } = await supabase
          .from('products')
          .update({ status: 'available' })
          .eq('id', productId)
          .eq('status', 'reserved');
          
        if (productUpdateError) {
          console.error('Błąd podczas przywracania statusu produktu:', productUpdateError);
        } else {
          console.log('Status produktu przywrócony na "available"');
        }
      }
      
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas anulowania rezerwacji:', err);
    }
  };
  
  const markReservationAsExpired = async (reservationId: string) => {
    if (!reservationId) return;
    
    try {
      const { data: reservation, error: getReservationError } = await supabase
        .from('product_orders')
        .select('product_id')
        .eq('id', reservationId)
        .single();
        
      if (getReservationError) {
        console.error('Błąd podczas pobierania informacji o rezerwacji:', getReservationError);
        return;
      }
      
      const { error: updateError } = await supabase
        .from('product_orders')
        .update({ status: 'reservation_expired' })
        .eq('id', reservationId);
        
      if (updateError) {
        console.error('Błąd podczas aktualizacji statusu rezerwacji:', updateError);
        return;
      }
      
      if (reservation && reservation.product_id) {
        const { error: productUpdateError } = await supabase
          .from('products')
          .update({ status: 'available' })
          .eq('id', reservation.product_id)
          .eq('status', 'reserved');
          
        if (productUpdateError) {
          console.error('Błąd podczas przywracania statusu produktu:', productUpdateError);
        } else {
          console.log('Status produktu przywrócony na "available"');
        }
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas oznaczania rezerwacji jako wygasłej:', err);
    }
  };
  
  // Setup interval to check for expired reservations
  useEffect(() => {
    if (user && productId) {
      checkExpiredReservations();
      
      const intervalId = setInterval(checkExpiredReservations, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, [user, productId]);
  
  return {
    checkExpiredReservations,
    cancelPreviousReservations,
    markReservationAsExpired
  };
}
