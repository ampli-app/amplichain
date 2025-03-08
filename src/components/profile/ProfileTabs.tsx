
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ProfileInfoTab } from './ProfileInfoTab';
import { ProfileFeedTab } from './ProfileFeedTab';
import { PortfolioTab } from './PortfolioTab';
import { ExperienceTab } from './ExperienceTab';
import { EducationTab } from './EducationTab';
import { ProfileRatingsTab } from './ProfileRatingsTab';
import { MarketplaceTab } from './MarketplaceTab';
import { useMarketplaceActions } from '@/hooks/useMarketplaceActions';
import { ClientConsultationsPanel } from '@/components/marketplace/consultations/client/ClientConsultationsPanel';

interface ProfileTabsProps {
  profileId: string;
  isOwnProfile: boolean;
}

export const ProfileTabs = ({ profileId, isOwnProfile }: ProfileTabsProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabParam = searchParams.get('tab') || 'info';
  const [activeTab, setActiveTab] = useState<string>(tabParam);
  
  const { 
    handleDeleteProduct, 
    handleDeleteService, 
    handleDeleteConsultation 
  } = useMarketplaceActions(profileId);

  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-4">
        <TabsTrigger value="info">Informacje</TabsTrigger>
        <TabsTrigger value="feed">Posty</TabsTrigger>
        <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        <TabsTrigger value="experience">Doświadczenie</TabsTrigger>
        <TabsTrigger value="education">Edukacja</TabsTrigger>
        <TabsTrigger value="ratings">Oceny</TabsTrigger>
        
        {isOwnProfile && (
          <>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="consultations">Konsultacje</TabsTrigger>
          </>
        )}
      </TabsList>

      <TabsContent value="info">
        <ProfileInfoTab profileId={profileId} isEditable={isOwnProfile} />
      </TabsContent>

      <TabsContent value="feed">
        <ProfileFeedTab profileId={profileId} isOwnProfile={isOwnProfile} />
      </TabsContent>

      <TabsContent value="portfolio">
        <PortfolioTab profileId={profileId} isEditable={isOwnProfile} />
      </TabsContent>

      <TabsContent value="experience">
        <ExperienceTab profileId={profileId} isEditable={isOwnProfile} />
      </TabsContent>

      <TabsContent value="education">
        <EducationTab profileId={profileId} isEditable={isOwnProfile} />
      </TabsContent>

      <TabsContent value="ratings">
        <ProfileRatingsTab profileId={profileId} />
      </TabsContent>

      {isOwnProfile && (
        <>
          <TabsContent value="marketplace">
            <MarketplaceTab 
              profileId={profileId} 
              onDeleteProduct={handleDeleteProduct}
              onDeleteService={handleDeleteService}
              onDeleteConsultation={handleDeleteConsultation}
            />
          </TabsContent>
          
          <TabsContent value="consultations">
            <ClientConsultationsPanel />
          </TabsContent>
        </>
      )}
    </Tabs>
  );
};
