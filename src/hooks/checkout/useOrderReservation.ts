
import { useState } from 'react';
import { OrderData, OrderDetails } from './useOrderReservationType';
import { useReservationCreation } from './useReservationCreation';
import { useReservationCheck } from './useReservationCheck';
import { useReservationExpiration } from './useReservationExpiration';
import { useOrderConfirmation } from './useOrderConfirmation';
import { usePaymentInitiation } from './usePaymentInitiation';

export * from './useOrderReservationType';

export const useOrderReservation = ({ productId, isTestMode = false }: { productId: string, isTestMode?: boolean }) => {
  const [reservationData, setReservationData] = useState<OrderData | null>(null);
  const [reservationExpiresAt, setReservationExpiresAt] = useState<string | null>(null);
  
  // Pobierz hook do oznaczania rezerwacji jako wygasłej
  const { markReservationAsExpired } = useReservationExpiration();
  
  // Pobierz hook do tworzenia rezerwacji
  const reservationCreation = useReservationCreation({ 
    productId, 
    isTestMode 
  });
  
  // Ustaw stan lokalny na podstawie utworzonej rezerwacji
  if (reservationCreation.reservationData && !reservationData) {
    setReservationData(reservationCreation.reservationData);
  }
  
  if (reservationCreation.reservationExpiresAt && !reservationExpiresAt) {
    setReservationExpiresAt(reservationCreation.reservationExpiresAt);
  }
  
  // Pobierz hook do sprawdzania rezerwacji
  const { 
    checkExistingReservation,
    checkExpiredReservations
  } = useReservationCheck({ 
    productId,
    setReservationData,
    setReservationExpiresAt,
    markReservationAsExpired 
  });
  
  // Pobierz hook do potwierdzania zamówienia
  const { confirmOrder } = useOrderConfirmation(reservationData);
  
  // Pobierz hook do inicjowania płatności
  const { 
    isLoading: isPaymentLoading,
    initiatePayment,
    handlePaymentResult
  } = usePaymentInitiation(reservationData);
  
  return {
    isLoading: reservationCreation.isLoading || isPaymentLoading,
    reservationData,
    reservationExpiresAt,
    initiateOrder: reservationCreation.initiateOrder,
    checkExistingReservation,
    markReservationAsExpired,
    confirmOrder,
    initiatePayment,
    handlePaymentResult,
    checkExpiredReservations
  };
};
