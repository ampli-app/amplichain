
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Info, MapPin, Calendar } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StolenEquipmentHeader } from '@/components/stolen-equipment/StolenEquipmentHeader';
import { StolenEquipmentCategories } from '@/components/stolen-equipment/StolenEquipmentCategories';
import { StolenEquipmentCard } from '@/components/stolen-equipment/StolenEquipmentCard';
import { StolenEquipmentInfo } from '@/components/stolen-equipment/StolenEquipmentInfo';
import { ReportStolenDialog } from '@/components/stolen-equipment/ReportStolenDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useStolenEquipment, useCategories } from '@/hooks/useStolenEquipment';
import { toast } from 'sonner';

export default function StolenEquipment() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();
  const { 
    data: stolenItems = [], 
    isLoading: isItemsLoading, 
    error 
  } = useStolenEquipment(selectedCategory, searchQuery);

  if (error) {
    toast.error("Wystąpił błąd podczas ładowania danych");
  }

  const handleSeeAllClick = () => {
    navigate('/stolen-equipment/all');
  };

  const categoryOptions = [
    { id: 'all', name: 'Wszystkie', icon: 'All' },
    ...categories.map((category) => ({
      id: category.id,
      name: category.name,
      icon: category.slug || category.name
    }))
  ];

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
            
            {isCategoriesLoading ? (
              <div className="flex overflow-x-auto pb-2 gap-2">
                {Array(8).fill(0).map((_, index) => (
                  <div key={index} className="h-10 w-32 rounded-full bg-gray-200 animate-pulse"></div>
                ))}
              </div>
            ) : (
              <StolenEquipmentCategories 
                categories={categoryOptions}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
              />
            )}
            
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
            {isItemsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {Array(6).fill(0).map((_, index) => (
                  <Card key={index} className="overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200"></div>
                    <CardContent className="p-4">
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div className="h-16 bg-gray-200 rounded mb-4"></div>
                      <div className="flex space-x-2">
                        <div className="h-9 bg-gray-200 rounded flex-1"></div>
                        <div className="h-9 bg-gray-200 rounded w-32"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : stolenItems.length === 0 ? (
              <div className="text-center py-12 mt-8 border rounded-md">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {stolenItems.map(item => (
                  <StolenEquipmentCard 
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>
            )}
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
