
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Loader2, ArrowLeft } from 'lucide-react';
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

export default function Checkout() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isTestMode = location.pathname.includes('/test');
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  
  // Inicjalizacja hooka checkout
  const checkout = useCheckout({ 
    productId: id || '', 
    isTestMode 
  });
  
  // Ustawienie domyślnego emaila użytkownika
  useEffect(() => {
    if (user?.email) {
      checkout.setFormData(prev => ({
        ...prev,
        email: user.email || ''
      }));
    }
  }, [user?.email]);
  
  // Obsługa złożenia zamówienia
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Walidacja przed złożeniem zamówienia
    if (!checkout.validateForm()) {
      return;
    }
    
    // Symulacja przetwarzania płatności
    checkout.simulatePaymentProcessing((success) => {
      if (success) {
        toast({
          title: "Płatność zaakceptowana",
          description: "Twoje zamówienie zostało złożone pomyślnie!",
        });
        
        // Przekierowanie na stronę potwierdzenia
        const url = isTestMode 
          ? `/checkout/success/${id}?mode=test` 
          : `/checkout/success/${id}?mode=buy`;
        
        navigate(url);
      }
    });
  };
  
  // Przekierowanie niezalogowanych użytkowników
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
  
  // Stan ładowania
  if (checkout.isLoading) {
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
  
  // Brak produktu
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
  
  // Brak opcji dostawy
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
          
          {/* Progress Bar */}
          <CheckoutProgress activeStep={checkout.activeStep} />
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Lewa kolumna - formularz krok po kroku */}
              <div className="lg:col-span-2">
                {/* Krok 1: Dane osobowe */}
                {checkout.activeStep === 'personal' && (
                  <PersonalInfoForm
                    formData={checkout.formData}
                    handleInputChange={checkout.handleInputChange}
                    goToNextStep={checkout.goToNextStep}
                  />
                )}
                
                {/* Krok 2: Dostawa */}
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
                
                {/* Krok 3: Płatność */}
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
                
                {/* Krok 4: Podsumowanie i finalizacja */}
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
                    onSubmit={handleSubmit}
                  />
                )}
              </div>
              
              {/* Prawa kolumna - podsumowanie zamówienia */}
              <div className="lg:col-span-1">
                <CheckoutSummary
                  productTitle={checkout.product.title}
                  productImageUrl={checkout.getProductImageUrl()}
                  price={checkout.getPrice()}
                  deliveryCost={checkout.getDeliveryCost()}
                  discountValue={checkout.getDiscountAmount()}
                  discountApplied={checkout.discountApplied}
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
