import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface DeliveryOption {
  id: string;
  name: string;
  price: number;
}

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  inpostPoint: string;
  comments: string;
  blikCode: string;
}

export type CheckoutStep = 'personal' | 'delivery' | 'payment' | 'summary';

export interface UseCheckoutProps {
  productId: string;
  isTestMode: boolean;
}

export const SERVICE_FEE_PERCENTAGE = 0.015;

export function useCheckout({ productId, isTestMode = false }: { productId: string; isTestMode?: boolean }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [product, setProduct] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('blik');
  const [activeStep, setActiveStep] = useState<CheckoutStep>('personal');
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<DeliveryOption | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountValue, setDiscountValue] = useState(0);
  const [discountData, setDiscountData] = useState<any>(null);
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    inpostPoint: '',
    comments: '',
    blikCode: '',
  });
  
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

  useEffect(() => {
    if (productId) {
      fetchProductData();
    }
  }, [productId]);
  
  const handleDeliveryMethodChange = (value: string) => {
    setDeliveryMethod(value);
    const selected = deliveryOptions.find(option => option.id === value);
    if (selected) {
      setSelectedDeliveryOption(selected);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const goToNextStep = () => {
    const steps: CheckoutStep[] = ['personal', 'delivery', 'payment', 'summary'];
    const currentIndex = steps.findIndex(step => step === activeStep);
    if (currentIndex < steps.length - 1) {
      if (activeStep === 'personal') {
        if (!validatePersonalData()) return;
      } else if (activeStep === 'delivery') {
        if (!validateDeliveryData()) return;
      } else if (activeStep === 'payment') {
        if (!validatePaymentData()) return;
      }
      
      setActiveStep(steps[currentIndex + 1]);
    }
  };
  
  const goToPreviousStep = () => {
    const steps: CheckoutStep[] = ['personal', 'delivery', 'payment', 'summary'];
    const currentIndex = steps.findIndex(step => step === activeStep);
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1]);
    }
  };
  
  const validatePersonalData = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    const fieldLabels = {
      firstName: 'Imię',
      lastName: 'Nazwisko',
      email: 'Email',
      phone: 'Telefon',
      address: 'Adres',
      city: 'Miasto',
      postalCode: 'Kod pocztowy',
    };
    
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast({
          title: "Błąd walidacji",
          description: `Pole ${fieldLabels[field as keyof typeof fieldLabels]} jest wymagane.`,
          variant: "destructive",
        });
        return false;
      }
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Błąd walidacji",
        description: "Wprowadź poprawny adres email.",
        variant: "destructive",
      });
      return false;
    }
    
    const phoneRegex = /^\d{9}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
      toast({
        title: "Błąd walidacji",
        description: "Wprowadź poprawny 9-cyfrowy numer telefonu.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const validateDeliveryData = () => {
    const fieldLabels = {
      firstName: 'Imię',
      lastName: 'Nazwisko',
      email: 'Email',
      phone: 'Telefon',
      address: 'Adres',
      city: 'Miasto',
      postalCode: 'Kod pocztowy',
    };
    
    if (!deliveryMethod) {
      toast({
        title: "Błąd walidacji",
        description: "Wybierz metodę dostawy.",
        variant: "destructive",
      });
      return false;
    }
    
    const isCourierDelivery = selectedDeliveryOption?.name === 'Kurier';
    if (isCourierDelivery) {
      const requiredFields = ['address', 'city', 'postalCode'];
      
      for (const field of requiredFields) {
        if (!formData[field as keyof typeof formData]) {
          toast({
            title: "Błąd walidacji",
            description: `Pole ${fieldLabels[field as keyof typeof fieldLabels]} jest wymagane.`,
            variant: "destructive",
          });
          return false;
        }
      }
      
      const postalCodeRegex = /^\d{2}-\d{3}$/;
      if (!postalCodeRegex.test(formData.postalCode)) {
        toast({
          title: "Błąd walidacji",
          description: "Wprowadź poprawny kod pocztowy w formacie XX-XXX.",
          variant: "destructive",
        });
        return false;
      }
    }
    
    const isInpostDelivery = selectedDeliveryOption?.name === 'Paczkomat InPost';
    if (isInpostDelivery && !formData.inpostPoint) {
      toast({
        title: "Błąd walidacji",
        description: "Wybierz paczkomat InPost.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const validatePaymentData = () => {
    if (!paymentMethod) {
      toast({
        title: "Błąd walidacji",
        description: "Wybierz metodę płatności.",
        variant: "destructive",
      });
      return false;
    }
    
    if (paymentMethod === 'blik' && (!formData.blikCode || formData.blikCode.length !== 6)) {
      toast({
        title: "Błąd walidacji",
        description: "Wprowadź poprawny 6-cyfrowy kod BLIK.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const validateForm = () => {
    if (!agreeToTerms) {
      toast({
        title: "Błąd",
        description: "Musisz zaakceptować regulamin, aby kontynuować.",
        variant: "destructive",
      });
      return false;
    }
    
    return validatePersonalData() && validateDeliveryData() && validatePaymentData();
  };
  
  const simulatePaymentProcessing = (callback: (success: boolean) => void) => {
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      callback(true);
    }, 1500);
  };
  
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
      
      // Sprawdzamy walidność kodu rabatowego
      const subtotal = getPrice() + getDeliveryCost();
      
      // Przykładowe proste sprawdzenie - w rzeczywistej aplikacji użylibyśmy funkcji supabase
      if (discountCode === "RABAT10") {
        setDiscountApplied(true);
        const productPrice = getPrice();
        setDiscountValue(productPrice * 0.1);
        setDiscountData({
          discount_id: null,
          code: "RABAT10",
          discount_type: "percentage",
          discount_value: 10
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
          discount_id: null,
          code: "RABAT20",
          discount_type: "percentage",
          discount_value: 20
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
          discount_id: null,
          code: "DOSTAWA",
          discount_type: "delivery",
          discount_value: 100
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
          discount_id: null,
          code: "BEZPROWIZJI",
          discount_type: "fee",
          discount_value: 100
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
  
  const getPrice = () => {
    if (!product) return 0;
    
    if (isTestMode && product.testing_price !== null && product.testing_price !== undefined) {
      return product.testing_price;
    }
    
    return product.price || 0;
  };
  
  const getDeliveryCost = () => {
    if (!selectedDeliveryOption) return 0;
    return selectedDeliveryOption.price || 0;
  };
  
  const getDiscountAmount = () => {
    if (!discountApplied || !discountData) return 0;
    
    const price = getPrice();
    
    if (discountData.discount_type === 'percentage') {
      return -(price * (discountData.discount_value / 100));
    } else if (discountData.discount_type === 'fixed') {
      return -discountData.discount_value;
    }
    
    return 0;
  };
  
  const getServiceFee = () => {
    const price = getPrice();
    const deliveryCost = getDeliveryCost();
    const baseAmount = price + deliveryCost;
    
    return baseAmount * 0.015;
  };
  
  const getTotalCost = () => {
    const price = getPrice();
    const deliveryCost = getDeliveryCost();
    const discountAmount = getDiscountAmount();
    const serviceFee = getServiceFee();
    
    return price + deliveryCost + discountAmount + serviceFee;
  };
  
  const removeDiscount = () => {
    setDiscountCode('');
    setDiscountApplied(false);
    setDiscountValue(0);
    setDiscountData(null);
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
  
  return {
    isLoading,
    isProcessing,
    setIsProcessing,
    product,
    paymentMethod,
    setPaymentMethod,
    activeStep,
    setActiveStep,
    deliveryMethod,
    deliveryOptions,
    selectedDeliveryOption,
    agreeToTerms,
    setAgreeToTerms,
    discountCode,
    setDiscountCode,
    discountApplied,
    discountValue,
    discountData,
    formData,
    setFormData,
    handleInputChange,
    handleDeliveryMethodChange,
    goToNextStep,
    goToPreviousStep,
    validateForm,
    simulatePaymentProcessing,
    handleApplyDiscount,
    removeDiscount,
    getPrice,
    getDeliveryCost,
    getDiscountAmount,
    getServiceFee,
    getTotalCost,
    getProductImageUrl,
  };
}
