
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DiscoverSlider {
  id: string;
  title: string;
  description: string;
  button_text: string;
  image_url: string;
  background_position?: string;
  link: string;
  active: boolean;
  sort_order: number;
}

export const useDiscoverSliders = () => {
  const [sliders, setSliders] = useState<DiscoverSlider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('discover_sliders')
          .select('*')
          .eq('active', true)
          .order('sort_order', { ascending: true });
        
        if (error) {
          console.error("Błąd podczas pobierania sliderów:", error);
          setError(error.message);
          return;
        }
        
        setSliders(data || []);
      } catch (err) {
        console.error("Nieoczekiwany błąd:", err);
        setError("Wystąpił nieoczekiwany błąd podczas ładowania danych.");
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, []);

  return { sliders, loading, error };
};
