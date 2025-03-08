
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
      // Pobierz wszystkie konsultacje
      const { data: consultationsData, error: consultationsError } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (consultationsError) {
        throw consultationsError;
      }
      
      if (consultationsData && consultationsData.length > 0) {
        // Pobierz profile dla każdej konsultacji
        const userIds = [...new Set(consultationsData.map(c => c.user_id))];
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .in('id', userIds);
          
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        }
        
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
