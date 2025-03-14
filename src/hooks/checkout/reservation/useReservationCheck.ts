
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
  const [isChecking, setIsChecking] = useState(false);
  
  const checkExistingReservation = async () => {
    if (!user || !productId || isChecking) return null;
    
    try {
      setIsChecking(true);
      setIsLoading(true);
      
      // Walidacja UUID przed wysłaniem zapytania do Supabase
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
      
      if (!isValidUUID) {
        console.log(`ProductId nie jest prawidłowym UUID: ${productId}`);
        return null;
      }
      
      console.log(`Sprawdzanie istniejących rezerwacji dla produktu: ${productId} i użytkownika: ${user.id}`);
      
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
        console.log('Znaleziono istniejącą rezerwację:', data[0]);
        setReservationData(data[0]);
        
        if (data[0].reservation_expires_at) {
          setReservationExpiresAt(new Date(data[0].reservation_expires_at));
        }
        
        if (data[0].payment_deadline) {
          setPaymentDeadline(new Date(data[0].payment_deadline));
        }
        
        return data[0];
      }
      
      console.log('Nie znaleziono istniejących rezerwacji');
      return null;
    } catch (err) {
      console.error('Nieoczekiwany błąd:', err);
      return null;
    } finally {
      setIsChecking(false);
      setIsLoading(false);
    }
  };
  
  return {
    checkExistingReservation,
    isChecking
  };
}
