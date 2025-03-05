
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketplaceItem } from '@/components/MarketplaceItem';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface Item {
  id: string;
  title: string;
  image: string;
  price?: number;
  author?: string;
  category?: string;
}

interface MarketplaceSectionProps {
  title: string;
  itemType: 'products' | 'services' | 'consultations';
  items: Item[];
}

export function MarketplaceSection({ title, itemType, items }: MarketplaceSectionProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
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
        .eq('item_type', itemType === 'products' ? 'product' : itemType === 'services' ? 'service' : 'consultation');
        
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

  const toggleFavorite = async (itemId: string, isFavorite: boolean) => {
    if (!user) {
      toast({
        title: "Wymagane logowanie",
        description: "Aby dodać do ulubionych, musisz być zalogowany.",
      });
      return;
    }
    
    const itemType_db = itemType === 'products' ? 'product' : itemType === 'services' ? 'service' : 'consultation';
    
    try {
      if (isFavorite) {
        // Usuwamy z ulubionych
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId)
          .eq('item_type', itemType_db);
          
        setFavorites(prev => {
          const newFavorites = { ...prev };
          delete newFavorites[itemId];
          return newFavorites;
        });
        
        toast({
          title: "Usunięto z ulubionych",
          description: `${itemType === 'products' ? 'Produkt' : itemType === 'services' ? 'Usługa' : 'Konsultacja'} została usunięta z ulubionych.`,
        });
      } else {
        // Dodajemy do ulubionych
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            item_id: itemId,
            item_type: itemType_db
          });
          
        setFavorites(prev => ({
          ...prev,
          [itemId]: true
        }));
        
        toast({
          title: "Dodano do ulubionych",
          description: `${itemType === 'products' ? 'Produkt' : itemType === 'services' ? 'Usługa' : 'Konsultacja'} została dodana do ulubionych.`,
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

  const getViewAllPath = () => {
    if (itemType === 'products') {
      return '/marketplace?tab=products';
    } else if (itemType === 'services') {
      return '/marketplace?tab=services';
    } else {
      return '/marketplace?tab=consultations';
    }
  };
  
  const handleItemClick = (itemId: string) => {
    navigate(`/marketplace/${itemId}`);
  };

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">{title}</h3>
        <Link to={getViewAllPath()} className="no-underline">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Zobacz wszystkie
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      
      <div className="relative">
        <ScrollArea className="w-full overflow-x-auto" type="always">
          <div className="flex space-x-4 pb-6 min-w-full">
            {items.slice(0, 12).map((item, index) => (
              <div 
                key={item.id} 
                className="w-[200px] flex-none"
                onClick={() => handleItemClick(item.id)}
              >
                <MarketplaceItem
                  id={item.id}
                  title={item.title}
                  price={item.price || 0}
                  image={item.image}
                  category={item.category || "Inne"}
                  delay={index * 0.05}
                  isFavorite={favorites[item.id] || false}
                  onToggleFavorite={toggleFavorite}
                  hideInDiscover={false} // Upewnij się, że odznaki są zawsze widoczne
                />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
