
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { MediaUploadSection } from '@/components/consultations/MediaUploadSection';
import { MediaFile, uploadMediaToStorage } from '@/utils/mediaUtils';
import { CategorySelect } from '@/components/consultations/CategorySelect';

interface AddConsultationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddConsultationDialog({ open, onOpenChange }: AddConsultationDialogProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Formularz konsultacji
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [subcategoryId, setSubcategoryId] = useState<string | undefined>(undefined);
  const [isOnline, setIsOnline] = useState(true);
  const [isInPerson, setIsInPerson] = useState(false);
  const [location, setLocation] = useState('');
  
  // Metody kontaktu
  const [contactMethods, setContactMethods] = useState<string[]>([]);
  
  // Dodajemy stan dla mediów
  const [media, setMedia] = useState<MediaFile[]>([]);
  
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setCategoryId(undefined);
    setSubcategoryId(undefined);
    setIsOnline(true);
    setIsInPerson(false);
    setLocation('');
    setContactMethods([]);
    setMedia([]);
  };
  
  const toggleContactMethod = (method: string) => {
    setContactMethods(prev => 
      prev.includes(method) 
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };
  
  const handleSubmit = async () => {
    // Walidacja formularza
    if (!title.trim()) {
      toast({
        title: "Brak tytułu",
        description: "Podaj tytuł dla swoich konsultacji.",
        variant: "destructive",
      });
      return;
    }
    
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      toast({
        title: "Nieprawidłowa cena",
        description: "Podaj prawidłową cenę za konsultacje.",
        variant: "destructive",
      });
      return;
    }
    
    if (!categoryId) {
      toast({
        title: "Brak kategorii",
        description: "Wybierz kategorię dla swoich konsultacji.",
        variant: "destructive",
      });
      return;
    }
    
    if (!subcategoryId) {
      toast({
        title: "Brak podkategorii",
        description: "Wybierz podkategorię dla swoich konsultacji.",
        variant: "destructive",
      });
      return;
    }
    
    if (isInPerson && !location.trim()) {
      toast({
        title: "Brak lokalizacji",
        description: "Podaj lokalizację dla konsultacji stacjonarnych.",
        variant: "destructive",
      });
      return;
    }
    
    if (contactMethods.length === 0) {
      toast({
        title: "Brak metod kontaktu",
        description: "Wybierz przynajmniej jedną metodę kontaktu dla swoich konsultacji.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (!user) {
        throw new Error("Nie jesteś zalogowany.");
      }
      
      // Obsługa przesyłania nowych mediów
      const mediaPromises = media
        .filter(m => m.file) // tylko nowe pliki
        .map(m => uploadMediaToStorage(m.file!, 'consultation-images'));
      
      const uploadedMediaUrls = await Promise.all(mediaPromises);
      
      // Wszystkie media URL
      const allMediaUrls = media
        .filter(m => !m.file) // stare pliki (tylko url)
        .map(m => m.url)
        .concat(uploadedMediaUrls.filter(url => url !== null) as string[]);
      
      const consultationData = {
        user_id: user.id,
        title,
        description,
        price: Number(price),
        category_id: categoryId,
        subcategory_id: subcategoryId,
        is_online: isOnline,
        location: isInPerson ? location : null,
        contact_methods: contactMethods,
        images: allMediaUrls.length > 0 ? JSON.stringify(allMediaUrls) : null
      };
      
      const { data, error } = await supabase
        .from('consultations')
        .insert(consultationData)
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Sukces!",
        description: "Twoje konsultacje zostały dodane pomyślnie.",
      });
      
      onOpenChange(false);
      resetForm();
      
      // Przekieruj na stronę profilu z aktywną zakładką marketplace
      navigate('/profile?tab=marketplace&marketplaceTab=consultations');
      
    } catch (error) {
      console.error("Błąd podczas dodawania konsultacji:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się dodać konsultacji. Spróbuj ponownie później.",
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
          <DialogTitle>Dodaj swoje konsultacje</DialogTitle>
          <DialogDescription>
            Zaoferuj swoje konsultacje muzyczne i podziel się swoją wiedzą i doświadczeniem z innymi.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid gap-3">
            <Label htmlFor="title">Tytuł oferty konsultacji</Label>
            <Input 
              id="title" 
              placeholder="np. Konsultacje z zakresu produkcji muzycznej"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <CategorySelect
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            subcategoryId={subcategoryId}
            setSubcategoryId={setSubcategoryId}
          />
          
          <div className="grid gap-3">
            <Label htmlFor="description">Opis konsultacji</Label>
            <Textarea 
              id="description" 
              placeholder="Opisz szczegółowo zakres swoich konsultacji, swoje doświadczenie i co uczestnik może zyskać..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
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
              className="flex-1"
            />
          </div>
          
          {/* Dodajemy sekcję przesyłania zdjęć */}
          <MediaUploadSection
            media={media}
            setMedia={setMedia}
            disabled={isLoading}
            maxFiles={6}
          />
          
          <div className="grid gap-3">
            <Label>Sposób prowadzenia konsultacji</Label>
            <div className="flex flex-col gap-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={isOnline} 
                  onCheckedChange={setIsOnline}
                  id="online"
                />
                <Label htmlFor="online" className="font-normal cursor-pointer">Online (zdalna)</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={isInPerson} 
                  onCheckedChange={setIsInPerson}
                  id="in-person"
                />
                <Label htmlFor="in-person" className="font-normal cursor-pointer">Stacjonarnie</Label>
              </div>
              
              {isInPerson && (
                <div className="pl-6 pt-2">
                  <Label htmlFor="location" className="mb-2 block">Lokalizacja</Label>
                  <Input 
                    id="location" 
                    placeholder="np. Warszawa, Kraków"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="grid gap-3">
            <Label>Metody kontaktu</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="contact-video"
                  checked={contactMethods.includes('video')}
                  onCheckedChange={() => toggleContactMethod('video')}
                />
                <Label htmlFor="contact-video" className="font-normal cursor-pointer">
                  Rozmowa wideo (Zoom, Google Meet, itp.)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="contact-phone"
                  checked={contactMethods.includes('phone')}
                  onCheckedChange={() => toggleContactMethod('phone')}
                />
                <Label htmlFor="contact-phone" className="font-normal cursor-pointer">
                  Rozmowa telefoniczna
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="contact-chat"
                  checked={contactMethods.includes('chat')}
                  onCheckedChange={() => toggleContactMethod('chat')}
                />
                <Label htmlFor="contact-chat" className="font-normal cursor-pointer">
                  Czat tekstowy
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="contact-live"
                  checked={contactMethods.includes('live')}
                  onCheckedChange={() => toggleContactMethod('live')}
                />
                <Label htmlFor="contact-live" className="font-normal cursor-pointer">
                  Na żywo
                </Label>
              </div>
            </div>
          </div>
          
          {/* Podgląd oferty konsultacji */}
          <div className="mt-4">
            <h3 className="font-medium mb-2">Podgląd oferty</h3>
            <Card className="p-4">
              <div className="mb-2">
                <h4 className="font-bold">{title || "Tytuł konsultacji"}</h4>
                <p className="text-sm text-muted-foreground">
                  {description || "Opis konsultacji pojawi się tutaj..."}
                </p>
              </div>
              
              <div className="flex items-center text-sm mt-2">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="font-medium">
                  {price ? `${price} PLN` : "Cena"}
                </span>
              </div>
              
              {contactMethods.length > 0 && (
                <div className="text-sm mt-2">
                  <span className="font-medium">Metody kontaktu: </span>
                  {contactMethods.join(', ')}
                </div>
              )}
            </Card>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Anuluj
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Dodaj konsultacje
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
