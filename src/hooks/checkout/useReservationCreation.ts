
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrderData } from './useOrderReservationType';
import { toast } from '@/components/ui/use-toast';

export const useReservationCreation = ({ productId, isTestMode = false }: { productId: string, isTestMode?: boolean }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [reservationData, setReservationData] = useState<OrderData | null>(null);
  const [reservationExpiresAt, setReservationExpiresAt] = useState<string | null>(null);
  
  // Funkcja inicjująca nowe zamówienie
  const initiateOrder = useCallback(async (product: any) => {
    if (!product || !product.id) {
      console.error("Brak danych produktu");
      return null;
    }
    
    setIsLoading(true);
    
    try {
      // Pobierz ID aktualnie zalogowanego użytkownika
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Wymagane logowanie",
          description: "Aby dokonać zakupu, musisz być zalogowany.",
          variant: "destructive",
        });
        return null;
      }
      
      // Sprawdź, czy produkt istnieje w bazie
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', product.id)
        .single();
      
      if (productError || !productData) {
        toast({
          title: "Błąd produktu",
          description: "Nie udało się pobrać informacji o produkcie. Spróbuj ponownie.",
          variant: "destructive",
        });
        return null;
      }
      
      // Określenie ID sprzedawcy
      const sellerId = productData.user_id;
      
      if (!sellerId) {
        toast({
          title: "Błąd produktu",
          description: "Nie można określić właściciela produktu. Spróbuj ponownie.",
          variant: "destructive",
        });
        return null;
      }
      
      // Sprawdź, czy sprzedawca nie jest kupującym
      if (sellerId === user.id) {
        toast({
          title: "Operacja niemożliwa",
          description: "Nie możesz kupić własnego produktu.",
          variant: "destructive",
        });
        return null;
      }
      
      // Anuluj wszystkie poprzednie rezerwacje tego produktu dla tego użytkownika
      await supabase
        .from('product_orders')
        .update({ 
          status: 'reservation_expired',
          updated_at: new Date().toISOString()
        })
        .eq('buyer_id', user.id)
        .eq('product_id', product.id)
        .eq('status', 'reserved');
      
      // Określ cenę na podstawie trybu (testowego lub normalnego)
      const price = isTestMode && productData.testing_price 
        ? parseFloat(productData.testing_price) 
        : parseFloat(productData.price);
      
      // Oblicz czas wygaśnięcia rezerwacji (10 minut od teraz)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      
      // Utwórz nową rezerwację - ważna zmiana: przekazujemy price jako number, ale konwertujemy daty na ISO string
      const { data: orderData, error: orderError } = await supabase
        .from('product_orders')
        .insert({
          product_id: product.id,
          buyer_id: user.id,
          seller_id: sellerId,
          total_amount: price,
          status: 'reserved',
          order_type: isTestMode ? 'test' : 'purchase',
          reservation_expires_at: expiresAt.toISOString() // Już jako string, nie wymaga konwersji
        })
        .select()
        .single();
      
      if (orderError || !orderData) {
        toast({
          title: "Błąd rezerwacji",
          description: "Nie udało się utworzyć rezerwacji. Spróbuj ponownie.",
          variant: "destructive",
        });
        return null;
      }
      
      setReservationData(orderData);
      setReservationExpiresAt(orderData.reservation_expires_at);
      
      return orderData;
    } catch (err) {
      console.error("Nieoczekiwany błąd podczas tworzenia rezerwacji:", err);
      toast({
        title: "Błąd systemu",
        description: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isTestMode]);
  
  return {
    isLoading,
    reservationData,
    reservationExpiresAt,
    setReservationData,
    setReservationExpiresAt,
    initiateOrder
  };
};
