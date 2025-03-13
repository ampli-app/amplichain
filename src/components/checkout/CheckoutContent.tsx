
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
import { CheckoutOrderInitializer } from './CheckoutOrderInitializer';
import { CheckoutFormManager } from './CheckoutFormManager';
import { CheckoutPaymentHandler } from './CheckoutPaymentHandler';

interface CheckoutContentProps {
  productId: string;
  isTestMode: boolean;
  orderId: string | null;
  onReservationExpire: () => void;
  orderInitialized: boolean;
  setOrderInitialized: (value: boolean) => void;
}

export function CheckoutContent({ 
  productId, 
  isTestMode,
  orderId,
  onReservationExpire,
  orderInitialized,
  setOrderInitialized
}: CheckoutContentProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [initializing, setInitializing] = useState(true);
  
  const checkout = useCheckout({ 
    productId: productId, 
    isTestMode 
  });
  
  const { 
    isLoading,
    reservationData, 
    reservationExpiresAt,
    markReservationAsExpired
  } = useOrderReservation({ 
    productId: productId, 
    isTestMode 
  });
  
  const handleReservationExpire = async () => {
    console.log("Obsługa wygaśnięcia rezerwacji");
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
  
  const { handleSubmit } = CheckoutPaymentHandler({
    productId,
    isTestMode,
    paymentMethod: checkout.paymentMethod,
    formData: checkout.formData,
    setIsProcessing: checkout.setIsProcessing,
    simulatePaymentProcessing: checkout.simulatePaymentProcessing
  });
  
  // Pokaż indykator ładowania podczas inicjalizacji
  if (initializing || isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p>Inicjalizacja zamówienia...</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <CheckoutOrderInitializer
        productId={productId}
        isTestMode={isTestMode}
        product={checkout.product}
        orderInitialized={orderInitialized}
        setOrderInitialized={setOrderInitialized}
        setInitializing={setInitializing}
      />
      
      <h1 className="text-3xl font-bold mb-4 text-center">
        {isTestMode ? 'Rezerwacja testowa' : 'Finalizacja zakupu'}
      </h1>
      
      <CheckoutFormManager
        user={user}
        checkout={checkout}
        reservationExpiresAt={reservationExpiresAt}
        handleReservationExpire={handleReservationExpire}
      />
      
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
