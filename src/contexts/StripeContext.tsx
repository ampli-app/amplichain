
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PAYMENT_PROVIDERS } from '@/hooks/checkout/payment/paymentConfig';
import { supabase } from '@/integrations/supabase/client';

// Publiczny klucz Stripe - musi być z tego samego konta co tajny klucz
const stripePublishableKey = 'pk_test_51PknP5HWq4SaAphRMxLKZvKm5A3fJRXiajDAD5kwwAGGEmT4ZjBYayqWspHZcViJBs9hfA1ADCRtDIZh6p7UOlS900OdLD37Ya';

// Inicjalizacja Stripe
const stripePromise = loadStripe(stripePublishableKey);

type StripeContextType = {
  isStripeReady: boolean;
  getPaymentProvider: (method: string) => string;
  getPaymentElementOptions: () => Record<string, any>;
  createPaymentIntent: (amount: number, currency: string, metadata?: Record<string, any>, orderId?: string) => Promise<string | null>;
  verifyPaymentIntent: (paymentIntentId: string) => Promise<any>;
};

const defaultContext: StripeContextType = {
  isStripeReady: false,
  getPaymentProvider: () => PAYMENT_PROVIDERS.STRIPE,
  getPaymentElementOptions: () => ({}),
  createPaymentIntent: async () => null,
  verifyPaymentIntent: async () => null,
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
  const createPaymentIntent = async (
    amount: number, 
    currency: string = 'pln', 
    metadata: Record<string, any> = {},
    orderId?: string
  ): Promise<string | null> => {
    try {
      console.log(`Tworzenie intencji płatności: ${amount} ${currency} dla zamówienia ${orderId}`);
      
      // Wywołanie Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount,
          currency,
          metadata,
          orderId
        }
      });
      
      if (error) {
        console.error('Błąd podczas tworzenia intencji płatności:', error);
        return null;
      }
      
      console.log('Odpowiedź z Supabase Edge Function:', data);
      
      if (!data || !data.clientSecret) {
        console.error('Brak client secret w odpowiedzi z serwera');
        return null;
      }
      
      return data.clientSecret;
    } catch (error) {
      console.error('Błąd podczas tworzenia intencji płatności:', error);
      return null;
    }
  };
  
  // Funkcja do weryfikacji statusu intencji płatności
  const verifyPaymentIntent = async (paymentIntentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment-intent', {
        body: {
          paymentIntentId
        }
      });
      
      if (error) {
        console.error('Błąd podczas weryfikacji intencji płatności:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Błąd podczas weryfikacji intencji płatności:', error);
      return null;
    }
  };

  const value = {
    isStripeReady: isStripeInitialized,
    getPaymentProvider,
    getPaymentElementOptions,
    createPaymentIntent,
    verifyPaymentIntent,
  };

  return (
    <StripeContext.Provider value={value}>
      <Elements stripe={stripePromise} options={{
        locale: 'pl',
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0570de',
            colorBackground: '#ffffff',
            colorText: '#30313d',
            colorDanger: '#df1b41',
            fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
            spacingUnit: '4px',
            borderRadius: '4px',
          }
        }
      }}>
        {children}
      </Elements>
    </StripeContext.Provider>
  );
};
