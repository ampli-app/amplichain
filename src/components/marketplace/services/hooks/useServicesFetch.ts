
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Service } from '@/types/messages';

export function useServicesFetch() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchServices();
  }, []);
  
  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (servicesError) {
        throw servicesError;
      }
      
      if (servicesData) {
        const servicesWithProfiles = await Promise.all(servicesData.map(async (service) => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('username, full_name, avatar_url')
            .eq('id', service.user_id)
            .single();
            
          return {
            ...service,
            profiles: profileError ? { 
              username: null, 
              full_name: null, 
              avatar_url: null 
            } : profileData
          };
        }));
        
        setServices(servicesWithProfiles as Service[]);
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd:', err);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać listy usług. Spróbuj odświeżyć stronę.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return { services, loading, fetchServices };
}
