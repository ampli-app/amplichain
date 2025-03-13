
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ServicesMarketplace } from '@/components/ServicesMarketplace';
import { ProductsTab } from '@/components/marketplace/ProductsTab';
import { ConsultationsTab } from '@/components/marketplace/ConsultationsTab';
import { MarketplaceHeader } from '@/components/marketplace/MarketplaceHeader';
import { MarketplaceTabs } from '@/components/marketplace/MarketplaceTabs';
import { MarketplaceDialogs } from '@/components/marketplace/MarketplaceDialogs';
import { Product, Category, productConditions, conditionMap } from '@/components/marketplace/types';

export default function Marketplace() {
  const { isLoggedIn } = useAuth();

  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false);
  const [showAddConsultationDialog, setShowAddConsultationDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Sprawdź czy w URL jest parametr tab i ustaw odpowiednią zakładkę
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    
    if (tabParam && ['products', 'services', 'consultations'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    
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
        // Dodaj "all" kategorię tylko jeśli nie istnieje
        const allCategoryExists = data?.some(cat => cat.slug === 'all-categories');
        const filteredCategories = data?.filter(cat => cat.slug !== 'all-categories') || [];
        
        if (!allCategoryExists) {
          // Nie dodajemy specjalnej kategorii "all", gdyż teraz pokazujemy wszystkie domyślnie
        }
        
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
        // Map database results to Product type
        setProducts((data || []).map(product => ({
          ...product,
          status: product.status as 'available' | 'reserved' | 'sold' | string
        })));
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddButtonClick = () => {
    if (!isLoggedIn) {
      setShowAuthDialog(true);
      return;
    }

    switch(activeTab) {
      case "products":
        setShowAddProductDialog(true);
        break;
      case "services":
        setShowAddServiceDialog(true);
        break;
      case "consultations":
        setShowAddConsultationDialog(true);
        break;
      default:
        setShowAddProductDialog(true);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Aktualizuj URL z parametrem tab
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.pushState({}, '', url);
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
          <MarketplaceHeader 
            getAddButtonText={getAddButtonText}
            handleAddButtonClick={handleAddButtonClick}
          />
          
          <MarketplaceTabs
            activeTab={activeTab}
            handleTabChange={handleTabChange}
            productsContent={
              <ProductsTab
                categories={categories}
                products={products}
                loading={loading}
                isLoggedIn={isLoggedIn}
                handleAddProductClick={handleAddButtonClick}
                productConditions={productConditions}
                conditionMap={conditionMap}
              />
            }
            servicesContent={<ServicesMarketplace />}
            consultationsContent={<ConsultationsTab />}
          />
        </div>
      </main>
      
      <Footer />
      
      <MarketplaceDialogs
        showAddProductDialog={showAddProductDialog}
        setShowAddProductDialog={setShowAddProductDialog}
        showAddServiceDialog={showAddServiceDialog}
        setShowAddServiceDialog={setShowAddServiceDialog}
        showAddConsultationDialog={showAddConsultationDialog}
        setShowAddConsultationDialog={setShowAddConsultationDialog}
        showAuthDialog={showAuthDialog}
        setShowAuthDialog={setShowAuthDialog}
      />
    </div>
  );
}
