
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DeliveryOption, FormData } from '@/hooks/checkout/useCheckout';
import { ArrowLeft, ArrowRight, Building, Info, MapPin, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface DeliveryFormProps {
  formData: FormData;
  deliveryMethod: string;
  deliveryOptions: DeliveryOption[];
  selectedDeliveryOption: DeliveryOption | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleDeliveryMethodChange: (value: string) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  productLocation?: string;
}

export function DeliveryForm({ 
  formData, 
  deliveryMethod, 
  deliveryOptions, 
  selectedDeliveryOption,
  handleInputChange, 
  handleDeliveryMethodChange, 
  goToNextStep, 
  goToPreviousStep,
  productLocation
}: DeliveryFormProps) {
  
  const isInpostDelivery = selectedDeliveryOption?.name === 'Paczkomat InPost';
  const isCourierDelivery = selectedDeliveryOption?.name === 'Kurier';
  
  return (
    <Card className="mb-8">
      <CardHeader className="border-b bg-muted/40">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
          Sposób dostawy
        </h2>
      </CardHeader>
      
      <CardContent className="p-6">
        <RadioGroup value={deliveryMethod} onValueChange={handleDeliveryMethodChange} className="space-y-3">
          {deliveryOptions.map(option => (
            <div 
              key={option.id} 
              className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/20 transition-colors ${
                deliveryMethod === option.id ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <RadioGroupItem value={option.id} id={`delivery-${option.id}`} />
              <Label 
                htmlFor={`delivery-${option.id}`} 
                className="flex-1 cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {option.name === 'Odbiór osobisty' ? (
                      <MapPin className="h-5 w-5 text-primary" />
                    ) : option.name === 'Paczkomat InPost' ? (
                      <Building className="h-5 w-5 text-primary" />
                    ) : (
                      <Package className="h-5 w-5 text-primary" />
                    )}
                    <span>{option.name}</span>
                    {option.name === 'Odbiór osobisty' && productLocation && (
                      <span className="text-sm text-muted-foreground">({productLocation})</span>
                    )}
                  </div>
                  <span className="font-medium">
                    {option.price > 0 
                      ? formatCurrency(option.price) 
                      : 'Darmowa'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {option.name === 'Kurier' && 'Dostawa w ciągu 1-2 dni roboczych'}
                  {option.name === 'Paczkomat InPost' && 'Dostawa do paczkomatu w ciągu 1-2 dni roboczych'}
                  {option.name === 'Odbiór osobisty' && 'Odbiór osobisty w lokalizacji sprzedawcy'}
                </p>
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        {/* Dodatkowe opcje dla wybranej metody dostawy */}
        {isInpostDelivery && (
          <div className="mt-6 p-4 border border-dashed rounded-lg">
            <h3 className="text-base font-medium mb-3 flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" />
              Wybierz paczkomat
            </h3>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Wybierz paczkomat InPost, do którego zostanie wysłana Twoja przesyłka.
              </p>
              
              <Select
                value={formData.inpostPoint}
                onValueChange={(value) => {
                  const e = { target: { name: 'inpostPoint', value } } as React.ChangeEvent<HTMLInputElement>;
                  handleInputChange(e);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Wybierz paczkomat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WAW123">Warszawa - Centrum (WAW123)</SelectItem>
                  <SelectItem value="WAW456">Warszawa - Mokotów (WAW456)</SelectItem>
                  <SelectItem value="KRK123">Kraków - Stare Miasto (KRK123)</SelectItem>
                  <SelectItem value="WRO123">Wrocław - Centrum (WRO123)</SelectItem>
                  <SelectItem value="POZ123">Poznań - Centrum (POZ123)</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" />
                <span>
                  Pełna integracja z mapą paczkomatów InPost zostanie dodana wkrótce.
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Adres dostawy dla kuriera */}
        {isCourierDelivery && (
          <div className="mt-6 space-y-4 p-4 border border-dashed rounded-lg">
            <h3 className="text-base font-medium mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Adres dostawy
            </h3>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="address">Ulica i numer</Label>
                <Input 
                  id="address"
                  name="address"
                  placeholder="ul. Przykładowa 123/45"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Kod pocztowy</Label>
                  <Input 
                    id="postalCode"
                    name="postalCode"
                    placeholder="00-000"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">Miasto</Label>
                  <Input 
                    id="city"
                    name="city"
                    placeholder="Warszawa"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>
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
