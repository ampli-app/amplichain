
import { useEffect, useState } from 'react';

interface LoadStripeScriptProps {
  onLoad?: () => void;
  onError?: () => void;
}

export function LoadStripeScript({ onLoad, onError }: LoadStripeScriptProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!document.getElementById('stripe-js') && !loaded && !error) {
      const script = document.createElement('script');
      script.id = 'stripe-js';
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      
      script.onload = () => {
        setLoaded(true);
        if (onLoad) onLoad();
      };
      
      script.onerror = () => {
        setError(true);
        if (onError) onError();
      };
      
      document.body.appendChild(script);
    }
    
    return () => {
      // Script stays loaded globally, no need to remove
    };
  }, [onLoad, onError, loaded, error]);

  return null;
}

// Helper function to load Stripe
export async function loadStripe(publishableKey: string) {
  if (!window.Stripe) {
    console.error('Stripe.js nie został załadowany');
    return null;
  }
  
  try {
    return window.Stripe(publishableKey);
  } catch (error) {
    console.error('Błąd inicjalizacji Stripe:', error);
    return null;
  }
}

// Add the type definition to global Window
declare global {
  interface Window {
    Stripe?: (key: string) => any;
  }
}
