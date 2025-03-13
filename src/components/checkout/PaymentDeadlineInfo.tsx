
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface PaymentDeadlineInfoProps {
  deadline: Date | string;
  onExpire?: () => void;
}

export function PaymentDeadlineInfo({ deadline, onExpire }: PaymentDeadlineInfoProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  
  useEffect(() => {
    const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline;
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = deadlineDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        setTimeLeft('Termin płatności upłynął');
        setIsExpired(true);
        if (onExpire) onExpire();
        return;
      }
      
      // Konwersja na godziny i minuty
      const hours = Math.floor(difference / 1000 / 60 / 60);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      
      // Formatowanie do "X godz. Y min."
      const hoursText = hours > 0 ? `${hours} ${hours === 1 ? 'godz.' : 'godz.'}` : '';
      const minutesText = minutes > 0 ? `${minutes} ${minutes === 1 ? 'min' : 'min'}` : '';
      const separator = hours > 0 && minutes > 0 ? ' ' : '';
      
      setTimeLeft(`${hoursText}${separator}${minutesText}`);
    };
    
    // Obliczenie początkowego czasu
    calculateTimeLeft();
    
    // Aktualizacja co minutę
    const interval = setInterval(calculateTimeLeft, 60000);
    
    return () => clearInterval(interval);
  }, [deadline, onExpire]);
  
  return (
    <div className={`flex items-center gap-2 ${isExpired ? 'text-red-500' : 'text-primary'}`}>
      <Clock className="h-4 w-4" />
      <span className="font-medium">
        {isExpired ? 'Termin płatności upłynął' : `Termin płatności: ${timeLeft}`}
      </span>
    </div>
  );
}
