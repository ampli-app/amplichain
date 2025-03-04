
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Loader2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AddServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Kategorie usług
const serviceCategories = [
  { id: 'recording', name: 'Studio nagrań' },
  { id: 'mixing', name: 'Mix i mastering' },
  { id: 'production', name: 'Produkcja muzyczna' },
  { id: 'lessons', name: 'Lekcje muzyki' },
  { id: 'songwriting', name: 'Kompozycja' },
  { id: 'arrangement', name: 'Aranżacja' },
  { id: 'live', name: 'Występy na żywo' },
  { id: 'rental', name: 'Wynajem sprzętu' },
  { id: 'repair', name: 'Naprawa instrumentów' }
];

export function AddServiceFormDialog({ open, onOpenChange }: AddServiceFormDialogProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Formularz usługi
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setCategory('');
    setLocation('');
    setIsOnline(false);
  };
  
  const handleSubmit = async () => {
    // Walidacja formularza
    if (!title.trim()) {
      toast({
        title: "Brak tytułu",
        description: "Podaj tytuł dla swojej usługi.",
        variant: "destructive",
      });
      return;
    }
    
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      toast({
        title: "Nieprawidłowa cena",
        description: "Podaj prawidłową cenę za usługę.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (!user) {
        throw new Error("Nie jesteś zalogowany.");
      }
      
      const serviceData = {
        user_id: user.id,
        title,
        description,
        price: Number(price),
        category,
        location: location || null,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const { data, error } = await supabase
        .from('services')
        .insert(serviceData)
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Sukces!",
        description: "Twoja usługa została dodana pomyślnie.",
      });
      
      onOpenChange(false);
      resetForm();
      
      // Przekieruj na stronę profilu z aktywną zakładką marketplace
      navigate('/profile?tab=marketplace&marketplaceTab=services');
      
    } catch (error) {
      console.error("Błąd podczas dodawania usługi:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się dodać usługi. Spróbuj ponownie później.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dodaj swoją usługę</DialogTitle>
          <DialogDescription>
            Zaoferuj swoje usługi muzyczne i dotrzej do szerokiego grona klientów.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid gap-3">
            <Label htmlFor="title">Tytuł usługi</Label>
            <Input 
              id="title" 
              placeholder="np. Profesjonalne nagrania wokalne"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="grid gap-3">
            <Label htmlFor="description">Opis usługi</Label>
            <Textarea 
              id="description" 
              placeholder="Opisz szczegółowo zakres swojej usługi, doświadczenie i co klienci mogą zyskać..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-3">
              <Label htmlFor="price">Cena (PLN)</Label>
              <Input 
                id="price" 
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            
            <div className="grid gap-3">
              <Label htmlFor="category">Kategoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz kategorię" />
                </SelectTrigger>
                <SelectContent>
                  {serviceCategories.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="isOnline">Usługa online</Label>
              <Switch 
                id="isOnline"
                checked={isOnline}
                onCheckedChange={setIsOnline}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Zaznacz, jeśli usługa może być świadczona zdalnie przez internet.
            </p>
          </div>
          
          <div className="grid gap-3">
            <Label htmlFor="location">Lokalizacja</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                id="location" 
                placeholder="np. Warszawa, Kraków"
                className="pl-10"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Podaj miasto lub region, w którym świadczysz usługi stacjonarne.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Anuluj
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Dodaj usługę
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
