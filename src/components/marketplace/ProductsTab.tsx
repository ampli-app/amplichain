import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from "@/components/ui/separator";
import { Filter, Search } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { CategorySelection } from './CategorySelection';
import { MarketplaceFilters } from './MarketplaceFilters';
import { ProductGrid } from './ProductGrid';

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

interface ProductsTabProps {
  categories: Category[];
  products: Product[];
  loading: boolean;
  isLoggedIn: boolean;
  handleAddProductClick: () => void;
  productConditions: string[];
  conditionMap: Record<string, string>;
}

export function ProductsTab({ 
  categories, 
  products, 
  loading, 
  isLoggedIn, 
  handleAddProductClick,
  productConditions,
  conditionMap
}: ProductsTabProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'filters'>('grid');
  
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 999999]);
  const [minPrice, setMinPrice] = useState<string>('0');
  const [maxPrice, setMaxPrice] = useState<string>('999999');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>("featured");
  const [showTestingOnly, setShowTestingOnly] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 9;
  
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [maxProductPrice, setMaxProductPrice] = useState(999999);

  useEffect(() => {
    if (products && products.length > 0) {
      const highestPrice = Math.max(...products.map(product => product.price)) || 10000;
      const roundedMax = Math.min(Math.ceil(highestPrice / 1000) * 1000 * 1.5, 999999);
      setMaxProductPrice(roundedMax);
      setPriceRange([0, roundedMax]);
      setMaxPrice(roundedMax.toString());
    }
  }, [products]);

  useEffect(() => {
    applyFilters();
  }, [products, selectedCategory, showTestingOnly, priceRange, selectedConditions, searchQuery, sortOption]);

  useEffect(() => {
    updateDisplayedProducts();
  }, [filteredProducts, currentPage]);

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

  const handlePriceInputChange = () => {
    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || maxProductPrice;
    
    const limitedMax = Math.min(max, 999999);
    
    setPriceRange([min, limitedMax]);
    if (limitedMax !== max) {
      setMaxPrice(limitedMax.toString());
    }
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

  return (
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
      
      <div className="w-full">
        <CategorySelection
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className={`lg:w-64 space-y-6 ${viewMode === 'filters' ? 'block' : 'hidden lg:block'}`}>
            <MarketplaceFilters
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              showTestingOnly={showTestingOnly}
              setShowTestingOnly={setShowTestingOnly}
              selectedConditions={selectedConditions}
              setSelectedConditions={setSelectedConditions}
              maxProductPrice={maxProductPrice}
              handlePriceInputChange={handlePriceInputChange}
              handleApplyFilters={handleApplyFilters}
              productConditions={productConditions}
            />
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
                {selectedCategory && (
                  <Badge variant="outline" className="px-3 py-1">
                    {categories.find(c => c.id === selectedCategory)?.name || 'Wybrana kategoria'}
                    <button 
                      className="ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                      onClick={() => setSelectedCategory('')}
                    >
                      &times;
                    </button>
                  </Badge>
                )}
                <Separator orientation="vertical" className="h-6" />
                <span className="text-sm text-zinc-500">
                  {filteredProducts.length} produktów
                </span>
              </div>
            </div>
            
            <ProductGrid
              displayedProducts={displayedProducts}
              filteredProducts={filteredProducts}
              loading={loading}
              products={products}
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
              handleAddProductClick={handleAddProductClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
