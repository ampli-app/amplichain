
import { Info } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProductPriceProps {
  price: number;
  sale: boolean;
  salePercentage?: number | null;
  forTesting: boolean;
  testingPrice?: number | null;
  showServiceFeeInfo?: boolean;
}

export function ProductPrice({ 
  price, 
  sale, 
  salePercentage, 
  forTesting, 
  testingPrice,
  showServiceFeeInfo = true
}: ProductPriceProps) {
  const calculateSalePrice = (originalPrice: number, salePercentage: number) => {
    return originalPrice - (originalPrice * (salePercentage / 100));
  };
  
  const formattedPrice = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(price);
  
  const formattedSalePrice = sale && salePercentage ? 
    new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(calculateSalePrice(price, salePercentage)) : null;
    
  const formattedTestingPrice = forTesting && testingPrice ? 
    new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(testingPrice) : null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center justify-between">
        <div>
          {sale && salePercentage ? (
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-primary">{formattedSalePrice}</span>
              <span className="text-sm text-muted-foreground line-through">{formattedPrice}</span>
            </div>
          ) : (
            <span className="text-lg font-bold text-primary">{formattedPrice}</span>
          )}
        </div>
        
        {forTesting && testingPrice && (
          <div className="text-sm text-muted-foreground">
            Test: {formattedTestingPrice}
          </div>
        )}
      </div>
      
      {showServiceFeeInfo && (
        <div className="text-xs text-muted-foreground flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center text-left">
                <span>+ opłata serwisowa 1,5%</span>
                <Info className="h-3 w-3 ml-1 inline-block" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-60">
                  Do ceny produktu zostanie doliczona opłata serwisowa w wysokości 1,5% wartości zamówienia.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}
