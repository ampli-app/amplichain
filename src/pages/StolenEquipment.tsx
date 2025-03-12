import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Info, MapPin, Calendar } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { StolenEquipmentHeader } from '@/components/stolen-equipment/StolenEquipmentHeader';
import { StolenEquipmentCategories } from '@/components/stolen-equipment/StolenEquipmentCategories';
import { StolenEquipmentCard } from '@/components/stolen-equipment/StolenEquipmentCard';
import { StolenEquipmentInfo } from '@/components/stolen-equipment/StolenEquipmentInfo';
import { ReportStolenDialog } from '@/components/stolen-equipment/ReportStolenDialog';
import { useAuth } from '@/contexts/AuthContext';

const sampleItems = [
  {
    id: '1',
    title: 'Fender Stratocaster (1976)',
    location: 'Warszawa, Mokotów',
    date: '12.03.2025',
    description: 'Czarny Stratocaster z charakterystycznym wytarciem lakieru na korpusie przy pickguardzie. Numer seryjny: 765438.',
    image: '/lovable-uploads/e6773bd4-a479-47fc-a893-b16486c67ba5.png',
    status: 'verified' as const,
    category: 'Gitary'
  },
  {
    id: '2',
    title: 'Roland JP-8000',
    location: 'Kraków, Kazimierz',
    date: '05.03.2025',
    description: 'Syntezator ze srebrną naklejką studia na tylnej części obudowy. Numer seryjny: 2873921.',
    image: '/lovable-uploads/e6773bd4-a479-47fc-a893-b16486c67ba5.png',
    status: 'unverified' as const,
    category: 'Syntezatory'
  },
  {
    id: '3',
    title: 'Shure SM7B + Cloudlifter',
    location: 'Gdańsk',
    date: '01.03.2025',
    description: 'Mikrofon z wytartym logo Shure i niebieskim Cloudlifter. Na Cloudlifterze naklejka z logiem studia XYZ.',
    image: '/lovable-uploads/e6773bd4-a479-47fc-a893-b16486c67ba5.png',
    status: 'recovered' as const,
    category: 'Mikrofony'
  },
];

const categories = [
  { id: 'all', name: 'Wszystkie', icon: 'All' },
  { id: 'guitars', name: 'Gitary', icon: 'Guitar' },
  { id: 'synths', name: 'Syntezatory', icon: 'Synth' },
  { id: 'studio', name: 'Sprzęt studyjny', icon: 'Studio' },
  { id: 'accessories', name: 'Akcesoria', icon: 'Accessories' },
  { id: 'interfaces', name: 'Interfejsy Audio', icon: 'Interface' },
  { id: 'controllers', name: 'Kontrolery', icon: 'Controller' },
  { id: 'microphones', name: 'Mikrofony', icon: 'Microphone' },
  { id: 'monitors', name: 'Monitory', icon: 'Monitor' },
  { id: 'software', name: 'Oprogramowanie', icon: 'Software' },
];

const locations = [
  { id: 'warszawa', name: 'Warszawa' },
  { id: 'krakow', name: 'Kraków' },
  { id: 'gdansk', name: 'Gdańsk' },
];

export default function StolenEquipment() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSeeAllClick = () => {
    navigate('/stolen-equipment/all');
  };

  const filteredItems = sampleItems
    .filter(item => {
      const categoryMatch = !selectedCategory || selectedCategory === 'all'
        ? true
        : item.category.toLowerCase() === selectedCategory.toLowerCase();

      const searchMatch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());

      return categoryMatch && searchMatch;
    });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          {/* Hero section */}
          <StolenEquipmentHeader
            onReportClick={() => setShowReportDialog(true)}
          />
          
          {/* Info box */}
          <StolenEquipmentInfo />
          
          {/* Category selection */}
          <div className="mt-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center">
                <span className="inline-block w-3 h-8 bg-primary mr-3"></span>
                Zgłoszone instrumenty i sprzęt
              </h2>
              <Button 
                variant="outline" 
                onClick={handleSeeAllClick}
              >
                Zobacz wszystkie
              </Button>
            </div>
            
            <StolenEquipmentCategories 
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
            
            {/* Search bar */}
            <div className="relative max-w-md w-full mt-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Szukaj po nazwie, opisie..."
                className="pl-10 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setSearchQuery('')}
                >
                  ×
                </Button>
              )}
            </div>
            
            {/* Stolen equipment items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {filteredItems.map(item => (
                <StolenEquipmentCard 
                  key={item.id}
                  item={item}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      <ReportStolenDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
      />
    </div>
  );
}
