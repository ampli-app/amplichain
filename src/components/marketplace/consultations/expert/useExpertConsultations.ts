
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { ConsultationOrder } from '@/types/consultations';
import { TabType, UseExpertConsultationsResult } from './types';

export const useExpertConsultations = (): UseExpertConsultationsResult => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ConsultationOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      console.log("Fetching expert's consultation orders for user:", user.id);

      const { data, error } = await supabase
        .from('consultation_orders')
        .select(`
          *,
          consultations:consultation_id(id, user_id, title, description, price, categories, experience, availability, is_online, location, contact_methods, created_at, updated_at),
          profiles:client_id(id, username, full_name, avatar_url)
        `)
        .eq('expert_id', user.id);

      if (error) throw error;

      console.log("Expert consultation orders:", data);
      
      // Properly cast the data to ensure type safety
      const typedData = data as unknown as ConsultationOrder[];
      setOrders(typedData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching expert consultation orders:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać zamówień konsultacji.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    if (!user) return;
    setProcessingOrderId(orderId);

    try {
      const { error } = await supabase
        .from('consultation_orders')
        .update({
          status: 'accepted',
          is_expert_confirmed: true
        })
        .eq('id', orderId)
        .eq('expert_id', user.id);

      if (error) throw error;

      toast({
        title: "Zaakceptowano",
        description: "Zamówienie zostało zaakceptowane. Skontaktuj się z klientem.",
      });

      fetchOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaakceptować zamówienia.",
        variant: "destructive",
      });
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    if (!user) return;
    setProcessingOrderId(orderId);

    try {
      const { error } = await supabase
        .from('consultation_orders')
        .update({
          status: 'rejected',
          is_expert_confirmed: false
        })
        .eq('id', orderId)
        .eq('expert_id', user.id);

      if (error) throw error;

      toast({
        title: "Odrzucono",
        description: "Zamówienie zostało odrzucone.",
      });

      fetchOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się odrzucić zamówienia.",
        variant: "destructive",
      });
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    if (!user) return;
    setProcessingOrderId(orderId);

    try {
      const { error } = await supabase
        .from('consultation_orders')
        .update({
          status: 'completed',
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('expert_id', user.id);

      if (error) throw error;

      toast({
        title: "Zakończono",
        description: "Konsultacja została oznaczona jako zakończona.",
      });

      fetchOrders();
    } catch (error) {
      console.error('Error completing order:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zakończyć konsultacji.",
        variant: "destructive",
      });
    } finally {
      setProcessingOrderId(null);
    }
  };

  const filterOrdersByStatus = (status: TabType) => {
    if (status === 'pending') {
      return orders.filter(order => order.status === 'pending');
    } else if (status === 'active') {
      return orders.filter(order => order.status === 'accepted' && !order.is_completed);
    } else if (status === 'completed') {
      return orders.filter(order => order.status === 'completed' || order.is_completed);
    } else if (status === 'rejected') {
      return orders.filter(order => order.status === 'rejected' || order.status === 'cancelled');
    }
    return orders;
  };

  return {
    orders,
    loading,
    processingOrderId,
    handleAcceptOrder,
    handleRejectOrder,
    handleCompleteOrder,
    filterOrdersByStatus
  };
};
