
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ReservationTimerProps {
  expiresAt: string;
  onExpire: () => void;
}

export function ReservationTimer({ expiresAt, onExpire }: ReservationTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number }>({ minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    // Funkcja do kalkulacji pozostałego czasu
    const calculateTimeLeft = () => {
      try {
        if (!expiresAt) {
          console.log("Brak daty wygaśnięcia rezerwacji");
          return;
        }
        
        const expiryTime = new Date(expiresAt).getTime();
        const now = new Date().getTime();
        const difference = expiryTime - now;
        
        if (difference <= 0) {
          console.log("Rezerwacja wygasła! Czas wygaśnięcia:", expiresAt);
          
          if (!expired) {
            setExpired(true);
            setTimeLeft({ minutes: 0, seconds: 0 });
            onExpire();
          }
          return;
        }
        
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ minutes, seconds });
      } catch (error) {
        console.error("Błąd podczas kalkulacji czasu:", error);
        setTimeLeft({ minutes: 0, seconds: 0 });
      }
    };

    // Reset stanu expired przy zmianie expiresAt
    if (expiresAt) {
      setExpired(false);
      
      // Wykonaj obliczenie od razu przy montowaniu komponentu
      calculateTimeLeft();
      
      // Ustaw interwał co sekundę
      const interval = setInterval(calculateTimeLeft, 1000);
      
      // Wyczyść interwał przy odmontowaniu komponentu
      return () => clearInterval(interval);
    }
  }, [expiresAt, expired, onExpire]);

  // Jeśli nie ma daty wygaśnięcia, nie renderuj timera
  if (!expiresAt) {
    return null;
  }

  return (
    <div className="flex items-center justify-center text-sm font-medium">
      <Clock className="mr-2 h-4 w-4" />
      <span>
        Rezerwacja wygasa za: 
        <span className="font-bold ml-1">
          {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </span>
    </div>
  );
}
