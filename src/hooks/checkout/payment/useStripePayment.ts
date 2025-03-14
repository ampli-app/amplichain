
import { useState } from 'react';
import { useStripe as useStripeElements, useElements } from '@stripe/react-stripe-js';
import { StripePaymentElementOptions } from '@stripe/stripe-js';
import { toast } from '@/components/ui/use-toast';
import { STRIPE_CONFIG } from './paymentConfig';

/**
 * Hook do obsługi płatności Stripe
 * Na razie tylko konfiguracja, będzie rozwijany w kolejnych krokach
 */
export function useStripePayment() {
  const [isLoading, setIsLoading] = useState(false);
  const stripe = useStripeElements();
  const elements = useElements();

  // Opcje dla elementu płatności Stripe
  const paymentElementOptions: StripePaymentElementOptions = {
    layout: "tabs",
    defaultValues: {
      billingDetails: {
        name: '',
        email: '',
        phone: '',
        address: {
          country: 'PL',
        }
      }
    }
  };

  /**
   * Sprawdza, czy Stripe zostało prawidłowo załadowane
   */
  const isStripeReady = () => {
    return !!stripe && !!elements;
  };
  
  /**
   * Pomocnicza funkcja do wyświetlania błędów
   */
  const handlePaymentError = (error: any) => {
    setIsLoading(false);
    console.error('Błąd płatności Stripe:', error);
    toast({
      title: "Błąd płatności",
      description: error?.message || "Wystąpił nieoczekiwany błąd podczas przetwarzania płatności.",
      variant: "destructive",
    });
    return false;
  };

  return {
    stripe,
    elements,
    isLoading,
    setIsLoading,
    paymentElementOptions,
    isStripeReady,
    handlePaymentError,
    currency: STRIPE_CONFIG.CURRENCY
  };
}
