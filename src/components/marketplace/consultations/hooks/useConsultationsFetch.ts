
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Consultation } from '@/types/consultations';

export function useConsultationsFetch() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchConsultations();
  }, []);
  
  const fetchConsultations = async () => {
    setLoading(true);
    try {
      console.log("Rozpoczęto pobieranie konsultacji");
      
      // Pobierz wszystkie konsultacje
      const { data: consultationsData, error: consultationsError } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (consultationsError) {
        console.error('Błąd pobierania konsultacji:', consultationsError);
        throw consultationsError;
      }
      
      console.log(`Pobrano ${consultationsData?.length || 0} konsultacji`);
      
      if (consultationsData && consultationsData.length > 0) {
        // Pobierz unikalne ID użytkowników
        const userIds = [...new Set(consultationsData.map(c => c.user_id))];
        
        console.log(`Pobieranie profili dla ${userIds.length} użytkowników`);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .in('id', userIds);
          
        if (profilesError) {
          console.error('Błąd pobierania profili:', profilesError);
        }
        
        console.log(`Pobrano ${profilesData?.length || 0} profili`);
        
        // Połącz dane konsultacji z profilami
        const consultationsWithProfiles = consultationsData.map(consultation => {
          const profile = profilesData?.find(p => p.id === consultation.user_id);
          return {
            ...consultation,
            profiles: profile || { 
              id: consultation.user_id,
              username: null, 
              full_name: null, 
              avatar_url: null 
            }
          };
        });
        
        console.log("Połączone dane konsultacji z profilami:", consultationsWithProfiles);
        setConsultations(consultationsWithProfiles);
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
  
  return { consultations, loading, fetchConsultations };
}
