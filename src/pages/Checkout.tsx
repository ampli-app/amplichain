
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

export default function Checkout() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isTestMode = searchParams.get('mode') === 'test';
  const orderId = searchParams.get('orderId');
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  
  const [reservationExpired, setReservationExpired] = useState(false);
  
  const checkout = useCheckout({ 
    productId: id || '', 
    isTestMode 
  });
  
  const { isLoading: isReservationLoading } = useOrderReservation({ 
    productId: id || '', 
    isTestMode 
  });
  
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
  
  const handleReservationExpire = () => {
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
      />
    </CheckoutLayout>
  );
}
