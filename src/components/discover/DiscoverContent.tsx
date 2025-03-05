
import { MarketplaceSection } from './MarketplaceSection';
import { GroupsSection } from './GroupsSection';
import { FeedSection } from './FeedSection';
import { SuggestedProfilesSection } from './SuggestedProfilesSection';
import { PopularHashtagsSection } from './PopularHashtagsSection';
import { DiscoverSlider } from './DiscoverSlider';
import { useNavigate } from 'react-router-dom';
import { useMarketplaceData } from '@/hooks/useMarketplaceData';

export function DiscoverContent() {
  const { products, services, consultations, groups, loading } = useMarketplaceData();
  const navigate = useNavigate();

  return (
    <>
      <DiscoverSlider />
      
      <div className="space-y-8 mt-8">
        {/* Sekcja Marketplace - teraz na pełną szerokość z przewijaniem */}
        <section>
          <h2 className="text-xl font-bold mb-6">Popularne w Marketplace</h2>
          {loading ? (
            <div className="text-center py-8">Ładowanie produktów...</div>
          ) : (
            <>
              <MarketplaceSection 
                title="Produkty" 
                itemType="products" 
                items={products.map(item => ({...item, hideInDiscover: true}))} 
              />
              
              <MarketplaceSection 
                title="Usługi" 
                itemType="services" 
                items={services.map(item => ({...item, hideInDiscover: true}))} 
              />
              
              <MarketplaceSection 
                title="Konsultacje" 
                itemType="consultations" 
                items={consultations.map(item => ({...item, hideInDiscover: true}))} 
              />
            </>
          )}
        </section>
        
        {/* Sekcja Grupy - teraz na pełną szerokość z przewijaniem */}
        <GroupsSection groups={groups} />
        
        {/* Układ dwukolumnowy dla Feed i bocznych informacji */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <FeedSection />
          </div>
          
          <div className="space-y-8">
            <SuggestedProfilesSection />
            <PopularHashtagsSection />
          </div>
        </div>
      </div>
    </>
  );
}
