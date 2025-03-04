import { useState, useEffect } from 'react';
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
import { Loader2, Clock, Tag, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface AddConsultationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function AddConsultationDialog({ open, onOpenChange }: AddConsultationDialogProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
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
  
  // Tagi i etykiety
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);
  
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
    setTags([]);
    setTagInput('');
  };
  
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
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
    
    setIsLoading(true);
    
    try {
      if (!user) {
        throw new Error("Nie jesteś zalogowany.");
      }
      
      const consultationData = {
        user_id: user.id,
        title,
        description,
        price: Number(price),
        experience: experienceYears,
        categories: selectedCategories,
        is_online: isOnline,
        location: isInPerson ? location : null,
        availability: [], // Docelowo można dodać wybór dostępności
        created_at: new Date(),
        updated_at: new Date()
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
