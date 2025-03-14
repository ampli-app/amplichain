
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useProductAvailability = (productId: string | undefined) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [productStatus, setProductStatus] = useState<string | null>(null);
  const initialCheckDoneRef = useRef(false);
  const lastStatusRef = useRef<string | null>(null);
  const subscriptionActiveRef = useRef(false);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!productId) {
      setIsLoading(false);
      return;
    }

    // Funkcja sprawdzania dostępności, która nie generuje zbędnych logów
    const checkAvailability = async (logActivity = false) => {
      if (initialCheckDoneRef.current && !logActivity) {
        // Nie logujemy cyklicznych sprawdzeń
      } else if (logActivity) {
        console.log(`[useProductAvailability] Sprawdzanie statusu produktu: ${productId}`);
      }
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('status')
          .eq('id', productId)
          .single();

        if (error) {
          if (logActivity) {
            console.error('Błąd podczas sprawdzania dostępności produktu:', error);
          }
          setIsAvailable(false);
        } else {
          // Aktualizuj stan tylko jeśli status się zmienił
          if (lastStatusRef.current !== data.status) {
            if (logActivity) {
              console.log(`[useProductAvailability] Status produktu ${productId}:`, data.status);
            }
            lastStatusRef.current = data.status;
            setProductStatus(data.status);
            setIsAvailable(data.status === 'available');
          }
        }
      } catch (err) {
        if (logActivity) {
          console.error('Nieoczekiwany błąd:', err);
        }
        setIsAvailable(false);
      } finally {
        if (!initialCheckDoneRef.current) {
          setIsLoading(false);
          initialCheckDoneRef.current = true;
        }
      }
    };

    // Pierwsze sprawdzenie, które pokaże wskaźnik ładowania
    checkAvailability(true);

    // Ustaw subskrypcję na zmiany w tabeli products
    const channel = supabase
      .channel(`product-status-${productId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${productId}`,
        },
        (payload) => {
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
        subscriptionActiveRef.current = status === 'SUBSCRIBED';
        console.log(`[useProductAvailability] Subskrypcja dla produktu ${productId} aktywna`);
      });

    // Sprawdzanie fallbackowe tylko co 30 sekund (rzadziej), jeśli subskrypcja zawiedzie
    const setupFallbackCheck = () => {
      // Usuwamy istniejący timeout, jeśli istnieje
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
      
      checkTimeoutRef.current = setTimeout(() => {
        if (!subscriptionActiveRef.current) {
          // Sprawdź tylko jeśli subskrypcja nie działa
          checkAvailability(false);
        }
        setupFallbackCheck(); // Rekursywnie ustawiamy kolejne sprawdzenie
      }, 30000); // Co 30 sekund
    };
    
    setupFallbackCheck();

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [productId]);

  return {
    isAvailable,
    isLoading,
    productStatus
  };
};
