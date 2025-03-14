import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Loader2, ArrowLeft, AlertTriangle, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CheckoutProgress } from '@/components/checkout/CheckoutProgress';
import { PersonalInfoForm } from '@/components/checkout/PersonalInfoForm';
import { DeliveryForm } from '@/components/checkout/DeliveryForm';
import { PaymentForm } from '@/components/checkout/PaymentForm';
import { OrderSummaryForm } from '@/components/checkout/OrderSummaryForm';
import { CheckoutSummary } from '@/components/checkout/CheckoutSummary';
import { useCheckout } from '@/hooks/checkout/useCheckout';
import { ReservationTimer } from '@/components/checkout/ReservationTimer';
import { useOrderReservation } from '@/hooks/checkout/useOrderReservation';
import { usePayment } from '@/hooks/checkout/usePayment';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { StripePaymentElement } from '@/components/checkout/StripePaymentElement';
import { PaymentRedirection } from '@/components/checkout/PaymentRedirection';
import { useStripe } from '@/contexts/StripeContext';
import { PAYMENT_METHODS } from '@/hooks/checkout/payment/paymentConfig';

const stripePromise = loadStripe('pk_test_51PknP5HWq4SaAphRMxLKZvKm5A3fJRXiajDAD5kwwAGGEmT4ZjBYayqWspHZcViJBs9hfA1ADCRtDIZh6p7UOlS900OdLD37Ya');

export default function Checkout() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isTestMode = searchParams.get('mode') === 'test';
  const orderId = searchParams.get('orderId');
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  
  const [reservationExpired, setReservationExpired] = useState(false);
  const [isProcessingReservation, setIsProcessingReservation] = useState(false);
  const [hasCheckedExistingReservation, setHasCheckedExistingReservation] = useState(false);
  
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const stripeContext = useStripe();
  
  const checkout = useCheckout({ 
    productId: id || '', 
    isTestMode 
  });
  
  const { 
    isLoading: isReservationLoading, 
    reservationData,
    setReservationData, 
    reservationExpiresAt,
    initiateOrder,
    confirmOrder,
    cancelPreviousReservations,
    markReservationAsExpired,
    checkExpiredReservations,
    checkExistingReservation
  } = useOrderReservation({ 
    productId: id || '', 
    isTestMode 
  });
  
  const {
    initiatePayment,
    handlePaymentResult,
    simulatePaymentProcessing,
    isProcessingPayment,
    clientSecret,
    setClientSecret
  } = usePayment();
  
  useEffect(() => {
    const handleReservation = async () => {
      if (!checkout.product || !user) return;
      
      await checkExpiredReservations();
      
      if (orderId || hasCheckedExistingReservation) {
        if (orderId && !hasCheckedExistingReservation) {
          console.log("Kontynuowanie istniejącego zamówienia z ID:", orderId);
          const existingReservation = await checkExistingReservation();
          setHasCheckedExistingReservation(true);
          
          if (existingReservation) {
            console.log("Znaleziono istniejącą rezerwację:", existingReservation);
            return;
          }
        }
        
        if (hasCheckedExistingReservation && !reservationData) {
          console.log("Brak aktywnej rezerwacji po sprawdzeniu, nie tworzymy nowej automatycznie");
          return;
        }
      } else {
        setHasCheckedExistingReservation(true);
        
        const existingReservation = await checkExistingReservation();
        
        if (existingReservation) {
          console.log("Znaleziono istniejącą rezerwację bez orderId w URL:", existingReservation);
          return;
        }
        
        console.log("Brak orderId i istniejącej rezerwacji - nie tworzymy nowej automatycznie");
      }
    };
    
    if (checkout.product && user) {
      handleReservation();
    }
    
    const intervalId = setInterval(() => {
      if (user && id) {
        checkExpiredReservations();
      }
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [checkout.product, user, orderId]);
  
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
    
    setReservationExpired(true);
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
    
    const orderData = {
      address: checkout.formData.address,
      city: checkout.formData.city,
      postalCode: checkout.formData.postalCode,
      comments: checkout.formData.comments,
      paymentMethod: checkout.paymentMethod,
      deliveryMethod: checkout.deliveryMethod,
      productPrice: checkout.getPrice(),
      deliveryPrice: checkout.getDeliveryCost(),
      serviceFee: checkout.getServiceFee(),
      discount: checkout.getDiscountAmount(),
      discountCode: checkout.discountApplied ? checkout.discountCode : null,
      discountCodeId: null
    };
    
    console.log('Przekazuję do potwierdzenia zamówienia dane:', orderData);
    
    const confirmed = await confirmOrder(orderData);
    
    if (!confirmed) {
      return;
    }
    
    checkout.setIsProcessing(true);
    
    try {
      if (checkout.paymentMethod === PAYMENT_METHODS.CARD) {
        const paymentIntent = await initiatePayment(reservationData, null);
        
        if (!paymentIntent) {
          checkout.setIsProcessing(false);
          return;
        }
        
        setStripeClientSecret(paymentIntent.client_secret);
        setShowStripeForm(true);
      } else {
        const paymentIntent = await initiatePayment(reservationData, null);
        
        if (!paymentIntent) {
          checkout.setIsProcessing(false);
          return;
        }
        
        simulatePaymentProcessing(
          {
            paymentMethod: checkout.paymentMethod,
            blikCode: checkout.formData.blikCode
          },
          reservationData,
          (result) => {
            checkout.setIsProcessing(false);
            
            if (result.success) {
              toast({
                title: "Płatność zaakceptowana",
                description: "Twoje zamówienie zostało złożone pomyślnie!",
              });
              
              let baseUrl = isTestMode 
                ? `/checkout/success/${id}?mode=test` 
                : `/checkout/success/${id}?mode=buy`;
              
              const currentUrlParams = new URLSearchParams(location.search);
              currentUrlParams.delete('mode');
              
              if (currentUrlParams.toString()) {
                baseUrl = baseUrl + (baseUrl.includes('?') ? '&' : '?') + currentUrlParams.toString();
              }
              
              const finalUrl = baseUrl + (baseUrl.includes('?') ? '&' : '?') + `mode=${isTestMode ? 'test' : 'buy'}`;
              
              navigate(finalUrl);
            } else {
              toast({
                title: "Błąd płatności",
                description: result.message,
                variant: "destructive"
              });
            }
          }
        );
      }
    } catch (error) {
      console.error('Błąd podczas przetwarzania płatności:', error);
      checkout.setIsProcessing(false);
      toast({
        title: "Błąd płatności",
        description: "Wystąpił nieoczekiwany błąd podczas przetwarzania płatności.",
        variant: "destructive"
      });
    }
  };
  
  const handleStripePaymentSuccess = () => {
    checkout.setIsProcessing(false);
    handlePaymentResult(true, reservationData);
    toast({
      title: "Płatność zaakceptowana",
      description: "Twoje zamówienie zostało złożone pomyślnie!",
    });
    
    let baseUrl = isTestMode 
      ? `/checkout/success/${id}?mode=test` 
      : `/checkout/success/${id}`;
    
    const currentUrlParams = new URLSearchParams(location.search);
    currentUrlParams.delete('mode');
    
    if (currentUrlParams.toString()) {
      baseUrl = baseUrl + (baseUrl.includes('?') ? '&' : '?') + currentUrlParams.toString();
    }
    
    const finalUrl = baseUrl + (baseUrl.includes('?') ? '&' : '?') + `mode=${isTestMode ? 'test' : 'buy'}`;
    
    navigate(finalUrl);
  };
  
  const handleStripePaymentError = (error: string) => {
    checkout.setIsProcessing(false);
    handlePaymentResult(false, reservationData);
    toast({
      title: "Błąd płatności",
      description: error,
      variant: "destructive"
    });
  };
  
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    if (!id) {
      navigate('/marketplace');
      return;
    }
  }, [id, isLoggedIn, navigate]);
  
  if (checkout.isLoading || isReservationLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4">
              <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" />
            </div>
            <p className="text-rhythm-600 dark:text-rhythm-400">Ładowanie danych produktu...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!checkout.product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Błąd pobrania produktu</h2>
            <p className="text-rhythm-600 dark:text-rhythm-400 mb-6">
              Nie udało się pobrać informacji o produkcie. Spróbuj ponownie później.
            </p>
            <Button asChild>
              <Link to="/marketplace">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Wróć do Rynku
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (checkout.deliveryOptions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Brak opcji dostawy</h2>
            <p className="text-rhythm-600 dark:text-rhythm-400 mb-6">
              Dla tego produktu nie skonfigurowano opcji dostawy. Skontaktuj się ze sprzedawcą.
            </p>
            <Button asChild>
              <Link to={`/marketplace/${id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Wróć do produktu
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (reservationExpired) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Rezerwacja wygasła</h2>
            <p className="text-rhythm-600 dark:text-rhythm-400 mb-6">
              Czas na dokończenie zamówienia upłynął. Możesz rozpocząć proces zakupowy od nowa.
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild variant="default">
                <Link to={`/marketplace/${id}`}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Wróć do produktu
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/marketplace">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Wróć do Rynku
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (showStripeForm && stripeClientSecret) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16">
          <div className="container max-w-xl mx-auto px-4">
            <div className="mb-8">
              <Button 
                variant="outline" 
                onClick={() => setShowStripeForm(false)}
                className="inline-flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Wróć do podsumowania
              </Button>
            </div>
            
            <h1 className="text-2xl font-bold mb-6 text-center">Płatność kartą</h1>
            
            <div className="mb-6">
              <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
                <StripePaymentElement 
                  clientSecret={stripeClientSecret}
                  onSuccess={handleStripePaymentSuccess}
                  onError={handleStripePaymentError}
                  orderId={reservationData?.id}
                  returnUrl={isTestMode 
                    ? `${window.location.origin}/checkout/success/${id}?mode=test&orderId=${reservationData?.id}` 
                    : `${window.location.origin}/checkout/success/${id}?mode=buy&orderId=${reservationData?.id}`
                  }
                />
              </Elements>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <div className="mb-8">
            <Link 
              to={`/marketplace/${id}`} 
              className="inline-flex items-center gap-2 text-rhythm-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Wróć do produktu
            </Link>
          </div>
          
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
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
