
import { Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

interface ServicesFiltersProps {
  viewMode: 'grid' | 'filters';
  selectedLocation: string;
  filteredCount: number;
  onViewModeChange: (mode: 'grid' | 'filters') => void;
  onLocationClear: () => void;
}

export function ServicesFilters({
  viewMode,
  selectedLocation,
  filteredCount,
  onViewModeChange,
  onLocationClear,
}: ServicesFiltersProps) {
  // Funkcja do określenia tekstu wyników
  const getProperResultsText = (count: number) => {
    if (count === 0) return "wyników";
    if (count === 1) return "wynik";
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 > 20)) return "wyniki";
    return "wyników";
  };

  return (
    <>
      <div className="lg:hidden mb-4">
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'filters' ? 'default' : 'outline'} 
            className="flex-1" 
            onClick={() => onViewModeChange('filters')}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtry
          </Button>
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'outline'} 
            className="flex-1" 
            onClick={() => onViewModeChange('grid')}
          >
            <Search className="h-4 w-4 mr-2" />
            Przeglądaj
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {selectedLocation && (
          <Badge variant="outline" className="px-3 py-1">
            <MapPin className="h-3 w-3 mr-1" /> {selectedLocation}
            <button 
              className="ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              onClick={onLocationClear}
            >
              &times;
            </button>
          </Badge>
        )}
        
        <span className="text-sm text-muted-foreground ml-2">
          {filteredCount} {getProperResultsText(filteredCount)}
        </span>
      </div>
    </>
  );
}
