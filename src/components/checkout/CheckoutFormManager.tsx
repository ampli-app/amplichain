
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ReservationTimer } from '@/components/checkout/ReservationTimer';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CheckoutFormManagerProps {
  user: any;
  checkout: any;
  reservationExpiresAt: string | null;
  handleReservationExpire: () => void;
}

export function CheckoutFormManager({
  user,
  checkout,
  reservationExpiresAt,
  handleReservationExpire
}: CheckoutFormManagerProps) {
  // Wypełnij email użytkownika automatycznie
  useEffect(() => {
    if (user?.email) {
      checkout.setFormData(prev => ({
        ...prev,
        email: user.email || ''
      }));
    }
  }, [user?.email, checkout]);

  return (
    <>
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
    </>
  );
}
