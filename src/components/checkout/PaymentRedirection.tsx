
import { useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface PaymentRedirectionProps {
  isLoading: boolean;
  error?: string | null;
  onReady?: () => void;
  paymentProvider: string;
}

export function PaymentRedirection({ 
  isLoading, 
  error, 
  onReady,
  paymentProvider = 'Stripe'
}: PaymentRedirectionProps) {
  useEffect(() => {
    if (!isLoading && !error && onReady) {
      // Wywołujemy onReady gdy komponent jest zamontowany i nie ma błędów
      const timer = setTimeout(() => {
        onReady();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, error, onReady]);
  
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
        <CardHeader className="pb-2 text-red-600 dark:text-red-400 font-medium flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>Błąd płatności</span>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-10">
        <div className="flex flex-col items-center justify-center text-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <div>
            <h3 className="text-lg font-medium">Przygotowywanie płatności</h3>
            <p className="text-muted-foreground mt-1">
              Za chwilę zostaniesz przekierowany do systemu płatności {paymentProvider}...
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
