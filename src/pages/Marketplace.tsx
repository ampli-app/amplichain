
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MarketplaceItem } from '@/components/MarketplaceItem';
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
  ArrowRight 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AddProductDialog } from '@/components/AddProductDialog';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Slider } from '@/components/ui/slider';

interface Product {
  id: string;
  title: string;
  price: number;
  image_url: string;
  category: string | null;
  rating: number | null;
  review_count: number | null;
  sale?: boolean | null;
  sale_percentage?: number | null;
  for_testing?: boolean | null;
  testing_price?: number | null;
  created_at?: string; // Add created_at property
}

const categories = [
  "All Categories",
  "Mikrofony",
  "Interfejsy Audio",
  "Monitory",
  "Słuchawki",
  "Kontrolery",
  "Instrumenty",
  "Oprogramowanie",
  "Akcesoria"
];

const productConditions = [
  "Nowy",
  "Jak nowy",
  "Bardzo dobry",
  "Dobry",
  "Zadowalający"
];

export default function Marketplace() {
  // Auth state
  const { isLoggedIn } = useAuth();

  // UI state
  const [showTestingOnly, setShowTestingOnly] = useState(false);
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [minPrice, setMinPrice] = useState<string>('0');
  const [maxPrice, setMaxPrice] = useState<string>('10000');
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
  const [maxProductPrice, setMaxProductPrice] = useState(10000);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProducts();
  }, []);

  // Apply filters when relevant state changes
  useEffect(() => {
    applyFilters();
  }, [products, selectedCategory, showTestingOnly, priceRange, selectedConditions, searchQuery, sortOption]);

  // Update displayed products when page changes or filtered products change
  useEffect(() => {
    updateDisplayedProducts();
  }, [filteredProducts, currentPage]);

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
        
        // Find the maximum price for the slider
        if (data && data.length > 0) {
          const highestPrice = Math.max(...data.map(product => product.price)) || 10000;
          const roundedMax = Math.ceil(highestPrice / 1000) * 1000;
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
    
    // Filter by category
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Filter by testing availability
    if (showTestingOnly) {
      filtered = filtered.filter(item => item.for_testing === true);
    }
    
    // Filter by price range
    filtered = filtered.filter(
      item => item.price >= priceRange[0] && item.price <= priceRange[1]
    );
    
    // Filter by conditions (to be implemented with condition field)
    if (selectedConditions.length > 0) {
      // This is a placeholder for when condition field is added to products
      // filtered = filtered.filter(item => selectedConditions.includes(item.condition));
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item => 
          item.title.toLowerCase().includes(query) ||
          (item.category && item.category.toLowerCase().includes(query))
      );
    }
    
    // Sort products
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
        // Handle the case where created_at might be undefined
        filtered.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
        break;
      default: // "featured" or any other default
        // No additional sorting needed as it's already sorted by created_at desc
        break;
    }
    
    setFilteredProducts(filtered);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
    
    // Reset to page 1 when filters change
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
    setPriceRange([min, max]);
  };

  const handleConditionChange = (condition: string, checked: boolean) => {
    if (checked) {
      setSelectedConditions(prev => [...prev, condition]);
    } else {
      setSelectedConditions(prev => prev.filter(c => c !== condition));
    }
  };

  const handleApplyFilters = () => {
    // Filters are already applied through useEffect, 
    // but this provides visual feedback that something happened
    toast({
      title: "Filtry zastosowane",
      description: `Znaleziono ${filteredProducts.length} produktów.`,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Rynek Sprzętu</h1>
            <p className="text-lg text-rhythm-600 max-w-2xl">
              Odkryj wysokiej jakości sprzęt muzyczny od zaufanych sprzedawców w naszym wyselekcjonowanym sklepie.
            </p>
            <Button 
              className="mt-6 gap-2"
              onClick={handleAddProductClick}
            >
              <PlusCircle className="h-4 w-4" />
              Dodaj produkt
            </Button>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            <div className="lg:w-64 space-y-6">
              {/* Category Filter */}
              <div className="glass-card rounded-xl p-5 border">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Kategorie
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center">
                      <label className="flex items-center w-full cursor-pointer hover:text-primary transition-colors">
                        <input 
                          type="radio" 
                          name="category" 
                          className="mr-2 accent-primary"
                          checked={selectedCategory === category}
                          onChange={() => setSelectedCategory(category)}
                        />
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Price Range Filter */}
              <div className="glass-card rounded-xl p-5 border">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Zakres cenowy
                </h3>
                <div className="pt-2 pb-2 px-1">
                  <Slider
                    defaultValue={[0, maxProductPrice]}
                    value={priceRange}
                    min={0}
                    max={maxProductPrice}
                    step={100}
                    onValueChange={(value) => {
                      setPriceRange(value as [number, number]);
                      setMinPrice(value[0].toString());
                      setMaxPrice(value[1].toString());
                    }}
                    className="my-6"
                  />
                  <div className="flex justify-between text-sm text-rhythm-500">
                    <span>{new Intl.NumberFormat('pl-PL', {
                      style: 'currency',
                      currency: 'PLN',
                      maximumFractionDigits: 0
                    }).format(priceRange[0])}</span>
                    <span>{new Intl.NumberFormat('pl-PL', {
                      style: 'currency',
                      currency: 'PLN',
                      maximumFractionDigits: 0
                    }).format(priceRange[1])}</span>
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
                      max={maxProductPrice}
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
                      max={maxProductPrice}
                    />
                  </div>
                </div>
              </div>
              
              {/* Product Condition Filter */}
              <div className="glass-card rounded-xl p-5 border">
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
              
              {/* Testing Filter */}
              <div className="glass-card rounded-xl p-5 border">
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
                  <div className="text-sm text-rhythm-600">
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
            
            <div className="flex-1">
              {/* Search and Sort Controls */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rhythm-500 h-4 w-4" />
                  <Input 
                    placeholder="Szukaj produktów..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-rhythm-500">Sortuj według:</span>
                  <select 
                    className="py-2 px-3 rounded-md border bg-background"
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
              
              {/* Products List */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all duration-300 animate-pulse">
                      <div className="aspect-square bg-rhythm-200 dark:bg-rhythm-800"></div>
                      <div className="p-5 space-y-3">
                        <div className="h-5 bg-rhythm-200 dark:bg-rhythm-800 rounded-md w-2/3"></div>
                        <div className="h-4 bg-rhythm-200 dark:bg-rhythm-800 rounded-md w-1/3"></div>
                        <div className="h-9 bg-rhythm-200 dark:bg-rhythm-800 rounded-md w-full mt-4"></div>
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
                  <p className="text-rhythm-600 mb-6">
                    {filteredProducts.length === 0 && products.length > 0 
                      ? "Spróbuj zmienić filtry aby zobaczyć więcej produktów." 
                      : "Nie ma jeszcze żadnych produktów. Dodaj pierwszy produkt!"}
                  </p>
                  <Button onClick={handleAddProductClick}>Dodaj produkt</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Add Product Dialog */}
      <AddProductDialog 
        open={showAddProductDialog} 
        onOpenChange={setShowAddProductDialog} 
      />
      
      {/* Auth Required Dialog */}
      <AuthRequiredDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
        title="Wymagane logowanie"
        description="Aby dodać produkt do rynku, musisz być zalogowany."
      />
    </div>
  );
}
