
// Update MarketplaceTab to accept the required props
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
import { ProductCard } from '@/components/marketplace/ProductCard';
import { ServiceCard } from '@/components/marketplace/services/ServiceCard';
import { ConsultationCard } from '@/components/marketplace/consultations/ConsultationCard';

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
  
  useEffect(() => {
    if (profileId) {
      fetchMarketplaceItems();
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
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div>
      <Tabs defaultValue="products">
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
                  onDelete={() => handleServiceDeleted(service.id)}
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
          {consultations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {consultations.map(consultation => (
                <ConsultationCard 
                  key={consultation.id}
                  consultation={consultation} 
                  isFavorite={false}
                  isOwner={true}
                  onToggleFavorite={() => {}}
                  onDelete={() => handleConsultationDeleted(consultation.id)}
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
      </Tabs>
      
      <AddProductDialog
        open={showAddProductDialog}
        onOpenChange={setShowAddProductDialog}
        onSuccess={handleItemAdded}
      />
      
      <AddServiceFormDialog
        open={showAddServiceDialog}
        onOpenChange={setShowAddServiceDialog}
        onSuccess={handleItemAdded}
      />
      
      <AddConsultationDialog
        open={showAddConsultationDialog}
        onOpenChange={setShowAddConsultationDialog}
        onSuccess={handleItemAdded}
      />
    </div>
  );
}
