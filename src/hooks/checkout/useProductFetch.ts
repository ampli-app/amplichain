
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { DeliveryOption } from './types';

export function useProductFetch(productId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<DeliveryOption | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState('');

  const fetchProductData = async () => {
    setIsLoading(true);
    
    try {
      console.log("Pobieranie produktu o ID:", productId);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (error) {
        console.error('Błąd pobierania produktu:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać danych produktu.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      if (data) {
        console.log("Otrzymano dane produktu:", data);
        setProduct(data);
        
        await fetchDeliveryOptions(data.id);
      } else {
        console.error("Nie zwrócono danych produktu");
        toast({
          title: "Błąd",
          description: "Nie znaleziono produktu o podanym ID.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas pobierania danych produktu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchDeliveryOptions = async (productId: string) => {
    try {
      console.log("Pobieranie opcji dostawy dla produktu ID:", productId);
      
      const { data: productDeliveryData, error: productDeliveryError } = await supabase
        .from('product_delivery_options')
        .select('delivery_option_id')
        .eq('product_id', productId);
      
      if (productDeliveryError) {
        console.error('Błąd pobierania opcji dostawy produktu:', productDeliveryError);
        return;
      }
      
      if (productDeliveryData && productDeliveryData.length > 0) {
        const deliveryOptionIds = productDeliveryData.map(option => option.delivery_option_id);
        
        const { data: optionsData, error: optionsError } = await supabase
          .from('delivery_options')
          .select('*')
          .in('id', deliveryOptionIds);
        
        if (optionsError) {
          console.error('Błąd pobierania szczegółów opcji dostawy:', optionsError);
          return;
        }
        
        if (optionsData && optionsData.length > 0) {
          console.log("Otrzymano opcje dostawy:", optionsData);
          setDeliveryOptions(optionsData);
          
          const defaultOption = optionsData.find(opt => opt.name !== 'Odbiór osobisty') || optionsData[0];
          setDeliveryMethod(defaultOption.id);
          setSelectedDeliveryOption(defaultOption);
        }
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd pobierania opcji dostawy:', err);
    }
  };

  const handleDeliveryMethodChange = (value: string) => {
    setDeliveryMethod(value);
    const selected = deliveryOptions.find(option => option.id === value);
    if (selected) {
      setSelectedDeliveryOption(selected);
    }
  };

  const getProductImageUrl = () => {
    if (!product?.image_url) return '/placeholder.svg';
    
    try {
      if (typeof product.image_url === 'string') {
        try {
          const images = JSON.parse(product.image_url);
          if (Array.isArray(images) && images.length > 0) {
            return images[0];
          }
        } catch (e) {
          return product.image_url;
        }
      } else if (Array.isArray(product.image_url) && product.image_url.length > 0) {
        return product.image_url[0];
      }
    } catch (e) {
      console.error("Błąd parsowania URL obrazka:", e);
    }
    
    return '/placeholder.svg';
  };

  useEffect(() => {
    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  return {
    isLoading,
    product,
    deliveryOptions,
    deliveryMethod,
    selectedDeliveryOption,
    handleDeliveryMethodChange,
    getProductImageUrl
  };
}
