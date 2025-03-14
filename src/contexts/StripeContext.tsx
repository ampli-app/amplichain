
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PAYMENT_PROVIDERS } from '@/hooks/checkout/payment/paymentConfig';
import { supabase } from '@/integrations/supabase/client';

// Publiczny klucz Stripe (powinien być w zmiennych środowiskowych)
// W przyszłości można przenieść do zmiennych środowiskowych Supabase
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

  // Funkcja do tworzenia intencji płatności z wykorzystaniem Supabase Edge Function
  const createPaymentIntent = async (amount: number, currency: string = 'pln'): Promise<string | null> => {
    try {
      console.log(`Tworzenie intencji płatności: ${amount} ${currency}`);
      
      // Wywołanie funkcji Supabase do tworzenia intencji płatności
      const { data, error } = await supabase.rpc('create_stripe_payment_intent', {
        p_amount: Math.round(amount * 100), // Stripe wymaga kwoty w najmniejszych jednostkach waluty (np. grosze)
        p_currency: currency,
        p_payment_method: 'card', // Domyślna metoda płatności
        p_description: 'Płatność za zamówienie w sklepie'
      });
      
      if (error) {
        console.error('Błąd podczas tworzenia intencji płatności:', error);
        return null;
      }
      
      // Pobieranie client secret z odpowiedzi
      const clientSecret = data.client_secret;
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
