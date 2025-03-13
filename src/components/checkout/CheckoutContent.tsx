
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { CheckoutProgress } from '@/components/checkout/CheckoutProgress';
import { PersonalInfoForm } from '@/components/checkout/PersonalInfoForm';
import { DeliveryForm } from '@/components/checkout/DeliveryForm';
import { PaymentForm } from '@/components/checkout/PaymentForm';
import { OrderSummaryForm } from '@/components/checkout/OrderSummaryForm';
import { CheckoutSummary } from '@/components/checkout/CheckoutSummary';
import { ReservationTimer } from '@/components/checkout/ReservationTimer';
import { useCheckout } from '@/hooks/checkout/useCheckout';
import { useOrderReservation } from '@/hooks/checkout/useOrderReservation';
import { loadStripe } from '@/components/checkout/LoadStripeScript';

interface CheckoutContentProps {
  productId: string;
  isTestMode: boolean;
  orderId: string | null;
  onReservationExpire: () => void;
}

export function CheckoutContent({ 
  productId, 
  isTestMode,
  orderId,
  onReservationExpire
}: CheckoutContentProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [orderInitialized, setOrderInitialized] = useState(false);
  
  const checkout = useCheckout({ 
    productId: productId, 
    isTestMode 
  });
  
  const { 
    reservationData, 
    reservationExpiresAt,
    initiateOrder,
    confirmOrder,
    cancelPreviousReservations,
    markReservationAsExpired,
    checkExpiredReservations,
    checkExistingReservation,
    initiatePayment,
    handlePaymentResult
  } = useOrderReservation({ 
    productId: productId, 
    isTestMode 
  });
  
  useEffect(() => {
    const handleReservation = async () => {
      if (!checkout.product || !user || orderInitialized) return;
      
      await checkExpiredReservations();
      
      if (orderId) {
        console.log("Kontynuowanie istniejącego zamówienia z ID:", orderId);
        const existingReservation = await checkExistingReservation();
        
        if (existingReservation) {
          console.log("Znaleziono istniejącą rezerwację:", existingReservation);
          setOrderInitialized(true);
          return;
        }
      }
      
      if (!reservationData) {
        await cancelPreviousReservations();
        
        // Upewnijmy się, że przekazujemy owner_id jeśli nie ma user_id
        const productWithSeller = {
          ...checkout.product,
          owner_id: checkout.product.owner_id || checkout.product.user_id
        };
        
        const reservation = await initiateOrder(productWithSeller, isTestMode);
        if (!reservation) {
          toast({
            title: "Błąd rezerwacji",
            description: "Nie udało się utworzyć rezerwacji produktu.",
            variant: "destructive",
          });
        } else {
          setOrderInitialized(true);
        }
      }
    };
    
    if (checkout.product && user && !orderInitialized) {
      handleReservation();
    }
    
    const intervalId = setInterval(() => {
      if (user && productId) {
        checkExpiredReservations();
      }
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [checkout.product, user, reservationData, orderInitialized]);
  
  useEffect(() => {
    if (user?.email) {
      checkout.setFormData(prev => ({
        ...prev,
        email: user.email || ''
      }));
    }
  }, [user?.email]);
  
  const handleReservationExpire = async () => {
    if (reservationData?.id) {
      await markReservationAsExpired(reservationData.id);
    }
    
    onReservationExpire();
    toast({
      title: "Rezerwacja wygasła",
      description: "Czas na dokończenie zamówienia upłynął. Rozpocznij proces od nowa.",
      variant: "destructive",
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkout.validateForm()) {
      return;
    }
    
    const confirmed = await confirmOrder({
      address: checkout.formData.address,
      city: checkout.formData.city,
      postalCode: checkout.formData.postalCode,
      comments: checkout.formData.comments,
      paymentMethod: checkout.paymentMethod
    });
    
    if (!confirmed) {
      return;
    }
    
    const paymentIntent = await initiatePayment();
    
    if (!paymentIntent) {
      toast({
        title: "Błąd płatności",
        description: "Nie udało się zainicjować płatności. Spróbuj ponownie.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Zainicjowano płatność:", paymentIntent);
    checkout.setIsProcessing(true);
    
    if (checkout.paymentMethod === 'stripe') {
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
      if (!stripe) {
        toast({
          title: "Błąd",
          description: "Nie udało się załadować modułu płatności Stripe.",
          variant: "destructive",
        });
        checkout.setIsProcessing(false);
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
        checkout.setIsProcessing(false);
      }
    } else {
      checkout.simulatePaymentProcessing(async (success) => {
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
        }
      });
    }
  };
  
  return (
    <>
      <h1 className="text-3xl font-bold mb-4 text-center">
        {isTestMode ? 'Rezerwacja testowa' : 'Finalizacja zakupu'}
      </h1>
      
      {reservationExpiresAt && (
        <Alert className="mb-6 max-w-lg mx-auto">
          <AlertDescription className="flex justify-center">
            <ReservationTimer 
              expiresAt={reservationExpiresAt} 
              onExpire={handleReservationExpire} 
            />
          </AlertDescription>
        </Alert>
      )}
      
      <CheckoutProgress activeStep={checkout.activeStep} />
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {checkout.activeStep === 'personal' && (
              <PersonalInfoForm
                formData={checkout.formData}
                handleInputChange={checkout.handleInputChange}
                goToNextStep={checkout.goToNextStep}
              />
            )}
            
            {checkout.activeStep === 'delivery' && (
              <DeliveryForm
                formData={checkout.formData}
                deliveryMethod={checkout.deliveryMethod}
                deliveryOptions={checkout.deliveryOptions}
                selectedDeliveryOption={checkout.selectedDeliveryOption}
                handleInputChange={checkout.handleInputChange}
                handleDeliveryMethodChange={checkout.handleDeliveryMethodChange}
                goToNextStep={checkout.goToNextStep}
                goToPreviousStep={checkout.goToPreviousStep}
                productLocation={checkout.product.location}
              />
            )}
            
            {checkout.activeStep === 'payment' && (
              <PaymentForm
                formData={checkout.formData}
                paymentMethod={checkout.paymentMethod}
                setPaymentMethod={checkout.setPaymentMethod}
                handleInputChange={checkout.handleInputChange}
                goToNextStep={checkout.goToNextStep}
                goToPreviousStep={checkout.goToPreviousStep}
              />
            )}
            
            {checkout.activeStep === 'summary' && (
              <OrderSummaryForm
                formData={checkout.formData}
                paymentMethod={checkout.paymentMethod}
                selectedDeliveryOption={checkout.selectedDeliveryOption}
                agreeToTerms={checkout.agreeToTerms}
                setAgreeToTerms={checkout.setAgreeToTerms}
                goToPreviousStep={checkout.goToPreviousStep}
                isProcessing={checkout.isProcessing}
                totalCost={checkout.getTotalCost()}
                serviceFee={checkout.getServiceFee()}
                onSubmit={handleSubmit}
              />
            )}
          </div>
          
          <div className="lg:col-span-1">
            <CheckoutSummary
              productTitle={checkout.product.title}
              productImageUrl={checkout.getProductImageUrl()}
              price={checkout.getPrice()}
              deliveryCost={checkout.getDeliveryCost()}
              discountValue={checkout.getDiscountAmount()}
              discountApplied={checkout.discountApplied}
              serviceFee={checkout.getServiceFee()}
              totalCost={checkout.getTotalCost()}
              isTestMode={isTestMode}
              discountCode={checkout.discountCode}
              setDiscountCode={checkout.setDiscountCode}
              handleApplyDiscount={checkout.handleApplyDiscount}
              removeDiscount={checkout.removeDiscount}
            />
          </div>
        </div>
      </form>
    </>
  );
}
