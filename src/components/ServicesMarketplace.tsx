
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, MapPin, User, ArrowRight, ArrowLeft, Briefcase, Heart, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { AddServiceFormDialog } from '@/components/AddServiceFormDialog';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';
import { CategorySelection } from '@/components/marketplace/CategorySelection';
import { MarketplaceFilters } from '@/components/marketplace/MarketplaceFilters';
import { Service } from '@/types/messages';

export function ServicesMarketplace() {
  const { isLoggedIn, user } = useAuth();
  
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [minPrice, setMinPrice] = useState<string>('0');
  const [maxPrice, setMaxPrice] = useState<string>('5000');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 6;
  
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'filters'>('grid');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const serviceCategories = [
    { id: 'all', name: 'Wszystkie kategorie', slug: 'all-categories', description: null },
    { id: 'recording', name: 'Studio nagrań', slug: 'recording-studio', description: null },
    { id: 'mixing', name: 'Mix i mastering', slug: 'mixing-mastering', description: null },
    { id: 'production', name: 'Produkcja muzyczna', slug: 'music-production', description: null },
    { id: 'lessons', name: 'Lekcje muzyki', slug: 'music-lessons', description: null },
    { id: 'songwriting', name: 'Kompozycja', slug: 'songwriting', description: null },
    { id: 'arrangement', name: 'Aranżacja', slug: 'arrangement', description: null },
    { id: 'live', name: 'Występy na żywo', slug: 'live-performance', description: null },
    { id: 'rental', name: 'Wynajem sprzętu', slug: 'equipment-rental', description: null },
    { id: 'repair', name: 'Naprawa instrumentów', slug: 'instrument-repair', description: null }
  ];
  
  const getProperResultsText = (count: number) => {
    if (count === 0) return "wyników";
    if (count === 1) return "wynik";
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 > 20)) return "wyniki";
    return "wyników";
  };
  
  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [services, searchQuery, selectedCategory, selectedLocation, priceRange]);
  
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
  
  const applyFilters = () => {
    let filtered = [...services];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        service.title.toLowerCase().includes(query) ||
        (service.description && service.description.toLowerCase().includes(query)) ||
        (service.category && service.category.toLowerCase().includes(query))
      );
    }
    
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(service => 
        service.category && service.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    if (selectedLocation) {
      filtered = filtered.filter(service => 
        service.location && service.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }
    
    filtered = filtered.filter(service => 
      service.price >= priceRange[0] && service.price <= priceRange[1]
    );
    
    setFilteredServices(filtered);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
    
    if (currentPage > Math.ceil(filtered.length / PAGE_SIZE)) {
      setCurrentPage(1);
    }
  };
  
  const handleAddServiceClick = () => {
    if (isLoggedIn) {
      setShowAddServiceDialog(true);
    } else {
      setShowAuthDialog(true);
    }
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const getCurrentPageServices = () => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return filteredServices.slice(startIndex, endIndex);
  };

  const handlePriceInputChange = () => {
    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || 5000;
    
    const limitedMax = Math.min(max, 999999);
    
    setPriceRange([min, limitedMax]);
    if (limitedMax !== max) {
      setMaxPrice(limitedMax.toString());
    }
  };

  const toggleFavorite = async (serviceId: string, isFavorite: boolean) => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    
    try {
      if (isFavorite) {
        // Usuń z ulubionych
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
        // Dodaj do ulubionych
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
  
  return (
    <div>
      <CategorySelection 
        categories={serviceCategories}
        selectedCategory={selectedCategory || 'all'}
        onCategorySelect={handleCategorySelect}
        showAllCategoriesInBar={false}
      />
      
      <div className="lg:hidden mb-4">
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'filters' ? 'default' : 'outline'} 
            className="flex-1" 
            onClick={() => setViewMode('filters')}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtry
          </Button>
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'outline'} 
            className="flex-1" 
            onClick={() => setViewMode('grid')}
          >
            <Search className="h-4 w-4 mr-2" />
            Przeglądaj
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className={`lg:w-64 space-y-6 ${viewMode === 'filters' ? 'block' : 'hidden lg:block'}`}>
          <MarketplaceFilters
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            showTestingOnly={false}
            setShowTestingOnly={() => {}}
            selectedConditions={[]}
            setSelectedConditions={() => {}}
            maxProductPrice={5000}
            handlePriceInputChange={handlePriceInputChange}
            handleApplyFilters={applyFilters}
            productConditions={[]}
          />
        </div>
        
        <div className={`flex-1 ${viewMode === 'grid' ? 'block' : 'hidden lg:block'}`}>
          <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
              <Input 
                placeholder="Szukaj usług..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button onClick={handleAddServiceClick}>
              <Briefcase className="h-4 w-4 mr-2" />
              Dodaj swoją usługę
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedLocation && (
              <Badge variant="outline" className="px-3 py-1">
                <MapPin className="h-3 w-3 mr-1" /> {selectedLocation}
                <button 
                  className="ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                  onClick={() => setSelectedLocation('')}
                >
                  &times;
                </button>
              </Badge>
            )}
            
            <span className="text-sm text-muted-foreground ml-2">
              {filteredServices.length} {getProperResultsText(filteredServices.length)}
            </span>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
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
          ) : getCurrentPageServices().length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getCurrentPageServices().map(service => (
                  <Card key={service.id} className="relative overflow-hidden hover:shadow-md transition-all group">
                    <Button 
                      variant={favorites[service.id] ? "destructive" : "secondary"}
                      size="icon" 
                      className="absolute top-3 right-3 opacity-70 hover:opacity-100 z-10"
                      onClick={() => toggleFavorite(service.id, favorites[service.id] || false)}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="absolute bottom-3 right-3 opacity-70 hover:opacity-100 z-10"
                      onClick={() => {
                        const serviceUrl = `${window.location.origin}/services/${service.id}`;
                        navigator.clipboard.writeText(serviceUrl);
                        toast({
                          title: "Link skopiowany",
                          description: "Link do usługi został skopiowany do schowka.",
                        });
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar>
                          <AvatarImage 
                            src={service.profiles?.avatar_url || undefined} 
                            alt={service.profiles?.full_name || "Użytkownik"} 
                          />
                          <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{service.profiles?.full_name || "Użytkownik"}</h3>
                          <p className="text-sm text-muted-foreground">@{service.profiles?.username || "użytkownik"}</p>
                        </div>
                      </div>
                      
                      <h4 className="text-lg font-medium mb-2">{service.title}</h4>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{service.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {service.category && (
                          <Badge variant="secondary">
                            {service.category}
                          </Badge>
                        )}
                        
                        {service.location && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {service.location}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="font-semibold text-lg bg-primary/10 px-2 py-1 rounded text-primary">
                          {new Intl.NumberFormat('pl-PL', {
                            style: 'currency',
                            currency: 'PLN'
                          }).format(service.price)}
                        </div>
                        
                        <Button>Kontakt</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" /> Poprzednia
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Następna <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 border rounded-md">
              <div className="mb-4">
                <Search className="h-12 w-12 mx-auto text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">Nie znaleziono usług</h3>
              <p className="text-muted-foreground mb-4">
                Spróbuj zmienić kryteria wyszukiwania lub dodaj swoją pierwszą usługę
              </p>
              <Button onClick={handleAddServiceClick}>
                Dodaj usługę
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <AddServiceFormDialog
        open={showAddServiceDialog}
        onOpenChange={setShowAddServiceDialog}
      />
      
      <AuthRequiredDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
        title="Wymagane logowanie"
        description="Aby dodać usługę do rynku, musisz być zalogowany."
      />
    </div>
  );
}
