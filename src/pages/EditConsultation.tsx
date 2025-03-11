
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, Save, Trash2, Loader2, PlusCircle, X, Upload
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from '@/components/ui/badge';
import { Consultation } from '@/types/consultations';
import { AspectRatio } from '@/components/ui/aspect-ratio';

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

interface ConsultationImage {
  file: File | null;
  preview: string;
  existingUrl?: string;
}

export default function EditConsultation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState('za godzinę');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [isInPerson, setIsInPerson] = useState(false);
  const [location, setLocation] = useState('');
  const [contactMethods, setContactMethods] = useState<string[]>([]);
  
  // Tagi
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  // Multi-image support
  const [consultationImages, setConsultationImages] = useState<ConsultationImage[]>([]);
  const MAX_IMAGES = 8;
  
  useEffect(() => {
    // Check if user is logged in
    if (!isLoggedIn) {
      toast({
        title: "Dostęp zabroniony",
        description: "Musisz być zalogowany, aby edytować konsultacje.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    // Fetch consultation data
    if (id) {
      fetchConsultationData(id);
    } else {
      // If no ID, redirect to marketplace
      navigate('/marketplace');
    }
  }, [id, isLoggedIn, user]);
  
  const fetchConsultationData = async (consultationId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', consultationId)
        .single();
      
      if (error) {
        console.error('Error fetching consultation:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać danych konsultacji.",
          variant: "destructive",
        });
        navigate('/marketplace');
        return;
      }
      
      if (!data) {
        toast({
          title: "Konsultacja nie znaleziona",
          description: "Nie znaleziono konsultacji o podanym ID.",
          variant: "destructive",
        });
        navigate('/marketplace');
        return;
      }
      
      // Check if this consultation belongs to the current user
      if (user?.id !== data.user_id) {
        toast({
          title: "Brak uprawnień",
          description: "Nie możesz edytować konsultacji innych użytkowników.",
          variant: "destructive",
        });
        navigate('/marketplace');
        return;
      }
      
      // Set form state with consultation data
      setTitle(data.title);
      setDescription(data.description || '');
      setPrice(data.price.toString());
      setPriceType('za godzinę'); // Domyślnie
      setSelectedCategories(data.categories || []);
      setExperienceYears(data.experience || '');
      setIsOnline(data.is_online);
      setIsInPerson(data.location ? true : false);
      setLocation(data.location || '');
      setContactMethods(data.contact_methods || []);
      
      // Obsługa zdjęć konsultacji
      if (data.images && data.images.length > 0) {
        const imagesWithPreviews = data.images.map(url => ({
          file: null,
          preview: url,
          existingUrl: url
        }));
        
        setConsultationImages(imagesWithPreviews);
      } else {
        // Brak zdjęć - dodaj domyślne
        setConsultationImages([{
          file: null,
          preview: "https://images.unsplash.com/photo-1542744173-05336fcc7ad4?q=80&w=2000&auto=format&fit=crop",
          existingUrl: "https://images.unsplash.com/photo-1542744173-05336fcc7ad4?q=80&w=2000&auto=format&fit=crop"
        }]);
      }
      
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      // Sprawdź ile jeszcze możemy dodać zdjęć
      const remainingSlots = MAX_IMAGES - consultationImages.length;
      
      if (remainingSlots <= 0) {
        toast({
          title: "Limit zdjęć",
          description: `Możesz dodać maksymalnie ${MAX_IMAGES} zdjęć. Usuń niektóre istniejące zdjęcia przed dodaniem nowych.`,
          variant: "destructive",
        });
        return;
      }
      
      // Limit liczby zdjęć
      const filesToProcess = files.slice(0, remainingSlots);
      
      if (files.length > remainingSlots) {
        toast({
          title: "Limit zdjęć",
          description: `Możesz dodać jeszcze tylko ${remainingSlots} zdjęć. Wybrano pierwsze ${filesToProcess.length}.`,
          variant: "destructive",
        });
      }
      
      // Przetwórz każdy plik
      const newImages: ConsultationImage[] = [];
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
            setConsultationImages(prev => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  const handleAddImageClick = () => {
    const fileInput = document.getElementById('multiple-images');
    if (fileInput) {
      fileInput.click();
    }
  };
  
  const handleRemoveImage = (index: number) => {
    const updatedImages = [...consultationImages];
    updatedImages.splice(index, 1);
    setConsultationImages(updatedImages);
  };
  
  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    // Najpierw dodaj wszystkie istniejące URL
    consultationImages.forEach(img => {
      if (img.existingUrl && !img.file) {
        uploadedUrls.push(img.existingUrl);
      }
    });
    
    // Następnie prześlij nowe pliki
    const filesToUpload = consultationImages.filter(img => img.file);
    
    for (const image of filesToUpload) {
      if (!image.file) continue;
      
      // Generuj unikalną nazwę pliku
      const fileExt = image.file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `consultation-images/${fileName}`;
      
      try {
        const { data, error } = await supabase.storage
          .from('consultations')
          .upload(filePath, image.file);
        
        if (error) {
          console.error('Error uploading image:', error);
          toast({
            title: "Błąd",
            description: `Nie udało się przesłać zdjęcia: ${error.message}`,
            variant: "destructive",
          });
          continue;
        }
        
        // Pobierz publiczny URL
        const { data: urlData } = supabase.storage
          .from('consultations')
          .getPublicUrl(filePath);
        
        uploadedUrls.push(urlData.publicUrl);
      } catch (err) {
        console.error('Unexpected error during upload:', err);
      }
    }
    
    return uploadedUrls;
  };
  
  const validateForm = () => {
    if (!title.trim()) {
      toast({
        title: "Brak tytułu konsultacji",
        description: "Podaj tytuł konsultacji.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!price.trim() || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      toast({
        title: "Nieprawidłowa cena",
        description: "Podaj poprawną cenę konsultacji.",
        variant: "destructive",
      });
      return false;
    }
    
    if (selectedCategories.length === 0) {
      toast({
        title: "Brak kategorii",
        description: "Wybierz przynajmniej jedną kategorię konsultacji.",
        variant: "destructive",
      });
      return false;
    }
    
    if (isInPerson && !location.trim()) {
      toast({
        title: "Brak lokalizacji",
        description: "Podaj lokalizację dla konsultacji stacjonarnych.",
        variant: "destructive",
      });
      return false;
    }
    
    if (contactMethods.length === 0) {
      toast({
        title: "Brak metod kontaktu",
        description: "Wybierz przynajmniej jedną metodę kontaktu dla swoich konsultacji.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn || !user) {
      toast({
        title: "Wymagane logowanie",
        description: "Musisz być zalogowany, aby edytować konsultacje.",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prześlij wszystkie zdjęcia
      const imageUrls = await uploadImages();
      
      const consultationData = {
        title,
        description,
        price: parseFloat(price),
        categories: selectedCategories,
        experience: experienceYears,
        is_online: isOnline,
        location: isInPerson ? location : null,
        contact_methods: contactMethods,
        images: imageUrls,
      };
      
      const { error } = await supabase
        .from('consultations')
        .update(consultationData)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating consultation:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się zaktualizować konsultacji.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Sukces",
        description: "Konsultacja została zaktualizowana.",
      });
      
      // Powróć do strony profilu z aktywną zakładką konsultacji
      navigate('/profile?tab=marketplace&marketplaceTab=consultations');
      
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!id) return;
    
    const confirmed = window.confirm("Czy na pewno chcesz usunąć tę konsultację?");
    if (!confirmed) return;
    
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('consultations')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting consultation:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się usunąć konsultacji.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Sukces",
        description: "Konsultacja została usunięta.",
      });
      
      // Przejdź do marketplace
      navigate('/profile?tab=marketplace&marketplaceTab=consultations');
      
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4">
              <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" />
            </div>
            <p className="text-rhythm-600 dark:text-rhythm-400">Ładowanie danych konsultacji...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <div className="mb-8">
            <Link 
              to={`/profile?tab=marketplace&marketplaceTab=consultations`} 
              className="inline-flex items-center gap-2 text-rhythm-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Wróć do moich konsultacji
            </Link>
          </div>
          
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Edytuj konsultację</CardTitle>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="grid gap-3">
                  <Label htmlFor="title">Tytuł oferty konsultacji</Label>
                  <Input 
                    id="title" 
                    placeholder="np. Konsultacje z zakresu produkcji muzycznej"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
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
                        required
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
                
                {/* Multi-image upload component */}
                <div className="grid gap-3">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="images">Zdjęcia konsultacji ({consultationImages.length}/{MAX_IMAGES})</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAddImageClick}
                      disabled={consultationImages.length >= MAX_IMAGES}
                      className="flex items-center gap-1"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Dodaj zdjęcie
                    </Button>
                  </div>
                  
                  {/* Hidden input for uploading multiple images */}
                  <input
                    type="file"
                    id="multiple-images"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleMultipleImageUpload}
                  />
                  
                  {/* Drop zone for images */}
                  {consultationImages.length < MAX_IMAGES && (
                    <div 
                      className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                      onClick={handleAddImageClick}
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">
                        Przeciągnij zdjęcia tutaj lub kliknij, aby wybrać
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Możesz dodać maksymalnie {MAX_IMAGES} zdjęć (pozostało {MAX_IMAGES - consultationImages.length})
                      </p>
                    </div>
                  )}
                  
                  {/* Image previews */}
                  {consultationImages.length > 0 && (
                    <ScrollArea className="h-44 rounded-md border p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {consultationImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-md overflow-hidden border bg-gray-100 dark:bg-gray-800">
                              <img 
                                src={image.preview} 
                                alt={`Consultation preview ${index + 1}`} 
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <Button 
                              type="button"
                              variant="destructive" 
                              size="icon" 
                              className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
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
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="px-2 py-1 gap-1">
                          {tag}
                          <button 
                            className="ml-1 hover:text-destructive"
                            onClick={() => removeTag(tag)}
                            type="button"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button 
                  variant="destructive" 
                  type="button" 
                  onClick={handleDelete}
                  disabled={isSaving || isDeleting}
                >
                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Trash2 className="mr-2 h-4 w-4" />
                  Usuń konsultację
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => navigate('/profile?tab=marketplace&marketplaceTab=consultations')}
                    disabled={isSaving || isDeleting}
                  >
                    Anuluj
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSaving || isDeleting}
                  >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Zapisz zmiany
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
