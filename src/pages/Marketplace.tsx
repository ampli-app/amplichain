
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MarketplaceItem } from '@/components/MarketplaceItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, SlidersHorizontal, Calendar, PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AddProductDialog } from '@/components/AddProductDialog';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Product {
  id: number;
  title: string;
  price: number;
  image_url: string;
  category: string;
  rating: number;
  review_count: number;
  sale?: boolean;
  sale_percentage?: number;
  for_testing?: boolean;
  testing_price?: number;
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

export default function Marketplace() {
  // Auth state
  const { isLoggedIn } = useAuth();

  // UI state
  const [showTestingOnly, setShowTestingOnly] = useState(false);
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // We use a direct query instead of .from('products')
      const { data, error } = await supabase
        .rpc('fetch_products')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.message.includes('function "fetch_products" does not exist')) {
          // If the function doesn't exist yet, use SQL query instead
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

          if (productsError) {
            console.error('Error fetching products:', productsError);
            toast({
              title: "Błąd",
              description: "Nie udało się pobrać produktów. Spróbuj odświeżyć stronę.",
              variant: "destructive",
            });
          } else {
            setProducts(productsData as Product[] || []);
          }
        } else {
          console.error('Error fetching products:', error);
          toast({
            title: "Błąd",
            description: "Nie udało się pobrać produktów. Spróbuj odświeżyć stronę.",
            variant: "destructive",
          });
        }
      } else {
        setProducts(data as Product[] || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProductClick = () => {
    if (isLoggedIn) {
      setShowAddProductDialog(true);
    } else {
      setShowAuthDialog(true);
    }
  };

  const filteredProducts = products
    .filter(item => showTestingOnly ? item.for_testing : true)
    .filter(item => {
      if (selectedCategory === "All Categories") return true;
      return item.category === selectedCategory;
    })
    .filter(item => {
      if (!searchQuery) return true;
      return item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             item.category.toLowerCase().includes(searchQuery.toLowerCase());
    });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Rynek Sprzętu</h1>
              <p className="text-lg text-rhythm-600 max-w-2xl">
                Odkryj wysokiej jakości sprzęt muzyczny od zaufanych sprzedawców w naszym wyselekcjonowanym sklepie.
              </p>
            </div>
            
            <Button 
              className="mt-4 lg:mt-0 gap-2"
              onClick={handleAddProductClick}
            >
              <PlusCircle className="h-4 w-4" />
              Dodaj produkt
            </Button>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            <div className="lg:w-64 space-y-6">
              <div className="glass-card rounded-xl p-5 border">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Kategorie
                </h3>
                <div className="space-y-2">
                  {categories.map((category, index) => (
                    <div key={category} className="flex items-center">
                      <label className="flex items-center w-full cursor-pointer hover:text-primary transition-colors">
                        <input 
                          type="radio" 
                          name="category" 
                          className="mr-2 accent-primary"
                          defaultChecked={index === 0}
                          checked={selectedCategory === category}
                          onChange={() => setSelectedCategory(category)}
                        />
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="glass-card rounded-xl p-5 border">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Zakres cenowy
                </h3>
                <div className="pt-2 pb-6 px-1">
                  <div className="h-1 bg-rhythm-200 rounded-full mb-2">
                    <div className="h-1 bg-primary rounded-full w-3/4"></div>
                    <div className="relative">
                      <div className="absolute left-0 top-0 h-3 w-3 -mt-2 -ml-1.5 bg-primary rounded-full border-2 border-white"></div>
                      <div className="absolute left-3/4 top-0 h-3 w-3 -mt-2 -ml-1.5 bg-primary rounded-full border-2 border-white"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-rhythm-500">
                    <span>0 zł</span>
                    <span>3,000+ zł</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Min" className="text-sm" />
                  <Input placeholder="Max" className="text-sm" />
                </div>
              </div>
              
              <div className="glass-card rounded-xl p-5 border">
                <h3 className="font-semibold mb-3">Stan</h3>
                <div className="space-y-2">
                  {["Nowy", "Jak nowy", "Bardzo dobry", "Dobry", "Zadowalający"].map((condition) => (
                    <div key={condition} className="flex items-center">
                      <label className="flex items-center w-full cursor-pointer hover:text-primary transition-colors">
                        <input 
                          type="checkbox" 
                          className="mr-2 accent-primary"
                        />
                        {condition}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
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
              
              <Button className="w-full">Zastosuj filtry</Button>
            </div>
            
            <div className="flex-1">
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
                  <select className="py-2 px-3 rounded-md border bg-background">
                    <option>Wyróżnione</option>
                    <option>Cena: od najniższej</option>
                    <option>Cena: od najwyższej</option>
                    <option>Ocena</option>
                    <option>Najnowsze</option>
                  </select>
                </div>
              </div>
              
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
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((item, index) => (
                    <MarketplaceItem
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      price={item.price}
                      image={item.image_url}
                      category={item.category}
                      rating={item.rating || 0}
                      reviewCount={item.review_count || 0}
                      sale={item.sale}
                      salePercentage={item.sale_percentage}
                      forTesting={item.for_testing}
                      testingPrice={item.testing_price}
                      delay={index * 0.05}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">Nie znaleziono produktów</h3>
                  <p className="text-rhythm-600 mb-6">Spróbuj zmienić filtry lub dodaj pierwszy produkt</p>
                  <Button onClick={handleAddProductClick}>Dodaj produkt</Button>
                </div>
              )}
              
              {filteredProducts.length > 0 && (
                <div className="flex justify-center mt-10">
                  <div className="flex">
                    <Button variant="outline" size="sm" className="rounded-l-md rounded-r-none border-r-0">Poprzednia</Button>
                    {[1, 2, 3, 4, 5].map((page) => (
                      <Button 
                        key={page} 
                        variant={page === 1 ? "default" : "outline"} 
                        size="sm" 
                        className={`rounded-none ${page > 1 && page < 5 ? 'border-r-0' : ''}`}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button variant="outline" size="sm" className="rounded-r-md rounded-l-none">Następna</Button>
                  </div>
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
