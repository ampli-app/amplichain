
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Consultation } from '@/types/consultations';

interface ProfileData {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
}

export function useConsultationsFetch() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchConsultations = async () => {
    setLoading(true);
    try {
      console.log("Rozpoczęto pobieranie konsultacji");
      
      // 1. Najpierw pobieramy konsultacje bez relacji
      const { data: consultationsData, error: consultationsError } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (consultationsError) {
        console.error('Błąd pobierania konsultacji:', consultationsError);
        throw consultationsError;
      }
      
      console.log(`Pobrano ${consultationsData?.length || 0} konsultacji`, consultationsData);
      
      if (consultationsData && consultationsData.length > 0) {
        // 2. Pobieramy identyfikatory użytkowników z konsultacji
        const userIds = [...new Set(consultationsData.map(c => c.user_id))];
        
        // 3. Pobieramy profile użytkowników
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds);
        
        if (profilesError) {
          console.error('Błąd pobierania profili:', profilesError);
          // Kontynuujemy mimo błędu, użyjemy domyślnych danych
        }
        
        console.log('Pobrane profile:', profilesData);
        
        // 4. Tworzymy mapę profili dla szybkiego dostępu
        const profilesMap: Record<string, any> = {};
        if (profilesData) {
          profilesData.forEach(profile => {
            profilesMap[profile.id] = profile;
          });
        }
        
        // 5. Łączymy dane konsultacji z danymi profili
        const processedConsultations = consultationsData.map(consultation => {
          if (!consultation.images || consultation.images.length === 0) {
            consultation.images = [
              "https://images.unsplash.com/photo-1542744173-05336fcc7ad4?q=80&w=2000&auto=format&fit=crop"
            ];
          }
          
          let userProfile: ProfileData = {
            id: '',
            username: '',
            full_name: 'Ekspert',
            avatar_url: ''
          };
          
          // Sprawdzamy czy mamy profil dla tego użytkownika
          const profile = profilesMap[consultation.user_id];
          if (profile) {
            userProfile = {
              id: profile.id?.toString() || '',
              username: profile.username?.toString() || '',
              full_name: profile.full_name?.toString() || 'Ekspert',
              avatar_url: profile.avatar_url?.toString() || ''
            };
          }
          
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
