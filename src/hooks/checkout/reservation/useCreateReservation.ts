
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ReservationData } from './types';

export function useCreateReservation({
  productId,
  setReservationData,
  setReservationExpiresAt,
  setIsLoading
}: {
  productId: string;
  setReservationData: (data: ReservationData | null) => void;
  setReservationExpiresAt: (date: Date | null) => void;
  setIsLoading: (loading: boolean) => void;
}) {
  const { user } = useAuth();

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
  
  return {
    initiateOrder
  };
}
