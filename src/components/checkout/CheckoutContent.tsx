
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
  const [initializationTimeout, setInitializationTimeout] = useState(false);
  
  const checkout = useCheckout({ 
    productId: productId, 
    isTestMode 
  });
  
  const { 
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
  
  // Efekt sprawdzający stan inicjalizacji
  useEffect(() => {
    if (orderInitialized && initializing) {
      console.log("Rezerwacja już zainicjowana, zatrzymuję ładowanie");
      setInitializing(false);
    }
    
    // Jeśli mamy dane rezerwacji, ale nie mamy ustawionego orderInitialized
    if (reservationData && !orderInitialized) {
      console.log("Mamy dane rezerwacji, ale nie było ustawione orderInitialized - aktualizuję stan");
      setOrderInitialized(true);
      setInitializing(false);
    }
  }, [orderInitialized, initializing, reservationData, setOrderInitialized]);
  
  // Timer bezpieczeństwa, który zakończy inicjalizację po 5 sekundach
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (initializing) {
      timeoutId = setTimeout(() => {
        console.log("Timer bezpieczeństwa: 5 sekund oczekiwania na inicjalizację. Pokazuję przycisk ponowienia.");
        setInitializationTimeout(true);
        setInitializing(false);
      }, 5000);
    }
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [initializing]);
  
  // Handler do ponowienia inicjalizacji
  const handleRetryInitialization = () => {
    setInitializing(true);
    setInitializationTimeout(false);
    setOrderInitialized(false);
    
    // Dodaj opóźnienie, aby dać czas na wyrenderowanie się komponentu
    setTimeout(() => {
      console.log("Ponowne próbowanie inicjalizacji zamówienia");
      toast({
        title: "Ponowna próba",
        description: "Trwa ponowna inicjalizacja zamówienia...",
      });
    }, 100);
  };
  
  // Pokaż indykator ładowania podczas inicjalizacji
  if (initializing) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p>Inicjalizacja zamówienia...</p>
        </div>
      </div>
    );
  }
  
  // Pokazuje stan błędu inicjalizacji z możliwością ponowienia
  if (initializationTimeout && !orderInitialized) {
    return (
      <div className="flex flex-col justify-center items-center py-12 space-y-6 text-center">
        <div className="text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-medium mb-2">Problem z inicjalizacją zamówienia</h3>
          <p className="text-gray-500 mb-4">Nie udało się zainicjować zamówienia w oczekiwanym czasie. Możesz spróbować ponownie lub wrócić do strony produktu.</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={handleRetryInitialization}>
              Spróbuj ponownie
            </Button>
            <Button variant="outline" onClick={() => navigate(`/marketplace/${productId}`)}>
              Wróć do produktu
            </Button>
          </div>
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
