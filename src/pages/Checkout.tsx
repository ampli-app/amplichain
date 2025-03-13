
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CheckoutLayout } from '@/components/checkout/CheckoutLayout';
import { CheckoutContent } from '@/components/checkout/CheckoutContent';
import { CheckoutLoadingState } from '@/components/checkout/CheckoutLoadingState';
import { CheckoutErrorState } from '@/components/checkout/CheckoutErrorState';
import { ReservationExpiredState } from '@/components/checkout/ReservationExpiredState';
import { useCheckout } from '@/hooks/checkout/useCheckout';
import { useOrderReservation } from '@/hooks/checkout/useOrderReservation';
import { toast } from '@/components/ui/use-toast';
import { isValidUUID } from '@/utils/orderUtils';

export default function Checkout() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isTestMode = searchParams.get('mode') === 'test';
  const orderId = searchParams.get('orderId');
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  
  // Stan do śledzenia inicjalizacji zamówienia
  const [orderInitialized, setOrderInitialized] = useState(false);
  const [reservationExpired, setReservationExpired] = useState(false);
  const [pageIsReady, setPageIsReady] = useState(false);
  
  // Sprawdź poprawność ID produktu
  useEffect(() => {
    if (id && !isValidUUID(id)) {
      console.error("Nieprawidłowy format ID produktu:", id);
      toast({
        title: "Błąd produktu",
        description: "Nieprawidłowy format ID produktu. Prosimy o kontakt z administracją.",
        variant: "destructive",
      });
      navigate('/marketplace');
    } else {
      setPageIsReady(true);
    }
  }, [id, navigate]);
  
  const checkout = useCheckout({ 
    productId: id && isValidUUID(id) ? id : '', 
    isTestMode 
  });
  
  const { 
    isLoading: isReservationLoading, 
    reservationExpiresAt, 
    reservationData,
    checkExistingReservation
  } = useOrderReservation({ 
    productId: id && isValidUUID(id) ? id : '', 
    isTestMode 
  });
  
  // Sprawdzanie, czy użytkownik jest zalogowany i czy ID produktu jest dostępne
  useEffect(() => {
    if (!isLoggedIn) {
      console.log("Użytkownik nie jest zalogowany, przekierowuję do logowania");
      toast({
        title: "Wymagane logowanie",
        description: "Aby dokonać zakupu, musisz być zalogowany.",
        variant: "destructive",
      });
      navigate('/login', { state: { returnUrl: location.pathname + location.search }});
      return;
    }
    
    if (!id) {
      console.log("Brak ID produktu, przekierowuję do marketplace");
      navigate('/marketplace');
      return;
    }
    
    if (!isValidUUID(id)) {
      console.error("Nieprawidłowy format ID produktu:", id);
      return;
    }
    
    console.log("Checkout zainicjowany dla produktu:", id, "Mode:", isTestMode ? "test" : "purchase", "User:", user?.id);
  }, [id, isLoggedIn, navigate, isTestMode, user?.id, location.pathname, location.search]);
  
  // Sprawdź czy mamy dane rezerwacji i ustaw orderInitialized
  useEffect(() => {
    // Jeśli mamy dane rezerwacji, ale orderInitialized jest false
    if (reservationData && !orderInitialized) {
      console.log("Mamy dane rezerwacji, ustawiamy orderInitialized na true");
      setOrderInitialized(true);
    }
    
    // Sprawdź istniejące rezerwacje przy montowaniu komponentu
    if (user?.id && id && isValidUUID(id) && !orderInitialized && !reservationData) {
      console.log("Sprawdzamy istniejące rezerwacje przy montowaniu komponentu");
      checkExistingReservation(id).then(data => {
        if (data) {
          console.log("Znaleziono istniejącą rezerwację przy ładowaniu strony:", data);
          setOrderInitialized(true);
        }
      });
    }
  }, [reservationData, orderInitialized, user?.id, id, checkExistingReservation]);
  
  // Dodatkowy efekt do debugowania
  useEffect(() => {
    console.log("Stan komponentu Checkout:", {
      id,
      isTestMode,
      orderInitialized,
      reservationExpired,
      productLoading: checkout.isLoading,
      reservationLoading: isReservationLoading,
      product: checkout.product ? "załadowany" : "brak",
      deliveryOptions: checkout.deliveryOptions.length,
      reservationData: reservationData ? "dostępne" : "brak"
    });
  }, [
    id, 
    isTestMode, 
    orderInitialized, 
    reservationExpired, 
    checkout.isLoading, 
    isReservationLoading, 
    checkout.product,
    checkout.deliveryOptions.length,
    reservationData
  ]);
  
  const handleReservationExpire = () => {
    console.log("Rezerwacja wygasła, aktualizacja stanu");
    setReservationExpired(true);
  };
  
  if (!pageIsReady) {
    return (
      <CheckoutLayout productId={id || ''}>
        <CheckoutLoadingState />
      </CheckoutLayout>
    );
  }
  
  if (checkout.isLoading || isReservationLoading) {
    return (
      <CheckoutLayout productId={id || ''}>
        <CheckoutLoadingState />
      </CheckoutLayout>
    );
  }
  
  if (!checkout.product) {
    return (
      <CheckoutLayout productId={id || ''}>
        <CheckoutErrorState type="product" />
      </CheckoutLayout>
    );
  }
  
  if (checkout.deliveryOptions.length === 0) {
    return (
      <CheckoutLayout productId={id || ''}>
        <CheckoutErrorState type="delivery" />
      </CheckoutLayout>
    );
  }
  
  if (reservationExpired) {
    return (
      <CheckoutLayout productId={id || ''}>
        <ReservationExpiredState productId={id || ''} />
      </CheckoutLayout>
    );
  }
  
  return (
    <CheckoutLayout productId={id || ''}>
      <CheckoutContent 
        productId={id || ''}
        isTestMode={isTestMode}
        orderId={orderId}
        onReservationExpire={handleReservationExpire}
        orderInitialized={orderInitialized}
        setOrderInitialized={setOrderInitialized}
      />
    </CheckoutLayout>
  );
}
