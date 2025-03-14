
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useProductAvailability = (productId: string | undefined) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [productStatus, setProductStatus] = useState<string | null>(null);
  const [isBackgroundChecking, setIsBackgroundChecking] = useState(false);
  const initialCheckDoneRef = useRef(false);
  const lastStatusRef = useRef<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setIsLoading(false);
      return;
    }

    // Funkcja sprawdzania dostępności, która nie aktualizuje stanu loadingu dla sprawdzeń w tle
    const checkAvailability = async (background = false) => {
      if (background) {
        if (isBackgroundChecking) return; // Zapobieganie równoległym sprawdzeniom w tle
        setIsBackgroundChecking(true);
      } else {
        setIsLoading(true);
      }

      try {
        if (!background) {
          console.log(`[useProductAvailability] Sprawdzanie statusu produktu: ${productId}`);
        }
        
        const { data, error } = await supabase
          .from('products')
          .select('status')
          .eq('id', productId)
          .single();

        if (error) {
          console.error('Błąd podczas sprawdzania dostępności produktu:', error);
          if (!background) setIsAvailable(false);
        } else {
          // Aktualizuj stan tylko jeśli status się zmienił, aby uniknąć zbędnych renderowań
          if (lastStatusRef.current !== data.status) {
            if (!background) {
              console.log(`[useProductAvailability] Status produktu ${productId}:`, data.status);
            }
            lastStatusRef.current = data.status;
            setProductStatus(data.status);
            setIsAvailable(data.status === 'available');
          }
        }
      } catch (err) {
        console.error('Nieoczekiwany błąd:', err);
        if (!background) setIsAvailable(false);
      } finally {
        if (background) {
          setIsBackgroundChecking(false);
        } else {
          setIsLoading(false);
          initialCheckDoneRef.current = true;
        }
      }
    };

    // Pierwsze sprawdzenie, które pokaże wskaźnik ładowania
    checkAvailability(false);

    // Ustaw subskrypcję na zmiany w tabeli products
    const channel = supabase
      .channel(`product-status-changes-${productId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Nasłuchuj na wszystkie zmiany (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'products',
          filter: `id=eq.${productId}`,
        },
        (payload) => {
          console.log('[useProductAvailability] Zmiana w produkcie:', payload);
          if (payload.new && 'status' in payload.new) {
            const newStatus = payload.new.status as string;
            if (lastStatusRef.current !== newStatus) {
              console.log('[useProductAvailability] Nowy status produktu (z subskrypcji):', newStatus);
              lastStatusRef.current = newStatus;
              setProductStatus(newStatus);
              setIsAvailable(newStatus === 'available');
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(`[useProductAvailability] Status subskrypcji dla produktu ${productId}:`, status);
      });

    // Sprawdzaj status co 15 sekund jako dodatkowe zabezpieczenie, ale w tle
    const intervalId = setInterval(() => {
      // Pomiń pierwsze uruchomienie interwału jeśli pierwsze sprawdzenie jeszcze się nie zakończyło
      if (initialCheckDoneRef.current) {
        checkAvailability(true);
      }
    }, 15000);

    return () => {
      console.log(`[useProductAvailability] Usuwanie kanału i interwału dla produktu ${productId}`);
      clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, [productId]);

  return {
    isAvailable,
    isLoading,
    productStatus
  };
};
