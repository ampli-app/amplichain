
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function useServicesFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('item_id')
        .eq('user_id', user.id)
        .eq('item_type', 'service');
        
      if (error) {
        throw error;
      }
      
      const newFavorites: Record<string, boolean> = {};
      data?.forEach(fav => {
        newFavorites[fav.item_id] = true;
      });
      
      setFavorites(newFavorites);
    } catch (err) {
      console.error('Błąd podczas pobierania ulubionych:', err);
    }
  };

  const toggleFavorite = async (serviceId: string, isFavorite: boolean) => {
    if (!user) {
      toast({
        title: "Wymagane logowanie",
        description: "Aby dodać usługę do ulubionych, musisz być zalogowany.",
      });
      return;
    }
    
    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', serviceId)
          .eq('item_type', 'service');
          
        setFavorites(prev => {
          const newFavorites = { ...prev };
          delete newFavorites[serviceId];
          return newFavorites;
        });
        
        toast({
          title: "Usunięto z ulubionych",
          description: "Usługa została usunięta z Twoich ulubionych.",
        });
      } else {
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            item_id: serviceId,
            item_type: 'service'
          });
          
        setFavorites(prev => ({
          ...prev,
          [serviceId]: true
        }));
        
        toast({
          title: "Dodano do ulubionych",
          description: "Usługa została dodana do Twoich ulubionych.",
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
