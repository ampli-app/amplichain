
import { useState } from 'react';
import { CategorySelection } from '@/components/marketplace/CategorySelection';
import { MarketplaceFilters } from '@/components/marketplace/MarketplaceFilters';
import { ServicesSearch } from './ServicesSearch';
import { ServicesFilters } from './ServicesFilters'; 
import { ServicesList } from './ServicesList';
import { useServicesFetch } from './hooks/useServicesFetch';
import { useServicesFavorites } from './hooks/useServicesFavorites';
import { useServicesFilters } from './hooks/useServicesFilters';
import { AddServiceFormDialog } from '@/components/AddServiceFormDialog';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';
import { useAuth } from '@/contexts/AuthContext';

const serviceCategories = [
  { id: 'recording', name: 'Studio nagrań', slug: 'recording-studio', description: null },
  { id: 'mixing', name: 'Mix i mastering', slug: 'mixing-mastering', description: null },
  { id: 'production', name: 'Produkcja muzyczna', slug: 'music-production', description: null },
  { id: 'lessons', name: 'Lekcje muzyki', slug: 'music-lessons', description: null },
  { id: 'songwriting', name: 'Kompozycja', slug: 'songwriting', description: null }
];

export function ServicesMarketplaceContent() {
  const { isLoggedIn } = useAuth();
  const { services, loading } = useServicesFetch();
  const { favorites, toggleFavorite } = useServicesFavorites();
  const [viewMode, setViewMode] = useState<'grid' | 'filters'>('grid');
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    selectedLocation,
    setSelectedLocation,
    priceRange,
    setPriceRange,
    minPrice,
    maxPrice,
    filteredServices,
    currentPage,
    totalPages,
    handlePriceInputChange,
    handleCategorySelect,
    handlePageChange,
    getCurrentPageServices
  } = useServicesFilters(services);

  const handleAddServiceClick = () => {
    if (isLoggedIn) {
      setShowAddServiceDialog(true);
    } else {
      setShowAuthDialog(true);
    }
  };

  return (
    <div>
      <CategorySelection 
        categories={serviceCategories}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        showAllCategoriesInBar={false}
      />
      
      <ServicesFilters 
        viewMode={viewMode}
        selectedLocation={selectedLocation}
        filteredCount={filteredServices.length}
        onViewModeChange={setViewMode}
        onLocationClear={() => setSelectedLocation('')}
      />
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className={`lg:w-64 space-y-6 ${viewMode === 'filters' ? 'block' : 'hidden lg:block'}`}>
          <MarketplaceFilters
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            minPrice={minPrice}
            maxPrice={maxPrice}
            showTestingOnly={false}
            setShowTestingOnly={() => {}}
            selectedConditions={[]}
            setSelectedConditions={() => {}}
            maxProductPrice={5000}
            handlePriceInputChange={handlePriceInputChange}
            handleApplyFilters={() => {}}
            productConditions={[]}
            showConditionFilter={false}
            showTestingFilter={false}
          />
        </div>
        
        <div className={`flex-1 ${viewMode === 'grid' ? 'block' : 'hidden lg:block'}`}>
          <ServicesSearch 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddServiceClick={handleAddServiceClick}
          />
          
          <ServicesList 
            services={getCurrentPageServices()}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            favorites={favorites}
            onPageChange={handlePageChange}
            onToggleFavorite={toggleFavorite}
            onAddServiceClick={handleAddServiceClick}
          />
        </div>
      </div>
      
      <AddServiceFormDialog
        open={showAddServiceDialog}
        onOpenChange={setShowAddServiceDialog}
      />
      
      <AuthRequiredDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
        title="Wymagane logowanie"
        description="Aby dodać usługę do rynku, musisz być zalogowany."
      />
    </div>
  );
}
