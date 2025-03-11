import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Loader2, Plus, X } from 'lucide-react';
import { Consultation } from '@/types/consultations';

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

export default function EditConsultation() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
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
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (id) {
      fetchConsultation();
    } else {
      setIsFetching(false);
    }
  }, [id, user]);
  
  const fetchConsultation = async () => {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Nie znaleziono",
          description: "Nie znaleziono konsultacji o podanym ID.",
          variant: "destructive",
        });
        navigate('/profile?tab=marketplace&marketplaceTab=consultations');
        return;
      }
      
      // Sprawdź, czy użytkownik jest właścicielem konsultacji
      if (data.user_id !== user?.id) {
        toast({
          title: "Brak dostępu",
          description: "Nie masz uprawnień do edycji tej konsultacji.",
          variant: "destructive",
        });
        navigate('/profile?tab=marketplace&marketplaceTab=consultations');
        return;
      }
      
      // Wypełnij formularz danymi
      setTitle(data.title);
      setDescription(data.description || '');
      setPrice(data.price.toString());
      setSelectedCategories(data.categories || []);
      setExperienceYears(data.experience || '');
      setIsOnline(data.is_online);
      setIsInPerson(!!data.location);
      setLocation(data.location || '');
      setContactMethods(data.contact_methods || []);
      
      // Dodajmy domyślne obrazki, jeśli właściwość images nie istnieje w danych
      const defaultImages = [
        "https://images.unsplash.com/photo-1542744173-05336fcc7ad4?q=80&w=2000&auto=format&fit=crop"
      ];
      
    } catch (error) {
      console.error('Error fetching consultation:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać danych konsultacji.",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
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
        contact_methods: contactMethods,
      };
      
      let operation;
      if (id) {
        // Aktualizacja istniejącej konsultacji
        operation = supabase
          .from('consultations')
          .update(consultationData)
          .eq('id', id);
      } else {
        // Dodanie nowej konsultacji
        operation = supabase
          .from('consultations')
          .insert(consultationData);
      }
      
      const { error } = await operation;
      
      if (error) throw error;
      
      toast({
        title: id ? "Zaktualizowano!" : "Sukces!",
        description: id
          ? "Twoje konsultacje zostały zaktualizowane pomyślnie."
          : "Twoje konsultacje zostały dodane pomyślnie.",
      });
      
      // Przekieruj na stronę profilu z aktywną zakładką marketplace
      navigate('/profile?tab=marketplace&marketplaceTab=consultations');
      
    } catch (error) {
      console.error("Błąd podczas zapisywania konsultacji:", error);
      toast({
        title: "Błąd",
        description: `Nie udało się ${id ? 'zaktualizować' : 'dodać'} konsultacji. Spróbuj ponownie później.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isFetching) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16">
          <div className="container px-4 mx-auto flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>{id ? 'Edytuj konsultację' : 'Dodaj nową konsultację'}</CardTitle>
              <CardDescription>
                {id 
                  ? 'Zaktualizuj informacje o swojej ofercie konsultacji muzycznych'
                  : 'Zaoferuj swoje konsultacje muzyczne i podziel się swoją wiedzą z innymi'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                          <X className="h-3 w-3" />
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
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/profile?tab=marketplace&marketplaceTab=consultations')}
                disabled={isLoading}
              >
                Anuluj
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {id ? 'Zapisz zmiany' : 'Dodaj konsultację'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
