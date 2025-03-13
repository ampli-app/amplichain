
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { OrderReservationProps } from './useOrderReservationType';
import { useReservationManagement } from './useReservationManagement';
import { usePaymentProcessing } from './usePaymentProcessing';
import { isValidUUID } from '@/utils/orderUtils';

export * from './useOrderReservationType';

export const useOrderReservation = ({ productId, isTestMode = false }: OrderReservationProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    reservationData,
    reservationExpiresAt,
    markReservationAsExpired,
    checkExpiredReservations,
    checkExistingReservation,
    cancelPreviousReservations,
    initiateOrder,
    confirmOrder
  } = useReservationManagement(user?.id);
  
  const {
    paymentIntentData,
    initiatePayment: processPayment,
    handlePaymentResult: processPaymentResult,
    cancelPayment
  } = usePaymentProcessing();
  
  // Wrapper for initiatePayment to include loading state
  const initiatePayment = async () => {
    setIsLoading(true);
    try {
      const result = await processPayment(reservationData, user);
      return result;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Wrapper for handlePaymentResult
  const handlePaymentResult = async (success: boolean) => {
    return processPaymentResult(success, reservationData, paymentIntentData);
  };
  
  // Efekt sprawdzający istniejącą rezerwację przy montowaniu komponentu
  useEffect(() => {
    if (user && productId && isValidUUID(productId)) {
      console.log("Sprawdzam istniejącą rezerwację dla:", productId);
      checkExistingReservation(productId).then(data => {
        if (data) {
          console.log("Znaleziono istniejącą rezerwację po załadowaniu:", data);
        }
      });
    } else if (productId && !isValidUUID(productId)) {
      console.error("Nieprawidłowy format ID produktu:", productId);
    }
  }, [user?.id, productId, checkExistingReservation]);
  
  return {
    isLoading,
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
    handlePaymentResult,
    cancelPayment
  };
};
