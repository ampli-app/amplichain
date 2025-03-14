
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormData } from '@/hooks/checkout/useCheckout';
import { ArrowLeft, ArrowRight, Clock, CreditCard, LockIcon, Smartphone } from 'lucide-react';
import { PAYMENT_METHODS } from '@/hooks/checkout/payment/paymentConfig';

interface PaymentFormProps {
  formData: FormData;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

export function PaymentForm({ 
  formData, 
  paymentMethod, 
  setPaymentMethod, 
  handleInputChange, 
  goToNextStep, 
  goToPreviousStep 
}: PaymentFormProps) {
  return (
    <Card className="mb-8">
      <CardHeader className="border-b bg-muted/40">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">3</span>
          Metoda płatności
        </h2>
      </CardHeader>
      
      <CardContent className="p-6">
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
          <div 
            className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/20 transition-colors ${
              paymentMethod === PAYMENT_METHODS.CARD ? 'border-primary bg-primary/5' : ''
            }`}
          >
            <RadioGroupItem value={PAYMENT_METHODS.CARD} id="card" />
            <Label htmlFor="card" className="flex-1 cursor-pointer">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span>Karta płatnicza</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Zapłać kartą kredytową lub debetową
              </p>
            </Label>
          </div>
          
          <div 
            className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/20 transition-colors ${
              paymentMethod === PAYMENT_METHODS.BLIK ? 'border-primary bg-primary/5' : ''
            }`}
          >
            <RadioGroupItem value={PAYMENT_METHODS.BLIK} id="blik" />
            <Label htmlFor="blik" className="flex-1 cursor-pointer">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <span>BLIK</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Szybka płatność kodem BLIK z aplikacji bankowej
              </p>
            </Label>
          </div>
          
          <div 
            className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/20 transition-colors ${
              paymentMethod === PAYMENT_METHODS.P24 ? 'border-primary bg-primary/5' : ''
            }`}
          >
            <RadioGroupItem value={PAYMENT_METHODS.P24} id="p24" />
            <Label htmlFor="p24" className="flex-1 cursor-pointer">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span>Przelewy24</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Szybki przelew online przez Przelewy24
              </p>
            </Label>
          </div>
        </RadioGroup>
        
        {/* Dodatkowe pola dla wybranej metody płatności */}
        {paymentMethod === PAYMENT_METHODS.BLIK && (
          <div className="mt-6 p-4 border border-dashed rounded-lg">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="blikCode" className="font-medium">Kod BLIK</Label>
                <span className="text-sm text-muted-foreground">
                  Wygeneruj kod w aplikacji bankowej
                </span>
              </div>
              
              <Input 
                id="blikCode"
                name="blikCode"
                placeholder="Wpisz 6-cyfrowy kod"
                maxLength={6}
                className="text-center text-xl tracking-widest h-14"
                value={formData.blikCode}
                onChange={(e) => {
                  // Tylko cyfry
                  const sanitized = e.target.value.replace(/\D/g, '');
                  const event = {
                    target: {
                      name: 'blikCode',
                      value: sanitized
                    }
                  } as React.ChangeEvent<HTMLInputElement>;
                  handleInputChange(event);
                }}
              />
              
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-2 mt-2">
                <Clock className="h-4 w-4" />
                <span>Kod BLIK jest ważny przez 2 minuty</span>
              </div>
            </div>
          </div>
        )}
        
        {paymentMethod === PAYMENT_METHODS.P24 && (
          <div className="mt-6 p-4 border border-dashed rounded-lg">
            <div className="text-sm">
              <p className="font-medium mb-2">Jak to działa?</p>
              <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
                <li>Po kliknięciu "Zapłać" zostaniesz przekierowany do serwisu Przelewy24</li>
                <li>Wybierz swój bank</li>
                <li>Zaloguj się i potwierdź płatność w banku</li>
                <li>Po zakończeniu transakcji wrócisz na stronę potwierdzenia zamówienia</li>
              </ol>
              
              <div className="flex items-center gap-2 mt-4 text-muted-foreground">
                <LockIcon className="h-4 w-4" />
                <span>Bezpieczna płatność szyfrowana SSL</span>
              </div>
            </div>
          </div>
        )}
        
        {paymentMethod === PAYMENT_METHODS.CARD && (
          <div className="mt-6 p-4 border border-dashed rounded-lg">
            <div className="text-sm">
              <p className="font-medium mb-2">Płatność kartą</p>
              <p className="text-muted-foreground mb-2">
                Na następnym ekranie wprowadzisz dane swojej karty płatniczej.
              </p>
              
              <div className="flex items-center gap-2 mt-4 text-muted-foreground">
                <LockIcon className="h-4 w-4" />
                <span>Bezpieczna płatność szyfrowana SSL</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-between">
        <Button type="button" variant="outline" onClick={goToPreviousStep}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Wstecz
        </Button>
        <Button type="button" onClick={goToNextStep}>
          Dalej
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
