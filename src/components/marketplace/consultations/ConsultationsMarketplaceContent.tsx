
import { useState } from 'react';
import { CategorySelection } from '@/components/marketplace/CategorySelection';
import { MarketplaceFilters } from '@/components/marketplace/MarketplaceFilters';
import { ConsultationsSearch } from './ConsultationsSearch';
import { ConsultationsFilters } from './ConsultationsFilters';
import { ConsultationsList } from './ConsultationsList';
import { useConsultationsFetch } from './hooks/useConsultationsFetch';
import { useConsultationsFavorites } from './hooks/useConsultationsFavorites';
import { useConsultationsFilters } from './hooks/useConsultationsFilters';
import { AddConsultationDialog } from '@/components/AddConsultationDialog';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';
import { useAuth } from '@/contexts/AuthContext';

const consultationCategories = [
  { id: 'composition', name: 'Kompozycja', slug: 'composition', description: null },
  { id: 'arrangement', name: 'Aranżacja', slug: 'arrangement', description: null },
  { id: 'production', name: 'Produkcja muzyczna', slug: 'production', description: null },
  { id: 'mixing', name: 'Mix i mastering', slug: 'mixing', description: null },
  { id: 'theory', name: 'Teoria muzyki', slug: 'theory', description: null },
  { id: 'recording', name: 'Nagrywanie', slug: 'recording', description: null },
  { id: 'vocals', name: 'Wokal', slug: 'vocals', description: null }
];

export function ConsultationsMarketplaceContent() {
  const { isLoggedIn } = useAuth();
  const { consultations, loading } = useConsultationsFetch();
  const { favorites, toggleFavorite } = useConsultationsFavorites();
  const [viewMode, setViewMode] = useState<'grid' | 'filters'>('grid');
  const [showAddConsultationDialog, setShowAddConsultationDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    priceRange,
    setPriceRange,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    filteredConsultations,
    currentPage,
    totalPages,
    handlePriceInputChange,
    handleCategorySelect,
    handlePageChange,
    getCurrentPageConsultations,
    handleApplyFilters
  } = useConsultationsFilters({ consultations });

  const handleAddConsultationClick = () => {
    if (isLoggedIn) {
      setShowAddConsultationDialog(true);
    } else {
      setShowAuthDialog(true);
    }
  };

  // Definiujemy funkcję zaślepkę dla handleApplyFilters aby móc ją przekazać jako prop
  const applyFilters = () => {
    handleApplyFilters();
  };

  return (
    <div>
      <CategorySelection 
        categories={consultationCategories}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        showAllCategoriesInBar={false}
      />
      
      <ConsultationsFilters 
        viewMode={viewMode}
        selectedCategory={selectedCategory || undefined}
        filteredCount={filteredConsultations.length}
        onViewModeChange={setViewMode}
        onCategoryClear={() => handleCategorySelect(null)}
      />
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className={`lg:w-64 space-y-6 ${viewMode === 'filters' ? 'block' : 'hidden lg:block'}`}>
          <MarketplaceFilters
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            showTestingOnly={false}
            setShowTestingOnly={() => {}}
            selectedConditions={[]}
            setSelectedConditions={() => {}}
            maxProductPrice={2000}
            handlePriceInputChange={handlePriceInputChange}
            handleApplyFilters={applyFilters}
            productConditions={[]}
            showConditionFilter={false}
            showTestingFilter={false}
          />
        </div>
        
        <div className={`flex-1 ${viewMode === 'grid' ? 'block' : 'hidden lg:block'}`}>
          <ConsultationsSearch 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddConsultationClick={handleAddConsultationClick}
          />
          
          <ConsultationsList 
            consultations={getCurrentPageConsultations()}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            favorites={favorites}
            onPageChange={handlePageChange}
            onToggleFavorite={toggleFavorite}
            onAddConsultationClick={handleAddConsultationClick}
          />
        </div>
      </div>
      
      <AddConsultationDialog
        open={showAddConsultationDialog}
        onOpenChange={setShowAddConsultationDialog}
      />
      
      <AuthRequiredDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
        title="Wymagane logowanie"
        description="Aby dodać konsultację do rynku, musisz być zalogowany."
      />
    </div>
  );
}
