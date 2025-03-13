
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
  // Wypełnij dane użytkownika automatycznie
  useEffect(() => {
    if (user) {
      const fullName = user.user_metadata?.full_name || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      checkout.setFormData(prev => ({
        ...prev,
        firstName: firstName,
        lastName: lastName,
        email: user.email || ''
      }));
    }
  }, [user, checkout]);

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
