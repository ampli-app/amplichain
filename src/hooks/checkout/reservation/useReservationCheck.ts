
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
    if (!user || !productId) {
      console.log("Brak użytkownika lub produktId - nie można sprawdzić rezerwacji");
      return null;
    }
    
    if (isChecking) {
      console.log("Sprawdzanie rezerwacji już w toku - pomijam");
      return null;
    }
    
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
        .in('status', ['reserved', 'confirmed', 'awaiting_payment'])
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
          const expiresAt = new Date(data[0].reservation_expires_at);
          setReservationExpiresAt(expiresAt);
          console.log('Rezerwacja wygasa o:', expiresAt.toISOString());
        } else {
          console.log('Brak daty wygaśnięcia rezerwacji');
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
            
          if (!productError && productData && productData.status !== 'reserved') {
            console.log('Niezgodność statusu produktu! Aktualny status:', productData.status);
            console.log('Aktualizuję status produktu na "reserved"');
            
            // Aktualizuj status produktu na "reserved" jeśli nie jest zgodny z rezerwacją
            const { error: updateError } = await supabase
              .from('products')
              .update({ 
                status: 'reserved',
                updated_at: new Date().toISOString()
              })
              .eq('id', productId);
              
            if (updateError) {
              console.error('Błąd podczas aktualizacji statusu produktu:', updateError);
            } else {
              console.log('Status produktu zaktualizowany pomyślnie na "reserved"');
            }
          }
        }
        
        return data[0];
      }
      
      console.log('Nie znaleziono istniejących rezerwacji');
      return null;
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas sprawdzania rezerwacji:', err);
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
