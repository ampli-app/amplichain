
import { useState } from 'react';
import { ReservationData } from './types';

export function useReservationState() {
  const [isLoading, setIsLoading] = useState(false);
  const [reservationData, setReservationData] = useState<ReservationData | null>(null);
  const [reservationExpiresAt, setReservationExpiresAt] = useState<Date | null>(null);
  const [paymentDeadline, setPaymentDeadline] = useState<Date | null>(null);
  const [isOrderInitiated, setIsOrderInitiated] = useState(false);
  
  return {
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
  };
}
