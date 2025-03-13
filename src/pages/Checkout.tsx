
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
    }
  }, [id, navigate]);
  
  const checkout = useCheckout({ 
    productId: id && isValidUUID(id) ? id : '', 
    isTestMode 
  });
  
  const { isLoading: isReservationLoading, reservationExpiresAt, reservationData } = useOrderReservation({ 
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
  
  // Dodatkowy efekt - jeśli mamy dane rezerwacji, ustaw orderInitialized na true
  useEffect(() => {
    if (reservationData && !orderInitialized) {
      console.log("Mamy dane rezerwacji, ustawiamy orderInitialized na true");
      setOrderInitialized(true);
    }
  }, [reservationData, orderInitialized]);
  
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
