
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useProductAvailability = (productId: string | undefined) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [productStatus, setProductStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setIsLoading(false);
      return;
    }

    const checkAvailability = async () => {
      setIsLoading(true);
      try {
        console.log(`[useProductAvailability] Sprawdzanie statusu produktu: ${productId}`);
        
        const { data, error } = await supabase
          .from('products')
          .select('status')
          .eq('id', productId)
          .single();

        if (error) {
          console.error('Błąd podczas sprawdzania dostępności produktu:', error);
          setIsAvailable(false);
        } else {
          console.log(`[useProductAvailability] Status produktu ${productId}:`, data.status);
          setProductStatus(data.status);
          setIsAvailable(data.status === 'available');
        }
      } catch (err) {
        console.error('Nieoczekiwany błąd:', err);
        setIsAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAvailability();

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
            console.log('[useProductAvailability] Nowy status produktu:', newStatus);
            setProductStatus(newStatus);
            setIsAvailable(newStatus === 'available');
          }
        }
      )
      .subscribe((status) => {
        console.log(`[useProductAvailability] Status subskrypcji dla produktu ${productId}:`, status);
      });

    // Sprawdzaj status co 15 sekund jako dodatkowe zabezpieczenie
    const intervalId = setInterval(checkAvailability, 15000);

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
