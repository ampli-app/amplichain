
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Clock, Tag, Plus, X, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Consultation } from '@/types/consultations';
import { MediaFile, MediaPreview, handleFileUpload, uploadMediaToStorage } from '@/utils/mediaUtils';

interface EditConsultationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultation: Consultation | null;
}

// Kategorie konsultacji
const consultationCategories = [
  { id: 'composition', name: 'Kompozycja' },
  { id: 'arrangement', name: 'Aranżacja' },
  { id: 'production', name: 'Produkcja muzyczna' },
  { id: 'mixing', name: 'Mix i mastering' },
  { id: 'instruments', name: 'Instrumenty muzyczne' },
  { id: 'vocals', name: 'Wokal' },
  { id: 'theory', name: 'Teoria muzyki' },
  { id: 'recording', name: 'Nagrywanie' },
  { id: 'live_sound', name: 'Realizacja dźwięku na żywo' }
];

export function EditConsultationDialog({ open, onOpenChange, consultation }: EditConsultationDialogProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Formularz konsultacji
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState('za godzinę');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [isInPerson, setIsInPerson] = useState(false);
  const [location, setLocation] = useState('');
  
  // Metody kontaktu
  const [contactMethods, setContactMethods] = useState<string[]>([]);
  
  // Tagi i etykiety
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  // Zdjęcia konsultacji
  const [media, setMedia] = useState<MediaFile[]>([]);
  
  useEffect(() => {
    if (open && consultation) {
      loadConsultationData(consultation);
    } else if (open) {
      resetForm();
    }
  }, [open, consultation]);
  
  const loadConsultationData = (data: Consultation) => {
    setTitle(data.title || '');
    setDescription(data.description || '');
    setPrice(data.price ? data.price.toString() : '');
    setPriceType('za godzinę'); // Domyślna wartość, można dostosować jeśli konsultacja ma to pole
    setSelectedCategories(data.categories || []);
    setExperienceYears(data.experience || '');
    setIsOnline(data.is_online);
    setIsInPerson(!!data.location);
    setLocation(data.location || '');
    setContactMethods(data.contact_methods || []);
    
    // Wczytaj zdjęcia jeśli istnieją
    if (data.images) {
      let imageArray: string[] = [];
      
      if (typeof data.images === 'string') {
        try {
          imageArray = JSON.parse(data.images);
        } catch (e) {
          imageArray = [data.images];
        }
      } else if (Array.isArray(data.images)) {
        imageArray = data.images;
      }
      
      // Konwertuj na format MediaFile
      const mediaFiles: MediaFile[] = imageArray.map(url => ({
        url,
        type: 'image'
      }));
      
      setMedia(mediaFiles);
    } else {
      setMedia([]);
    }
  };
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setPriceType('za godzinę');
    setSelectedCategories([]);
    setExperienceYears('');
    setIsOnline(true);
    setIsInPerson(false);
    setLocation('');
    setContactMethods([]);
    setTags([]);
    setTagInput('');
    setMedia([]);
  };
  
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const toggleContactMethod = (method: string) => {
    setContactMethods(prev => 
      prev.includes(method) 
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };
  
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };
  
  const handleRemoveMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
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
    
    if (selectedCategories.length === 0) {
      toast({
        title: "Brak kategorii",
        description: "Wybierz przynajmniej jedną kategorię dla swoich konsultacji.",
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
    
    if (!consultation || !consultation.id) {
      toast({
        title: "Błąd",
        description: "Brak danych konsultacji do edycji.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (!user) {
        throw new Error("Nie jesteś zalogowany.");
      }
      
      // Prześlij wszystkie nowe zdjęcia do storage
      const uploadedImages: string[] = [];
      
      // Najpierw zbierz istniejące już URLe
      for (const item of media) {
        if (!item.file) {
          // To jest już przesłany plik, dodaj URL
          uploadedImages.push(item.url);
        }
      }
      
      // Prześlij nowe pliki
      for (const item of media) {
        if (item.file) {
          const filePath = await uploadMediaToStorage(item.file, `consultations/${consultation.id}`);
          if (filePath) {
            uploadedImages.push(filePath);
          }
        }
      }
      
      const consultationData = {
        title,
        description,
        price: Number(price),
        experience: experienceYears,
        categories: selectedCategories,
        is_online: isOnline,
        location: isInPerson ? location : null,
        contact_methods: contactMethods,
        images: uploadedImages.length > 0 ? JSON.stringify(uploadedImages) : null,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('consultations')
        .update(consultationData)
        .eq('id', consultation.id)
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Sukces!",
        description: "Twoje konsultacje zostały zaktualizowane pomyślnie.",
      });
      
      onOpenChange(false);
      resetForm();
      
      // Przekieruj na stronę szczegółów konsultacji
      navigate(`/consultations/${consultation.id}`);
      
    } catch (error) {
      console.error("Błąd podczas aktualizacji konsultacji:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować konsultacji. Spróbuj ponownie później.",
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
          <DialogTitle>Edytuj konsultację</DialogTitle>
          <DialogDescription>
            Zaktualizuj swoją ofertę konsultacji muzycznych.
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-3">
              <Label htmlFor="price">Cena</Label>
              <div className="flex gap-2">
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
                <Select value={priceType} onValueChange={setPriceType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Wybierz typ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="za godzinę">za godzinę</SelectItem>
                    <SelectItem value="za sesję">za sesję</SelectItem>
                    <SelectItem value="za projekt">za projekt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-3">
              <Label htmlFor="experience">Lata doświadczenia</Label>
              <Input 
                id="experience" 
                type="number"
                placeholder="np. 5"
                min="0"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
              />
            </div>
          </div>
          
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
            </div>
          </div>
          
          {/* Zdjęcia konsultacji */}
          <div className="grid gap-3">
            <Label>Zdjęcia konsultacji</Label>
            
            <MediaPreview 
              media={media} 
              onRemoveMedia={handleRemoveMedia} 
              disabled={isLoading}
            />
            
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(e, media, setMedia, fileInputRef)}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || media.length >= 6}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Dodaj zdjęcia
              </Button>
              <p className="text-xs text-muted-foreground">
                Maksymalnie 6 zdjęć. Obsługiwane formaty: JPG, PNG.
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid gap-3">
            <Label>Kategorie konsultacji</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {consultationCategories.map(category => (
                <div 
                  key={category.id}
                  className="flex items-center space-x-2"
                >
                  <Checkbox 
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.name)}
                    onCheckedChange={() => toggleCategory(category.name)}
                  />
                  <Label 
                    htmlFor={`category-${category.id}`}
                    className="font-normal cursor-pointer"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid gap-3">
            <Label>Tagi (słowa kluczowe)</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="Dodaj tag i naciśnij Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" size="icon" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="px-2 py-1 gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                    <button 
                      className="ml-1 hover:text-destructive"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
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
              
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-1 my-2">
                  {selectedCategories.map((cat, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex items-center text-sm mt-2">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="font-medium">
                  {price ? `${price} PLN` : "Cena"} {price ? priceType : ""}
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
            Zapisz zmiany
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
