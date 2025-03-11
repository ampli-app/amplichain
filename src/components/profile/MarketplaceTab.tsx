import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { AddProductDialog } from '@/components/AddProductDialog';
import { AddServiceFormDialog } from '@/components/AddServiceFormDialog';
import { AddConsultationDialog } from '@/components/AddConsultationDialog';
import { ProductsTabContent } from './marketplace/ProductsTabContent';
import { ServicesTabContent } from './marketplace/ServicesTabContent';
import { ConsultationsTabContent } from './marketplace/ConsultationsTabContent';
import { MarketplaceAddButtons } from './marketplace/MarketplaceAddButtons';

interface MarketplaceTabProps {
  profileId: string;
  onDeleteProduct: (id: string) => Promise<void>;
  onDeleteService: (id: string) => Promise<void>;
  onDeleteConsultation: (id: string) => Promise<void>;
}

export function MarketplaceTab({ 
  profileId,
  onDeleteProduct,
  onDeleteService,
  onDeleteConsultation
}: MarketplaceTabProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false);
  const [showAddConsultationDialog, setShowAddConsultationDialog] = useState(false);
  
  const [activeMarketplaceTab, setActiveMarketplaceTab] = useState('products');
  const [activeConsultationsTab, setActiveConsultationsTab] = useState('items');
  
  useEffect(() => {
    if (profileId) {
      fetchMarketplaceItems();
      
      const urlParams = new URLSearchParams(window.location.search);
      const marketplaceTabParam = urlParams.get('marketplaceTab');
      
      if (marketplaceTabParam && ['products', 'services', 'consultations'].includes(marketplaceTabParam)) {
        setActiveMarketplaceTab(marketplaceTabParam);
      }
    }
  }, [profileId]);
  
  const fetchMarketplaceItems = async () => {
    setLoading(true);
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', profileId);
        
      if (productsError) throw productsError;
      setProducts(productsData || []);
      
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', profileId);
        
      if (servicesError) throw servicesError;
      setServices(servicesData || []);
      
      const { data: consultationsData, error: consultationsError } = await supabase
        .from('consultations')
        .select('*')
        .eq('user_id', profileId);
        
      if (consultationsError) throw consultationsError;
      setConsultations(consultationsData || []);
      
    } catch (error) {
      console.error('Error fetching marketplace items:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się załadować elementów marketplace.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleProductDeleted = async (id: string) => {
    await onDeleteProduct(id);
    setProducts(products.filter(p => p.id !== id));
  };
  
  const handleServiceDeleted = async (id: string) => {
    await onDeleteService(id);
    setServices(services.filter(s => s.id !== id));
  };
  
  const handleConsultationDeleted = async (id: string) => {
    await onDeleteConsultation(id);
    setConsultations(consultations.filter(c => c.id !== id));
  };
  
  const handleMarketplaceTabChange = (value: string) => {
    setActiveMarketplaceTab(value);
    
    const url = new URL(window.location.href);
    url.searchParams.set('marketplaceTab', value);
    window.history.pushState({}, '', url);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div>
      <Tabs value={activeMarketplaceTab} onValueChange={handleMarketplaceTabChange}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="products">Produkty</TabsTrigger>
            <TabsTrigger value="services">Usługi</TabsTrigger>
            <TabsTrigger value="consultations">Konsultacje</TabsTrigger>
          </TabsList>
          
          <MarketplaceAddButtons 
            onAddProduct={() => setShowAddProductDialog(true)}
            onAddService={() => setShowAddServiceDialog(true)}
            onAddConsultation={() => setShowAddConsultationDialog(true)}
          />
        </div>
        
        <TabsContent value="products">
          <ProductsTabContent 
            products={products} 
            isOwner={true}
            onDelete={handleProductDeleted}
            onAddProduct={() => setShowAddProductDialog(true)}
          />
        </TabsContent>
        
        <TabsContent value="services">
          <ServicesTabContent 
            services={services}
            onDelete={handleServiceDeleted}
            onAddService={() => setShowAddServiceDialog(true)}
          />
        </TabsContent>
        
        <TabsContent value="consultations">
          <ConsultationsTabContent />
        </TabsContent>
      </Tabs>
      
      <AddProductDialog
        open={showAddProductDialog}
        onOpenChange={setShowAddProductDialog}
      />
      
      <AddServiceFormDialog
        open={showAddServiceDialog}
        onOpenChange={setShowAddServiceDialog}
      />
      
      <AddConsultationDialog
        open={showAddConsultationDialog}
        onOpenChange={setShowAddConsultationDialog}
      />
    </div>
  );
}
