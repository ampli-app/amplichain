
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PortfolioTab } from '@/components/profile/PortfolioTab';
import { ProductsTab } from '@/components/profile/ProductsTab';
import { ExperienceTab } from '@/components/profile/ExperienceTab';
import { EducationTab } from '@/components/profile/EducationTab';
import { MarketplaceTab } from '@/components/profile/MarketplaceTab';
import { ProfileFeedTab } from '@/components/profile/ProfileFeedTab';
import { ProfileInfoTab } from '@/components/profile/ProfileInfoTab';
import { ProfileRatingsTab } from '@/components/profile/ProfileRatingsTab';
import { useProfileData } from '@/hooks/useProfileData';

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
      <TabsList className="mb-6 grid sm:grid-cols-4 md:grid-cols-5 max-w-3xl">
        <TabsTrigger value="feed">Feed</TabsTrigger>
        <TabsTrigger value="info">Informacje</TabsTrigger>
        <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        <TabsTrigger value="ratings">Oceny</TabsTrigger>
        {isOwnProfile && (
          <TabsTrigger value="my_marketplace">Mój Marketplace</TabsTrigger>
        )}
      </TabsList>
      
      <TabsContent value="feed">
        <ProfileFeedTab profileId={profileId} />
      </TabsContent>
      
      <TabsContent value="info">
        <ProfileInfoTab 
          userProjects={userProjects}
          userExperience={userExperience}
          userEducation={userEducation}
          isOwnProfile={isOwnProfile}
        />
      </TabsContent>
      
      <TabsContent value="marketplace">
        <ProductsTab 
          userProducts={userProducts}
          isOwnProfile={false}
          profileId={profileId}
        />
      </TabsContent>
      
      <TabsContent value="ratings">
        <ProfileRatingsTab profileId={profileId} />
      </TabsContent>
      
      {isOwnProfile && (
        <TabsContent value="my_marketplace">
          <MarketplaceTab 
            profileId={profileId}
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
