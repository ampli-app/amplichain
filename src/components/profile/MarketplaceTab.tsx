import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MarketplaceItem } from '@/components/MarketplaceItem';
import { ServiceItem } from '@/components/ServiceItem';
import { supabase } from '@/integrations/supabase/client';

export function MarketplaceTab({ profileId }: { profileId: string }) {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserItems = async () => {
      setLoading(true);
      try {
        // Pobierz produkty użytkownika
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', profileId);
          
        if (productsError) {
          console.error('Błąd pobierania produktów:', productsError);
        } else {
          setProducts(productsData || []);
        }
        
        // Pobierz usługi użytkownika
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('user_id', profileId);
          
        if (servicesError) {
          console.error('Błąd pobierania usług:', servicesError);
        } else {
          setServices(servicesData || []);
        }
      } catch (error) {
        console.error('Nieoczekiwany błąd:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (profileId) {
      fetchUserItems();
    }
  }, [profileId]);
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="products">Produkty ({products.length})</TabsTrigger>
          <TabsTrigger value="services">Usługi ({services.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <MarketplaceItem
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  image={product.image_url}
                  category={product.category || "Inne"}
                  userId={product.user_id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Brak produktów do wyświetlenia</p>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/marketplace?tab=products'}
              >
                Dodaj produkt
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="services">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceItem
                  key={service.id}
                  id={service.id}
                  title={service.title}
                  price={service.price}
                  image={service.image_url}
                  category={service.category || "Inne"}
                  location={service.location}
                  userId={service.user_id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Brak usług do wyświetlenia</p>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/marketplace?tab=services'}
              >
                Dodaj usługę
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
