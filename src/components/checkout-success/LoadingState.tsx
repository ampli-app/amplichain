
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Loader2 } from 'lucide-react';

export const LoadingState = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" />
          </div>
          <p className="text-rhythm-600 dark:text-rhythm-400">Ładowanie potwierdzenia zamówienia...</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};
