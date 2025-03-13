
import { Loader2 } from 'lucide-react';

export function CheckoutLoadingState() {
  return (
    <div className="text-center">
      <div className="mb-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" />
      </div>
      <p className="text-rhythm-600 dark:text-rhythm-400">Ładowanie danych produktu...</p>
    </div>
  );
}
