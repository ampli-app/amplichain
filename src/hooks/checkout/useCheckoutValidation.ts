
import { toast } from '@/components/ui/use-toast';
import { FormData } from './types';

export function useCheckoutValidation() {
  const validatePersonalData = (formData: FormData) => {
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
  
  const validateDeliveryData = (
    formData: FormData, 
    deliveryMethod: string, 
    selectedDeliveryOption: { name: string } | null
  ) => {
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
  
  const validatePaymentData = (paymentMethod: string, formData: FormData) => {
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

  const validateForm = (
    formData: FormData, 
    agreeToTerms: boolean, 
    deliveryMethod: string, 
    selectedDeliveryOption: { name: string } | null, 
    paymentMethod: string
  ) => {
    if (!agreeToTerms) {
      toast({
        title: "Błąd",
        description: "Musisz zaakceptować regulamin, aby kontynuować.",
        variant: "destructive",
      });
      return false;
    }
    
    return validatePersonalData(formData) && 
      validateDeliveryData(formData, deliveryMethod, selectedDeliveryOption) && 
      validatePaymentData(paymentMethod, formData);
  };

  return {
    validatePersonalData,
    validateDeliveryData,
    validatePaymentData,
    validateForm
  };
}
