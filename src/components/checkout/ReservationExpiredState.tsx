
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ShoppingCart } from 'lucide-react';

interface ReservationExpiredStateProps {
  productId: string;
}

export function ReservationExpiredState({ productId }: ReservationExpiredStateProps) {
  return (
    <div className="text-center max-w-md mx-auto">
      <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-4">Rezerwacja wygasła</h2>
      <p className="text-rhythm-600 dark:text-rhythm-400 mb-6">
        Czas na dokończenie zamówienia upłynął. Możesz rozpocząć proces zakupowy od nowa.
      </p>
      <div className="flex flex-col gap-3">
        <Button asChild variant="default">
          <Link to={`/marketplace/${productId}`}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Wróć do produktu
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/marketplace">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Wróć do Rynku
          </Link>
        </Button>
      </div>
    </div>
  );
}
