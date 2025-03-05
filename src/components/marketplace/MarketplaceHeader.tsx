
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface MarketplaceHeaderProps {
  getAddButtonText: () => string;
  handleAddButtonClick: () => void;
}

export function MarketplaceHeader({ getAddButtonText, handleAddButtonClick }: MarketplaceHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div className="text-center md:text-left mb-4 md:mb-0">
        <h1 className="text-3xl md:text-4xl font-bold">Marketplace</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mt-2 max-w-2xl">
          Znajdź najlepszy sprzęt i usługi muzyczne w jednym miejscu.
        </p>
      </div>
      
      <Button 
        className="self-center md:self-auto gap-2"
        onClick={handleAddButtonClick}
        size="lg"
      >
        <PlusCircle className="h-4 w-4" />
        {getAddButtonText()}
      </Button>
    </div>
  );
}
