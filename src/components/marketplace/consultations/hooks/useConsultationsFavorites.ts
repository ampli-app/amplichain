
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

export function useConsultationsFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);
  
  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('item_id')
        .eq('user_id', user.id)
        .eq('item_type', 'consultation');
        
      if (error) {
        throw error;
      }
      
      const newFavorites: Record<string, boolean> = {};
      data?.forEach(fav => {
        newFavorites[fav.item_id] = true;
      });
      
      setFavorites(newFavorites);
    } catch (err) {
      console.error('Błąd podczas pobierania ulubionych konsultacji:', err);
    }
  };
  
  const toggleFavorite = async (consultationId: string, isFavorite: boolean) => {
    if (!user) {
      toast({
        title: "Wymagane logowanie",
        description: "Aby dodać konsultację do ulubionych, musisz być zalogowany.",
      });
      return;
    }
    
    try {
      if (isFavorite) {
        // Usuń z ulubionych
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', consultationId)
          .eq('item_type', 'consultation');
          
        if (error) throw error;
        
        setFavorites(prev => {
          const newFavorites = { ...prev };
          delete newFavorites[consultationId];
          return newFavorites;
        });
        
        toast({
          title: "Usunięto z ulubionych",
          description: "Konsultacja została usunięta z ulubionych.",
        });
      } else {
        // Dodaj do ulubionych
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            item_id: consultationId,
            item_type: 'consultation'
          });
          
        if (error) throw error;
        
        setFavorites(prev => ({
          ...prev,
          [consultationId]: true
        }));
        
        toast({
          title: "Dodano do ulubionych",
          description: "Konsultacja została dodana do ulubionych.",
        });
      }
    } catch (err) {
      console.error('Błąd podczas aktualizacji ulubionych:', err);
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować ulubionych. Spróbuj ponownie.",
        variant: "destructive",
      });
    }
  };
  
  return { favorites, toggleFavorite };
}
