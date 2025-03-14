
import { useState, useRef } from 'react';
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
  const lastReservationIdRef = useRef<string | null>(null);
  const operationCountRef = useRef(0);
  
  const checkExistingReservation = async (logActivity = true) => {
    if (!user || !productId) {
      if (logActivity) {
        console.log("Brak użytkownika lub productId - nie można sprawdzić rezerwacji");
      }
      return null;
    }
    
    if (isChecking) {
      if (logActivity) {
        console.log("Sprawdzanie rezerwacji już w toku - pomijam");
      }
      return null;
    }
    
    const operationId = ++operationCountRef.current;
    
    try {
      setIsChecking(true);
      setIsLoading(true);
      
      // Walidacja UUID przed wysłaniem zapytania do Supabase
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
      
      if (!isValidUUID) {
        if (logActivity) {
          console.log(`ProductId nie jest prawidłowym UUID: ${productId}`);
        }
        return null;
      }
      
      if (logActivity) {
        console.log(`Sprawdzanie rezerwacji dla produktu: ${productId} (operacja ${operationId})`);
      }
      
      const { data, error } = await supabase
        .from('product_orders')
        .select('*')
        .eq('product_id', productId)
        .eq('buyer_id', user.id)
        .in('status', ['reserved', 'confirmed', 'awaiting_payment'])
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        if (logActivity) {
          console.error('Błąd podczas sprawdzania rezerwacji:', error);
        }
        return null;
      }
      
      if (data && data.length > 0) {
        // Sprawdź czy jest to ta sama rezerwacja co poprzednio
        if (lastReservationIdRef.current === data[0].id) {
          if (logActivity) {
            console.log('Ta sama rezerwacja co poprzednio, pomijam aktualizację');
          }
          return data[0];
        }
        
        if (logActivity) {
          console.log(`Znaleziono rezerwację: ${data[0].id} (operacja ${operationId})`);
        }
        
        lastReservationIdRef.current = data[0].id;
        setReservationData(data[0]);
        
        if (data[0].reservation_expires_at) {
          const expiresAt = new Date(data[0].reservation_expires_at);
          setReservationExpiresAt(expiresAt);
          if (logActivity) {
            console.log('Rezerwacja wygasa:', expiresAt.toLocaleString());
          }
        } else {
          setReservationExpiresAt(null);
        }
        
        if (data[0].payment_deadline) {
          setPaymentDeadline(new Date(data[0].payment_deadline));
        } else {
          setPaymentDeadline(null);
        }
        
        // Sprawdź czy status produktu jest zgodny z rezerwacją
        if (data[0].status !== 'reservation_expired') {
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('status')
            .eq('id', productId)
            .single();
            
          if (!productError && productData) {
            if (productData.status !== 'reserved') {
              if (logActivity) {
                console.log(`Niezgodność statusu produktu: ${productData.status}, aktualizuję na "reserved"`);
              }
              
              // Aktualizuj status produktu na "reserved" jeśli nie jest zgodny z rezerwacją
              const { error: updateError } = await supabase
                .from('products')
                .update({ 
                  status: 'reserved',
                  updated_at: new Date().toISOString()
                })
                .eq('id', productId);
                
              if (updateError && logActivity) {
                console.error('Błąd aktualizacji statusu produktu:', updateError);
              }
            }
          }
        }
        
        return data[0];
      }
      
      // Jeśli nie znaleziono rezerwacji, a była poprzednio, wyzeruj referencję
      if (lastReservationIdRef.current !== null) {
        if (logActivity) {
          console.log('Poprzednia rezerwacja już nie istnieje, resetuję stan');
        }
        lastReservationIdRef.current = null;
        setReservationData(null);
        setReservationExpiresAt(null);
        setPaymentDeadline(null);
      } else if (logActivity) {
        console.log(`Brak aktywnych rezerwacji (operacja ${operationId})`);
      }
      
      return null;
    } catch (err) {
      if (logActivity) {
        console.error('Nieoczekiwany błąd sprawdzania rezerwacji:', err);
      }
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
