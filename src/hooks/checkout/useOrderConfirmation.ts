
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrderData, OrderDetails } from './useOrderReservationType';
import { toast } from '@/components/ui/use-toast';

export const useOrderConfirmation = (reservationData: OrderData | null) => {
  // Funkcja potwierdzająca zamówienie
  const confirmOrder = useCallback(async (orderDetails: OrderDetails) => {
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
  }, [reservationData]);
  
  return {
    confirmOrder
  };
};
