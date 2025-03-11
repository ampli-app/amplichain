
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
      
      // Pobierz wszystkie konsultacje
      const { data: consultationsData, error: consultationsError } = await supabase
        .from('consultations')
        .select('*, profiles:user_id(id, username, full_name, avatar_url)')
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
            profiles: consultation.profiles ? {
              id: consultation.profiles.id,
              username: consultation.profiles.username || '',
              full_name: consultation.profiles.full_name || '',
              avatar_url: consultation.profiles.avatar_url || ''
            } : undefined
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
