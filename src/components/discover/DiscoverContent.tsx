
import { MarketplaceSection } from './MarketplaceSection';
import { GroupsSection } from './GroupsSection';
import { FeedSection } from './FeedSection';
import { SuggestedProfilesSection } from './SuggestedProfilesSection';
import { PopularHashtagsSection } from './PopularHashtagsSection';
import { FeatureCard } from './FeatureCard';
import { useNavigate } from 'react-router-dom';
import { MarketplaceItem, Group, useMarketplaceData } from '@/hooks/useMarketplaceData';

export function DiscoverContent() {
  const { products, services, consultations, groups, loading } = useMarketplaceData();
  const navigate = useNavigate();

  return (
    <>
      <FeatureCard 
        title="Dołącz do społeczności producentów"
        description="Ponad 1000 profesjonalistów z branży muzycznej czeka na Ciebie. Wymieniaj się wiedzą, uzyskaj feedback i rozwiń swoje umiejętności."
        backgroundImage="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop"
        onClick={() => navigate('/groups')}
        buttonText="Dołącz teraz"
      />
      
      <div className="space-y-8 mt-8">
        {/* Sekcja Marketplace - teraz na pełną szerokość */}
        <section>
          <h2 className="text-xl font-bold mb-6">Popularne w Marketplace</h2>
          {loading ? (
            <div className="text-center py-8">Ładowanie produktów...</div>
          ) : (
            <>
              <MarketplaceSection 
                title="Produkty" 
                itemType="products" 
                items={products} 
              />
              
              <MarketplaceSection 
                title="Usługi" 
                itemType="services" 
                items={services} 
              />
              
              <MarketplaceSection 
                title="Konsultacje" 
                itemType="consultations" 
                items={consultations} 
              />
            </>
          )}
        </section>
        
        {/* Sekcja Grupy - teraz na pełną szerokość */}
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
