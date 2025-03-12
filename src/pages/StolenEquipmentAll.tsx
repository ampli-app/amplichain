
import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { StolenEquipmentFilters } from '@/components/stolen-equipment/StolenEquipmentFilters';
import { StolenEquipmentGrid } from '@/components/stolen-equipment/StolenEquipmentGrid';
import { ReportStolenDialog } from '@/components/stolen-equipment/ReportStolenDialog';
import { CategorySelection } from '@/components/marketplace/CategorySelection';

// Sample data
const sampleItems = [
  {
    id: '1',
    title: 'Fender Stratocaster (1976)',
    location: 'Warszawa, Mokotów',
    date: '12.03.2025',
    description: 'Czarny Stratocaster z charakterystycznym wytarciem lakieru na korpusie przy pickguardzie. Numer seryjny: 765438.',
    image: '/lovable-uploads/e6773bd4-a479-47fc-a893-b16486c67ba5.png',
    status: 'verified',
    category: 'Gitary'
  },
  {
    id: '2',
    title: 'Roland JP-8000',
    location: 'Kraków, Kazimierz',
    date: '05.03.2025',
    description: 'Syntezator ze srebrną naklejką studia na tylnej części obudowy. Numer seryjny: 2873921.',
    image: '/lovable-uploads/e6773bd4-a479-47fc-a893-b16486c67ba5.png',
    status: 'unverified',
    category: 'Syntezatory'
  },
  {
    id: '3',
    title: 'Shure SM7B + Cloudlifter',
    location: 'Gdańsk',
    date: '01.03.2025',
    description: 'Mikrofon z wytartym logo Shure i niebieskim Cloudlifter. Na Cloudlifterze naklejka z logiem studia XYZ.',
    image: '/lovable-uploads/e6773bd4-a479-47fc-a893-b16486c67ba5.png',
    status: 'recovered',
    category: 'Mikrofony'
  },
  {
    id: '4',
    title: 'Korg Minilogue',
    location: 'Wrocław',
    date: '20.02.2025',
    description: 'Syntezator z charakterystycznym zarysowaniem na obudowie. Brakuje jednego pokrętła.',
    image: '/lovable-uploads/e6773bd4-a479-47fc-a893-b16486c67ba5.png',
    status: 'verified',
    category: 'Syntezatory'
  },
  {
    id: '5',
    title: 'Gibson Les Paul Standard',
    location: 'Poznań',
    date: '15.02.2025',
    description: 'Sunburst, rok 2018. Delikatny odprysk lakieru przy pickupie mostkowym.',
    image: '/lovable-uploads/e6773bd4-a479-47fc-a893-b16486c67ba5.png',
    status: 'verified',
    category: 'Gitary'
  },
  {
    id: '6',
    title: 'Universal Audio Apollo Twin',
    location: 'Gdynia',
    date: '10.02.2025',
    description: 'Interface audio z widocznym zadrapaniem na górnym panelu.',
    image: '/lovable-uploads/e6773bd4-a479-47fc-a893-b16486c67ba5.png',
    status: 'unverified',
    category: 'Interfejsy Audio'
  },
];

const categories = [
  { id: 'all-categories', name: 'Wszystkie kategorie', slug: 'all-categories', description: null },
  { id: 'guitars', name: 'Gitary', slug: 'guitars', description: null },
  { id: 'synths', name: 'Syntezatory', slug: 'synths', description: null },
  { id: 'studio', name: 'Sprzęt studyjny', slug: 'studio', description: null },
  { id: 'accessories', name: 'Akcesoria', slug: 'accessories', description: null },
  { id: 'interfaces', name: 'Interfejsy Audio', slug: 'interfaces', description: null },
  { id: 'controllers', name: 'Kontrolery', slug: 'controllers', description: null },
  { id: 'microphones', name: 'Mikrofony', slug: 'microphones', description: null },
  { id: 'monitors', name: 'Monitory', slug: 'monitors', description: null },
  { id: 'software', name: 'Oprogramowanie', slug: 'software', description: null },
];

export default function StolenEquipmentAll() {
  const { isLoggedIn } = useAuth();
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all-categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'filters'>('grid');

  // Filter items based on category, search query, and status
  const filteredItems = sampleItems.filter(item => {
    // Category filter
    const categoryMatch = 
      !selectedCategory || 
      selectedCategory === 'all-categories' || 
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    
    // Search query filter
    const searchMatch = 
      !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const statusMatch = 
      selectedStatus.length === 0 || 
      selectedStatus.includes(item.status);
    
    return categoryMatch && searchMatch && statusMatch;
  });

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Baza skradzionych sprzętów</h1>
            <button 
              onClick={() => setShowReportDialog(true)}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Zgłoś kradzież
            </button>
          </div>
          
          <CategorySelection 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />
          
          <div className="mt-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className={`lg:w-64 space-y-6 ${viewMode === 'filters' ? 'block' : 'hidden lg:block'}`}>
                <StolenEquipmentFilters 
                  setSearchQuery={setSearchQuery}
                  searchQuery={searchQuery}
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
                  onReportClick={() => setShowReportDialog(true)}
                />
              </div>
              
              <div className={`flex-1 ${viewMode === 'grid' ? 'block' : 'hidden lg:block'}`}>
                <StolenEquipmentGrid 
                  items={filteredItems}
                  onReportClick={() => setShowReportDialog(true)}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </div>
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
