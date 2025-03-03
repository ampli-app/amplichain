
import { useEffect, useState } from 'react';
import { Mic, Music, Headphones, Calendar, Filter, Search, Sliders, SlidersHorizontal, ChevronDown, ArrowLeft, ArrowRight, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from "@/components/ui/separator";
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ServiceItem } from '@/components/ServiceItem';
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';
import { supabase } from '@/integrations/supabase/client';

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface Service {
  id: string;
  title: string;
  price: number;
  price_type: string;
  image_url: string | string[];
  category: string | null;
  category_id: string | null;
  rating: number | null;
  review_count: number | null;
  created_at?: string;
  user_id?: string;
  tags?: string[];
  description?: string;
  location?: string;
}

const serviceCategories = [
  { id: '1', name: 'Producenci', slug: 'producenci', description: 'Usługi producentów muzycznych' },
  { id: '2', name: 'DJ-e', slug: 'dj', description: 'Usługi DJ-ów i realizatorów imprez' },
  { id: '3', name: 'Mix i mastering', slug: 'mix-mastering', description: 'Usługi inżynierów dźwięku' },
  { id: '4', name: 'Kompozytorzy', slug: 'kompozytorzy', description: 'Usługi kompozytorów i twórców muzyki' },
  { id: '5', name: 'Instrumentaliści', slug: 'instrumentalisci', description: 'Usługi muzyków sesyjnych' },
  { id: '6', name: 'Wokaliści', slug: 'wokalisci', description: 'Usługi wokalistów i chórzystów' },
  { id: '7', name: 'Nauka', slug: 'nauczanie', description: 'Lekcje i coaching muzyczny' },
  { id: '8', name: 'Realizacja', slug: 'realizacja', description: 'Realizacja dźwięku na żywo' }
];

const dummyServices: Service[] = [
  {
    id: '1',
    title: 'Profesjonalny miks i mastering utworów muzycznych',
    price: 500,
    price_type: 'za utwór',
    image_url: '/lovable-uploads/9b8af26a-e395-4b2d-b30e-ff147a5f2eac.png',
    category: 'Mix i mastering',
    category_id: '3',
    rating: 4.8,
    review_count: 24,
    created_at: '2023-06-15T10:00:00Z',
    user_id: '1',
    tags: ['mastering', 'miks', 'produkcja'],
    description: 'Profesjonalny mix i mastering Twoich utworów. Wieloletnie doświadczenie w branży muzycznej.',
    location: 'Warszawa, Polska'
  },
  {
    id: '2',
    title: 'Produkcja muzyczna - od dema do gotowego utworu',
    price: 2000,
    price_type: 'za utwór',
    image_url: '/lovable-uploads/f8ca029f-1e5e-42c9-ae3a-01ffb67072b4.png',
    category: 'Producenci',
    category_id: '1',
    rating: 4.6,
    review_count: 18,
    tags: ['produkcja', 'aranżacja', 'kompozycja'],
    location: 'Online'
  },
  {
    id: '3',
    title: 'Sesje wokalne - profesjonalne nagrania',
    price: 150,
    price_type: 'za godzinę',
    image_url: '/lovable-uploads/16892876-2744-491f-acab-cbcf263983ed.png',
    category: 'Wokaliści',
    category_id: '6',
    rating: 4.9,
    review_count: 32,
    tags: ['wokal', 'nagrania', 'sesyjne'],
    location: 'Kraków, Polska'
  },
  {
    id: '4',
    title: 'Nauka gry na gitarze - wszystkie poziomy',
    price: 120,
    price_type: 'za godzinę',
    image_url: '/lovable-uploads/aa463c52-7637-4ee5-a553-736e045af0aa.png',
    category: 'Nauka',
    category_id: '7',
    rating: 4.7,
    review_count: 45,
    tags: ['nauka', 'gitara', 'lekcje'],
    location: 'Online / Poznań'
  },
  {
    id: '5',
    title: 'DJ na Twoje wydarzenie - wesele, impreza firmowa',
    price: 1500,
    price_type: 'za wydarzenie',
    image_url: '/lovable-uploads/9b8af26a-e395-4b2d-b30e-ff147a5f2eac.png',
    category: 'DJ-e',
    category_id: '2',
    rating: 4.8,
    review_count: 38,
    tags: ['dj', 'impreza', 'wesele'],
    location: 'Cała Polska'
  }
];

export function ServicesMarketplace() {
  // Auth state
  const { isLoggedIn } = useAuth();

  // UI state
  const [viewMode, setViewMode] = useState<'grid' | 'filters'>('grid');
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showCategoriesDialog, setShowCategoriesDialog] = useState(false);
  
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [minPrice, setMinPrice] = useState<string>('0');
  const [maxPrice, setMaxPrice] = useState<string>('2000');
  const [sortOption, setSortOption] = useState<string>("featured");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 9;
  
  // Services state
  const [services, setServices] = useState<Service[]>(dummyServices);
  const [filteredServices, setFilteredServices] = useState<Service[]>(dummyServices);
  const [displayedServices, setDisplayedServices] = useState<Service[]>(dummyServices);
  const [loading, setLoading] = useState(false);
  const [maxServicePrice, setMaxServicePrice] = useState(2000);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Tu docelowo fetchServices() gdy będzie backend
  }, []);

  useEffect(() => {
    applyFilters();
  }, [services, selectedCategory, priceRange, searchQuery, sortOption]);

  useEffect(() => {
    updateDisplayedServices();
  }, [filteredServices, currentPage]);

  const applyFilters = () => {
    if (!services) return;
    
    let filtered = [...services];
    
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category_id === selectedCategory);
    }
    
    filtered = filtered.filter(
      item => item.price >= priceRange[0] && item.price <= priceRange[1]
    );
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item => 
          item.title.toLowerCase().includes(query) ||
          (item.category && item.category.toLowerCase().includes(query)) ||
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    switch (sortOption) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        filtered.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
        break;
      default: // "featured" lub inne domyślne
        break;
    }
    
    setFilteredServices(filtered);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
    
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const updateDisplayedServices = () => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    setDisplayedServices(filteredServices.slice(startIndex, endIndex));
  };

  const handleAddServiceClick = () => {
    if (isLoggedIn) {
      setShowAddServiceDialog(true);
    } else {
      setShowAuthDialog(true);
    }
  };

  const handlePriceInputChange = () => {
    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || maxServicePrice;
    
    const limitedMax = Math.min(max, 99999);
    
    setPriceRange([min, limitedMax]);
    if (limitedMax !== max) {
      setMaxPrice(limitedMax.toString());
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowCategoriesDialog(false);
  };

  const handleApplyFilters = () => {
    toast({
      title: "Filtry zastosowane",
      description: `Znaleziono ${filteredServices.length} usług.`,
    });
    
    if (window.innerWidth < 768) {
      setViewMode('grid');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryIcon = (categoryName: string) => {
    switch(categoryName.toLowerCase()) {
      case 'producenci':
        return <Music className="h-5 w-5" />;
      case 'dj-e':
      case 'dj':
        return <Headphones className="h-5 w-5" />;
      case 'mix i mastering':
        return <Sliders className="h-5 w-5" />;
      case 'wokaliści':
        return <Mic className="h-5 w-5" />;
      case 'nauka':
        return <Calendar className="h-5 w-5" />;
      default:
        return <ListFilter className="h-5 w-5" />;
    }
  };

  const renderFilters = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Zakres cenowy
        </h3>
        <div className="pt-2 pb-2 px-1">
          <Slider
            defaultValue={[0, maxServicePrice]}
            value={priceRange}
            min={0}
            max={99999}
            step={100}
            onValueChange={(value) => {
              setPriceRange(value as [number, number]);
              setMinPrice(value[0].toString());
              setMaxPrice(value[1].toString());
            }}
            className="my-6"
          />
          <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
            <span>{new Intl.NumberFormat('pl-PL', {
              style: 'currency',
              currency: 'PLN',
              maximumFractionDigits: 0
            }).format(priceRange[0])}</span>
            <span>
              {priceRange[1] >= 99999 
                ? "99 999+ PLN" 
                : new Intl.NumberFormat('pl-PL', {
                    style: 'currency',
                    currency: 'PLN',
                    maximumFractionDigits: 0
                  }).format(priceRange[1])
              }
            </span>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <div className="flex-1">
            <Label htmlFor="minPrice">Min</Label>
            <Input
              id="minPrice"
              placeholder="Min"
              className="text-sm"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={handlePriceInputChange}
              type="number"
              min="0"
              max="99999"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="maxPrice">Max</Label>
            <Input
              id="maxPrice"
              placeholder="Max"
              className="text-sm"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={handlePriceInputChange}
              type="number"
              min="0"
              max="99999"
            />
          </div>
        </div>
      </div>
      
      <Button className="w-full" onClick={handleApplyFilters}>Zastosuj filtry</Button>
    </div>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pagesToShow = Math.min(5, totalPages);
    let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    let endPage = startPage + pagesToShow - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - pagesToShow + 1);
    }
    
    const pages = Array.from({length: endPage - startPage + 1}, (_, i) => startPage + i);
    
    return (
      <div className="flex justify-center mt-10">
        <div className="flex">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-l-md rounded-r-none border-r-0"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Poprzednia
          </Button>
          
          {pages.map((page) => (
            <Button 
              key={page} 
              variant={page === currentPage ? "default" : "outline"} 
              size="sm" 
              className={`rounded-none ${page > startPage && page < endPage ? 'border-r-0' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-r-md rounded-l-none"
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Następna <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
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
      
      <div className="flex items-center justify-center mb-4">
        <div className="flex overflow-x-auto p-1 bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-sm mb-1 rounded-md">
          {serviceCategories.slice(0, 6).map((category) => (
            <Button 
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              className="flex-shrink-0 flex gap-2 items-center h-10 px-4 py-2"
              onClick={() => setSelectedCategory(category.id)}
            >
              {getCategoryIcon(category.name)}
              <span>{category.name}</span>
            </Button>
          ))}
          
          <Button
            variant="ghost"
            className="flex-shrink-0 flex gap-2 items-center h-10 px-4 py-2"
            onClick={() => setShowCategoriesDialog(true)}
          >
            <ChevronDown className="h-5 w-5" />
            <span>Więcej kategorii</span>
          </Button>
        </div>
        
        <Dialog open={showCategoriesDialog} onOpenChange={setShowCategoriesDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Wszystkie kategorie</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
              {serviceCategories.map((category) => (
                <div 
                  key={category.id}
                  className={`rounded-lg border p-4 cursor-pointer transition-all 
                  ${selectedCategory === category.id 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:border-primary hover:text-primary"}
                  `}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category.name)}
                    <span className="font-medium">{category.name}</span>
                  </div>
                  {category.description && (
                    <p className="text-xs mt-1 opacity-80">{category.description}</p>
                  )}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        <div className={`lg:w-64 space-y-6 ${viewMode === 'filters' ? 'block' : 'hidden lg:block'}`}>
          {renderFilters()}
        </div>
        
        <div className={`flex-1 ${viewMode === 'grid' ? 'block' : 'hidden lg:block'}`}>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
              <Input 
                placeholder="Szukaj usług..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500">Sortuj według:</span>
              <select 
                className="py-2 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-background"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="featured">Wyróżnione</option>
                <option value="price-asc">Cena: od najniższej</option>
                <option value="price-desc">Cena: od najwyższej</option>
                <option value="rating">Ocena</option>
                <option value="newest">Najnowsze</option>
              </select>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1">
                {serviceCategories.find(c => c.id === selectedCategory)?.name || 'Wszystkie kategorie'}
                {selectedCategory && (
                  <button 
                    className="ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                    onClick={() => setSelectedCategory('')}
                  >
                    &times;
                  </button>
                )}
              </Badge>
              <Separator orientation="vertical" className="h-6" />
              <span className="text-sm text-zinc-500">
                {filteredServices.length} usług
              </span>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all duration-300 animate-pulse">
                  <div className="aspect-square bg-zinc-200 dark:bg-zinc-800"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-md w-2/3"></div>
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-1/3"></div>
                    <div className="h-9 bg-zinc-200 dark:bg-zinc-800 rounded-md w-full mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayedServices.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedServices.map((service, index) => (
                  <ServiceItem
                    key={service.id}
                    id={service.id}
                    title={service.title}
                    price={service.price}
                    priceType={service.price_type}
                    image={service.image_url}
                    category={service.category || "Inne"}
                    userId={service.user_id}
                    rating={service.rating || 0}
                    reviewCount={service.review_count || 0}
                    location={service.location}
                    tags={service.tags || []}
                    delay={index * 0.05}
                  />
                ))}
              </div>
              
              {renderPagination()}
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">Nie znaleziono usług</h3>
              <p className="text-zinc-600 mb-6">
                {filteredServices.length === 0 && services.length > 0 
                  ? "Spróbuj zmienić filtry aby zobaczyć więcej usług." 
                  : "Nie ma jeszcze żadnych usług. Dodaj pierwszą usługę!"}
              </p>
              <Button onClick={handleAddServiceClick}>Dodaj usługę</Button>
            </div>
          )}
        </div>
      </div>
      
      <AuthRequiredDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
        title="Wymagane logowanie"
        description="Aby dodać usługę, musisz być zalogowany."
      />
    </>
  );
}
