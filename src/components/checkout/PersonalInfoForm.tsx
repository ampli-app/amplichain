
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormData } from '@/hooks/checkout/useCheckout';
import { ArrowRight } from 'lucide-react';

interface PersonalInfoFormProps {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  goToNextStep: () => void;
}

export function PersonalInfoForm({ formData, handleInputChange, goToNextStep }: PersonalInfoFormProps) {
  return (
    <Card className="mb-8">
      <CardHeader className="border-b bg-muted/40">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
          Dane kontaktowe
        </h2>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Imię</Label>
            <Input 
              id="firstName"
              name="firstName"
              placeholder="Jan"
              value={formData.firstName}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName">Nazwisko</Label>
            <Input 
              id="lastName"
              name="lastName"
              placeholder="Kowalski"
              value={formData.lastName}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              name="email"
              type="email"
              placeholder="jan.kowalski@example.com"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input 
              id="phone"
              name="phone"
              placeholder="123456789"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="comments">Uwagi do zamówienia (opcjonalnie)</Label>
          <Textarea 
            id="comments"
            name="comments"
            placeholder="Dodatkowe informacje do zamówienia..."
            value={formData.comments}
            onChange={handleInputChange}
          />
        </div>
      </CardContent>
      
      <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-end">
        <Button type="button" onClick={goToNextStep}>
          Dalej
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
