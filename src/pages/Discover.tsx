
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DiscoverHero } from '@/components/discover/DiscoverHero';
import { FeatureCard } from '@/components/discover/FeatureCard';
import { MarketplaceSection } from '@/components/discover/MarketplaceSection';
import { GroupsSection } from '@/components/discover/GroupsSection';
import { FeedSection } from '@/components/discover/FeedSection';
import { SuggestedProfilesSection } from '@/components/discover/SuggestedProfilesSection';
import { PopularHashtagsSection } from '@/components/discover/PopularHashtagsSection';

// Przykładowe dane
const PRODUCTS = [
  { id: '1', title: 'Mikrofon Neumann', image: 'https://images.unsplash.com/photo-1520116468816-95b69f847357?q=80&w=2000&auto=format&fit=crop' },
  { id: '2', title: 'Interfejs audio', image: 'https://images.unsplash.com/photo-1558612846-ec0107aaf552?q=80&w=2000&auto=format&fit=crop' },
  { id: '3', title: 'Kontroler MIDI', image: 'https://images.unsplash.com/photo-1553526665-10042bd50dd1?q=80&w=2000&auto=format&fit=crop' },
  { id: '4', title: 'Monitory studyjne', image: 'https://images.unsplash.com/photo-1609587312208-cea54be969e7?q=80&w=2000&auto=format&fit=crop' },
  { id: '5', title: 'Słuchawki studyjne', image: 'https://images.unsplash.com/photo-1545127398-14699f92334b?q=80&w=2000&auto=format&fit=crop' }
];

const SERVICES = [
  { id: '1', title: 'Produkcja muzyczna', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop' },
  { id: '2', title: 'Miksowanie', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2000&auto=format&fit=crop' },
  { id: '3', title: 'Mastering', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2000&auto=format&fit=crop' },
  { id: '4', title: 'Nagrywanie wokalu', image: 'https://images.unsplash.com/photo-1520166012374-87f11d27f4e7?q=80&w=2000&auto=format&fit=crop' },
  { id: '5', title: 'Aranżacja', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=2000&auto=format&fit=crop' }
];

const CONSULTATIONS = [
  { id: '1', title: 'Konsultacja produkcyjna', image: 'https://images.unsplash.com/photo-1507941097613-9f2157b69235?q=80&w=2000&auto=format&fit=crop' },
  { id: '2', title: 'Doradztwo A&R', image: 'https://images.unsplash.com/photo-1453738773917-9c3eff1db985?q=80&w=2000&auto=format&fit=crop' },
  { id: '3', title: 'Rozwój kariery muzycznej', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=2000&auto=format&fit=crop' },
  { id: '4', title: 'Mentoring dla producentów', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2000&auto=format&fit=crop' },
  { id: '5', title: 'Doradztwo biznesowe', image: 'https://images.unsplash.com/photo-1542744173-05336fcc7ad4?q=80&w=2000&auto=format&fit=crop' }
];

const GROUPS = [
  { id: '1', name: 'Krąg Producentów', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop' },
  { id: '2', name: 'Spostrzeżenia A&R', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2000&auto=format&fit=crop' },
  { id: '3', name: 'Laboratorium Inżynierii Dźwięku', image: 'https://images.unsplash.com/photo-1588479839125-731d7ae923f6?q=80&w=2000&auto=format&fit=crop' },
  { id: '4', name: 'Wokaliści i Teksty', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=2000&auto=format&fit=crop' },
  { id: '5', name: 'Marketing Muzyczny', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2000&auto=format&fit=crop' },
  { id: '6', name: 'Kompozytorzy', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=2000&auto=format&fit=crop' },
];

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Tutaj możesz zaimplementować logikę wyszukiwania
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Odkrywaj</h1>
          <p className="text-muted-foreground">Znajdź inspiracje, kontakty i projekty w branży muzycznej</p>
        </div>
        
        <DiscoverHero onSearch={handleSearch} />
        
        <FeatureCard 
          title="Dołącz do społeczności producentów"
          description="Ponad 1000 profesjonalistów z branży muzycznej czeka na Ciebie. Wymieniaj się wiedzą, uzyskaj feedback i rozwiń swoje umiejętności."
          backgroundImage="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop"
          onClick={() => navigate('/groups')}
          buttonText="Dołącz teraz"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-6">Popularne w Marketplace</h2>
                <MarketplaceSection 
                  title="Produkty" 
                  itemType="products" 
                  items={PRODUCTS} 
                />
                
                <MarketplaceSection 
                  title="Usługi" 
                  itemType="services" 
                  items={SERVICES} 
                />
                
                <MarketplaceSection 
                  title="Konsultacje" 
                  itemType="consultations" 
                  items={CONSULTATIONS} 
                />
              </section>
              
              <GroupsSection groups={GROUPS} />
              
              <FeedSection />
            </div>
          </div>
          
          <div className="space-y-8">
            <SuggestedProfilesSection />
            <PopularHashtagsSection />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
