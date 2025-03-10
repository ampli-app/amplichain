
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { FormData } from '@/hooks/checkout/useCheckout';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface OrderSummaryFormProps {
  formData: FormData;
  paymentMethod: string;
  selectedDeliveryOption: any;
  agreeToTerms: boolean;
  setAgreeToTerms: (checked: boolean) => void;
  goToPreviousStep: () => void;
  isProcessing: boolean;
  totalCost: number;
  onSubmit: () => void;
}

export function OrderSummaryForm({ 
  formData, 
  paymentMethod,
  selectedDeliveryOption,
  agreeToTerms, 
  setAgreeToTerms, 
  goToPreviousStep, 
  isProcessing,
  totalCost,
  onSubmit
}: OrderSummaryFormProps) {
  
  const isPickupDelivery = selectedDeliveryOption?.name === 'Odbiór osobisty';
  const isInpostDelivery = selectedDeliveryOption?.name === 'Paczkomat InPost';
  const isCourierDelivery = selectedDeliveryOption?.name === 'Kurier';
  
  return (
    <Card className="mb-8">
      <CardHeader className="border-b bg-muted/40">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">4</span>
          Podsumowanie zamówienia
        </h2>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Dane osobowe */}
        <div className="space-y-2">
          <h3 className="text-base font-medium">Dane kontaktowe</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Imię i nazwisko:</span>
            </div>
            <div>{formData.firstName} {formData.lastName}</div>
            
            <div>
              <span className="text-muted-foreground">Email:</span>
            </div>
            <div>{formData.email}</div>
            
            <div>
              <span className="text-muted-foreground">Telefon:</span>
            </div>
            <div>{formData.phone}</div>
          </div>
        </div>
        
        <Separator />
        
        {/* Dostawa */}
        <div className="space-y-2">
          <h3 className="text-base font-medium">Dostawa</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Metoda dostawy:</span>
            </div>
            <div>{selectedDeliveryOption?.name}</div>
            
            {isPickupDelivery && selectedDeliveryOption?.location && (
              <>
                <div>
                  <span className="text-muted-foreground">Miejsce odbioru:</span>
                </div>
                <div>{selectedDeliveryOption.location}</div>
              </>
            )}
            
            {isInpostDelivery && formData.inpostPoint && (
              <>
                <div>
                  <span className="text-muted-foreground">Paczkomat:</span>
                </div>
                <div>{formData.inpostPoint}</div>
              </>
            )}
            
            {isCourierDelivery && (
              <>
                <div>
                  <span className="text-muted-foreground">Adres dostawy:</span>
                </div>
                <div>
                  {formData.address}, {formData.postalCode} {formData.city}
                </div>
              </>
            )}
          </div>
        </div>
        
        <Separator />
        
        {/* Płatność */}
        <div className="space-y-2">
          <h3 className="text-base font-medium">Płatność</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Metoda płatności:</span>
            </div>
            <div>
              {paymentMethod === 'blik' ? 'BLIK' : 'Przelewy24'}
            </div>
            
            {paymentMethod === 'blik' && formData.blikCode && (
              <>
                <div>
                  <span className="text-muted-foreground">Kod BLIK:</span>
                </div>
                <div>{formData.blikCode}</div>
              </>
            )}
          </div>
        </div>
        
        {formData.comments && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-base font-medium">Uwagi do zamówienia</h3>
              <p className="text-sm">{formData.comments}</p>
            </div>
          </>
        )}
        
        <Separator />
        
        {/* Akceptacja regulaminu */}
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="terms" 
            checked={agreeToTerms}
            onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Akceptuję regulamin i politykę prywatności
            </label>
            <p className="text-sm text-muted-foreground">
              Składając zamówienie, akceptujesz {" "}
              <a href="#" className="text-primary underline hover:text-primary/90">regulamin</a> {" "}
              i zgadzasz się na przetwarzanie danych zgodnie z naszą {" "}
              <a href="#" className="text-primary underline hover:text-primary/90">polityką prywatności</a>.
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-between">
        <Button type="button" variant="outline" onClick={goToPreviousStep}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Wstecz
        </Button>
        <Button type="submit" disabled={isProcessing} onClick={onSubmit}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Przetwarzanie płatności...
            </>
          ) : (
            <>
              Zapłać i zamów ({formatCurrency(totalCost)})
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
