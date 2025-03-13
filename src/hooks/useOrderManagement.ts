
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface Order {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  product_title: string;
  product_image: string;
  notes?: string;
  tracking_number?: string;
  reservation_expires_at?: string;
  order_type: string;
}

export interface OrderStatusUpdate {
  orderId: string;
  status: string;
  trackingNumber?: string;
  notes?: string;
}

export function useOrderManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const fetchOrders = async (asBuyer: boolean = true) => {
    setIsLoading(true);
    
    try {
      const userField = asBuyer ? 'buyer_id' : 'seller_id';
      
      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data.user) {
        console.error('Błąd autoryzacji:', error);
        toast({
          title: "Błąd",
          description: "Wystąpił problem z autoryzacją. Spróbuj zalogować się ponownie.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const userId = data.user.id;
      
      // Pobierz zamówienia wraz z danymi produktu
      const { data: ordersData, error: ordersError } = await supabase
        .from('product_orders')
        .select(`
          *,
          products:product_id (
            title,
            image_url
          )
        `)
        .eq(userField, userId)
        .order('updated_at', { ascending: false });
      
      if (ordersError) {
        console.error('Błąd pobierania zamówień:', ordersError);
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać danych zamówień.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Przekształć dane, dodając tytuł i zdjęcie produktu bezpośrednio do obiektu zamówienia
      const formattedOrders = ordersData.map(order => {
        const productData = order.products as any;
        let productImage = '/placeholder.svg';
        
        if (productData?.image_url) {
          try {
            if (typeof productData.image_url === 'string') {
              try {
                const images = JSON.parse(productData.image_url);
                if (Array.isArray(images) && images.length > 0) {
                  productImage = images[0];
                }
              } catch (e) {
                productImage = productData.image_url;
              }
            } else if (Array.isArray(productData.image_url) && productData.image_url.length > 0) {
              productImage = productData.image_url[0];
            }
          } catch (e) {
            console.error("Błąd parsowania URL obrazka:", e);
          }
        }
        
        return {
          ...order,
          product_title: productData?.title || 'Nieznany produkt',
          product_image: productImage
        } as Order;
      });
      
      setOrders(formattedOrders);
    } catch (err) {
      console.error('Nieoczekiwany błąd pobierania zamówień:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas pobierania danych.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateOrderStatus = async (update: OrderStatusUpdate): Promise<boolean> => {
    try {
      // Aktualizuj status zamówienia
      const { error } = await supabase
        .from('product_orders')
        .update({
          status: update.status,
          tracking_number: update.trackingNumber,
          notes: update.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', update.orderId);
      
      if (error) {
        console.error('Błąd aktualizacji statusu zamówienia:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się zaktualizować statusu zamówienia.",
          variant: "destructive",
        });
        return false;
      }
      
      // Odśwież listę zamówień
      await fetchOrders();
      
      toast({
        title: "Sukces",
        description: "Status zamówienia został zaktualizowany.",
      });
      
      return true;
    } catch (err) {
      console.error('Nieoczekiwany błąd aktualizacji statusu:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas aktualizacji statusu.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const getStatusTranslation = (status: string): string => {
    const statusMap: Record<string, string> = {
      'reserved': 'Zarezerwowane',
      'oczekujące': 'Oczekujące na realizację',
      'payment_succeeded': 'Płatność zatwierdzona',
      'payment_failed': 'Błąd płatności',
      'zaakceptowane': 'Przyjęte do realizacji',
      'przygotowane_do_wysyłki': 'Gotowe do wysyłki',
      'wysłane': 'Wysłane',
      'dostarczone': 'Dostarczone',
      'anulowane': 'Anulowane',
      'reservation_expired': 'Rezerwacja wygasła'
    };
    
    return statusMap[status] || status;
  };
  
  const checkExpiredReservations = async () => {
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
  
  return {
    isLoading,
    orders,
    fetchOrders,
    updateOrderStatus,
    getStatusTranslation,
    checkExpiredReservations
  };
}
