import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useOrderCreation = (userId: string | undefined) => {
  const [orderCreated, setOrderCreated] = useState(false);
  const isCreatingOrder = useRef(false);
  
  const testEndDate = new Date();
  testEndDate.setDate(testEndDate.getDate() + 7);
  
  const createOrder = async (productData: any, isTestMode: boolean) => {
    if (!userId || !productData) return;
    
    // Zabezpieczenie przed podwójnym wywołaniem
    if (isCreatingOrder.current) {
      console.log('Zamówienie jest już w trakcie tworzenia');
      return;
    }
    
    try {
      isCreatingOrder.current = true;
      console.log('Rozpoczynam tworzenie zamówienia dla produktu:', productData.id);
      console.log('ID użytkownika:', userId);
      
      // Sprawdź, czy produkt jest już zarezerwowany
      const { data: existingOrders, error: fetchError } = await supabase
        .from('product_orders')
        .select('id, status, buyer_id, reservation_expires_at')
        .eq('product_id', productData.id)
        .in('status', ['reserved', 'confirmed'])
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (fetchError) {
        console.error('Błąd podczas sprawdzania istniejących zamówień:', fetchError);
        return;
      }
      
      console.log('Znalezione istniejące zamówienia:', existingOrders);
      
      if (existingOrders && existingOrders.length > 0) {
        const order = existingOrders[0];
        console.log('Sprawdzam zamówienie:', {
          orderId: order.id,
          status: order.status,
          buyerId: order.buyer_id,
          currentUserId: userId,
          reservationExpiresAt: order.reservation_expires_at
        });
        
        if (order.status === 'reserved') {
          // Sprawdź, czy rezerwacja nie wygasła
          const now = new Date();
          const expiresAt = order.reservation_expires_at ? new Date(order.reservation_expires_at) : null;
          
          if (expiresAt && expiresAt > now) {
            if (order.buyer_id === userId) {
              console.log('Produkt już zarezerwowany przez tego samego użytkownika');
              toast({
                title: "Produkt już zarezerwowany",
                description: "Ten produkt jest już w Twoim koszyku.",
                variant: "default",
              });
              setOrderCreated(true);
            } else {
              console.log('Produkt zarezerwowany przez innego użytkownika');
              toast({
                title: "Produkt niedostępny",
                description: "Ten produkt jest obecnie zarezerwowany przez innego kupującego.",
                variant: "destructive",
              });
            }
          } else {
            console.log('Rezerwacja wygasła, można utworzyć nowe zamówienie');
            // Aktualizuj status wygasłego zamówienia
            await supabase
              .from('product_orders')
              .update({ status: 'reservation_expired' })
              .eq('id', order.id);
          }
        }
      } else {
        console.log('Nie znaleziono zarezerwowanych zamówień dla tego produktu');
      }
      
      const { data: deliveryOptions, error: deliveryError } = await supabase
        .from('delivery_options')
        .select('*')
        .eq('name', 'Kurier')
        .limit(1);
      
      if (deliveryError || !deliveryOptions || deliveryOptions.length === 0) {
        console.error('Błąd podczas pobierania opcji dostawy:', deliveryError);
        return;
      }
      
      const deliveryOption = deliveryOptions[0];
      
      const productPrice = isTestMode && productData.testing_price 
        ? parseFloat(productData.testing_price) 
        : parseFloat(productData.price);
      
      const totalAmount = productPrice + deliveryOption.price;
      
      console.log('Tworzę nowe zamówienie z danymi:', {
        productId: productData.id,
        buyerId: userId,
        sellerId: productData.user_id,
        totalAmount: totalAmount,
        deliveryOptionId: deliveryOption.id,
        isTestMode: isTestMode
      });
      
      const { data, error } = await supabase
        .from('product_orders')
        .insert([{
          product_id: productData.id,
          buyer_id: userId,
          seller_id: productData.user_id,
          total_amount: totalAmount,
          delivery_option_id: deliveryOption.id,
          status: 'reserved',
          payment_method: 'Karta płatnicza',
          order_type: isTestMode ? 'test' : 'purchase',
          test_end_date: isTestMode ? testEndDate.toISOString() : null,
          reservation_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minut
        }])
        .select();
      
      if (error) {
        console.error('Błąd podczas tworzenia zamówienia:', error);
        toast({
          title: "Ostrzeżenie",
          description: "Zamówienie mogło nie zostać zapisane poprawnie. Sprawdź swoje zamówienia.",
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        console.log('Zamówienie utworzone pomyślnie:', data[0]);
        setOrderCreated(true);
        toast({
          title: "Sukces",
          description: "Zamówienie zostało pomyślnie zapisane.",
        });
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas tworzenia zamówienia:', err);
    } finally {
      isCreatingOrder.current = false;
    }
  };
  
  return {
    orderCreated,
    setOrderCreated,
    createOrder,
    testEndDate
  };
};
