
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

interface OrderSummaryProps {
  product: any;
  productPrice: number;
  deliveryCost: number;
  totalCost: number;
  getProductImageUrl: () => string;
  formatCurrency: (amount: number) => string;
  isTestMode: boolean;
}

export const OrderSummary = ({ 
  product, 
  productPrice, 
  deliveryCost, 
  totalCost, 
  getProductImageUrl, 
  formatCurrency,
  isTestMode
}: OrderSummaryProps) => {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Podsumowanie zamówienia</h2>
        
        <div className="flex gap-4 border-b pb-4 mb-4">
          <div className="h-24 w-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
            <img 
              src={getProductImageUrl()} 
              alt={product.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-medium text-lg">{product.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {isTestMode ? 'Test przez 7 dni' : 'Zakup produktu'}
            </p>
            <p className="font-medium">
              {formatCurrency(productPrice)}
            </p>
          </div>
        </div>
        
        <div className="space-y-2 mb-6">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Cena produktu</span>
            <span>{formatCurrency(productPrice)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Dostawa</span>
            <span>{formatCurrency(deliveryCost)}</span>
          </div>
          <Separator />
          <div className="flex justify-between py-2 font-bold">
            <span>Razem</span>
            <span>{formatCurrency(totalCost)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
