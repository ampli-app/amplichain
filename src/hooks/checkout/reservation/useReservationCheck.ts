
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ReservationData } from './types';

export function useReservationCheck({ 
  productId,
  setReservationData,
  setReservationExpiresAt,
  setPaymentDeadline,
  setIsLoading
}: { 
  productId: string;
  setReservationData: (data: ReservationData | null) => void;
  setReservationExpiresAt: (date: Date | null) => void;
  setPaymentDeadline: (date: Date | null) => void;
  setIsLoading: (loading: boolean) => void;
}) {
  const { user } = useAuth();
  
  const checkExistingReservation = async () => {
    if (!user || !productId) return null;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('product_orders')
        .select('*')
        .eq('product_id', productId)
        .eq('buyer_id', user.id)
        .in('status', ['reserved', 'confirmed'])
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Błąd podczas sprawdzania istniejącej rezerwacji:', error);
        return null;
      }
      
      if (data && data.length > 0) {
        setReservationData(data[0]);
        
        if (data[0].reservation_expires_at) {
          setReservationExpiresAt(new Date(data[0].reservation_expires_at));
        }
        
        if (data[0].payment_deadline) {
          setPaymentDeadline(new Date(data[0].payment_deadline));
        }
        
        return data[0];
      }
      
      return null;
    } catch (err) {
      console.error('Nieoczekiwany błąd:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    checkExistingReservation
  };
}
