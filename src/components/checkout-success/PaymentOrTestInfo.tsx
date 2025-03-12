
import { Clock, Calendar } from 'lucide-react';

interface PaymentOrTestInfoProps {
  isTestMode: boolean;
  formatDate: (date: Date) => string;
  testEndDate: Date;
}

export const PaymentOrTestInfo = ({ 
  isTestMode, 
  formatDate, 
  testEndDate 
}: PaymentOrTestInfoProps) => {
  return (
    <div>
      <h3 className="font-medium mb-2 flex items-center gap-1">
        <Clock className="h-4 w-4 text-primary" />
        {isTestMode ? 'Informacje o teście' : 'Podsumowanie płatności'}
      </h3>
      {isTestMode ? (
        <div className="text-sm space-y-1">
          <p>Okres testu: 7 dni</p>
          <p>Rozpoczęcie: {formatDate(new Date())}</p>
          <p>Zakończenie: {formatDate(testEndDate)}</p>
        </div>
      ) : (
        <div className="text-sm space-y-1">
          <p>Metoda płatności: Karta płatnicza</p>
          <p>Status: Opłacone</p>
          <p>Data płatności: {formatDate(new Date())}</p>
        </div>
      )}
    </div>
  );
};
