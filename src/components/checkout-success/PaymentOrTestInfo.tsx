
import { Clock, Calendar, CreditCard, CheckCircle } from 'lucide-react';

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
        {isTestMode ? (
          <>
            <Clock className="h-4 w-4 text-primary" />
            Informacje o teście
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 text-primary" />
            Podsumowanie płatności
          </>
        )}
      </h3>
      {isTestMode ? (
        <div className="text-sm space-y-1">
          <p>Okres testu: 7 dni</p>
          <p>Rozpoczęcie: {formatDate(new Date())}</p>
          <p>Zakończenie: {formatDate(testEndDate)}</p>
        </div>
      ) : (
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-1">
            <span>Status:</span>
            <span className={`font-medium ${paymentStatus === 'paid' ? 'text-green-600' : 'text-red-500'}`}>
              {paymentStatus === 'paid' ? (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Opłacone
                </span>
              ) : 'Oczekuje na płatność'}
            </span>
          </div>
          <p>Metoda płatności: {paymentMethod || 'Karta płatnicza'}</p>
          <p>Data płatności: {paymentDate ? formatDate(paymentDate) : formatDate(new Date())}</p>
          {paymentId && <p className="text-xs text-rhythm-500">ID płatności: {paymentId}</p>}
        </div>
      )}
    </div>
  );
};
