
import { Clock, Calendar } from 'lucide-react';

interface PaymentOrTestInfoProps {
  isTestMode: boolean;
  formatDate: (date: Date) => string;
  testEndDate: Date;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentDate?: Date;
  paymentId?: string;
}

export const PaymentOrTestInfo = ({ 
  isTestMode, 
  formatDate, 
  testEndDate,
  paymentMethod,
  paymentStatus,
  paymentDate,
  paymentId
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
          <p>Metoda płatności: {paymentMethod || 'Karta płatnicza'}</p>
          <p>Status: {paymentStatus || 'Opłacone'}</p>
          <p>Data płatności: {paymentDate ? formatDate(paymentDate) : formatDate(new Date())}</p>
          {paymentId && <p className="text-xs text-rhythm-500">ID płatności: {paymentId}</p>}
        </div>
      )}
    </div>
  );
};
