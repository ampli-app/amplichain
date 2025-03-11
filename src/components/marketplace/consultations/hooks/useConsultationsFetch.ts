
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
        .select('*, profiles:user_id(*)')
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
          
          return consultation;
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
