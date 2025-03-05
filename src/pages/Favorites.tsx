
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, Briefcase, Headphones, HeartOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';
import { MarketplaceItem } from '@/components/MarketplaceItem';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  title: string;
  price: number;
  image_url: string | string[];
  category: string | null;
  rating: number | null;
  review_count: number | null;
  user_id?: string;
  condition?: string;
}

interface Service {
  id: string;
  title: string;
  price: number;
  description: string | null;
  category: string | null;
  location: string | null;
  image_url: string | null;
  user_id: string;
  profiles?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  }
}

interface Consultation {
  id: string;
  title: string;
  price: number;
  description: string | null;
  experience: string | null;
  categories: string[] | null;
  is_online: boolean | null;
  location: string | null;
  user_id: string;
  profiles?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  }
}

export default function Favorites() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("products");
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [favoriteServices, setFavoriteServices] = useState<Service[]>([]);
  const [favoriteConsultations, setFavoriteConsultations] = useState<Consultation[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn) {
      fetchFavorites();
    } else {
      setShowAuthDialog(true);
    }
  }, [isLoggedIn, activeTab]);
  
  const fetchFavorites = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Pobierz ulubione elementy danego typu
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('item_id, item_type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (favoritesError) throw favoritesError;
      
      if (favoritesData) {
        // Pogrupuj identyfikatory według typu
        const productIds = favoritesData.filter(f => f.item_type === 'product').map(f => f.item_id);
        const serviceIds = favoritesData.filter(f => f.item_type === 'service').map(f => f.item_id);
        const consultationIds = favoritesData.filter(f => f.item_type === 'consultation').map(f => f.item_id);
        
        // Pobierz dane dla ulubionych produktów
        if (productIds.length > 0) {
          const { data: products, error: productsError } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds);
            
          if (productsError) throw productsError;
          setFavoriteProducts(products || []);
        } else {
          setFavoriteProducts([]);
        }
        
        // Pobierz dane dla ulubionych usług
        if (serviceIds.length > 0) {
          const { data: services, error: servicesError } = await supabase
            .from('services')
            .select('*, profiles:user_id(username, full_name, avatar_url)')
            .in('id', serviceIds);
            
          if (servicesError) throw servicesError;
          setFavoriteServices(services || []);
        } else {
          setFavoriteServices([]);
        }
        
        // Pobierz dane dla ulubionych konsultacji
        if (consultationIds.length > 0) {
          const { data: consultations, error: consultationsError } = await supabase
            .from('consultations')
            .select('*, profiles:user_id(username, full_name, avatar_url)')
            .in('id', consultationIds);
            
          if (consultationsError) throw consultationsError;
          setFavoriteConsultations(consultations || []);
        } else {
          setFavoriteConsultations([]);
        }
      }
    } catch (err) {
      console.error('Błąd podczas pobierania ulubionych:', err);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać ulubionych. Spróbuj odświeżyć stronę.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveFromFavorites = async (itemId: string, itemType: 'product' | 'service' | 'consultation') => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .eq('item_type', itemType);
        
      if (error) throw error;
      
      // Aktualizuj lokalne stany po usunięciu
      if (itemType === 'product') {
        setFavoriteProducts(prev => prev.filter(p => p.id !== itemId));
      } else if (itemType === 'service') {
        setFavoriteServices(prev => prev.filter(s => s.id !== itemId));
      } else if (itemType === 'consultation') {
        setFavoriteConsultations(prev => prev.filter(c => c.id !== itemId));
      }
      
      toast({
        title: "Usunięto z ulubionych",
        description: "Element został usunięty z Twoich ulubionych.",
      });
    } catch (err) {
      console.error('Błąd podczas usuwania z ulubionych:', err);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć elementu z ulubionych. Spróbuj ponownie.",
        variant: "destructive",
      });
    }
  };

  const getProperCountText = (count: number, type: 'product' | 'service' | 'consultation') => {
    if (count === 0) {
      switch (type) {
        case 'product': return "produktów";
        case 'service': return "usług";
        case 'consultation': return "konsultacji";
      }
    }
    
    if (count === 1) {
      switch (type) {
        case 'product': return "produkt";
        case 'service': return "usługa";
        case 'consultation': return "konsultacja";
      }
    }
    
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 > 20)) {
      switch (type) {
        case 'product': return "produkty";
        case 'service': return "usługi";
        case 'consultation': return "konsultacje";
      }
    }
    
    switch (type) {
      case 'product': return "produktów";
      case 'service': return "usług";
      case 'consultation': return "konsultacji";
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Ulubione</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">
            Twoje ulubione produkty, usługi i konsultacje w jednym miejscu
          </p>
          
          <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="products" className="flex gap-2 items-center">
                <ShoppingBag className="h-4 w-4" />
                <span>Produkty ({favoriteProducts.length})</span>
              </TabsTrigger>
              <TabsTrigger value="services" className="flex gap-2 items-center">
                <Briefcase className="h-4 w-4" />
                <span>Usługi ({favoriteServices.length})</span>
              </TabsTrigger>
              <TabsTrigger value="consultations" className="flex gap-2 items-center">
                <Headphones className="h-4 w-4" />
                <span>Konsultacje ({favoriteConsultations.length})</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="products">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Ulubione produkty</h2>
                <p className="text-sm text-muted-foreground">
                  {favoriteProducts.length} {getProperCountText(favoriteProducts.length, 'product')}
                </p>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all duration-300 animate-pulse">
                      <div className="aspect-square bg-zinc-200 dark:bg-zinc-800"></div>
                      <div className="p-5 space-y-3">
                        <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-md w-2/3"></div>
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-1/3"></div>
                        <div className="h-9 bg-zinc-200 dark:bg-zinc-800 rounded-md w-full mt-4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : favoriteProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteProducts.map((product, index) => (
                    <MarketplaceItem
                      key={product.id}
                      id={product.id}
                      title={product.title}
                      price={product.price}
                      image={product.image_url}
                      category={product.category || "Inne"}
                      userId={product.user_id}
                      rating={product.rating || 0}
                      reviewCount={product.review_count || 0}
                      delay={index * 0.05}
                      isFavorite={true}
                      onToggleFavorite={() => handleRemoveFromFavorites(product.id, 'product')}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <HeartOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Nie masz ulubionych produktów</h3>
                  <p className="text-muted-foreground mb-4">
                    Dodaj produkty do ulubionych, aby mieć do nich szybki dostęp.
                  </p>
                  <Button onClick={() => navigate('/marketplace')}>
                    Przeglądaj produkty
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="services">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Ulubione usługi</h2>
                <p className="text-sm text-muted-foreground">
                  {favoriteServices.length} {getProperCountText(favoriteServices.length, 'service')}
                </p>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all duration-300 animate-pulse">
                      <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
                          <div>
                            <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-md w-32 mb-1"></div>
                            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-24"></div>
                          </div>
                        </div>
                        <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-md w-3/4 mb-2"></div>
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-full mb-4"></div>
                        <div className="flex justify-between">
                          <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-md w-24"></div>
                          <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-md w-28"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : favoriteServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favoriteServices.map(service => (
                    <div key={service.id} className="rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all duration-300 relative group">
                      <Button 
                        variant="destructive"
                        size="icon" 
                        className="absolute top-3 right-3 opacity-70 hover:opacity-100 z-10"
                        onClick={() => handleRemoveFromFavorites(service.id, 'service')}
                      >
                        <HeartOff className="h-4 w-4" />
                      </Button>
                      
                      <div className="p-6" onClick={() => navigate(`/services/${service.id}`)}>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Briefcase className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{service.profiles?.full_name || "Usługodawca"}</h3>
                            <p className="text-sm text-muted-foreground">@{service.profiles?.username || "użytkownik"}</p>
                          </div>
                        </div>
                        
                        <h4 className="text-lg font-medium mb-2">{service.title}</h4>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{service.description}</p>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="font-semibold text-lg bg-primary/10 px-2 py-1 rounded text-primary">
                            {formatCurrency(service.price)}
                          </div>
                          
                          <Button onClick={() => navigate(`/services/${service.id}`)}>
                            Szczegóły
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <HeartOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Nie masz ulubionych usług</h3>
                  <p className="text-muted-foreground mb-4">
                    Dodaj usługi do ulubionych, aby mieć do nich szybki dostęp.
                  </p>
                  <Button onClick={() => navigate('/marketplace?tab=services')}>
                    Przeglądaj usługi
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="consultations">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Ulubione konsultacje</h2>
                <p className="text-sm text-muted-foreground">
                  {favoriteConsultations.length} {getProperCountText(favoriteConsultations.length, 'consultation')}
                </p>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all duration-300 animate-pulse">
                      <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
                          <div>
                            <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-md w-32 mb-1"></div>
                            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-24"></div>
                          </div>
                        </div>
                        <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-md w-3/4 mb-2"></div>
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-full mb-4"></div>
                        <div className="flex justify-between">
                          <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-md w-24"></div>
                          <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-md w-28"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : favoriteConsultations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favoriteConsultations.map(consultation => (
                    <div key={consultation.id} className="rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all duration-300 relative group">
                      <Button 
                        variant="destructive"
                        size="icon" 
                        className="absolute top-3 right-3 opacity-70 hover:opacity-100 z-10"
                        onClick={() => handleRemoveFromFavorites(consultation.id, 'consultation')}
                      >
                        <HeartOff className="h-4 w-4" />
                      </Button>
                      
                      <div className="p-6" onClick={() => navigate(`/consultations/${consultation.id}`)}>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Headphones className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{consultation.profiles?.full_name || "Konsultant"}</h3>
                            <p className="text-sm text-muted-foreground">@{consultation.profiles?.username || "użytkownik"}</p>
                          </div>
                        </div>
                        
                        <h4 className="text-lg font-medium mb-2">{consultation.title}</h4>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{consultation.description}</p>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="font-semibold text-lg bg-primary/10 px-2 py-1 rounded text-primary">
                            {formatCurrency(consultation.price)}
                          </div>
                          
                          <Button onClick={() => navigate(`/consultations/${consultation.id}`)}>
                            Szczegóły
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <HeartOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Nie masz ulubionych konsultacji</h3>
                  <p className="text-muted-foreground mb-4">
                    Dodaj konsultacje do ulubionych, aby mieć do nich szybki dostęp.
                  </p>
                  <Button onClick={() => navigate('/marketplace?tab=consultations')}>
                    Przeglądaj konsultacje
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
      
      <AuthRequiredDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
        title="Wymagane logowanie"
        description="Aby zobaczyć ulubione elementy, musisz być zalogowany."
        redirectAfterClose="/marketplace"
      />
    </div>
  );
}
