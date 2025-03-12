
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Music, Upload } from 'lucide-react';

interface ReportStolenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportStolenDialog({ open, onOpenChange }: ReportStolenDialogProps) {
  const { isLoggedIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm({
    defaultValues: {
      title: '',
      category: '',
      location: '',
      date: '',
      serialNumber: '',
      description: '',
      contactInfo: '',
    }
  });
  
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      // This would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Zgłoszenie przyjęte",
        description: "Twoje zgłoszenie zostało przyjęte i oczekuje na weryfikację.",
      });
      
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zgłosić kradzieży. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Zgłoś kradzież sprzętu</DialogTitle>
          <DialogDescription>
            Wypełnij formularz aby zgłosić skradziony sprzęt muzyczny. Im więcej szczegółów podasz, tym większa szansa na odzyskanie sprzętu.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Nazwa sprzętu *</Label>
              <Input
                id="title"
                placeholder="np. Fender Stratocaster 1976"
                {...form.register('title', { required: true })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Kategoria *</Label>
              <Select onValueChange={(value) => form.setValue('category', value)} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Wybierz kategorię" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guitars">Gitary</SelectItem>
                  <SelectItem value="synths">Syntezatory</SelectItem>
                  <SelectItem value="studio">Sprzęt studyjny</SelectItem>
                  <SelectItem value="accessories">Akcesoria</SelectItem>
                  <SelectItem value="interfaces">Interfejsy Audio</SelectItem>
                  <SelectItem value="controllers">Kontrolery</SelectItem>
                  <SelectItem value="microphones">Mikrofony</SelectItem>
                  <SelectItem value="monitors">Monitory</SelectItem>
                  <SelectItem value="software">Oprogramowanie</SelectItem>
                  <SelectItem value="other">Inne</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Miejsce kradzieży *</Label>
              <Input
                id="location"
                placeholder="np. Warszawa, Mokotów"
                {...form.register('location', { required: true })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Data kradzieży *</Label>
              <Input
                id="date"
                type="date"
                {...form.register('date', { required: true })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="serialNumber">Numer seryjny (jeśli znany)</Label>
            <Input
              id="serialNumber"
              placeholder="np. 765438"
              {...form.register('serialNumber')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Opis charakterystycznych cech *</Label>
            <Textarea
              id="description"
              placeholder="Opisz szczegółowo swój sprzęt, w tym wszelkie charakterystyczne cechy, uszkodzenia, modyfikacje itp."
              className="min-h-[100px]"
              {...form.register('description', { required: true })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="images">Zdjęcia</Label>
            <div className="border border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center">
              <Music className="h-8 w-8 text-muted-foreground mb-2" />
              <div className="text-sm text-muted-foreground mb-3">
                Przeciągnij zdjęcia tutaj lub kliknij aby wybrać
              </div>
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Wybierz zdjęcia
              </Button>
              <input type="file" className="hidden" accept="image/*" multiple />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactInfo">Informacje kontaktowe *</Label>
            <Textarea
              id="contactInfo"
              placeholder="Podaj swoje dane kontaktowe, które będą widoczne dla osób posiadających informacje o Twoim sprzęcie."
              className="min-h-[60px]"
              {...form.register('contactInfo', { required: true })}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Wysyłanie...' : 'Zgłoś kradzież'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
