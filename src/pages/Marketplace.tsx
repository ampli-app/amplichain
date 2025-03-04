import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { PlusCircle, ShoppingBag, Briefcase, Headphones } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AddProductDialog } from '@/components/AddProductDialog';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ServicesMarketplace } from '@/components/ServicesMarketplace';
import { ProductsTab } from '@/components/marketplace/ProductsTab';
import { ConsultationsTab } from '@/components/marketplace/ConsultationsTab';

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

export default function Marketplace() {
  const { isLoggedIn } = useAuth();

  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProducts();
    fetchCategories();
  }, []);

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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getAddButtonText = () => {
    switch(activeTab) {
      case "products": return "Dodaj produkt";
      case "services": return "Dodaj usługę";
      case "consultations": return "Dodaj konsultację";
      default: return "Dodaj";
    }
  };

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
              {getAddButtonText()}
            </Button>
          </div>
          
          <Tabs 
            defaultValue="products" 
            value={activeTab} 
            onValueChange={handleTabChange}
            className="mb-6"
          >
            <div className="flex justify-center mb-4">
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
              <ProductsTab
                categories={categories}
                products={products}
                loading={loading}
                isLoggedIn={isLoggedIn}
                handleAddProductClick={handleAddProductClick}
                productConditions={productConditions}
                conditionMap={conditionMap}
              />
            </TabsContent>
            
            <TabsContent value="services" className="mt-6">
              <ServicesMarketplace />
            </TabsContent>
            
            <TabsContent value="consultations" className="mt-6">
              <ConsultationsTab />
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
