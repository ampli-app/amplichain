
import { createContext, useContext, ReactNode } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { STRIPE_CONFIG } from '@/hooks/checkout/payment/paymentConfig';

// Inicjalizacja Stripe z kluczem publikowalnym
const stripePromise = loadStripe(STRIPE_CONFIG.PUBLISHABLE_KEY);

// Typy dla kontekstu
type StripeContextType = {
  isStripeLoaded: boolean;
};

// Utworzenie kontekstu
const StripeContext = createContext<StripeContextType | undefined>(undefined);

// Dostawca (provider) kontekstu Stripe
export function StripeProvider({ children }: { children: ReactNode }) {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}

// Hook do korzystania z kontekstu Stripe
export function useStripe() {
  const context = useContext(StripeContext);
  if (!context) {
    // Zwracamy domyślne wartości jeśli kontekst nie jest dostępny
    return { isStripeLoaded: false };
  }
  return context;
}
