
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar, Info, LockIcon, MapPin, Package, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CheckoutSummaryProps {
  productTitle: string;
  productImageUrl: string;
  price: number;
  deliveryCost: number;
  discountValue: number;
  discountApplied: boolean;
  serviceFee: number;
  totalCost: number;
  isTestMode: boolean;
  discountCode: string;
  setDiscountCode: (code: string) => void;
  handleApplyDiscount: () => void;
  removeDiscount: () => void;
}

export function CheckoutSummary({ 
  productTitle, 
  productImageUrl,
  price, 
  deliveryCost, 
  discountValue, 
  discountApplied, 
  serviceFee,
  totalCost,
  isTestMode,
  discountCode,
  setDiscountCode,
  handleApplyDiscount,
  removeDiscount
}: CheckoutSummaryProps) {
  return (
    <Card className="sticky top-24">
      <CardHeader className="border-b bg-muted/40">
        <h2 className="text-xl font-semibold">Podsumowanie</h2>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex gap-4 border-b pb-4">
            <div className="h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
              <img 
                src={productImageUrl} 
                alt={productTitle}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-medium">{productTitle}</h3>
              <p className="text-sm text-muted-foreground">
                {isTestMode ? 'Test przez 7 dni' : 'Zakup produktu'}
              </p>
              <p className="font-medium mt-1">
                {formatCurrency(price)}
              </p>
            </div>
          </div>
          
          {isTestMode && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 flex gap-2">
              <Info className="h-5 w-5 flex-shrink-0 mt-0.5 text-blue-500" />
              <div className="text-sm">
                <p className="font-medium">Informacja o teście</p>
                <p className="mt-1">Produkt zostanie dostarczony na 7 dni. Po tym czasie musisz go odesłać lub opłacić pełną wartość produktu.</p>
              </div>
            </div>
          )}
          
          {/* Kod rabatowy */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label htmlFor="discountCode">Kod rabatowy</Label>
              {discountApplied && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Rabat zastosowany
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Input 
                id="discountCode"
                placeholder="Wpisz kod rabatowy"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                disabled={discountApplied}
                className="flex-1"
              />
              <Button 
                type="button" 
                variant={discountApplied ? "outline" : "default"}
                onClick={discountApplied ? removeDiscount : handleApplyDiscount}
                disabled={!discountCode && !discountApplied}
              >
                {discountApplied ? "Usuń" : "Zastosuj"}
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Cena produktu</span>
              <span>{formatCurrency(price)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Dostawa</span>
              <span>{formatCurrency(deliveryCost)}</span>
            </div>
            
            {discountApplied && (
              <div className="flex justify-between py-1 text-green-600 dark:text-green-400">
                <span>Rabat</span>
                <span>-{formatCurrency(discountValue)}</span>
              </div>
            )}
            
            <div className="flex justify-between py-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-muted-foreground flex items-center">
                      Opłata serwisowa (1,5%)
                      <Info className="h-4 w-4 ml-1 text-muted-foreground/70" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-60">
                      Opłata serwisowa w wysokości 1,5% wartości zamówienia
                      (produkt + dostawa).
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span>{formatCurrency(serviceFee)}</span>
            </div>
            
            <Separator />
            <div className="flex justify-between py-2 font-bold">
              <span>Razem</span>
              <span>{formatCurrency(totalCost)}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              <span>Bezpieczne płatności</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4 text-green-500" />
              <span>Szybka dostawa</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-green-500" />
              <span>30-dniowe prawo zwrotu</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
