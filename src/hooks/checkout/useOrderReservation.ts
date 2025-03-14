
import { useEffect } from 'react';
import { OrderReservationProps } from './reservation/types';
import { useReservationState } from './reservation/useReservationState';
import { useReservationCleanup } from './reservation/useReservationCleanup';
import { useReservationCheck } from './reservation/useReservationCheck';
import { useCreateReservation } from './reservation/useCreateReservation';
import { useConfirmReservation } from './reservation/useConfirmReservation';
import { usePaymentProcessing } from './reservation/usePaymentProcessing';
import { useAuth } from '@/contexts/AuthContext';

export function useOrderReservation({ productId, isTestMode = false }: OrderReservationProps) {
  const { user } = useAuth();
  
  const {
    isLoading,
    setIsLoading,
    reservationData,
    setReservationData,
    reservationExpiresAt,
    setReservationExpiresAt,
    paymentDeadline,
    setPaymentDeadline,
    isOrderInitiated,
    setIsOrderInitiated
  } = useReservationState();
  
  const {
    checkExpiredReservations,
    cancelPreviousReservations,
    markReservationAsExpired
  } = useReservationCleanup({ productId });
  
  const { checkExistingReservation, isChecking } = useReservationCheck({
    productId,
    setReservationData,
    setReservationExpiresAt,
    setPaymentDeadline,
    setIsLoading
  });
  
  const { initiateOrder, isInitiating } = useCreateReservation({
    productId,
    setReservationData,
    setReservationExpiresAt,
    setIsLoading
  });
  
  const { confirmOrder } = useConfirmReservation({
    reservationData,
    reservationExpiresAt,
    setReservationData,
    setPaymentDeadline,
    setIsLoading
  });
  
  const { initiatePayment, handlePaymentResult } = usePaymentProcessing({
    reservationData,
    paymentDeadline,
    setReservationData,
    setIsLoading
  });
  
  useEffect(() => {
    if (user && productId) {
      checkExpiredReservations().then(() => {
        checkExistingReservation();
      });
      
      const intervalId = setInterval(() => {
        checkExpiredReservations().then(() => {
          checkExistingReservation();
        });
      }, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, [user, productId]);
  
  return {
    isLoading,
    reservationData,
    setReservationData,
    reservationExpiresAt,
    paymentDeadline,
    isChecking,
    isInitiating,
    initiateOrder: async (product: any, discount: any = null, testMode: boolean = false) => {
      // Zabezpieczenie przed podwójnym wywołaniem
      if (isOrderInitiated || isChecking || isInitiating) {
        console.log('Zamówienie jest już w trakcie inicjowania lub sprawdzania - zapobieganie duplikatom');
        return reservationData;
      }
      
      setIsOrderInitiated(true);
      try {
        return await initiateOrder(product, discount, testMode || isTestMode);
      } finally {
        setIsOrderInitiated(false);
      }
    },
    confirmOrder,
    initiatePayment,
    handlePaymentResult,
    checkExistingReservation,
    cancelPreviousReservations,
    markReservationAsExpired,
    checkExpiredReservations
  };
}
