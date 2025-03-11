
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Consultation } from '@/types/consultations';

export function useConsultationsFetch() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchConsultations = async () => {
    setLoading(true);
    try {
      console.log("Rozpoczęto pobieranie konsultacji");
      
      // Pobierz wszystkie konsultacje z dołączonymi danymi profilowymi
      const { data: consultationsData, error: consultationsError } = await supabase
        .from('consultations')
        .select(`
          *,
          profiles!consultations_user_id_fkey(id, username, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });
      
      if (consultationsError) {
        console.error('Błąd pobierania konsultacji:', consultationsError);
        throw consultationsError;
      }
      
      console.log(`Pobrano ${consultationsData?.length || 0} konsultacji`);
      
      if (consultationsData) {
        const processedConsultations = consultationsData.map(consultation => {
          // Dodaj domyślne obrazy, jeśli nie są dostępne
          if (!consultation.images || consultation.images.length === 0) {
            consultation.images = [
              "https://images.unsplash.com/photo-1542744173-05336fcc7ad4?q=80&w=2000&auto=format&fit=crop"
            ];
          }
          
          // Przygotuj profil użytkownika - obsługa przypadku, gdy profiles może być null lub SelectQueryError
          let userProfile;
          
          // Bezpieczne sprawdzenie, czy profiles istnieje i ma poprawną strukturę
          const profileData = consultation.profiles;
          if (
            profileData && 
            typeof profileData === 'object' && 
            !('error' in profileData)
          ) {
            userProfile = {
              id: profileData && profileData.id ? profileData.id : '',
              username: profileData && profileData.username ? profileData.username : '',
              full_name: profileData && profileData.full_name ? profileData.full_name : '',
              avatar_url: profileData && profileData.avatar_url ? profileData.avatar_url : ''
            };
          } else {
            // Jeśli brak danych profilu lub wystąpił błąd, użyj domyślnych wartości
            userProfile = {
              id: '',
              username: '',
              full_name: 'Ekspert',
              avatar_url: ''
            };
          }
          
          // Konwertuj dane do właściwego typu Consultation
          return {
            id: consultation.id,
            user_id: consultation.user_id,
            title: consultation.title,
            description: consultation.description || '',
            price: consultation.price,
            categories: consultation.categories || [],
            experience: consultation.experience || '',
            availability: consultation.availability || [],
            is_online: consultation.is_online || false,
            location: consultation.location || '',
            contact_methods: consultation.contact_methods || [],
            created_at: consultation.created_at,
            updated_at: consultation.updated_at,
            images: consultation.images,
            profiles: userProfile
          } as Consultation;
        });
        
        setConsultations(processedConsultations);
      } else {
        setConsultations([]);
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd:', err);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać listy konsultacji. Spróbuj odświeżyć stronę.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchConsultations();
  }, []);
  
  return { consultations, loading, fetchConsultations };
}
