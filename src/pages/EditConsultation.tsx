import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Loader2, Upload } from 'lucide-react';
import { BasicInfoSection } from '@/components/consultations/BasicInfoSection';
import { AvailabilitySection } from '@/components/consultations/AvailabilitySection';
import { ContactMethodsSection } from '@/components/consultations/ContactMethodsSection';
import { CategoriesSection } from '@/components/consultations/CategoriesSection';
import { useConsultationForm } from '@/hooks/useConsultationForm';
import { MediaPreview } from '@/components/social/MediaPreview';
import { handleFileUpload, uploadMediaToStorage } from '@/utils/mediaUtils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EditConsultation() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useConsultationForm();
  
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
      
      if (data.user_id !== user?.id) {
        toast({
          title: "Brak dostępu",
          description: "Nie masz uprawnień do edycji tej konsultacji.",
          variant: "destructive",
        });
        navigate('/profile?tab=marketplace&marketplaceTab=consultations');
        return;
      }
      
      Object.entries(form).forEach(([key, setter]) => {
        if (typeof setter === 'function' && key.startsWith('set')) {
          const dataKey = key.slice(3).toLowerCase();
          if (data[dataKey] !== undefined) {
            setter(data[dataKey]);
          }
        }
      });
      
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

  const handleSubmit = async () => {
    if (!form.validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (!user) {
        throw new Error("Nie jesteś zalogowany.");
      }

      const mediaUrls = await Promise.all(
        form.media
          .filter(m => m.file) // tylko nowe pliki
          .map(m => uploadMediaToStorage(m.file!, 'consultation-images'))
      );

      const allMediaUrls = form.media
        .filter(m => !m.file) // stare pliki (tylko url)
        .map(m => m.url)
        .concat(mediaUrls.filter(url => url !== null) as string[]);
      
      const consultationData = {
        ...form.getFormData(),
        images: allMediaUrls.length > 0 ? JSON.stringify(allMediaUrls) : null,
      };
      
      let operation;
      if (id) {
        operation = supabase
          .from('consultations')
          .update(consultationData)
          .eq('id', id);
      } else {
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
  
  const toggleContactMethod = (method: string) => {
    form.setContactMethods(prev => 
      prev.includes(method) 
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const toggleCategory = (category: string) => {
    form.setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
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
              <BasicInfoSection
                title={form.title}
                setTitle={form.setTitle}
                description={form.description}
                setDescription={form.setDescription}
                price={form.price}
                setPrice={form.setPrice}
                priceType={form.priceType}
                setPriceType={form.setPriceType}
                experienceYears={form.experienceYears}
                setExperienceYears={form.setExperienceYears}
              />
              
              <Separator />

              <div className="grid gap-3">
                <Label>Zdjęcia</Label>
                <div className="grid gap-4">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="cursor-pointer"
                    onChange={(e) => handleFileUpload(e, form.media, form.setMedia, fileInputRef)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Możesz dodać maksymalnie 6 zdjęć. Dozwolone formaty: JPG, PNG.
                  </p>
                  <MediaPreview
                    media={form.media}
                    onRemoveMedia={(index) => {
                      form.setMedia(prev => prev.filter((_, i) => i !== index));
                    }}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <Separator />
              
              <AvailabilitySection
                isOnline={form.isOnline}
                setIsOnline={form.setIsOnline}
                isInPerson={form.isInPerson}
                setIsInPerson={form.setIsInPerson}
                location={form.location}
                setLocation={form.setLocation}
              />
              
              <Separator />
              
              <ContactMethodsSection
                contactMethods={form.contactMethods}
                toggleContactMethod={toggleContactMethod}
              />
              
              <Separator />
              
              <CategoriesSection
                selectedCategories={form.selectedCategories}
                toggleCategory={toggleCategory}
              />
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
