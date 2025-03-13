
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ReservationTimerProps {
  expiresAt: string;
  onExpire: () => void;
}

export function ReservationTimer({ expiresAt, onExpire }: ReservationTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number }>({ minutes: 0, seconds: 0 });
  const [isWarning, setIsWarning] = useState(false);
  
  useEffect(() => {
    if (!expiresAt) return;
    
    const expiresAtDate = new Date(expiresAt);
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = expiresAtDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        console.log("Timer wygasł o:", expiresAtDate);
        setTimeLeft({ minutes: 0, seconds: 0 });
        onExpire();
        return false;
      }
      
      const minutes = Math.floor(difference / 1000 / 60);
      const seconds = Math.floor((difference / 1000) % 60);
      
      setTimeLeft({ minutes, seconds });
      
      // Ustaw stan ostrzeżenia jeśli zostało mniej niż 3 minuty
      setIsWarning(minutes < 3);
      
      return true;
    };
    
    // Wywołaj od razu, aby wyświetlić początkowy czas
    const hasTimeLeft = calculateTimeLeft();
    if (!hasTimeLeft) return;
    
    // Ustaw interval co 1 sekundę
    const timerId = setInterval(() => {
      const hasTimeLeft = calculateTimeLeft();
      if (!hasTimeLeft) {
        clearInterval(timerId);
      }
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [expiresAt, onExpire]);
  
  const formatTime = (value: number) => value.toString().padStart(2, '0');
  
  return (
    <div className={`flex items-center gap-2 font-medium ${isWarning ? 'text-red-600 dark:text-red-400' : ''}`}>
      <Clock className={`h-5 w-5 ${isWarning ? 'animate-pulse' : ''}`} />
      <span>
        Rezerwacja wygasa za: {formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
      </span>
    </div>
  );
}
