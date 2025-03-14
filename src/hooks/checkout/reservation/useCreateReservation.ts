
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ReservationData } from './types';
import { SERVICE_FEE_PERCENTAGE } from '@/hooks/checkout/useCheckout';

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

  const initiateOrder = async (product: any, discount: any = null, testMode: boolean = false) => {
    if (!user || !productId || !product) {
      console.log("Nie można utworzyć rezerwacji - brak wymaganych danych");
      return null;
    }
    
    if (isInitiating) {
      console.log("Zamówienie jest już w trakcie inicjowania - blokowanie duplikatu");
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
      
      // Sprawdź, czy zamówienie nie zostało już utworzone
      const { data: existingOrders, error: checkError } = await supabase
        .from('product_orders')
        .select('*')
        .eq('product_id', productId)
        .eq('buyer_id', user.id)
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
          // Sprawdź czy produkt ma poprawny status "reserved"
          const { data: productCurrentStatus, error: productCurrentError } = await supabase
            .from('products')
            .select('status')
            .eq('id', productId)
            .single();
            
          if (!productCurrentError && productCurrentStatus.status !== 'reserved') {
            console.log('Niezgodność statusu produktu! Aktualizuję na reserved...');
            
            const { error: updateError } = await supabase
              .from('products')
              .update({ 
                status: 'reserved',
                updated_at: new Date().toISOString()
              })
              .eq('id', productId);
              
            if (updateError) {
              console.error('Błąd aktualizacji statusu produktu:', updateError);
            } else {
              console.log('Status produktu zaktualizowany na reserved');
            }
          }
          
          setReservationData(fullOrder);
          if (fullOrder.reservation_expires_at) {
            setReservationExpiresAt(new Date(fullOrder.reservation_expires_at));
          }
          
          toast({
            title: "Rezerwacja istnieje",
            description: "Ten produkt jest już zarezerwowany. Kontynuujesz istniejącą rezerwację.",
          });
          
          return fullOrder;
        }
      }
      
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      
      console.log("Zmieniam status produktu na 'reserved'");
      
      // Najpierw zmień status produktu na 'reserved'
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
        
      if (verifyError) {
        console.error('Błąd weryfikacji statusu produktu:', verifyError);
        return null;
      }
      
      if (!verifyProductStatus || verifyProductStatus.status !== 'reserved') {
        console.error('Weryfikacja aktualizacji statusu produktu nie powiodła się!');
        console.log('Aktualny status produktu po próbie aktualizacji:', verifyProductStatus?.status);
        toast({
          title: "Błąd",
          description: "Nie udało się zarezerwować produktu. Spróbuj ponownie.",
          variant: "destructive",
        });
        return null;
      }
      
      console.log('Zweryfikowano zmianę statusu na "reserved" pomyślnie');
      
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
      
      const deliveryPrice = deliveryOptions[0].price;
      
      // Obliczenie wartości rabatu
      let discountValue = 0;
      let discountCodeId = null;
      let discountCodeText = null;
      
      if (discount && discount.valid) {
        discountValue = parseFloat(discount.discount_value) || 0;
        discountCodeId = discount.discount_id;
        discountCodeText = discount.code;
      }
      
      // Obliczenie opłaty serwisowej (1,5% od sumy produktu i dostawy)
      const subtotal = productPrice + deliveryPrice;
      const serviceFee = parseFloat((subtotal * SERVICE_FEE_PERCENTAGE).toFixed(2));
      
      // Obliczenie sumy całkowitej
      const totalAmount = productPrice + deliveryPrice - discountValue + serviceFee;
      
      console.log("Tworzę zamówienie z parametrami:", {
        product_id: productId,
        buyer_id: user.id,
        seller_id: product.user_id,
        product_price: productPrice,
        delivery_price: deliveryPrice,
        discount_value: discountValue,
        service_fee: serviceFee,
        total_amount: totalAmount,
        delivery_option_id: deliveryOptions[0].id,
        status: 'reserved',
        reservation_expires_at: expiresAt.toISOString(),
        order_type: testMode ? 'test' : 'purchase',
        discount_code_id: discountCodeId,
        discount_code: discountCodeText
      });
      
      // Utwórz nowe zamówienie
      const { data, error } = await supabase
        .from('product_orders')
        .insert([{
          product_id: productId,
          buyer_id: user.id,
          seller_id: product.user_id,
          product_price: productPrice,
          delivery_price: deliveryPrice,
          discount_value: discountValue,
          service_fee: serviceFee,
          total_amount: totalAmount,
          delivery_option_id: deliveryOptions[0].id,
          status: 'reserved',
          reservation_expires_at: expiresAt.toISOString(),
          order_type: testMode ? 'test' : 'purchase',
          discount_code_id: discountCodeId,
          discount_code: discountCodeText
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
