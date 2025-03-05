
import { ReactNode } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShoppingBag, Briefcase, Headphones } from 'lucide-react';

interface MarketplaceTabsProps {
  activeTab: string;
  handleTabChange: (value: string) => void;
  productsContent: ReactNode;
  servicesContent: ReactNode;
  consultationsContent: ReactNode;
}

export function MarketplaceTabs({
  activeTab,
  handleTabChange,
  productsContent,
  servicesContent,
  consultationsContent
}: MarketplaceTabsProps) {
  return (
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
        {productsContent}
      </TabsContent>
      
      <TabsContent value="services" className="mt-6">
        {servicesContent}
      </TabsContent>
      
      <TabsContent value="consultations" className="mt-6">
        {consultationsContent}
      </TabsContent>
    </Tabs>
  );
}
