
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DiscountData } from './types';

export function useDiscountHandler(getPrice: () => number, getDeliveryCost: () => number, getServiceFee: () => number) {
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountValue, setDiscountValue] = useState(0);
  const [discountData, setDiscountData] = useState<DiscountData | null>(null);

  const handleApplyDiscount = async () => {
    if (!discountCode) {
      toast({
        title: "Błąd",
        description: "Wprowadź kod rabatowy.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const user = supabase.auth.getUser();
      const userId = (await user).data.user?.id;
      
      if (!userId) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby skorzystać z kodu rabatowego.",
          variant: "destructive",
        });
        return;
      }
      
      const subtotal = getPrice() + getDeliveryCost();
      
      // Normalnie byśmy sprawdzili kod rabatowy w bazie danych
      // Dla demonstracji używamy kilku predefiniowanych kodów
      if (discountCode === "RABAT10") {
        setDiscountApplied(true);
        const productPrice = getPrice();
        setDiscountValue(productPrice * 0.1);
        setDiscountData({
          id: "example-id-1",
          code: "RABAT10",
          type: "percentage",
          value: 10
        });
        toast({
          title: "Sukces",
          description: "Kod rabatowy został zastosowany! Otrzymujesz 10% zniżki na produkt.",
        });
      } else if (discountCode === "RABAT20") {
        setDiscountApplied(true);
        const productPrice = getPrice();
        setDiscountValue(productPrice * 0.2);
        setDiscountData({
          id: "example-id-2",
          code: "RABAT20",
          type: "percentage",
          value: 20
        });
        toast({
          title: "Sukces",
          description: "Kod rabatowy został zastosowany! Otrzymujesz 20% zniżki na produkt.",
        });
      } else if (discountCode === "DOSTAWA") {
        setDiscountApplied(true);
        const deliveryCost = getDeliveryCost();
        setDiscountValue(deliveryCost);
        setDiscountData({
          id: "example-id-3",
          code: "DOSTAWA",
          type: "delivery",
          value: 100
        });
        toast({
          title: "Sukces",
          description: "Kod rabatowy został zastosowany! Darmowa dostawa.",
        });
      } else if (discountCode === "BEZPROWIZJI") {
        setDiscountApplied(true);
        const serviceFee = getServiceFee();
        setDiscountValue(serviceFee);
        setDiscountData({
          id: "example-id-4",
          code: "BEZPROWIZJI",
          type: "fee",
          value: 100
        });
        toast({
          title: "Sukces",
          description: "Kod rabatowy został zastosowany! Brak opłaty serwisowej.",
        });
      } else {
        toast({
          title: "Błąd",
          description: "Nieprawidłowy kod rabatowy.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Błąd podczas weryfikacji kodu rabatowego:", error);
      toast({
        title: "Błąd",
        description: "Wystąpił problem podczas weryfikacji kodu rabatowego.",
        variant: "destructive",
      });
    }
  };

  const removeDiscount = () => {
    setDiscountCode('');
    setDiscountApplied(false);
    setDiscountValue(0);
    setDiscountData(null);
  };

  const getDiscountAmount = () => discountApplied ? discountValue : 0;

  return {
    discountCode,
    setDiscountCode,
    discountApplied,
    discountValue,
    discountData,
    handleApplyDiscount,
    removeDiscount,
    getDiscountAmount
  };
}
