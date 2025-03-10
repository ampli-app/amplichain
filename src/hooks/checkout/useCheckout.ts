
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

export function useCheckout({ productId, isTestMode }: UseCheckoutProps) {
  // Stan ładowania
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Stan produktu i płatności
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
  
  // Stan danych formularza
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
  
  // Pobieranie danych produktu
  const fetchProductData = async () => {
    setIsLoading(true);
    
    try {
      console.log("Pobieranie produktu o ID:", productId);
      
      // Pobierz dane produktu
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
        
        // Pobierz opcje dostawy dla produktu
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
  
  // Pobieranie opcji dostawy
  const fetchDeliveryOptions = async (productId: string) => {
    try {
      console.log("Pobieranie opcji dostawy dla produktu ID:", productId);
      
      // Pobierz opcje dostawy dla produktu
      const { data: productDeliveryData, error: productDeliveryError } = await supabase
        .from('product_delivery_options')
        .select('delivery_option_id')
        .eq('product_id', productId);
      
      if (productDeliveryError) {
        console.error('Błąd pobierania opcji dostawy produktu:', productDeliveryError);
        return;
      }
      
      // Pobierz szczegóły opcji dostawy
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
          
          // Ustaw pierwszą opcję dostawy jako domyślną (z wyjątkiem odbioru osobistego)
          const defaultOption = optionsData.find(opt => opt.name !== 'Odbiór osobisty') || optionsData[0];
          setDeliveryMethod(defaultOption.id);
          setSelectedDeliveryOption(defaultOption);
        }
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd pobierania opcji dostawy:', err);
    }
  };

  // Inicjalizacja danych przy montowaniu komponentu
  useEffect(() => {
    if (productId) {
      fetchProductData();
    }
  }, [productId]);
  
  // Obsługa zmiany metody dostawy
  const handleDeliveryMethodChange = (value: string) => {
    setDeliveryMethod(value);
    const selected = deliveryOptions.find(option => option.id === value);
    if (selected) {
      setSelectedDeliveryOption(selected);
    }
  };
  
  // Obsługa zmian w formularzu
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Przejście do następnego kroku
  const goToNextStep = () => {
    const steps: CheckoutStep[] = ['personal', 'delivery', 'payment', 'summary'];
    const currentIndex = steps.findIndex(step => step === activeStep);
    if (currentIndex < steps.length - 1) {
      // Walidacja przed przejściem do następnego kroku
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
  
  // Powrót do poprzedniego kroku
  const goToPreviousStep = () => {
    const steps: CheckoutStep[] = ['personal', 'delivery', 'payment', 'summary'];
    const currentIndex = steps.findIndex(step => step === activeStep);
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1]);
    }
  };
  
  // Walidacja danych osobowych
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
    
    // Walidacja formatu email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Błąd walidacji",
        description: "Wprowadź poprawny adres email.",
        variant: "destructive",
      });
      return false;
    }
    
    // Walidacja numeru telefonu
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
  
  // Walidacja danych dostawy
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
    
    // Walidacja adresu dla dostawy kurierem
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
      
      // Walidacja kodu pocztowego
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
    
    // Walidacja paczkomatu dla dostawy InPost
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
  
  // Walidacja danych płatności
  const validatePaymentData = () => {
    if (!paymentMethod) {
      toast({
        title: "Błąd walidacji",
        description: "Wybierz metodę płatności.",
        variant: "destructive",
      });
      return false;
    }
    
    // Walidacja kodu BLIK
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
  
  // Walidacja wszystkich danych przed złożeniem zamówienia
  const validateForm = () => {
    // Walidacja zgody na regulamin
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
  
  // Symulacja przetwarzania płatności
  const simulatePaymentProcessing = (callback: (success: boolean) => void) => {
    setIsProcessing(true);
    
    // Symulacja opóźnienia przetwarzania płatności
    setTimeout(() => {
      setIsProcessing(false);
      callback(true); // Sukces płatności
    }, 1500);
  };
  
  // Obsługa kodu rabatowego
  const handleApplyDiscount = () => {
    if (!discountCode) {
      toast({
        title: "Błąd",
        description: "Wprowadź kod rabatowy.",
        variant: "destructive",
      });
      return;
    }
    
    const price = isTestMode && product?.testing_price 
      ? parseFloat(product.testing_price) 
      : parseFloat(product?.price || 0);
      
    // Symulacja weryfikacji kodu rabatowego
    if (discountCode === "RABAT10") {
      setDiscountApplied(true);
      setDiscountValue(price * 0.1); // 10% zniżki
      toast({
        title: "Sukces",
        description: "Kod rabatowy został zastosowany! Otrzymujesz 10% zniżki.",
      });
    } else if (discountCode === "RABAT20") {
      setDiscountApplied(true);
      setDiscountValue(price * 0.2); // 20% zniżki
      toast({
        title: "Sukces",
        description: "Kod rabatowy został zastosowany! Otrzymujesz 20% zniżki.",
      });
    } else {
      toast({
        title: "Błąd",
        description: "Nieprawidłowy kod rabatowy.",
        variant: "destructive",
      });
    }
  };
  
  // Kalkulacje cenowe
  const getPrice = () => isTestMode && product?.testing_price 
    ? parseFloat(product.testing_price) 
    : parseFloat(product?.price || 0);
  
  const getDeliveryCost = () => selectedDeliveryOption ? selectedDeliveryOption.price : 0;
  const getDiscountAmount = () => discountApplied ? discountValue : 0;
  const getTotalCost = () => getPrice() + getDeliveryCost() - getDiscountAmount();
  
  // Usunięcie rabatu
  const removeDiscount = () => {
    setDiscountCode('');
    setDiscountApplied(false);
    setDiscountValue(0);
  };
  
  // Przygotowanie URL obrazka produktu
  const getProductImageUrl = () => {
    if (!product?.image_url) return '/placeholder.svg';
    
    try {
      if (typeof product.image_url === 'string') {
        // Spróbuj sparsować jako JSON
        try {
          const images = JSON.parse(product.image_url);
          if (Array.isArray(images) && images.length > 0) {
            return images[0];
          }
        } catch (e) {
          // To nie jest JSON, więc traktujemy jako zwykły string
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
    getTotalCost,
    getProductImageUrl,
  };
}
