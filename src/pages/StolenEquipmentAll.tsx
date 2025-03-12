
import { useState } from 'react';
import { Search, Filter, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StolenEquipmentCard } from '@/components/stolen-equipment/StolenEquipmentCard';
import { StolenEquipmentInfo } from '@/components/stolen-equipment/StolenEquipmentInfo';
import { ReportStolenDialog } from '@/components/stolen-equipment/ReportStolenDialog';
import { StolenEquipmentFilters } from '@/components/stolen-equipment/StolenEquipmentFilters';
import { useStolenEquipment, useCategories, useLocations } from '@/hooks/useStolenEquipment';
import { toast } from 'sonner';

export default function StolenEquipmentAll() {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Get data
  const { data: categories = [] } = useCategories();
  const { data: locations = [] } = useLocations();
  
  // Apply filters
  let filterQuery = searchQuery;
  if (selectedLocation) {
    filterQuery += ` ${selectedLocation}`;
  }
  
  const { 
    data: stolenItems = [], 
    isLoading, 
    error 
  } = useStolenEquipment(selectedCategory, filterQuery);

  // Filter by status if needed
  const filteredItems = selectedStatus 
    ? stolenItems.filter(item => item.status === selectedStatus)
    : stolenItems;

  if (error) {
    toast.error("Wystąpił błąd podczas ładowania danych");
  }

  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSelectedLocation(null);
    setSelectedStatus(null);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <div className="mb-8">
            <Link to="/stolen-equipment" className="inline-flex items-center text-primary hover:underline mb-4">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Powrót do strony głównej
            </Link>
            <h1 className="text-3xl font-bold mb-2">Wszystkie skradzione sprzęty</h1>
            <p className="text-muted-foreground">
              Przeglądaj pełną bazę skradzionych instrumentów i sprzętu muzycznego
            </p>
          </div>
          
          <StolenEquipmentInfo />
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
            {/* Mobile filters toggle */}
            <div className="lg:hidden flex justify-between mb-4">
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? "Ukryj filtry" : "Pokaż filtry"}
              </Button>
              
              <Button onClick={() => setShowReportDialog(true)}>
                Zgłoś kradzież
              </Button>
            </div>
            
            {/* Sidebar filters - desktop always visible, mobile conditional */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
              <StolenEquipmentFilters 
                categories={categories}
                locations={locations}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                onResetFilters={handleResetFilters}
              />
              
              {/* Desktop report button */}
              <div className="hidden lg:block mt-6">
                <Button 
                  className="w-full"
                  onClick={() => setShowReportDialog(true)}
                >
                  Zgłoś kradzież
                </Button>
              </div>
            </div>
            
            {/* Main content */}
            <div className="lg:col-span-3">
              {/* Search bar */}
              <div className="relative mb-6">
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
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array(6).fill(0).map((_, index) => (
                    <div key={index} className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 border rounded-md">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Nie znaleziono sprzętu</h3>
                  <p className="text-muted-foreground mb-6">
                    Spróbuj zmienić kryteria wyszukiwania lub zgłoś kradzież sprzętu
                  </p>
                  <Button onClick={() => setShowReportDialog(true)}>
                    Zgłoś kradzież
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-4 text-muted-foreground">
                    Znaleziono {filteredItems.length} {filteredItems.length === 1 ? 'sprzęt' : 
                      filteredItems.length >= 2 && filteredItems.length <= 4 ? 'sprzęty' : 'sprzętów'}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredItems.map(item => (
                      <StolenEquipmentCard 
                        key={item.id}
                        item={item}
                      />
                    ))}
                  </div>
                </>
              )}
              
              {filteredItems.length > 0 && (
                <div className="mt-8 text-center">
                  <Button variant="outline">Załaduj więcej</Button>
                </div>
              )}
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
