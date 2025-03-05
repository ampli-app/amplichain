
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PortfolioTab } from '@/components/profile/PortfolioTab';
import { ProductsTab } from '@/components/profile/ProductsTab';
import { ExperienceTab } from '@/components/profile/ExperienceTab';
import { EducationTab } from '@/components/profile/EducationTab';
import { MarketplaceTab } from '@/components/profile/MarketplaceTab';
import { useProfileData } from '@/hooks/useProfileData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface ProfileTabsProps {
  defaultTab: string;
  isOwnProfile: boolean;
  profileId: string;
  userProjects: any[];
  userProducts: any[];
  userExperience: any[];
  userEducation: any[];
  onDeleteProduct: (id: string) => Promise<void>;
  onDeleteService: (id: string) => Promise<void>;
  onDeleteConsultation: (id: string) => Promise<void>;
}

export function ProfileTabs({
  defaultTab,
  isOwnProfile,
  profileId,
  userProjects,
  userProducts,
  userExperience,
  userEducation,
  onDeleteProduct,
  onDeleteService,
  onDeleteConsultation
}: ProfileTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className="mb-8">
      <TabsList className="mb-6 grid grid-cols-5 max-w-3xl">
        <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        <TabsTrigger value="products">Produkty</TabsTrigger>
        <TabsTrigger value="experience">Doświadczenie</TabsTrigger>
        <TabsTrigger value="education">Edukacja</TabsTrigger>
        {isOwnProfile && (
          <TabsTrigger value="marketplace">Mój Marketplace</TabsTrigger>
        )}
      </TabsList>
      
      <TabsContent value="portfolio">
        <PortfolioTab 
          userProjects={userProjects}
          isOwnProfile={isOwnProfile}
        />
      </TabsContent>
      
      <TabsContent value="products">
        <ProductsTab 
          userProducts={userProducts}
          isOwnProfile={isOwnProfile}
        />
      </TabsContent>
      
      <TabsContent value="experience">
        <ExperienceTab 
          userExperience={userExperience}
          isOwnProfile={isOwnProfile}
        />
      </TabsContent>
      
      <TabsContent value="education">
        <EducationTab 
          userEducation={userEducation}
          isOwnProfile={isOwnProfile}
        />
      </TabsContent>
      
      {isOwnProfile && (
        <TabsContent value="marketplace">
          <MarketplaceTab 
            profileId={profileId}
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
