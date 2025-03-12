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
  const [activeMarketplaceTab, setActiveMarketplaceTab] = useState('products');
  const [activeConsultationsTab, setActiveConsultationsTab] = useState('items');
  
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false);
  const [showAddConsultationDialog, setShowAddConsultationDialog] = useState(false);
  
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (profileId) {
      const urlParams = new URLSearchParams(window.location.search);
      const marketplaceTabParam = urlParams.get('marketplaceTab');
      
      if (marketplaceTabParam && ['products', 'services', 'consultations'].includes(marketplaceTabParam)) {
        setActiveMarketplaceTab(marketplaceTabParam);
      }
      
      setLoading(false);
    }
  }, [profileId]);
  
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
            userId={profileId}
            isOwnProfile={true} 
          />
        </TabsContent>
        
        <TabsContent value="services">
          <ServicesTabContent 
            services={[]}
            onDelete={onDeleteService}
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
