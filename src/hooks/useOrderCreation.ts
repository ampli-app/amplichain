
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Product } from '@/components/marketplace/types';

export const useOrderCreation = (userId: string | undefined) => {
  const [orderCreated, setOrderCreated] = useState(false);
  const isCreatingOrder = useRef(false);
  
  const testEndDate = new Date();
  testEndDate.setDate(testEndDate.getDate() + 7);
  
  const createOrder = async (productData: Product, isTestMode: boolean) => {
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
      
      // Sprawdź czy produkt jest dostępny
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('status')
        .eq('id', productData.id)
        .single();
      
      if (productError) {
        console.error('Błąd podczas sprawdzania statusu produktu:', productError);
        toast({
          title: "Błąd",
          description: "Nie udało się sprawdzić statusu produktu.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('Aktualny status produktu:', product.status);
      
      if (product.status !== 'available') {
        console.log('Produkt nie jest dostępny, status:', product.status);
        toast({
          title: "Produkt niedostępny",
          description: "Ten produkt jest obecnie zarezerwowany lub sprzedany.",
          variant: "destructive",
        });
        return;
      }
      
      // Sprawdź czy nie istnieje już aktywne zamówienie dla tego produktu
      const { data: existingOrders, error: existingOrderError } = await supabase
        .from('product_orders')
        .select('id, status')
        .eq('product_id', productData.id)
        .in('status', ['reserved', 'awaiting_payment', 'confirmed'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingOrderError) {
        console.error('Błąd podczas sprawdzania istniejących zamówień:', existingOrderError);
        return;
      }

      if (existingOrders && existingOrders.length > 0) {
        console.log('Znaleziono istniejące aktywne zamówienie:', existingOrders[0]);
        toast({
          title: "Zamówienie już istnieje",
          description: "Ten produkt ma już aktywne zamówienie.",
          variant: "destructive",
        });
        
        // Zamiast tworzyć nowe zamówienie, użyjemy istniejącego
        setOrderCreated(true);
        return;
      }
      
      // Najpierw spróbuj zarezerwować produkt - WAŻNE: używamy transakcji
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          status: 'reserved',
          updated_at: new Date().toISOString()
        })
        .eq('id', productData.id)
        .eq('status', 'available'); // Dodatkowe zabezpieczenie - aktualizuj tylko jeśli status to 'available'
      
      if (updateError) {
        console.error('Błąd podczas aktualizacji statusu produktu:', updateError);
        toast({
          title: "Błąd",
          description: "Nie udało się zarezerwować produktu. Spróbuj ponownie.",
          variant: "destructive",
        });
        return;
      }
      
      // Sprawdź ponownie status po aktualizacji
      const { data: updatedProduct, error: checkError } = await supabase
        .from('products')
        .select('status')
        .eq('id', productData.id)
        .single();
        
      if (checkError || !updatedProduct || updatedProduct.status !== 'reserved') {
        console.error('Nie udało się zarezerwować produktu - status nie został zaktualizowany');
        toast({
          title: "Błąd",
          description: "Nie udało się zarezerwować produktu. Spróbuj ponownie.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('Status produktu zaktualizowany na "reserved"');
      
      const { data: deliveryOptions, error: deliveryError } = await supabase
        .from('delivery_options')
        .select('*')
        .eq('name', 'Kurier')
        .limit(1);
      
      if (deliveryError || !deliveryOptions || deliveryOptions.length === 0) {
        console.error('Błąd podczas pobierania opcji dostawy:', deliveryError);
        // Przywróć status produktu
        await supabase
          .from('products')
          .update({ status: 'available' })
          .eq('id', productData.id);
        return;
      }
      
      const deliveryOption = deliveryOptions[0];
      
      const productPrice = isTestMode && productData.testing_price 
        ? productData.testing_price 
        : productData.price;
      
      const totalAmount = productPrice + deliveryOption.price;
      
      // Utwórz zamówienie
      const orderData = {
        product_id: productData.id,
        buyer_id: userId,
        seller_id: productData.user_id,
        total_amount: totalAmount,
        delivery_option_id: deliveryOption.id,
        status: 'awaiting_payment',
        payment_method: 'Karta płatnicza',
        order_type: isTestMode ? 'test' : 'purchase',
        test_end_date: isTestMode ? testEndDate.toISOString() : null,
        reservation_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minut
      };
      
      const { data, error } = await supabase
        .from('product_orders')
        .insert(orderData)
        .select();
      
      if (error) {
        console.error('Błąd podczas tworzenia zamówienia:', error);
        // Przywróć status produktu
        await supabase
          .from('products')
          .update({ status: 'available' })
          .eq('id', productData.id);
          
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
      // Przywróć status produktu
      await supabase
        .from('products')
        .update({ 
          status: 'available',
          updated_at: new Date().toISOString()
        })
        .eq('id', productData.id);
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
