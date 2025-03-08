
import { FilterX, LayoutGrid, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ConsultationsFiltersProps {
  viewMode: 'grid' | 'filters';
  selectedCategory?: string;
  selectedContactMethods?: string[];
  filteredCount: number;
  onViewModeChange: (mode: 'grid' | 'filters') => void;
  onCategoryClear?: () => void;
  onContactMethodsClear?: () => void;
}

export function ConsultationsFilters({
  viewMode,
  selectedCategory,
  selectedContactMethods = [],
  filteredCount,
  onViewModeChange,
  onCategoryClear,
  onContactMethodsClear
}: ConsultationsFiltersProps) {
  const hasFilters = selectedCategory || (selectedContactMethods && selectedContactMethods.length > 0);
  
  const getContactMethodName = (method: string) => {
    switch (method) {
      case 'video': return 'Wideorozmowa';
      case 'phone': return 'Telefon';
      case 'chat': return 'Chat';
      default: return method;
    }
  };
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Znaleziono {filteredCount} {filteredCount === 1 ? 'konsultację' : 
            filteredCount > 1 && filteredCount < 5 ? 'konsultacje' : 'konsultacji'}
        </span>
        
        {hasFilters && (
          <div className="flex flex-wrap gap-2 ml-2">
            {selectedCategory && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Kategoria: {selectedCategory}
                <button 
                  className="ml-1 hover:text-destructive"
                  onClick={onCategoryClear}
                >
                  <FilterX className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {selectedContactMethods && selectedContactMethods.map(method => (
              <Badge key={method} variant="secondary" className="flex items-center gap-1">
                {getContactMethodName(method)}
                <button 
                  className="ml-1 hover:text-destructive"
                  onClick={() => onContactMethodsClear && onContactMethodsClear()}
                >
                  <FilterX className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      <div className="hidden sm:flex lg:hidden gap-2">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('grid')}
        >
          <LayoutGrid className="h-4 w-4 mr-2" />
          Siatka
        </Button>
        <Button
          variant={viewMode === 'filters' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('filters')}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filtry
        </Button>
      </div>
    </div>
  );
}
