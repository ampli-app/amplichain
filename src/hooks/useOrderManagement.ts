
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Order {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  product_title?: string;
  product_image?: string;
  buyer_name?: string;
  seller_name?: string;
  tracking_number?: string;
  notes?: string;
  order_type?: string;
  reservation_expires_at?: string;
  payment_intent_id?: string;
  payment_status?: string;
}

export interface OrderStatusUpdate {
  status: string;
  orderId: string;
  trackingNumber?: string;
  notes?: string;
}

export const useOrderManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useAuth();

  const checkExpiredReservations = async () => {
    if (!user) return;
    
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

  const fetchOrders = async (isBuyer: boolean = false) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      await checkExpiredReservations();
      
      const filterColumn = isBuyer ? 'buyer_id' : 'seller_id';
      
      const { data, error } = await supabase
        .from('product_orders')
        .select(`
          *,
          products:product_id (
            title,
            image_url,
            for_testing
          ),
          stripe_payments (
            payment_intent_id,
            payment_intent_client_secret,
            status
          )
        `)
        .eq(filterColumn, user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Błąd podczas pobierania zamówień:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać zamówień.",
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        const formattedOrders = data.map(order => {
          const productData = order.products as any;
          // Add type checking to avoid TypeScript errors
          const paymentData = order.stripe_payments && order.stripe_payments.length > 0 
            ? order.stripe_payments[0] 
            : { payment_intent_id: undefined, status: undefined };
          
          let imageUrl = '/placeholder.svg';
          if (productData?.image_url) {
            if (typeof productData.image_url === 'string') {
              try {
                const parsed = JSON.parse(productData.image_url);
                imageUrl = Array.isArray(parsed) && parsed.length > 0 
                  ? parsed[0] 
                  : productData.image_url;
              } catch (e) {
                imageUrl = productData.image_url;
              }
            } else if (Array.isArray(productData.image_url) && productData.image_url.length > 0) {
              imageUrl = productData.image_url[0];
            }
          }
          
          return {
            ...order,
            product_title: productData?.title || 'Produkt',
            product_image: imageUrl,
            order_type: productData?.for_testing ? 'test' : 'purchase',
            payment_intent_id: paymentData.payment_intent_id || undefined,
            payment_status: paymentData.status || undefined
          };
        });
        
        setOrders(formattedOrders);
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas pobierania zamówień.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async ({ status, orderId, trackingNumber, notes }: OrderStatusUpdate) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('product_orders')
        .update({ 
          status, 
          tracking_number: trackingNumber,
          notes
        })
        .eq('id', orderId);
      
      if (error) {
        console.error('Błąd podczas aktualizacji statusu zamówienia:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się zaktualizować statusu zamówienia.",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Sukces",
        description: `Status zamówienia został zmieniony na: ${status}`,
      });
      
      fetchOrders();
      return true;
    } catch (err) {
      console.error('Nieoczekiwany błąd:', err);
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
      'oczekujące': 'Oczekujące',
      'pending_payment': 'Oczekiwanie na płatność',
      'payment_succeeded': 'Płatność zrealizowana',
      'payment_failed': 'Płatność odrzucona',
      'zaakceptowane': 'Zaakceptowane',
      'przygotowane_do_wysyłki': 'Przygotowane do wysyłki',
      'wysłane': 'Wysłane',
      'dostarczone': 'Dostarczone',
      'anulowane': 'Anulowane',
      'reservation_expired': 'Rezerwacja wygasła'
    };
    
    return statusMap[status] || status;
  };

  const getOrderNotifications = async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('order_notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Błąd podczas pobierania powiadomień:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Nieoczekiwany błąd:', err);
      return [];
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('order_notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) {
        console.error('Błąd podczas oznaczania powiadomienia jako przeczytane:', error);
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd:', err);
    }
  };

  return {
    isLoading,
    orders,
    fetchOrders,
    updateOrderStatus,
    getStatusTranslation,
    getOrderNotifications,
    markNotificationAsRead,
    checkExpiredReservations
  };
};
