
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, Trash2, Upload, X, Loader2, Save } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Kategorie konsultacji - takie same jak w ConsultationsMarketplaceContent
const CONSULTATION_CATEGORIES = [
  'Kompozycja',
  'Aranżacja',
  'Produkcja muzyczna',
  'Mix i mastering',
  'Teoria muzyki',
  'Nagrywanie',
  'Wokal'
];

// Metody kontaktu
const CONTACT_METHODS = [
  { id: 'chat', label: 'Czat w aplikacji' },
  { id: 'video', label: 'Wideorozmowa' },
  { id: 'phone', label: 'Rozmowa telefoniczna' },
  { id: 'email', label: 'Email' }
];

export default function EditConsultation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [contactMethods, setContactMethods] = useState<string[]>([]);
  
  // Images handling
  const [images, setImages] = useState<string[]>([]);
  const [fileUploading, setFileUploading] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchConsultationData();
  }, [user, id]);
  
  const fetchConsultationData = async () => {
    if (!id) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data.user_id !== user?.id) {
        toast({
          title: "Brak dostępu",
          description: "Nie masz uprawnień do edycji tej konsultacji.",
          variant: "destructive"
        });
        navigate('/marketplace?tab=consultations');
        return;
      }
      
      // Populate form data
      setTitle(data.title || '');
      setDescription(data.description || '');
      setPrice(data.price?.toString() || '');
      setExperience(data.experience || '');
      setLocation(data.location || '');
      setIsOnline(data.is_online);
      setSelectedCategories(data.categories || []);
      setContactMethods(data.contact_methods || []);
      setImages(data.images || []);
      
    } catch (error) {
      console.error('Error fetching consultation:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać danych konsultacji.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = async () => {
    if (!user || !id) return;
    
    // Walidacja podstawowa
    if (!title.trim()) {
      toast({
        title: "Błąd walidacji",
        description: "Tytuł jest wymagany.",
        variant: "destructive"
      });
      return;
    }
    
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      toast({
        title: "Błąd walidacji",
        description: "Cena musi być liczbą większą od zera.",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedCategories.length === 0) {
      toast({
        title: "Błąd walidacji", 
        description: "Wybierz co najmniej jedną kategorię.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('consultations')
        .update({
          title,
          description,
          price: Number(price),
          experience,
          location,
          is_online: isOnline,
          categories: selectedCategories,
          contact_methods: contactMethods,
          images,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Zapisano zmiany",
        description: "Konsultacja została zaktualizowana pomyślnie."
      });
      
      navigate('/marketplace?tab=consultations');
      
    } catch (error) {
      console.error('Error updating consultation:', error);
      toast({
        title: "Błąd zapisu",
        description: "Nie udało się zaktualizować konsultacji. Spróbuj ponownie.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!user || !id) return;
    
    try {
      const { error } = await supabase
        .from('consultations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Konsultacja usunięta",
        description: "Konsultacja została usunięta pomyślnie."
      });
      
      navigate('/marketplace?tab=consultations');
      
    } catch (error) {
      console.error('Error deleting consultation:', error);
      toast({
        title: "Błąd usuwania",
        description: "Nie udało się usunąć konsultacji. Spróbuj ponownie.",
        variant: "destructive"
      });
    }
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) {
      return;
    }
    
    setFileUploading(true);
    
    try {
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user!.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('consultation_images')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      const { data } = supabase.storage
        .from('consultation_images')
        .getPublicUrl(filePath);
      
      setImages(prev => [...prev, data.publicUrl]);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Błąd przesyłania",
        description: "Nie udało się przesłać obrazu. Spróbuj ponownie.",
        variant: "destructive"
      });
    } finally {
      setFileUploading(false);
    }
  };
  
  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(prev => prev.filter(c => c !== category));
    } else {
      setSelectedCategories(prev => [...prev, category]);
    }
  };
  
  const toggleContactMethod = (method: string) => {
    if (contactMethods.includes(method)) {
      setContactMethods(prev => prev.filter(m => m !== method));
    } else {
      setContactMethods(prev => [...prev, method]);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Ładowanie danych konsultacji...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/marketplace?tab=consultations')}
          className="flex items-center"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Powrót do konsultacji
        </Button>
        
        <Button 
          variant="destructive" 
          onClick={() => setShowDeleteDialog(true)}
          className="flex items-center"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Usuń konsultację
        </Button>
      </div>
      
      <div className="bg-card rounded-lg border p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Edytuj konsultację</h1>
        
        <div className="space-y-6">
          {/* Podstawowe informacje */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Podstawowe informacje</h2>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tytuł konsultacji*</Label>
                <Input 
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Np. Konsultacja produkcji muzycznej"
                  maxLength={100}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Opis</Label>
                <Textarea 
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Opisz szczegółowo swoją ofertę konsultacji"
                  rows={5}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Cena za godzinę (PLN)*</Label>
                  <Input 
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Np. 150"
                    min={1}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="experience">Poziom doświadczenia (w latach)</Label>
                  <Input 
                    id="experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="Np. 5"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Kategorie */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Kategorie*</h2>
            <p className="text-muted-foreground text-sm">Wybierz kategorie, które najlepiej opisują twoją konsultację.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {CONSULTATION_CATEGORIES.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                  />
                  <label 
                    htmlFor={`category-${category}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          {/* Dostępność */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Dostępność</h2>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="online"
                checked={isOnline}
                onCheckedChange={setIsOnline}
              />
              <Label htmlFor="online">Konsultacje online</Label>
            </div>
            
            {!isOnline && (
              <div className="space-y-2">
                <Label htmlFor="location">Lokalizacja</Label>
                <Input 
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Np. Warszawa, Centrum"
                />
              </div>
            )}
          </div>
          
          <Separator />
          
          {/* Metody kontaktu */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Metody kontaktu</h2>
            <p className="text-muted-foreground text-sm">Wybierz preferowane metody kontaktu z klientami.</p>
            
            <div className="grid grid-cols-2 gap-2">
              {CONTACT_METHODS.map((method) => (
                <div key={method.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`method-${method.id}`}
                    checked={contactMethods.includes(method.id)}
                    onCheckedChange={() => toggleContactMethod(method.id)}
                  />
                  <label 
                    htmlFor={`method-${method.id}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {method.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          {/* Zdjęcia */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Zdjęcia</h2>
            <p className="text-muted-foreground text-sm">Dodaj zdjęcia, które reprezentują twoją konsultację (opcjonalnie).</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group aspect-square">
                  <img 
                    src={image} 
                    alt={`Konsultacja ${index + 1}`} 
                    className="w-full h-full object-cover rounded-md"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-red-500/80 transition-colors"
                    aria-label="Usuń zdjęcie"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              {images.length < 5 && (
                <div className="aspect-square flex items-center justify-center border-2 border-dashed rounded-md border-muted-foreground/25 relative">
                  <input
                    type="file"
                    id="imageUpload"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={fileUploading}
                  />
                  {fileUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <div className="text-center">
                      <Upload className="h-6 w-6 mb-1 mx-auto text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Dodaj zdjęcie</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Zapisywanie...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Zapisz zmiany
              </>
            )}
          </Button>
        </div>
      </div>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć tę konsultację?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja jest nieodwracalna. Konsultacja zostanie trwale usunięta z systemu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
