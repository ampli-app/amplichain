
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useOrderReservation } from '@/hooks/checkout/useOrderReservation';
import { loadStripe } from '@/components/checkout/LoadStripeScript';
import { OrderDetails } from '@/hooks/checkout/useOrderReservationType';

interface CheckoutPaymentHandlerProps {
  productId: string;
  isTestMode: boolean;
  paymentMethod: string;
  formData: any;
  setIsProcessing: (value: boolean) => void;
  simulatePaymentProcessing: (callback: (success: boolean) => void) => void;
}

export function CheckoutPaymentHandler({
  productId,
  isTestMode,
  paymentMethod,
  formData,
  setIsProcessing,
  simulatePaymentProcessing
}: CheckoutPaymentHandlerProps) {
  const navigate = useNavigate();
  
  const {
    reservationData,
    confirmOrder,
    initiatePayment,
    handlePaymentResult
  } = useOrderReservation({ productId, isTestMode });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reservationData) {
      console.error("Brak danych rezerwacji przy potwierdzaniu zamówienia");
      toast({
        title: "Błąd rezerwacji",
        description: "Nie znaleziono rezerwacji. Odśwież stronę i spróbuj ponownie.",
        variant: "destructive",
      });
      return;
    }
    
    const orderDetails: OrderDetails = {
      address: formData.address,
      city: formData.city,
      postalCode: formData.postalCode,
      comments: formData.comments,
      paymentMethod: paymentMethod
    };
    
    console.log("Potwierdzam zamówienie z danymi:", orderDetails);
    setIsProcessing(true);
    
    try {
      const confirmed = await confirmOrder(orderDetails);
      
      if (!confirmed) {
        toast({
          title: "Błąd zamówienia",
          description: "Nie udało się potwierdzić zamówienia. Spróbuj ponownie.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      
      console.log("Zamówienie potwierdzone, inicjuję płatność");
      const paymentIntent = await initiatePayment();
      
      if (!paymentIntent) {
        toast({
          title: "Błąd płatności",
          description: "Nie udało się zainicjować płatności. Spróbuj ponownie.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      
      console.log("Zainicjowano płatność:", paymentIntent);
      
      if (paymentMethod === 'stripe') {
        const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
        if (!stripe) {
          toast({
            title: "Błąd",
            description: "Nie udało się załadować modułu płatności Stripe.",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }
        
        const { error } = await stripe.redirectToCheckout({
          clientSecret: paymentIntent.client_secret,
        });
        
        if (error) {
          console.error('Błąd przekierowania do Stripe:', error);
          toast({
            title: "Błąd płatności",
            description: error.message || "Wystąpił problem z przekierowaniem do płatności.",
            variant: "destructive",
          });
          setIsProcessing(false);
        }
      } else {
        simulatePaymentProcessing(async (success) => {
          const updated = await handlePaymentResult(success);
          
          if (success && updated) {
            toast({
              title: "Płatność zaakceptowana",
              description: "Twoje zamówienie zostało złożone pomyślnie!",
            });
            
            const url = isTestMode 
              ? `/checkout/success/${productId}?mode=test` 
              : `/checkout/success/${productId}?mode=buy`;
            
            navigate(url);
          } else {
            toast({
              title: "Błąd płatności",
              description: "Wystąpił problem z płatnością. Spróbuj ponownie.",
              variant: "destructive",
            });
            setIsProcessing(false);
          }
        });
      }
    } catch (error) {
      console.error("Błąd podczas przetwarzania płatności:", error);
      toast({
        title: "Błąd systemu",
        description: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return { handleSubmit };
}
