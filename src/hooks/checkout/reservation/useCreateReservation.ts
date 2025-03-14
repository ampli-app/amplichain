
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ReservationData } from './types';

export function useCreateReservation({
  productId,
  setReservationData,
  setReservationExpiresAt,
  setIsLoading
}: {
  productId: string;
  setReservationData: (data: ReservationData | null) => void;
  setReservationExpiresAt: (date: Date | null) => void;
  setIsLoading: (loading: boolean) => void;
}) {
  const { user } = useAuth();
  const [isInitiating, setIsInitiating] = useState(false);

  const initiateOrder = async (product: any, testMode: boolean = false) => {
    if (!user || !productId || !product || isInitiating) {
      console.log("Nie można utworzyć rezerwacji - brak wymaganych danych lub rezerwacja w toku.");
      if (isInitiating) {
        console.log("Zamówienie jest już w trakcie inicjowania - blokowanie duplikatu");
      }
      return null;
    }
    
    try {
      setIsInitiating(true);
      setIsLoading(true);
      
      console.log("Rozpoczynam tworzenie rezerwacji dla produktu:", productId);
      
      // Sprawdź czy produkt jest dostępny przed utworzeniem rezerwacji
      const { data: productStatus, error: productStatusError } = await supabase
        .from('products')
        .select('status')
        .eq('id', productId)
        .single();
        
      if (productStatusError) {
        console.error('Błąd podczas sprawdzania statusu produktu:', productStatusError);
        toast({
          title: "Błąd",
          description: "Nie udało się sprawdzić dostępności produktu.",
          variant: "destructive",
        });
        return null;
      }
      
      if (productStatus.status !== 'available') {
        console.log('Produkt nie jest dostępny, status:', productStatus.status);
        toast({
          title: "Produkt niedostępny",
          description: "Ten produkt jest obecnie zarezerwowany lub sprzedany.",
          variant: "destructive",
        });
        return null;
      }
      
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      
      // Sprawdź, czy zamówienie nie zostało już utworzone
      const { data: existingOrders, error: checkError } = await supabase
        .from('product_orders')
        .select('id')
        .eq('product_id', productId)
        .in('status', ['reserved', 'awaiting_payment', 'confirmed'])
        .limit(1);
        
      if (checkError) {
        console.error('Błąd podczas sprawdzania istniejących zamówień:', checkError);
      } else if (existingOrders && existingOrders.length > 0) {
        console.log('Znaleziono istniejące aktywne zamówienie:', existingOrders[0].id);
        
        // Pobierz pełne dane zamówienia
        const { data: fullOrder, error: fetchError } = await supabase
          .from('product_orders')
          .select('*')
          .eq('id', existingOrders[0].id)
          .single();
          
        if (!fetchError && fullOrder) {
          setReservationData(fullOrder);
          setReservationExpiresAt(new Date(fullOrder.reservation_expires_at));
          
          toast({
            title: "Rezerwacja istnieje",
            description: "Ten produkt jest już zarezerwowany. Nie można utworzyć nowej rezerwacji.",
            variant: "destructive",
          });
          
          return fullOrder;
        }
        
        // Jeśli znaleziono istniejącą rezerwację, ale nie udało się pobrać pełnych danych,
        // powiadom użytkownika i przerwij operację
        toast({
          title: "Produkt zarezerwowany",
          description: "Ten produkt ma już aktywną rezerwację. Nie można utworzyć nowej.",
          variant: "destructive",
        });
        return null;
      }
      
      // Najpierw zmień status produktu na 'reserved' za pomocą transakcji
      const { error: updateProductError } = await supabase
        .from('products')
        .update({ 
          status: 'reserved',
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .eq('status', 'available'); // Zabezpieczenie, aby zmienić tylko jeśli dalej jest dostępny
      
      if (updateProductError) {
        console.error('Błąd podczas aktualizacji statusu produktu:', updateProductError);
        toast({
          title: "Błąd",
          description: "Nie udało się zarezerwować produktu. Spróbuj ponownie.",
          variant: "destructive",
        });
        return null;
      }
      
      console.log("Status produktu zmieniony na 'reserved'");
      
      // Sprawdź, czy aktualizacja statusu powiodła się
      const { data: verifyProductStatus, error: verifyError } = await supabase
        .from('products')
        .select('status')
        .eq('id', productId)
        .single();
        
      if (verifyError || verifyProductStatus.status !== 'reserved') {
        console.error('Weryfikacja aktualizacji statusu produktu nie powiodła się:', verifyError);
        console.log('Aktualny status produktu po próbie aktualizacji:', verifyProductStatus?.status);
      } else {
        console.log('Zweryfikowano zmianę statusu na "reserved" pomyślnie');
      }
      
      const { data: deliveryOptions, error: deliveryError } = await supabase
        .from('delivery_options')
        .select('*')
        .eq('name', 'Kurier')
        .limit(1);
      
      if (deliveryError || !deliveryOptions || deliveryOptions.length === 0) {
        console.error('Błąd podczas pobierania opcji dostawy:', deliveryError);
        toast({
          title: "Błąd",
          description: "Nie można pobrać opcji dostawy.",
          variant: "destructive",
        });
        
        // Przywróć status produktu na available w przypadku błędu
        await supabase
          .from('products')
          .update({ 
            status: 'available',
            updated_at: new Date().toISOString()
          })
          .eq('id', productId);
          
        return null;
      }
      
      const productPrice = testMode && product.testing_price 
        ? parseFloat(product.testing_price) 
        : parseFloat(product.price);
      
      const totalAmount = productPrice + deliveryOptions[0].price;
      
      console.log("Tworzę zamówienie z parametrami:", {
        product_id: productId,
        buyer_id: user.id,
        seller_id: product.user_id,
        total_amount: totalAmount,
        delivery_option_id: deliveryOptions[0].id,
        status: 'reserved',
        reservation_expires_at: expiresAt.toISOString(),
        order_type: testMode ? 'test' : 'purchase'
      });
      
      // Utwórz nowe zamówienie
      const { data, error } = await supabase
        .from('product_orders')
        .insert([{
          product_id: productId,
          buyer_id: user.id,
          seller_id: product.user_id,
          total_amount: totalAmount,
          delivery_option_id: deliveryOptions[0].id,
          status: 'reserved',
          reservation_expires_at: expiresAt.toISOString(),
          order_type: testMode ? 'test' : 'purchase'
        }])
        .select();
      
      if (error) {
        console.error('Błąd podczas tworzenia rezerwacji:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się utworzyć rezerwacji.",
          variant: "destructive",
        });
        
        // Przywróć status produktu w przypadku błędu
        await supabase
          .from('products')
          .update({ 
            status: 'available',
            updated_at: new Date().toISOString()
          })
          .eq('id', productId);
          
        return null;
      }
      
      if (data && data.length > 0) {
        const reservation = data[0];
        console.log("Utworzono nową rezerwację:", reservation.id);
        
        setReservationData(reservation);
        setReservationExpiresAt(new Date(reservation.reservation_expires_at));
        
        toast({
          title: "Rezerwacja utworzona",
          description: "Masz 10 minut na dokończenie zamówienia.",
        });
        
        return reservation;
      }
      
      return null;
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas tworzenia rezerwacji:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas tworzenia rezerwacji.",
        variant: "destructive",
      });
      
      // Przywróć status produktu w przypadku błędu
      await supabase
        .from('products')
        .update({ 
          status: 'available',
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);
        
      return null;
    } finally {
      setIsInitiating(false);
      setIsLoading(false);
    }
  };
  
  return {
    initiateOrder,
    isInitiating
  };
}
