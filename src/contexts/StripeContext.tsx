
import React, { createContext, useContext, ReactNode } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PAYMENT_PROVIDERS } from '@/hooks/checkout/payment/paymentConfig';

// Publiczny klucz Stripe (normalnie powinien być w zmiennych środowiskowych)
// TO DO: W przyszłości przenieść do zmiennych środowiskowych Supabase
const stripePublishableKey = 'pk_test_TYooMQauvdEDq54NiTphI7jx';

// Inicjalizacja Stripe
const stripePromise = loadStripe(stripePublishableKey);

type StripeContextType = {
  isStripeReady: boolean;
  getPaymentProvider: (method: string) => string;
};

const defaultContext: StripeContextType = {
  isStripeReady: false,
  getPaymentProvider: () => PAYMENT_PROVIDERS.STRIPE,
};

const StripeContext = createContext<StripeContextType>(defaultContext);

export const useStripe = () => useContext(StripeContext);

type StripeProviderProps = {
  children: ReactNode;
};

export const StripeProvider = ({ children }: StripeProviderProps) => {
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

  const value = {
    isStripeReady: true,
    getPaymentProvider,
  };

  return (
    <StripeContext.Provider value={value}>
      <Elements stripe={stripePromise}>
        {children}
      </Elements>
    </StripeContext.Provider>
  );
};
