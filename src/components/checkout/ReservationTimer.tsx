
import { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

interface ReservationTimerProps {
  expiresAt: string;
  onExpire: () => void;
}

export function ReservationTimer({ expiresAt, onExpire }: ReservationTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number }>({ minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const expireHandled = useRef(false);

  useEffect(() => {
    if (!expiresAt) {
      console.log("Brak daty wygaśnięcia rezerwacji");
      return;
    }
    
    // Reset stanu przy zmianie expiresAt
    setExpired(false);
    expireHandled.current = false;
    
    console.log("Ustawiam timer rezerwacji do:", expiresAt);
    
    // Funkcja do kalkulacji pozostałego czasu
    const calculateTimeLeft = () => {
      try {
        const expiryTime = new Date(expiresAt).getTime();
        const now = new Date().getTime();
        const difference = expiryTime - now;
        
        if (difference <= 0) {
          console.log("Rezerwacja wygasła! Czas wygaśnięcia:", expiresAt);
          
          setExpired(true);
          setTimeLeft({ minutes: 0, seconds: 0 });
          
          // Wywołaj onExpire tylko raz
          if (!expireHandled.current) {
            expireHandled.current = true;
            console.log("Wywołuję onExpire - rezerwacja wygasła");
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

    // Oblicz czas od razu przy montowaniu
    calculateTimeLeft();
    
    // Wyczyść interwał jeśli istnieje
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Ustaw nowy interwał co sekundę
    intervalRef.current = setInterval(calculateTimeLeft, 1000);
    
    // Wyczyść interwał przy odmontowaniu
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [expiresAt, onExpire]);

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
