
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ReservationTimerProps {
  expiresAt: Date | string;
  onExpire?: () => void;
}

export function ReservationTimer({ expiresAt, onExpire }: ReservationTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  
  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft('--:--');
      return;
    }
    
    const expirationDate = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = expirationDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        setTimeLeft('00:00');
        setIsExpired(true);
        if (onExpire && !isExpired) onExpire();
        return;
      }
      
      // Konwersja na minuty i sekundy
      const minutes = Math.floor(difference / 1000 / 60);
      const seconds = Math.floor((difference / 1000) % 60);
      
      // Formatowanie do MM:SS
      setTimeLeft(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };
    
    // Obliczenie początkowego czasu
    calculateTimeLeft();
    
    // Aktualizacja co sekundę
    const interval = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(interval);
  }, [expiresAt, onExpire, isExpired]);
  
  if (!expiresAt) {
    return null;
  }
  
  return (
    <div className={`flex items-center gap-2 font-medium ${isExpired ? 'text-red-500' : 'text-amber-600'}`}>
      <Clock className="h-4 w-4" />
      <span>
        {isExpired ? 'Czas rezerwacji wygasł' : `Rezerwacja wygasa za: ${timeLeft}`}
      </span>
    </div>
  );
}
