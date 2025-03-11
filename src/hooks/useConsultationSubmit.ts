
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { uploadMediaToStorage } from '@/utils/mediaUtils';
import { useAuth } from '@/contexts/AuthContext';

export function useConsultationSubmit(id?: string) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (form: any) => {
    if (!form.validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (!user) {
        throw new Error("Nie jesteś zalogowany.");
      }

      // Obsługa przesyłania nowych mediów
      const newMediaPromises = form.media
        .filter((m: any) => m.file) // tylko nowe pliki
        .map((m: any) => uploadMediaToStorage(m.file!, 'consultation-images'));
      
      const uploadedMediaUrls = await Promise.all(newMediaPromises);
      
      // Połącz istniejące i nowe media
      const allMediaUrls = form.media
        .filter((m: any) => !m.file) // stare pliki (tylko url)
        .map((m: any) => m.url)
        .concat(uploadedMediaUrls.filter((url: string | null) => url !== null) as string[]);
      
      const consultationData = {
        ...form.getFormData(),
        images: allMediaUrls.length > 0 ? JSON.stringify(allMediaUrls) : null,
        user_id: user.id
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

  return {
    isLoading,
    handleSubmit
  };
}
