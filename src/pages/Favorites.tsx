
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Briefcase, Headphones, Search } from 'lucide-react';
import { MarketplaceItem } from '@/components/MarketplaceItem';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Link, useNavigate } from 'react-router-dom';

export default function Favorites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");
  const [loading, setLoading] = useState(true);
  
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
  const [favoriteServices, setFavoriteServices] = useState<any[]>([]);
  const [favoriteConsultations, setFavoriteConsultations] = useState<any[]>([]);
  
  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user, activeTab]);
  
  const fetchFavorites = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('item_id, item_type')
        .eq('user_id', user.id);
      
      if (favoritesError) throw favoritesError;
      
      // Get all product IDs
      const productIds = favoritesData
        .filter(fav => fav.item_type === 'product')
        .map(fav => fav.item_id);
      
      // Get all service IDs
      const serviceIds = favoritesData
        .filter(fav => fav.item_type === 'service')
        .map(fav => fav.item_id);
      
      // Get all consultation IDs
      const consultationIds = favoritesData
        .filter(fav => fav.item_type === 'consultation')
        .map(fav => fav.item_id);
      
      // Fetch products if we're on the products tab
      if (activeTab === 'products' && productIds.length > 0) {
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);
        
        if (productsError) throw productsError;
        setFavoriteProducts(products || []);
      }
      
      // Fetch services if we're on the services tab
      if (activeTab === 'services' && serviceIds.length > 0) {
        const { data: services, error: servicesError } = await supabase
          .from('services')
          .select('*, profiles:user_id(username, full_name, avatar_url)')
          .in('id', serviceIds);
        
        if (servicesError) throw servicesError;
        setFavoriteServices(services || []);
      }
      
      // Fetch consultations if we're on the consultations tab
      if (activeTab === 'consultations' && consultationIds.length > 0) {
        const { data: consultations, error: consultationsError } = await supabase
          .from('consultations')
          .select('*, profiles:user_id(username, full_name, avatar_url)')
          .in('id', consultationIds);
        
        if (consultationsError) throw consultationsError;
        setFavoriteConsultations(consultations || []);
      }
    } catch (err) {
      console.error("Błąd podczas pobierania ulubionych:", err);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać ulubionych. Spróbuj odświeżyć stronę.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const toggleFavorite = async (itemId: string, itemType: string, isFavorite: boolean) => {
    if (!user) return;
    
    try {
      // Zawsze usuwamy z ulubionych, bo jesteśmy na stronie ulubionych
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .eq('item_type', itemType);
      
      // Aktualizujemy listę ulubionych
      if (itemType === 'product') {
        setFavoriteProducts(prev => prev.filter(item => item.id !== itemId));
      } else if (itemType === 'service') {
        setFavoriteServices(prev => prev.filter(item => item.id !== itemId));
      } else if (itemType === 'consultation') {
        setFavoriteConsultations(prev => prev.filter(item => item.id !== itemId));
      }
      
      toast({
        title: "Usunięto z ulubionych",
        description: "Element został usunięty z Twoich ulubionych."
      });
    } catch (err) {
      console.error("Błąd podczas usuwania z ulubionych:", err);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć z ulubionych. Spróbuj ponownie.",
        variant: "destructive",
      });
    }
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">Moje ulubione</h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mt-2">
              Twoje ulubione produkty, usługi i konsultacje
            </p>
          </div>
          
          <Tabs 
            defaultValue="products" 
            value={activeTab} 
            onValueChange={handleTabChange}
            className="mb-6"
          >
            <div className="flex justify-center mb-6">
              <TabsList className="w-full max-w-md mx-auto">
                <TabsTrigger 
                  value="products" 
                  className="flex-1 gap-2 font-medium"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>Sprzęt</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="services" 
                  className="flex-1 gap-2 font-medium"
                >
                  <Briefcase className="h-5 w-5" />
                  <span>Usługi</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="consultations" 
                  className="flex-1 gap-2 font-medium"
                >
                  <Headphones className="h-5 w-5" />
                  <span>Konsultacje</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="products" className="mt-6">
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
                  {favoriteProducts.map((product) => (
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
                      sale={product.sale || false}
                      salePercentage={product.sale_percentage}
                      forTesting={product.for_testing || false}
                      testingPrice={product.testing_price}
                      isFavorite={true}
                      onToggleFavorite={(id, isFav) => toggleFavorite(id, 'product', isFav)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <div className="mb-4">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Brak ulubionych produktów</h3>
                  <p className="text-muted-foreground mb-4">
                    Dodaj produkty do ulubionych, aby łatwo do nich wracać
                  </p>
                  <Button onClick={() => navigate('/marketplace')}>
                    Przeglądaj produkty
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="services" className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-0">
                        <div className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <Skeleton className="w-12 h-12 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-2/3 mb-4" />
                          <div className="flex justify-between">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-10 w-24" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : favoriteServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favoriteServices.map(service => (
                    <Card key={service.id} className="overflow-hidden hover:shadow-md transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar>
                            <AvatarImage 
                              src={service.profiles?.avatar_url || undefined} 
                              alt={service.profiles?.full_name || "Użytkownik"} 
                            />
                            <AvatarFallback>{service.profiles?.username?.substring(0, 1) || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{service.profiles?.full_name || "Użytkownik"}</h3>
                            <p className="text-sm text-muted-foreground">@{service.profiles?.username || "użytkownik"}</p>
                          </div>
                          <Button 
                            variant="destructive"
                            size="icon" 
                            className="ml-auto"
                            onClick={() => toggleFavorite(service.id, 'service', true)}
                          >
                            <ShoppingBag className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <Link to={`/service/${service.id}`}>
                          <h4 className="text-lg font-medium mb-2 hover:text-primary transition-colors">{service.title}</h4>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{service.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {service.category && (
                            <Badge variant="secondary">
                              {service.category}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="font-medium text-lg bg-primary/10 px-2 py-1 rounded text-primary">
                            {new Intl.NumberFormat('pl-PL', {
                              style: 'currency',
                              currency: 'PLN'
                            }).format(service.price)}
                          </div>
                          
                          <Button asChild>
                            <Link to={`/service/${service.id}`}>
                              Szczegóły
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <div className="mb-4">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Brak ulubionych usług</h3>
                  <p className="text-muted-foreground mb-4">
                    Dodaj usługi do ulubionych, aby łatwo do nich wracać
                  </p>
                  <Button onClick={() => navigate('/marketplace?tab=services')}>
                    Przeglądaj usługi
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="consultations" className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-0">
                        <div className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <Skeleton className="w-12 h-12 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-2/3 mb-4" />
                          <div className="flex justify-between">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-10 w-24" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : favoriteConsultations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favoriteConsultations.map(consultation => (
                    <Card key={consultation.id} className="overflow-hidden hover:shadow-md transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar>
                            <AvatarImage 
                              src={consultation.profiles?.avatar_url || undefined} 
                              alt={consultation.profiles?.full_name || "Użytkownik"} 
                            />
                            <AvatarFallback>{consultation.profiles?.username?.substring(0, 1) || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{consultation.profiles?.full_name || "Użytkownik"}</h3>
                            <p className="text-sm text-muted-foreground">@{consultation.profiles?.username || "użytkownik"}</p>
                          </div>
                          <Button 
                            variant="destructive"
                            size="icon" 
                            className="ml-auto"
                            onClick={() => toggleFavorite(consultation.id, 'consultation', true)}
                          >
                            <ShoppingBag className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <Link to={`/consultation/${consultation.id}`}>
                          <h4 className="text-lg font-medium mb-2 hover:text-primary transition-colors">{consultation.title}</h4>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{consultation.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {consultation.categories && consultation.categories.map((category: string, idx: number) => (
                            <Badge key={idx} variant="secondary">
                              {category}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="font-medium text-lg bg-primary/10 px-2 py-1 rounded text-primary">
                            {new Intl.NumberFormat('pl-PL', {
                              style: 'currency',
                              currency: 'PLN'
                            }).format(consultation.price)}
                          </div>
                          
                          <Button asChild>
                            <Link to={`/consultation/${consultation.id}`}>
                              Szczegóły
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <div className="mb-4">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Brak ulubionych konsultacji</h3>
                  <p className="text-muted-foreground mb-4">
                    Dodaj konsultacje do ulubionych, aby łatwo do nich wracać
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
    </div>
  );
}
