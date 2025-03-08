
import { FilePlus, PenLine, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MarketplaceAddButtonsProps {
  onAddProduct: () => void;
  onAddService: () => void;
  onAddConsultation: () => void;
}

export function MarketplaceAddButtons({
  onAddProduct,
  onAddService,
  onAddConsultation
}: MarketplaceAddButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onAddProduct}
      >
        <FilePlus className="h-4 w-4 mr-2" />
        Dodaj produkt
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onAddService}
      >
        <PenLine className="h-4 w-4 mr-2" />
        Dodaj usługę
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onAddConsultation}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Dodaj konsultację
      </Button>
    </div>
  );
}
