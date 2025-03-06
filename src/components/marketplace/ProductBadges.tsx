
import { Badge } from '@/components/ui/badge';

interface ProductBadgesProps {
  forTesting: boolean;
  isUserProduct: boolean;
  sale: boolean;
  salePercentage?: number | null;
  hideInDiscover?: boolean;
}

export function ProductBadges({ forTesting, isUserProduct, sale, salePercentage, hideInDiscover = false }: ProductBadgesProps) {
  return (
    <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-2">
      {forTesting && (
        <Badge className="bg-amber-500 hover:bg-amber-500">
          Dostępne do testów
        </Badge>
      )}
      
      {isUserProduct && (
        <Badge className="bg-green-500 hover:bg-green-500 inline-block">
          Twój produkt
        </Badge>
      )}
      
      {sale && salePercentage && !isUserProduct && (
        <Badge className="bg-red-500 hover:bg-red-500">
          -{salePercentage}%
        </Badge>
      )}
    </div>
  );
}
