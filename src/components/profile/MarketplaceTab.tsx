import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FilePlus, PenLine, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { AddProductDialog } from '@/components/AddProductDialog';
import { AddServiceFormDialog } from '@/components/AddServiceFormDialog';
import { AddConsultationDialog } from '@/components/AddConsultationDialog';
import { ProductCard } from '../marketplace/ProductCard';
import { ServiceCard } from '@/components/marketplace/services/ServiceCard';
import { ConsultationCard } from '@/components/marketplace/consultations/ConsultationCard';
import { ExpertConsultationsPanel } from '@/components/marketplace/consultations/expert/ExpertConsultationsPanel';

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
      
      // Sprawdź czy w URL jest parametr marketplaceTab i ustaw odpowiednią zakładkę
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
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', profileId);
        
      if (productsError) throw productsError;
      setProducts(productsData || []);
      
      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', profileId);
        
      if (servicesError) throw servicesError;
      setServices(servicesData || []);
      
      // Fetch consultations
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
  
  const handleItemAdded = () => {
    fetchMarketplaceItems();
  };
  
  const handleMarketplaceTabChange = (value: string) => {
    setActiveMarketplaceTab(value);
    
    // Aktualizuj URL z parametrem marketplaceTab
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
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAddProductDialog(true)}
            >
              <FilePlus className="h-4 w-4 mr-2" />
              Dodaj produkt
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAddServiceDialog(true)}
            >
              <PenLine className="h-4 w-4 mr-2" />
              Dodaj usługę
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAddConsultationDialog(true)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Dodaj konsultację
            </Button>
          </div>
        </div>
        
        <TabsContent value="products">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <ProductCard 
                  key={product.id}
                  product={product} 
                  isOwner={true}
                  onDelete={() => handleProductDeleted(product.id)}
                />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground mb-4">Nie masz jeszcze żadnych produktów.</p>
              <Button onClick={() => setShowAddProductDialog(true)}>
                Dodaj pierwszy produkt
              </Button>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="services">
          {services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(service => (
                <ServiceCard 
                  key={service.id}
                  service={service} 
                  isFavorite={false}
                  isOwner={true}
                  onToggleFavorite={() => {}}
                  onDelete={handleServiceDeleted}
                />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground mb-4">Nie masz jeszcze żadnych usług.</p>
              <Button onClick={() => setShowAddServiceDialog(true)}>
                Dodaj pierwszą usługę
              </Button>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="consultations">
          <Tabs value={activeConsultationsTab} onValueChange={setActiveConsultationsTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="items">Moje oferty</TabsTrigger>
              <TabsTrigger value="orders">Panel eksperta</TabsTrigger>
            </TabsList>
            
            <TabsContent value="items">
              {consultations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {consultations.map(consultation => (
                    <ConsultationCard 
                      key={consultation.id}
                      consultation={consultation} 
                      isFavorite={false}
                      isOwner={true}
                      onToggleFavorite={() => {}}
                      onDelete={handleConsultationDeleted}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">Nie masz jeszcze żadnych konsultacji.</p>
                  <Button onClick={() => setShowAddConsultationDialog(true)}>
                    Dodaj pierwszą konsultację
                  </Button>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="orders">
              <ExpertConsultationsPanel />
            </TabsContent>
          </Tabs>
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
