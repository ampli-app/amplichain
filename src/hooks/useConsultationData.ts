
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useConsultationForm } from '@/hooks/useConsultationForm';
import { useAuth } from '@/contexts/AuthContext';
import { MediaFile } from '@/utils/mediaUtils';

export function useConsultationData(id?: string) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFetching, setIsFetching] = useState(true);
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
      
      // Ustaw wszystkie pola formularza z danych z bazy
      Object.entries(form).forEach(([key, setter]) => {
        if (typeof setter === 'function' && key.startsWith('set')) {
          const dataKey = key.slice(3).toLowerCase();
          if (data[dataKey] !== undefined) {
            setter(data[dataKey]);
          }
        }
      });
      
      // Przygotuj media z pobranych danych
      if (data.images && Array.isArray(data.images)) {
        const mediaFiles: MediaFile[] = data.images.map((url: string) => ({
          url,
          type: 'image',
        }));
        form.setMedia(mediaFiles);
      }
      
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

  return {
    form,
    isFetching
  };
}
