
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const ErrorState = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Nie znaleziono danych zamówienia</h2>
          <p className="text-rhythm-600 dark:text-rhythm-400 mb-6">
            Nie udało się znaleźć informacji o zamówieniu. Spróbuj ponownie później.
          </p>
          <Button asChild>
            <Link to="/marketplace">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Wróć do Rynku
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};
