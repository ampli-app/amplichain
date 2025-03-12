
import { CheckCircle2, Copy } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

interface OrderHeaderProps {
  orderNumber: string;
  isTestMode: boolean;
}

export const OrderHeader = ({ orderNumber, isTestMode }: OrderHeaderProps) => {
  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber).then(
      () => {
        toast({
          title: "Skopiowano",
          description: "Numer zamówienia został skopiowany do schowka.",
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: "Błąd",
          description: "Nie udało się skopiować numeru zamówienia.",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-12"
    >
      <div className="flex justify-center mb-4">
        <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
          <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
      </div>
      
      <h1 className="text-3xl font-bold mb-2">
        {isTestMode ? 'Rezerwacja testowa potwierdzona!' : 'Zamówienie złożone!'}
      </h1>
      
      <p className="text-rhythm-600 dark:text-rhythm-400 mb-6">
        {isTestMode 
          ? 'Twoja rezerwacja testowa została pomyślnie potwierdzona. Szczegóły znajdziesz poniżej.' 
          : 'Twoje zamówienie zostało pomyślnie złożone. Dziękujemy za zakup!'}
      </p>
      
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-sm font-medium">
          Numer zamówienia: <span className="font-bold">{orderNumber}</span>
        </span>
        <button 
          onClick={handleCopyOrderNumber} 
          className="text-primary hover:text-primary/80"
          aria-label="Kopiuj numer zamówienia"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
      
      <p className="text-sm text-rhythm-500">
        Szczegóły zostały wysłane na Twój adres email.
      </p>
    </motion.div>
  );
};
