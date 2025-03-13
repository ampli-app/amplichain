
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface CheckoutErrorStateProps {
  type: 'product' | 'delivery';
}

export function CheckoutErrorState({ type }: CheckoutErrorStateProps) {
  const title = type === 'product' 
    ? 'Błąd pobrania produktu' 
    : 'Brak opcji dostawy';
  
  const description = type === 'product'
    ? 'Nie udało się pobrać informacji o produkcie. Spróbuj ponownie później.'
    : 'Dla tego produktu nie skonfigurowano opcji dostawy. Skontaktuj się ze sprzedawcą.';
  
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-rhythm-600 dark:text-rhythm-400 mb-6">
        {description}
      </p>
      <Button asChild>
        <Link to={type === 'product' ? '/marketplace' : '/marketplace'}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Wróć do Rynku
        </Link>
      </Button>
    </div>
  );
}
