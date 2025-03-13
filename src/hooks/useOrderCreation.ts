
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useOrderCreation = (userId: string | undefined) => {
  const [orderCreated, setOrderCreated] = useState(false);
  
  const testEndDate = new Date();
  testEndDate.setDate(testEndDate.getDate() + 7);
  
  const createOrder = async (productData: any, isTestMode: boolean) => {
    if (!userId || !productData) return;
    
    try {
      console.log('Rozpoczynam tworzenie zamówienia dla produktu:', productData.id);
      
      const { data: existingOrders, error: fetchError } = await supabase
        .from('product_orders')
        .select('id')
        .eq('product_id', productData.id)
        .eq('buyer_id', userId)
        .eq('status', 'oczekujące')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (fetchError) {
        console.error('Błąd podczas sprawdzania istniejących zamówień:', fetchError);
        return;
      }
      
      if (existingOrders && existingOrders.length > 0) {
        console.log('Zamówienie już istnieje:', existingOrders[0].id);
        setOrderCreated(true);
        return;
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
          status: 'oczekujące',
          payment_method: 'Karta płatnicza',
          order_type: isTestMode ? 'test' : 'purchase',
          test_end_date: isTestMode ? testEndDate.toISOString() : null
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
    }
  };
  
  return {
    orderCreated,
    setOrderCreated,
    createOrder,
    testEndDate
  };
};
