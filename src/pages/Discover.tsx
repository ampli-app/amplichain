
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DiscoverHero } from '@/components/discover/DiscoverHero';
import { DiscoverContent } from '@/components/discover/DiscoverContent';
import { useSearchHandler } from '@/hooks/useSearchHandler';

export default function Discover() {
  const { handleSearch } = useSearchHandler();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Odkrywaj</h1>
          <p className="text-muted-foreground">Znajdź inspiracje, kontakty i projekty w branży muzycznej</p>
        </div>
        
        <DiscoverHero onSearch={handleSearch} />
        
        <DiscoverContent />
      </main>
      
      <Footer />
    </div>
  );
}
