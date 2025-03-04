
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, MapPin, User, ArrowRight, ArrowLeft, Headphones } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { CategorySelection } from './CategorySelection';

interface Consultation {
  id: string;
  title: string;
  description: string | null;
  price: number;
  user_id: string;
  categories: string[] | null;
  is_online: boolean;
  location: string | null;
  experience: string | null;
  created_at: string;
  profiles?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

// Kategorie konsultacji
const consultationCategories = [
  { id: 'all', name: 'Wszystkie kategorie', slug: 'all-categories', description: null },
  { id: 'composition', name: 'Kompozycja', slug: 'composition', description: null },
  { id: 'arrangement', name: 'Aranżacja', slug: 'arrangement', description: null },
  { id: 'production', name: 'Produkcja muzyczna', slug: 'production', description: null },
  { id: 'mixing', name: 'Mix i mastering', slug: 'mixing', description: null },
  { id: 'instruments', name: 'Instrumenty muzyczne', slug: 'instruments', description: null },
  { id: 'vocals', name: 'Wokal', slug: 'vocals', description: null },
  { id: 'theory', name: 'Teoria muzyki', slug: 'theory', description: null },
  { id: 'recording', name: 'Nagrywanie', slug: 'recording', description: null }
];

export function ConsultationsTab() {
  // Stan do przechowywania danych
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Stan dla filtrów
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  
  // Stan dla paginacji
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 6;
  
  // Stan dla UI
  const [viewMode, setViewMode] = useState<'grid' | 'filters'>('grid');
  
  useEffect(() => {
    fetchConsultations();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [consultations, searchQuery, selectedCategory, selectedLocation, priceRange]);
  
  const fetchConsultations = async () => {
    setLoading(true);
    try {
      // Pobieramy konsultacje
      const { data: consultationsData, error: consultationsError } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (consultationsError) {
        throw consultationsError;
      }
      
      // Dla każdej konsultacji pobieramy dane profilu użytkownika
      if (consultationsData) {
        const consultationsWithProfiles = await Promise.all(consultationsData.map(async (consultation) => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('username, full_name, avatar_url')
            .eq('id', consultation.user_id)
            .single();
            
          return {
            ...consultation,
            profiles: profileError ? { 
              username: null, 
              full_name: null, 
              avatar_url: null 
            } : profileData
          };
        }));
        
        setConsultations(consultationsWithProfiles as Consultation[]);
        setFilteredConsultations(consultationsWithProfiles as Consultation[]);
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd przy pobieraniu konsultacji:', err);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać listy konsultacji. Spróbuj odświeżyć stronę.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...consultations];
    
    // Filtrowanie wg wyszukiwania
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(consultation => 
        consultation.title.toLowerCase().includes(query) ||
        (consultation.description && consultation.description.toLowerCase().includes(query))
      );
    }
    
    // Filtrowanie wg kategorii
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(consultation => 
        consultation.categories && consultation.categories.some(cat => 
          cat.toLowerCase() === selectedCategory.toLowerCase())
      );
    }
    
    // Filtrowanie wg lokalizacji
    if (selectedLocation) {
      filtered = filtered.filter(consultation => 
        consultation.location && consultation.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }
    
    // Filtrowanie wg ceny
    filtered = filtered.filter(consultation => 
      consultation.price >= priceRange[0] && consultation.price <= priceRange[1]
    );
    
    setFilteredConsultations(filtered);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
    
    // Jeśli strona jest poza zakresem po zastosowaniu filtrów, wróć do pierwszej strony
    if (currentPage > Math.ceil(filtered.length / PAGE_SIZE)) {
      setCurrentPage(1);
    }
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Funkcja do wyświetlania konsultacji aktualnej strony
  const getCurrentPageConsultations = () => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return filteredConsultations.slice(startIndex, endIndex);
  };
  
  // Renderowanie kontrolek paginacji
  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;
    
    return (
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
    );
  };
  
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === 'all' ? '' : categoryId);
  };
  
  return (
    <div>
      <CategorySelection 
        categories={consultationCategories}
        selectedCategory={selectedCategory || 'all'}
        onCategorySelect={handleCategorySelect}
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
        {/* Panel filtrowania */}
        <div className={`lg:w-64 space-y-6 ${viewMode === 'filters' ? 'block' : 'hidden lg:block'}`}>
          <div>
            <h3 className="font-medium mb-4">Filtry</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Lokalizacja</label>
                <Input 
                  placeholder="np. Warszawa, Kraków"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Cena (PLN)</label>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="number" 
                    min="0" 
                    placeholder="Od"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  />
                  <span>-</span>
                  <Input 
                    type="number" 
                    min="0" 
                    placeholder="Do"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  />
                </div>
              </div>
              
              <Button className="w-full" onClick={applyFilters}>
                Zastosuj filtry
              </Button>
            </div>
          </div>
        </div>
        
        {/* Główna zawartość */}
        <div className={`flex-1 ${viewMode === 'grid' ? 'block' : 'hidden lg:block'}`}>
          <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
              <Input 
                placeholder="Szukaj konsultacji..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Wybrane filtry */}
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
            
            {filteredConsultations.length > 0 && (
              <div className="text-sm text-muted-foreground ml-2">
                Znaleziono {filteredConsultations.length} konsultacji
              </div>
            )}
          </div>
          
          {/* Lista konsultacji */}
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
          ) : getCurrentPageConsultations().length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getCurrentPageConsultations().map(consultation => (
                  <Card key={consultation.id} className="overflow-hidden hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar>
                          <AvatarImage 
                            src={consultation.profiles?.avatar_url || undefined} 
                            alt={consultation.profiles?.full_name || "Użytkownik"} 
                          />
                          <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{consultation.profiles?.full_name || "Użytkownik"}</h3>
                          <p className="text-sm text-muted-foreground">@{consultation.profiles?.username || "użytkownik"}</p>
                        </div>
                      </div>
                      
                      <h4 className="text-lg font-medium mb-2">{consultation.title}</h4>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{consultation.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {consultation.categories && consultation.categories.map((category, idx) => (
                          <Badge key={idx} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                        
                        {consultation.location && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {consultation.location}
                          </Badge>
                        )}
                        
                        {consultation.is_online && (
                          <Badge variant="outline">
                            Online
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="font-medium">
                          {new Intl.NumberFormat('pl-PL', {
                            style: 'currency',
                            currency: 'PLN'
                          }).format(consultation.price)}
                        </div>
                        
                        <Button>Kontakt</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {renderPaginationControls()}
            </>
          ) : (
            <div className="text-center py-12 border rounded-md">
              <div className="mb-4">
                <Search className="h-12 w-12 mx-auto text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">Nie znaleziono konsultacji</h3>
              <p className="text-muted-foreground mb-4">
                Spróbuj zmienić kryteria wyszukiwania lub dodaj swoją pierwszą konsultację
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
