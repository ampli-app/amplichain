
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ConsultationOrder } from '@/types/consultations';
import { toast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';

export const useClientConsultations = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ConsultationOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('consultation_orders')
        .select(`
          *,
          profiles:expert_id(id, username, full_name, avatar_url),
          consultations:consultation_id(id, user_id, title, description, price, categories, experience, availability, is_online, location, contact_methods, created_at, updated_at)
        `)
        .eq('client_id', user.id);
        
      if (error) throw error;
      
      // Konwersja danych do oczekiwanego typu za pomocą rzutowania przez unknown
      setOrders((data as unknown) as ConsultationOrder[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać Twoich rezerwacji konsultacji.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmConsultation = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('consultation_orders')
        .update({ 
          status: 'completed',
          is_client_confirmed: true,
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', orderId);
        
      if (error) throw error;
      
      toast({
        title: "Potwierdzono",
        description: "Konsultacja została oznaczona jako zakończona.",
      });
      
      fetchOrders();
      return Promise.resolve();
    } catch (error) {
      console.error('Error confirming consultation:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się potwierdzić konsultacji.",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('consultation_orders')
        .update({ 
          status: 'cancelled',
          is_client_confirmed: false
        })
        .eq('id', orderId);
        
      if (error) throw error;
      
      toast({
        title: "Anulowano",
        description: "Twoja rezerwacja została anulowana. Środki wrócą na Twoje konto.",
      });
      
      fetchOrders();
      return Promise.resolve();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się anulować rezerwacji.",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };

  const filterOrdersByStatus = (status: string) => {
    if (status === 'pending') {
      return orders.filter(order => 
        order.status === 'pending' || 
        order.status === 'pending_payment'
      );
    } else if (status === 'active') {
      return orders.filter(order => 
        order.status === 'accepted' && 
        !order.is_completed
      );
    } else if (status === 'completed') {
      return orders.filter(order => 
        order.status === 'completed' || 
        order.is_completed
      );
    } else if (status === 'cancelled') {
      return orders.filter(order => 
        order.status === 'rejected' || 
        order.status === 'cancelled'
      );
    }
    return orders;
  };
  
  return {
    orders,
    loading,
    handleConfirmConsultation,
    handleCancelOrder,
    filterOrdersByStatus
  };
};
