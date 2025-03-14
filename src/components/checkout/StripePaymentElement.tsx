
import { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { PaymentRedirection } from './PaymentRedirection';
import { toast } from '@/components/ui/use-toast';
import { useStripe as useStripeContext } from '@/contexts/StripeContext';

interface StripePaymentElementProps {
  clientSecret: string | null;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  orderId?: string;
  returnUrl?: string;
}

export function StripePaymentElement({ 
  clientSecret, 
  onSuccess, 
  onError, 
  orderId,
  returnUrl 
}: StripePaymentElementProps) {
  const stripe = useStripe();
  const elements = useElements();
  const stripeContext = useStripeContext();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);

  useEffect(() => {
    if (!stripe || !clientSecret) {
      return;
    }

    // Sprawdzamy, czy po powrocie z przekierowania statusu płatności
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!paymentIntent) return;

      console.log('Status płatności:', paymentIntent.status);

      switch (paymentIntent.status) {
        case "succeeded":
          setPaymentSuccess(true);
          onSuccess && onSuccess();
          toast({
            title: "Płatność zakończona powodzeniem",
            description: "Twoja płatność została zrealizowana pomyślnie."
          });
          break;
        case "processing":
          toast({
            title: "Płatność w trakcie przetwarzania",
            description: "Twoja płatność jest przetwarzana, prosimy o cierpliwość."
          });
          break;
        case "requires_payment_method":
          // Nic nie robimy, pokazujemy formularz płatności
          break;
        default:
          if (onError) {
            onError("Wystąpił problem z płatnością. Spróbuj ponownie.");
          }
          setErrorMessage("Wystąpił problem z płatnością. Spróbuj ponownie.");
          break;
      }
    });
  }, [stripe, clientSecret, onSuccess, onError]);

  // Funkcja pomocnicza do sprawdzenia, czy element PaymentElement jest już załadowany
  const checkElementsReady = () => {
    if (!elements) return false;
    try {
      // Próba pobrania elementu - jeśli się nie uda, nie jest jeszcze gotowy
      const element = elements.getElement(PaymentElement);
      return !!element;
    } catch (error) {
      return false;
    }
  };

  // Obsługa gotowości formularza płatności
  const handleFormReady = () => {
    console.log('Formularz płatności Stripe został załadowany');
    setIsFormReady(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      console.error("Stripe nie jest gotowy lub brak client secret");
      return;
    }

    if (!checkElementsReady()) {
      console.error("Element płatności Stripe nie jest jeszcze załadowany");
      toast({
        title: "Formularz nie jest gotowy",
        description: "Poczekaj chwilę, aż formularz płatności się załaduje i spróbuj ponownie.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Przygotuj URL powrotu
      const defaultReturnUrl = `${window.location.origin}/checkout/success/${orderId || ''}`;
      const effectiveReturnUrl = returnUrl || defaultReturnUrl;
      console.log('URL powrotu po płatności:', effectiveReturnUrl);

      // Dodaj parametry zapytania, jeśli istnieją w bieżącym URL
      const currentUrlParams = new URLSearchParams(window.location.search);
      let finalReturnUrl = effectiveReturnUrl;
      
      if (currentUrlParams.toString()) {
        // Dodaj parametry do URL powrotu
        const returnUrlObj = new URL(effectiveReturnUrl);
        currentUrlParams.forEach((value, key) => {
          returnUrlObj.searchParams.append(key, value);
        });
        finalReturnUrl = returnUrlObj.toString();
        console.log('URL powrotu z parametrami:', finalReturnUrl);
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: finalReturnUrl,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Błąd płatności:', error);
        setErrorMessage(error.message || "Wystąpił błąd podczas przetwarzania płatności");
        onError && onError(error.message || "Wystąpił błąd podczas przetwarzania płatności");
        toast({
          title: "Błąd płatności",
          description: error.message || "Wystąpił błąd podczas przetwarzania płatności",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Nieobsłużony błąd płatności:', error);
      setErrorMessage("Wystąpił nieoczekiwany błąd podczas przetwarzania płatności");
      onError && onError("Wystąpił nieoczekiwany błąd podczas przetwarzania płatności");
    } finally {
      setIsLoading(false);
    }
  };

  if (paymentSuccess) {
    return <PaymentRedirection isLoading={false} paymentSuccess={true} />;
  }

  if (errorMessage) {
    return <PaymentRedirection isLoading={false} error={errorMessage} />;
  }

  if (isLoading) {
    return <PaymentRedirection isLoading={true} paymentProvider="Stripe" />;
  }

  if (!stripe || !elements || !clientSecret) {
    return <PaymentRedirection isLoading={true} paymentProvider="Stripe" />;
  }

  // Pobieramy opcje konfiguracyjne z kontekstu
  const paymentElementOptions = stripeContext.getPaymentElementOptions();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement 
        options={paymentElementOptions}
        onReady={handleFormReady} 
      />
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || !stripe || !elements || !isFormReady}
      >
        {isLoading ? "Przetwarzanie..." : "Zapłać teraz"}
      </Button>
    </form>
  );
}
