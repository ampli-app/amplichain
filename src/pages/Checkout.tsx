
import { useState, useEffect } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { loadStripe } from '@/components/checkout/LoadStripeScript';

export default function Checkout() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isTestMode = searchParams.get('mode') === 'test';
  const orderId = searchParams.get('orderId'); // Pobieramy orderId z URL
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  
  const [reservationExpired, setReservationExpired] = useState(false);
  
  const checkout = useCheckout({ 
    productId: id || '', 
    isTestMode 
  });
  
  const { 
    isLoading: isReservationLoading, 
    reservationData, 
    reservationExpiresAt,
    paymentIntentData,
    initiateOrder,
    confirmOrder,
    cancelPreviousReservations,
    markReservationAsExpired,
    checkExpiredReservations,
    checkExistingReservation,
    initiatePayment,
    handlePaymentResult
  } = useOrderReservation({ 
    productId: id || '', 
    isTestMode 
  });
  
  useEffect(() => {
    const handleReservation = async () => {
      if (!checkout.product || !user) return;
      
      await checkExpiredReservations();
      
      if (orderId) {
        console.log("Kontynuowanie istniejącego zamówienia z ID:", orderId);
        const existingReservation = await checkExistingReservation();
        
        if (existingReservation) {
          console.log("Znaleziono istniejącą rezerwację:", existingReservation);
          return;
        }
      }
      
      if (!reservationData && !reservationExpired) {
        await cancelPreviousReservations();
        
        const reservation = await initiateOrder(checkout.product, isTestMode);
        if (!reservation) {
          toast({
            title: "Błąd rezerwacji",
            description: "Nie udało się utworzyć rezerwacji produktu.",
            variant: "destructive",
          });
        }
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
  }, [checkout.product, user, reservationData, reservationExpired]);
  
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
            ? `/checkout/success/${id}?mode=test` 
            : `/checkout/success/${id}?mode=buy`;
          
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
