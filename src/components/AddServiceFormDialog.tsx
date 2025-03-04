
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Upload, X, Plus, Tag, Music, Mic, Headphones, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface AddServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ServiceImage {
  file: File | null;
  preview: string;
}

// Kategorie usług
const serviceCategories = [
  { id: 'producer', name: 'Producent', icon: <Music className="h-4 w-4" /> },
  { id: 'dj', name: 'DJ', icon: <Headphones className="h-4 w-4" /> },
  { id: 'mixing', name: 'Mix i mastering', icon: <Music className="h-4 w-4" /> },
  { id: 'composer', name: 'Kompozytor', icon: <Music className="h-4 w-4" /> },
  { id: 'instrumentalist', name: 'Instrumentalista', icon: <Music className="h-4 w-4" /> },
  { id: 'vocalist', name: 'Wokalista', icon: <Mic className="h-4 w-4" /> },
  { id: 'teacher', name: 'Nauczyciel', icon: <Users className="h-4 w-4" /> },
  { id: 'sound_engineer', name: 'Realizator dźwięku', icon: <Music className="h-4 w-4" /> },
];

// Instrumenty muzyczne
const instruments = [
  'Gitara', 'Pianino/Keyboard', 'Perkusja', 'Bas', 'Skrzypce', 'Saksofon', 
  'Trąbka', 'Flet', 'Syntezator', 'Ukulele', 'Akordeon', 'Wokal'
];

// Gatunki muzyczne
const genres = [
  'Pop', 'Rock', 'Hip Hop', 'R&B', 'Jazz', 'Blues', 'Klasyczna', 'Folk', 
  'Electronic', 'Ambient', 'Metal', 'Punk', 'Country', 'Reggae', 'Soul'
];

export function AddServiceFormDialog({ open, onOpenChange }: AddServiceFormDialogProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [serviceTab, setServiceTab] = useState('service');
  
  // Wspólne pola formularza
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState('za godzinę');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [location, setLocation] = useState('');
  const [serviceImages, setServiceImages] = useState<ServiceImage[]>([]);
  
  // Tagi
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  // Pola dla muzyka/instrumentalisty
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isAvailableForHire, setIsAvailableForHire] = useState(true);
  const [experienceYears, setExperienceYears] = useState('');
  
  // Pola dla usług konsultacji
  const [offersConsultations, setOffersConsultations] = useState(false);
  const [consultationCategories, setConsultationCategories] = useState<string[]>([]);
  
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
    setSelectedCategory('');
    setLocation('');
    setServiceImages([]);
    setTags([]);
    setTagInput('');
    setSelectedInstruments([]);
    setSelectedGenres([]);
    setIsAvailableForHire(true);
    setExperienceYears('');
    setOffersConsultations(false);
    setConsultationCategories([]);
    setServiceTab('service');
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      // Limit liczby zdjęć
      const filesToProcess = files.slice(0, 5 - serviceImages.length);
      
      // Przetwórz każdy plik
      const newImages: ServiceImage[] = [];
      let processedFiles = 0;
      
      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push({
            file,
            preview: reader.result as string
          });
          
          processedFiles++;
          
          // Po przetworzeniu wszystkich plików, zaktualizuj stan
          if (processedFiles === filesToProcess.length) {
            setServiceImages(prev => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  const handleAddImageClick = () => {
    const fileInput = document.getElementById('service-images');
    if (fileInput) {
      fileInput.click();
    }
  };
  
  const removeImage = (index: number) => {
    const updatedImages = [...serviceImages];
    updatedImages.splice(index, 1);
    setServiceImages(updatedImages);
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
  
  const toggleInstrument = (instrument: string) => {
    setSelectedInstruments(prev => 
      prev.includes(instrument) 
        ? prev.filter(i => i !== instrument)
        : [...prev, instrument]
    );
  };
  
  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };
  
  const toggleConsultationCategory = (category: string) => {
    setConsultationCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const uploadServiceImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const image of serviceImages) {
      if (!image.file) continue;
      
      try {
        // Tu dodałbym kod do przesyłania obrazów do Supabase Storage
        // Na razie symulujemy sukces
        uploadedUrls.push(image.preview);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
    
    return uploadedUrls;
  };
  
  const validateForm = () => {
    if (!title.trim()) {
      toast({
        title: "Brak tytułu",
        description: "Podaj tytuł dla swojej usługi.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!selectedCategory) {
      toast({
        title: "Brak kategorii",
        description: "Wybierz kategorię dla swojej usługi.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      toast({
        title: "Nieprawidłowa cena",
        description: "Podaj prawidłową cenę za usługę.",
        variant: "destructive",
      });
      return false;
    }
    
    if (offersConsultations && consultationCategories.length === 0) {
      toast({
        title: "Brak kategorii konsultacji",
        description: "Wybierz przynajmniej jedną kategorię konsultacji.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const imageUrls = await uploadServiceImages();
      
      const serviceData = {
        title,
        description,
        price: Number(price),
        price_type: priceType,
        category: selectedCategory,
        location,
        image_url: imageUrls.length > 0 ? imageUrls : null,
        tags,
        instruments: selectedInstruments,
        genres: selectedGenres,
        experience_years: experienceYears ? Number(experienceYears) : null,
        available_for_hire: isAvailableForHire,
        offers_consultations: offersConsultations,
        consultation_categories: offersConsultations ? consultationCategories : [],
        user_id: user?.id,
        created_at: new Date()
      };
      
      // Tutaj dodałbym kod do zapisania w Supabase
      // const { data, error } = await supabase
      //   .from('services')
      //   .insert(serviceData)
      //   .select();
      
      // Symulujemy sukces
      setTimeout(() => {
        toast({
          title: "Sukces!",
          description: "Twoja usługa została dodana pomyślnie.",
        });
        
        if (offersConsultations) {
          toast({
            title: "Konsultacje dodane",
            description: "Twoja oferta konsultacji została również utworzona.",
          });
        }
        
        onOpenChange(false);
        resetForm();
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error("Błąd podczas dodawania usługi:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się dodać usługi. Spróbuj ponownie później.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dodaj swoją usługę</DialogTitle>
          <DialogDescription>
            Zaoferuj swoje usługi muzyczne. Możesz dodać zarówno usługi jak i dostępność do konsultacji.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={serviceTab} onValueChange={setServiceTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="service">Usługa muzyczna</TabsTrigger>
            <TabsTrigger value="consultations">Konsultacje</TabsTrigger>
          </TabsList>
          
          <TabsContent value="service" className="pt-4 space-y-4">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="title">Tytuł oferty</Label>
                  <Input 
                    id="title" 
                    placeholder="np. Profesjonalny mix i mastering"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-3">
                  <Label htmlFor="category">Kategoria</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Wybierz kategorię" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories.map(category => (
                        <SelectItem key={category.id} value={category.name}>
                          <div className="flex items-center gap-2">
                            {category.icon}
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="description">Opis usługi</Label>
                <Textarea 
                  id="description" 
                  placeholder="Opisz szczegółowo swoją usługę, swoje doświadczenie i co klient może oczekiwać..."
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
                        <SelectItem value="za utwór">za utwór</SelectItem>
                        <SelectItem value="za wydarzenie">za wydarzenie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-3">
                  <Label htmlFor="location">Lokalizacja</Label>
                  <Input 
                    id="location" 
                    placeholder="np. Warszawa, Online, Woj. mazowieckie"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
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
              
              {/* Instrumenty i gatunki muzyczne */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-3">
                  <Label>Instrumenty</Label>
                  <ScrollArea className="h-40 border rounded-md p-4">
                    <div className="grid grid-cols-2 gap-2">
                      {instruments.map(instrument => (
                        <div 
                          key={instrument}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox 
                            id={`instrument-${instrument}`}
                            checked={selectedInstruments.includes(instrument)}
                            onCheckedChange={() => toggleInstrument(instrument)}
                          />
                          <Label 
                            htmlFor={`instrument-${instrument}`}
                            className="font-normal cursor-pointer"
                          >
                            {instrument}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                
                <div className="grid gap-3">
                  <Label>Gatunki muzyczne</Label>
                  <ScrollArea className="h-40 border rounded-md p-4">
                    <div className="grid grid-cols-2 gap-2">
                      {genres.map(genre => (
                        <div 
                          key={genre}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox 
                            id={`genre-${genre}`}
                            checked={selectedGenres.includes(genre)}
                            onCheckedChange={() => toggleGenre(genre)}
                          />
                          <Label 
                            htmlFor={`genre-${genre}`}
                            className="font-normal cursor-pointer"
                          >
                            {genre}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
              
              {/* Zdjęcia usługi */}
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label>Zdjęcia usługi</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddImageClick}
                    disabled={serviceImages.length >= 5}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Dodaj zdjęcie
                  </Button>
                </div>
                
                {/* Hidden input for uploading images */}
                <input
                  type="file"
                  id="service-images"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                
                {/* Drop zone for images */}
                {serviceImages.length < 5 && (
                  <div 
                    className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={handleAddImageClick}
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-zinc-400" />
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Przeciągnij zdjęcia tutaj lub kliknij, aby wybrać
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Możesz dodać maksymalnie 5 zdjęć (pozostało {5 - serviceImages.length})
                    </p>
                  </div>
                )}
                
                {/* Image previews */}
                {serviceImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-4">
                    {serviceImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-md overflow-hidden border bg-zinc-100 dark:bg-zinc-800">
                          <img 
                            src={image.preview} 
                            alt={`Service preview ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button 
                          type="button"
                          variant="destructive" 
                          size="icon" 
                          className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Tagi */}
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
              
              <Separator />
              
              {/* Dostępność do konsultacji */}
              <div className="space-y-4 bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex justify-between">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="offersConsultations" 
                      checked={offersConsultations}
                      onCheckedChange={(checked) => setOffersConsultations(checked as boolean)}
                      className="mt-1"
                    />
                    <div>
                      <Label htmlFor="offersConsultations" className="text-base font-medium">Oferuję również konsultacje</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Zaznacz, jeśli chcesz również oferować konsultacje w wybranych dziedzinach.
                      </p>
                    </div>
                  </div>
                </div>
                
                {offersConsultations && (
                  <div className="pt-2">
                    <Label className="mb-2 block">Dziedziny konsultacji</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {serviceCategories.map(category => (
                        <div 
                          key={`consultation-${category.id}`}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox 
                            id={`consultation-${category.id}`}
                            checked={consultationCategories.includes(category.name)}
                            onCheckedChange={() => toggleConsultationCategory(category.name)}
                          />
                          <Label 
                            htmlFor={`consultation-${category.id}`}
                            className="font-normal cursor-pointer"
                          >
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      Twoje konsultacje będą również widoczne w zakładce "Konsultacje".
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="consultations" className="pt-4 space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
              <h3 className="text-amber-800 dark:text-amber-300 font-medium flex items-center gap-2">
                <Users className="h-5 w-5" />
                Dodawanie konsultacji
              </h3>
              <p className="text-amber-700 dark:text-amber-400 mt-1 text-sm">
                Możesz dodać swoją dostępność do konsultacji na zakładce "Usługa muzyczna", 
                zaznaczając opcję "Oferuję również konsultacje". Zostanie to automatycznie dodane
                do zakładki Konsultacje w Marketplace.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Anuluj
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Dodaj usługę
            {offersConsultations && " i konsultacje"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
