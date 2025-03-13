
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
      const email = user.email || '';
      const phone = user.user_metadata?.phone || '';
      
      console.log("Wypełniam dane użytkownika:", { firstName, lastName, email, phone });
      
      // Sprawdźmy, czy formularz jest już wypełniony, aby nie nadpisywać
      // danych, które użytkownik mógł już wprowadzić
      checkout.setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || firstName,
        lastName: prev.lastName || lastName,
        email: prev.email || email,
        phone: prev.phone || phone
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
