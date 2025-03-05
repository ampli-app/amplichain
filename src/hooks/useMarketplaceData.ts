
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Zastępcze dane na wypadek błędu pobierania
const FALLBACK_PRODUCTS = [
  { id: '1', title: 'Mikrofon Neumann', image: 'https://images.unsplash.com/photo-1520116468816-95b69f847357?q=80&w=2000&auto=format&fit=crop', price: 1299, category: 'Sprzęt' },
  { id: '2', title: 'Interfejs audio', image: 'https://images.unsplash.com/photo-1558612846-ec0107aaf552?q=80&w=2000&auto=format&fit=crop', price: 899, category: 'Sprzęt' },
  { id: '3', title: 'Kontroler MIDI', image: 'https://images.unsplash.com/photo-1553526665-10042bd50dd1?q=80&w=2000&auto=format&fit=crop', price: 699, category: 'Sprzęt' },
  { id: '4', title: 'Monitory studyjne', image: 'https://images.unsplash.com/photo-1609587312208-cea54be969e7?q=80&w=2000&auto=format&fit=crop', price: 1499, category: 'Sprzęt' },
  { id: '5', title: 'Słuchawki studyjne', image: 'https://images.unsplash.com/photo-1545127398-14699f92334b?q=80&w=2000&auto=format&fit=crop', price: 599, category: 'Sprzęt' }
];

const FALLBACK_SERVICES = [
  { id: '1', title: 'Produkcja muzyczna', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop', price: 1500, category: 'Produkcja' },
  { id: '2', title: 'Miksowanie', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2000&auto=format&fit=crop', price: 800, category: 'Produkcja' },
  { id: '3', title: 'Mastering', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2000&auto=format&fit=crop', price: 600, category: 'Produkcja' },
  { id: '4', title: 'Nagrywanie wokalu', image: 'https://images.unsplash.com/photo-1520166012374-87f11d27f4e7?q=80&w=2000&auto=format&fit=crop', price: 1200, category: 'Nagrywanie' },
  { id: '5', title: 'Aranżacja', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=2000&auto=format&fit=crop', price: 1000, category: 'Kompozycja' }
];

const FALLBACK_CONSULTATIONS = [
  { id: '1', title: 'Konsultacja produkcyjna', image: 'https://images.unsplash.com/photo-1507941097613-9f2157b69235?q=80&w=2000&auto=format&fit=crop', price: 300, category: 'Doradztwo' },
  { id: '2', title: 'Doradztwo A&R', image: 'https://images.unsplash.com/photo-1453738773917-9c3eff1db985?q=80&w=2000&auto=format&fit=crop', price: 250, category: 'Doradztwo' },
  { id: '3', title: 'Rozwój kariery muzycznej', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=2000&auto=format&fit=crop', price: 400, category: 'Kariera' },
  { id: '4', title: 'Mentoring dla producentów', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2000&auto=format&fit=crop', price: 500, category: 'Mentoring' },
  { id: '5', title: 'Doradztwo biznesowe', image: 'https://images.unsplash.com/photo-1542744173-05336fcc7ad4?q=80&w=2000&auto=format&fit=crop', price: 450, category: 'Biznes' }
];

const FALLBACK_GROUPS = [
  { id: '1', name: 'Krąg Producentów', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop' },
  { id: '2', name: 'Spostrzeżenia A&R', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2000&auto=format&fit=crop' },
  { id: '3', name: 'Laboratorium Inżynierii Dźwięku', image: 'https://images.unsplash.com/photo-1588479839125-731d7ae923f6?q=80&w=2000&auto=format&fit=crop' },
  { id: '4', name: 'Wokaliści i Teksty', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=2000&auto=format&fit=crop' },
  { id: '5', name: 'Marketing Muzyczny', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2000&auto=format&fit=crop' },
  { id: '6', name: 'Kompozytorzy', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=2000&auto=format&fit=crop' },
];

export interface MarketplaceItem {
  id: string;
  title: string;
  image: string;
  price: number;
  category: string;
}

export interface Group {
  id: string;
  name: string;
  image: string;
  memberCount?: number;
}

export function useMarketplaceData() {
  const [products, setProducts] = useState<MarketplaceItem[]>(FALLBACK_PRODUCTS);
  const [services, setServices] = useState<MarketplaceItem[]>(FALLBACK_SERVICES);
  const [consultations, setConsultations] = useState<MarketplaceItem[]>(FALLBACK_CONSULTATIONS);
  const [groups, setGroups] = useState<Group[]>(FALLBACK_GROUPS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Pobierz produkty
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, title, image_url, price, category')
          .limit(12);
        
        if (productsError) throw productsError;
        
        if (productsData && productsData.length > 0) {
          setProducts(productsData.map(p => ({
            id: p.id,
            title: p.title,
            image: p.image_url || 'https://placehold.co/600x400?text=Brak+zdjęcia',
            price: p.price,
            category: p.category
          })));
        }
        
        // Pobierz usługi
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('id, title, image_url, price, category')
          .limit(12);
        
        if (servicesError) throw servicesError;
        
        if (servicesData && servicesData.length > 0) {
          setServices(servicesData.map(s => ({
            id: s.id,
            title: s.title,
            image: s.image_url || 'https://placehold.co/600x400?text=Brak+zdjęcia',
            price: s.price,
            category: s.category
          })));
        }
        
        // Pobierz konsultacje - używamy 'categories' zamiast 'category'
        const { data: consultationsData, error: consultationsError } = await supabase
          .from('consultations')
          .select('id, title, price, categories')
          .limit(12);
        
        if (consultationsError) throw consultationsError;
        
        if (consultationsData && consultationsData.length > 0) {
          setConsultations(consultationsData.map(c => ({
            id: c.id,
            title: c.title,
            image: 'https://images.unsplash.com/photo-1542744173-05336fcc7ad4?q=80&w=2000&auto=format&fit=crop',
            price: c.price,
            // Używamy pierwszej kategorii z tablicy categories jeśli istnieje, w przeciwnym razie "Inne"
            category: c.categories && c.categories.length > 0 ? c.categories[0] : "Inne"
          })));
        }
      } catch (error) {
        console.error('Błąd podczas pobierania danych:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać wszystkich danych. Wyświetlamy przykładowe treści.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return {
    products,
    services,
    consultations,
    groups,
    loading
  };
}
