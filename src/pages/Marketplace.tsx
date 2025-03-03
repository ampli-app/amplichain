
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MarketplaceItem } from '@/components/MarketplaceItem';
import { ServicesMarketplace } from '@/components/ServicesMarketplace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Calendar, 
  PlusCircle, 
  ArrowLeft, 
  ArrowRight,
  Music,
  Mic,
  Headphones,
  Monitor,
  Gamepad2,
  Package,
  Laptop,
  Music2,
  ListFilter,
  ChevronDown,
  ShoppingBag,
  Briefcase
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AddProductDialog } from '@/components/AddProductDialog';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Slider } from '@/components/ui/slider';
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

interface Product {
  id: string;
  title: string;
  price: number;
  image_url: string | string[];
  category: string | null;
  category_id: string | null;
  rating: number | null;
  review_count: number | null;
  sale?: boolean | null;
  sale_percentage?: number | null;
  for_testing?: boolean | null;
  testing_price?: number | null;
  created_at?: string;
  user_id?: string;
  condition?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

const productConditions = [
  "Nowy",
  "Jak nowy",
  "Bardzo dobry",
  "Dobry",
  "Zadowalający"
];

const conditionMap: Record<string, string> = {
  "Nowy": "new",
  "Jak nowy": "like_new",
  "Bardzo dobry": "very_good",
  "Dobry": "good",
  "Zadowalający": "fair"
};

const conditionDisplayMap: Record<string, string> = {
  "new": "Nowy",
  "like_new": "Jak nowy",
  "very_good": "Bardzo dobry",
  "good": "Dobry",
  "fair": "Zadowalający"
};

const getCategoryIcon = (categoryName: string) => {
  switch(categoryName.toLowerCase()) {
    case 'mikrofony':
      return <Mic className="h-5 w-5" />;
    case 'interfejsy audio':
      return <Music2 className="h-5 w-5" />;
    case 'monitory':
      return <Monitor className="h-5 w-5" />;
    case 'słuchawki':
      return <Headphones className="h-5 w-5" />;
    case 'kontrolery':
      return <Gamepad2 className="h-5 w-5" />;
    case 'instrumenty':
      return <Music className="h-5 w-5" />;
    case 'oprogramowanie':
      return <Laptop className="h-5 w-5" />;
    case 'akcesoria':
      return <Package className="h-5 w-5" />;
    default:
      return <ListFilter className="h-5 w-5" />;
  }
};

export default function Marketplace() {
  // Auth state
  const { isLoggedIn } = useAuth();

  // UI state
  const [showTestingOnly, setShowTestingOnly] = useState(false);
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'filters'>('grid');
  const [showCategoriesDialog, setShowCategoriesDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  
  // Filter state
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 999999]);
  const [minPrice, setMinPrice] = useState<string>('0');
  const [maxPrice, setMaxPrice] = useState<string>('999999');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>("featured");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 9;
  
  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxProductPrice, setMaxProductPrice] = useState(999999);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, selectedCategory, showTestingOnly, priceRange, selectedConditions, searchQuery, sortOption]);

  useEffect(() => {
    updateDisplayedProducts();
  }, [filteredProducts, currentPage]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać kategorii produktów.",
          variant: "destructive",
        });
      } else {
        const filteredCategories = data?.filter(cat => cat.slug !== 'all-categories') || [];
        setCategories(filteredCategories);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać produktów. Spróbuj odświeżyć stronę.",
          variant: "destructive",
        });
      } else {
        setProducts(data || []);
        
        if (data && data.length > 0) {
          const highestPrice = Math.max(...data.map(product => product.price)) || 10000;
          const roundedMax = Math.min(Math.ceil(highestPrice / 1000) * 1000 * 1.5, 999999);
          setMaxProductPrice(roundedMax);
          setPriceRange([0, roundedMax]);
          setMaxPrice(roundedMax.toString());
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!products) return;
    
    let filtered = [...products];
    
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category_id === selectedCategory);
    }
    
    if (showTestingOnly) {
      filtered = filtered.filter(item => item.for_testing === true);
    }
    
    filtered = filtered.filter(
      item => item.price >= priceRange[0] && item.price <= priceRange[1]
    );
    
    if (selectedConditions.length > 0) {
      const englishConditions = selectedConditions.map(condition => conditionMap[condition]);
      filtered = filtered.filter(item => 
        item.condition && englishConditions.includes(item.condition)
      );
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item => 
          item.title.toLowerCase().includes(query) ||
          (item.category && item.category.toLowerCase().includes(query))
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
      default: // "featured" or any other default
        break;
    }
    
    setFilteredProducts(filtered);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
    
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const updateDisplayedProducts = () => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    setDisplayedProducts(filteredProducts.slice(startIndex, endIndex));
  };

  const handleAddProductClick = () => {
    if (isLoggedIn) {
      setShowAddProductDialog(true);
    } else {
      setShowAuthDialog(true);
    }
  };

  const handlePriceInputChange = () => {
    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || maxProductPrice;
    
    const limitedMax = Math.min(max, 999999);
    
    setPriceRange([min, limitedMax]);
    if (limitedMax !== max) {
      setMaxPrice(limitedMax.toString());
    }
  };

  const handleConditionChange = (condition: string, checked: boolean) => {
    if (checked) {
      setSelectedConditions(prev => [...prev, condition]);
    } else {
      setSelectedConditions(prev => prev.filter(c => c !== condition));
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowCategoriesDialog(false);
  };

  const handleApplyFilters = () => {
    toast({
      title: "Filtry zastosowane",
      description: `Znaleziono ${filteredProducts.length} produktów.`,
    });
    
    if (window.innerWidth < 768) {
      setViewMode('grid');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedCategory("");
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const renderFilters = () => (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Zakres cenowy
        </h3>
        <div className="pt-2 pb-2 px-1">
          <Slider
            defaultValue={[0, maxProductPrice]}
            value={priceRange}
            min={0}
            max={999999}
            step={1000}
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
              {priceRange[1] >= 999999 
                ? "999 999+ PLN" 
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
              max="999999"
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
              max="999999"
            />
          </div>
        </div>
      </div>
      
      <div className="glass-card rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
        <h3 className="font-semibold mb-3">Stan</h3>
        <div className="space-y-2">
          {productConditions.map((condition) => (
            <div key={condition} className="flex items-center">
              <label className="flex items-center w-full cursor-pointer hover:text-primary transition-colors">
                <input 
                  type="checkbox" 
                  className="mr-2 accent-primary"
                  checked={selectedConditions.includes(condition)}
                  onChange={(e) => handleConditionChange(condition, e.target.checked)}
                />
                {condition}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="glass-card rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Wypróbuj przed zakupem
        </h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <label className="flex items-center w-full cursor-pointer hover:text-primary transition-colors">
              <input 
                type="checkbox" 
                className="mr-2 accent-primary"
                checked={showTestingOnly}
                onChange={(e) => setShowTestingOnly(e.target.checked)}
              />
              Dostępne do testów
            </label>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            <p>Wypróbuj sprzęt przez tydzień przed podjęciem decyzji o zakupie.</p>
            <div className="flex items-center mt-2">
              <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
                Wynajem tygodniowy
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      <Button className="w-full" onClick={handleApplyFilters}>Zastosuj filtry</Button>
    </div>
  );

  const renderProductsTab = () => (
    <div className="flex flex-col lg:flex-row gap-8 mb-8">
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
          {categories.slice(0, 7).map((category) => (
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
              {categories.map((category) => (
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
      
      <div className={`lg:w-64 space-y-6 ${viewMode === 'filters' ? 'block' : 'hidden lg:block'}`}>
        {renderFilters()}
      </div>
      
      <div className={`flex-1 ${viewMode === 'grid' ? 'block' : 'hidden lg:block'}`}>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
            <Input 
              placeholder="Szukaj produktów..." 
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
              {categories.find(c => c.id === selectedCategory)?.name || 'Wybrana kategoria'}
              <button 
                className="ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                onClick={() => setSelectedCategory('')}
              >
                &times;
              </button>
            </Badge>
            <Separator orientation="vertical" className="h-6" />
            <span className="text-sm text-zinc-500">
              {filteredProducts.length} produktów
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
        ) : displayedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedProducts.map((item, index) => (
                <MarketplaceItem
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  price={item.price}
                  image={item.image_url}
                  category={item.category || "Inne"}
                  userId={item.user_id}
                  rating={item.rating || 0}
                  reviewCount={item.review_count || 0}
                  sale={item.sale || false}
                  salePercentage={item.sale_percentage}
                  forTesting={item.for_testing || false}
                  testingPrice={item.testing_price}
                  delay={index * 0.05}
                />
              ))}
            </div>
            
            {renderPagination()}
          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">Nie znaleziono produktów</h3>
            <p className="text-zinc-600 mb-6">
              {filteredProducts.length === 0 && products.length > 0 
                ? "Spróbuj zmienić filtry aby zobaczyć więcej produktów." 
                : "Nie ma jeszcze żadnych produktów. Dodaj pierwszy produkt!"}
            </p>
            <Button onClick={handleAddProductClick}>Dodaj produkt</Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold">Marketplace</h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 mt-2 max-w-2xl">
                Znajdź najlepszy sprzęt i usługi muzyczne w jednym miejscu.
              </p>
            </div>
            
            <Button 
              className="self-center md:self-auto gap-2"
              onClick={handleAddProductClick}
              size="lg"
            >
              <PlusCircle className="h-4 w-4" />
              {activeTab === "products" ? "Dodaj produkt" : "Dodaj usługę"}
            </Button>
          </div>
          
          <Tabs 
            defaultValue="products" 
            value={activeTab} 
            onValueChange={handleTabChange}
            className="mb-6"
          >
            <TabsList className="w-full max-w-md mx-auto">
              <TabsTrigger 
                value="products" 
                className="flex-1 gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Sprzęt</span>
              </TabsTrigger>
              <TabsTrigger 
                value="services" 
                className="flex-1 gap-2"
              >
                <Briefcase className="h-4 w-4" />
                <span>Usługi</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="products" className="mt-6">
              {renderProductsTab()}
            </TabsContent>
            
            <TabsContent value="services" className="mt-6">
              <ServicesMarketplace />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
      
      <AddProductDialog 
        open={showAddProductDialog} 
        onOpenChange={setShowAddProductDialog} 
      />
      
      <AuthRequiredDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
        title="Wymagane logowanie"
        description="Aby dodać produkt lub usługę do rynku, musisz być zalogowany."
      />
    </div>
  );
}
