import { useState, useEffect } from 'react';
import { User, Calendar, Search, Filter, Clock, ChevronDown, ArrowLeft, ArrowRight, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';
import { AddConsultationDialog } from '@/components/AddConsultationDialog';
import { toast } from '@/components/ui/use-toast';

interface Consultant {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  price_type?: string;
  categories?: string[];
  experience_years?: number;
  tags?: string[];
  created_at: string;
  profile?: {
    username: string;
    full_name: string;
    avatar_url: string;
    specialties?: string[];
    role?: string;
  }
}

// Przykładowe dane na potrzeby prezentacji UI
const dummyConsultants: Consultant[] = [
  {
    id: '1',
    user_id: '123',
    title: 'Konsultacje z zakresu realizacji dźwięku',
    description: 'Profesjonalne konsultacje z zakresu realizacji dźwięku, miksu i masteringu. Ponad 10 lat doświadczenia w branży.',
    price: 150,
    price_type: 'za godzinę',
    categories: ['Realizacja dźwięku', 'Mix i mastering'],
    experience_years: 10,
    tags: ['mix', 'mastering', 'realizacja'],
    created_at: '2023-06-15T10:00:00Z',
    profile: {
      username: 'soundmaster',
      full_name: 'Jan Kowalski',
      avatar_url: '/lovable-uploads/9b8af26a-e395-4b2d-b30e-ff147a5f2eac.png',
      specialties: ['Realizacja dźwięku', 'Produkcja muzyczna'],
      role: 'Realizator dźwięku'
    }
  },
  {
    id: '2',
    user_id: '456',
    title: 'Konsultacje z kompozycji i aranżacji',
    description: 'Pomogę Ci udoskonalić Twoje kompozycje i aranżacje. Specjalizuję się w muzyce filmowej i orkiestrowej.',
    price: 200,
    price_type: 'za godzinę',
    categories: ['Kompozycja', 'Aranżacja'],
    experience_years: 8,
    tags: ['kompozycja', 'aranżacja', 'muzyka filmowa'],
    created_at: '2023-05-20T14:30:00Z',
    profile: {
      username: 'composer',
      full_name: 'Anna Nowak',
      avatar_url: '/lovable-uploads/aa463c52-7637-4ee5-a553-736e045af0aa.png',
      specialties: ['Kompozycja', 'Aranżacja', 'Pianista'],
      role: 'Kompozytor'
    }
  },
  {
    id: '3',
    user_id: '789',
    title: 'Lekcje gry na gitarze i konsultacje muzyczne',
    description: 'Indywidualne lekcje gry na gitarze oraz konsultacje z zakresu improwizacji i teorii muzyki. Wszystkie poziomy zaawansowania.',
    price: 120,
    price_type: 'za godzinę',
    categories: ['Gra na gitarze', 'Teoria muzyki', 'Improwizacja'],
    experience_years: 15,
    tags: ['gitara', 'improwizacja', 'teoria muzyki'],
    created_at: '2023-07-05T09:15:00Z',
    profile: {
      username: 'guitarmaster',
      full_name: 'Piotr Wiśniewski',
      avatar_url: '/lovable-uploads/16892876-2744-491f-acab-cbcf263983ed.png',
      specialties: ['Gitara', 'Improwizacja'],
      role: 'Muzyk, instruktor gitary'
    }
  }
];

// Kategorie konsultacji
const consultationCategories = [
  { id: 'composition', name: 'Kompozycja' },
  { id: 'arrangement', name: 'Aranżacja' },
  { id: 'production', name: 'Produkcja muzyczna' },
  { id: 'mixing', name: 'Mix i mastering' },
  { id: 'instruments', name: 'Instrumenty muzyczne' },
  { id: 'vocals', name: 'Wokal' },
  { id: 'theory', name: 'Teoria muzyki' },
  { id: 'recording', name: 'Nagrywanie' },
  { id: 'live_sound', name: 'Realizacja dźwięku na żywo' }
];

export function ConsultationsTab() {
  const { isLoggedIn } = useAuth();
  
  // Stan do przechowywania danych
  const [consultants, setConsultants] = useState<Consultant[]>(dummyConsultants);
  const [filteredConsultants, setFilteredConsultants] = useState<Consultant[]>(dummyConsultants);
  const [loading, setLoading] = useState(false);
  
  // Stan dla filtrów
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  
  // Stan dla paginacji
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 9;
  
  // Stan dla dialogów
  const [showAddConsultationDialog, setShowAddConsultationDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'filters'>('grid');
  
  useEffect(() => {
    // Tutaj docelowo pobranie prawdziwych danych z Supabase
    fetchConsultants();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [consultants, searchQuery, selectedCategories, priceRange]);
  
  const fetchConsultants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          profiles:user_id(username, full_name, avatar_url, specialties, role)
        `);
      
      if (error) {
        console.error("Błąd podczas pobierania konsultantów:", error);
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać listy konsultacji.",
          variant: "destructive",
        });
      } else {
        console.log("Pobrane konsultacje:", data);
        if (data && data.length > 0) {
          setConsultants(data);
        } else {
          // Jeśli nie ma danych, używamy przykładowych danych
          setConsultants(dummyConsultants);
        }
      }
    } catch (error) {
      console.error("Błąd podczas pobierania konsultantów:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...consultants];
    
    // Filtrowanie według wyszukiwania
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(consultant => 
        consultant.title.toLowerCase().includes(query) ||
        consultant.description.toLowerCase().includes(query) ||
        (consultant.profile?.full_name && consultant.profile.full_name.toLowerCase().includes(query)) ||
        consultant.tags.some(tag => tag.toLowerCase().includes(query)) ||
        consultant.categories.some(cat => cat.toLowerCase().includes(query))
      );
    }
    
    // Filtrowanie według kategorii
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(consultant => 
        consultant.categories.some(cat => 
          selectedCategories.some(selectedCat => 
            cat.toLowerCase().includes(selectedCat.toLowerCase())
          )
        )
      );
    }
    
    // Filtrowanie według zakresu cenowego
    filtered = filtered.filter(consultant => 
      consultant.price >= priceRange[0] && consultant.price <= priceRange[1]
    );
    
    setFilteredConsultants(filtered);
    
    // Aktualizacja paginacji
    setTotalPages(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
    if (currentPage > Math.ceil(filtered.length / PAGE_SIZE)) {
      setCurrentPage(1);
    }
  };
  
  const handleAddConsultationClick = () => {
    if (isLoggedIn) {
      setShowAddConsultationDialog(true);
    } else {
      setShowAuthDialog(true);
    }
  };
  
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
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
  
  // Wyświetlanie aktualnej strony konsultantów
  const getCurrentPageConsultants = () => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return filteredConsultants.slice(startIndex, endIndex);
  };
  
  return (
    <div>
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
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Filtry</h3>
            
            <div>
              <p className="font-medium mb-2">Kategorie</p>
              <div className="space-y-1">
                {consultationCategories.map(category => (
                  <div 
                    key={category.id}
                    className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${
                      selectedCategories.includes(category.name) 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => toggleCategory(category.name)}
                  >
                    {category.name}
                  </div>
                ))}
              </div>
            </div>
            
            <Button className="w-full" onClick={applyFilters}>
              Zastosuj filtry
            </Button>
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
            
            <Button onClick={handleAddConsultationClick}>
              Dodaj swoje konsultacje
            </Button>
          </div>
          
          {/* Wybrane filtry */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCategories.map(category => (
                <Badge 
                  key={category} 
                  variant="outline"
                  className="px-3 py-1"
                >
                  {category}
                  <button 
                    className="ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                    onClick={() => toggleCategory(category)}
                  >
                    &times;
                  </button>
                </Badge>
              ))}
              
              <Button 
                variant="link" 
                className="h-auto p-0 text-xs"
                onClick={() => setSelectedCategories([])}
              >
                Wyczyść wszystkie
              </Button>
            </div>
          )}
          
          {/* Lista konsultantów */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="overflow-hidden">
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
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </div>
                      <Skeleton className="h-10 w-full mt-4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : getCurrentPageConsultants().length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getCurrentPageConsultants().map(consultant => (
                  <Card key={consultant.id} className="overflow-hidden hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={consultant.profile?.avatar_url} alt={consultant.profile?.full_name || "Konsultant"} />
                          <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{consultant.profile?.full_name || "Konsultant"}</h3>
                          <p className="text-sm text-muted-foreground">{consultant.profile?.role || "Specjalista"}</p>
                        </div>
                      </div>
                      
                      <h4 className="font-medium mb-2">{consultant.title}</h4>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{consultant.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {consultant.categories.map((category, idx) => (
                          <Badge key={idx} variant="secondary" className="px-2 py-1">
                            {category}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {consultant.price} PLN
                          </span>
                          <span className="text-muted-foreground">/ {consultant.price_type}</span>
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
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-medium mb-2">Nie znaleziono konsultacji</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedCategories.length > 0 
                  ? "Spróbuj zmienić kryteria wyszukiwania aby zobaczyć więcej wyników." 
                  : "Nie ma jeszcze żadnych konsultacji. Zostań pierwszym konsultantem!"}
              </p>
              <Button onClick={handleAddConsultationClick}>
                Dodaj swoje konsultacje
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <AuthRequiredDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
        title="Wymagane logowanie"
        description="Aby dodać konsultacje, musisz być zalogowany."
      />
      
      <AddConsultationDialog 
        open={showAddConsultationDialog} 
        onOpenChange={setShowAddConsultationDialog} 
      />
    </div>
  );
}
