
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PAYMENT_PROVIDERS } from '@/hooks/checkout/payment/paymentConfig';
import { supabase } from '@/integrations/supabase/client';

// Publiczny klucz Stripe (normalnie powinien być w zmiennych środowiskowych)
// TO DO: W przyszłości przenieść do zmiennych środowiskowych Supabase
const stripePublishableKey = 'pk_test_TYooMQauvdEDq54NiTphI7jx';

// Inicjalizacja Stripe
const stripePromise = loadStripe(stripePublishableKey);

type StripeContextType = {
  isStripeReady: boolean;
  getPaymentProvider: (method: string) => string;
  getPaymentElementOptions: () => Record<string, any>;
  createPaymentIntent: (amount: number, currency: string) => Promise<string | null>;
};

const defaultContext: StripeContextType = {
  isStripeReady: false,
  getPaymentProvider: () => PAYMENT_PROVIDERS.STRIPE,
  getPaymentElementOptions: () => ({}),
  createPaymentIntent: async () => null,
};

const StripeContext = createContext<StripeContextType>(defaultContext);

export const useStripe = () => useContext(StripeContext);

type StripeProviderProps = {
  children: ReactNode;
};

export const StripeProvider = ({ children }: StripeProviderProps) => {
  const [isStripeInitialized, setIsStripeInitialized] = useState(false);

  useEffect(() => {
    // Sprawdzamy, czy Stripe jest załadowany
    if (stripePromise) {
      setIsStripeInitialized(true);
    }
  }, []);

  // Określamy dostawcę płatności na podstawie metody
  const getPaymentProvider = (method: string) => {
    switch (method) {
      case 'card':
        return PAYMENT_PROVIDERS.STRIPE;
      case 'p24':
        return PAYMENT_PROVIDERS.PRZELEWY24;
      case 'blik':
        return PAYMENT_PROVIDERS.BLIK;
      default:
        return PAYMENT_PROVIDERS.STRIPE;
    }
  };

  // Opcje konfiguracyjne dla komponentu PaymentElement
  const getPaymentElementOptions = () => {
    return {
      layout: "tabs",
      defaultValues: {
        billingDetails: {
          name: '',
          email: '',
        }
      }
    };
  };

  // Funkcja do tworzenia intencji płatności
  const createPaymentIntent = async (amount: number, currency: string = 'pln'): Promise<string | null> => {
    try {
      console.log(`Tworzenie intencji płatności: ${amount} ${currency}`);
      
      // W rzeczywistym projekcie tutaj byłoby połączenie z API
      // Poniżej symulacja odpowiedzi z serwera
      
      // W przyszłości można zaimplementować faktyczne połączenie z API Stripe
      // np. poprzez funkcję Edge w Supabase
      
      // Symulacja odpowiedzi z API
      const clientSecret = `pi_3${Math.random().toString(36).substr(2, 9)}_secret_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Wygenerowano client secret:', clientSecret);
      
      return clientSecret;
    } catch (error) {
      console.error('Błąd podczas tworzenia intencji płatności:', error);
      return null;
    }
  };

  const value = {
    isStripeReady: isStripeInitialized,
    getPaymentProvider,
    getPaymentElementOptions,
    createPaymentIntent,
  };

  return (
    <StripeContext.Provider value={value}>
      <Elements stripe={stripePromise}>
        {children}
      </Elements>
    </StripeContext.Provider>
  );
};
