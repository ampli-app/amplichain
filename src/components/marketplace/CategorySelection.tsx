
import { Button } from '@/components/ui/button';
import { FilterIcon, Music, Mic, Headphones, Guitar, Piano, Drum, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useRef, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface CategorySelectionProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
  showAllCategoriesInBar?: boolean;
}

// Funkcja pomocnicza, która przypisuje ikony do kategorii na podstawie nazwy
const getCategoryIcon = (categoryName: string) => {
  const lowerName = categoryName.toLowerCase();
  
  if (lowerName.includes('produkcj')) return <Music className="h-5 w-5" />;
  if (lowerName.includes('wokal')) return <Mic className="h-5 w-5" />;
  if (lowerName.includes('realizac')) return <Headphones className="h-5 w-5" />;
  if (lowerName.includes('gitar')) return <Guitar className="h-5 w-5" />;
  if (lowerName.includes('pianin') || lowerName.includes('keyboard')) return <Piano className="h-5 w-5" />;
  if (lowerName.includes('perkus') || lowerName.includes('bębn')) return <Drum className="h-5 w-5" />;
  
  // Domyślna ikona
  return <Music className="h-5 w-5" />;
};

export function CategorySelection({
  categories,
  selectedCategory,
  onCategorySelect,
  showAllCategoriesInBar = true,
}: CategorySelectionProps) {
  const [open, setOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Przygotowanie listy kategorii (bez "Wszystkie", które będzie osobnym przyciskiem)
  const filteredCategories = showAllCategoriesInBar
    ? categories.filter(cat => cat.id !== 'all')
    : categories.filter(cat => cat.id !== 'all');

  const handleCategorySelect = (categoryId: string) => {
    onCategorySelect(categoryId);
    setOpen(false);
  };

  // Funkcja do sprawdzania widoczności przycisków przewijania
  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth);
    }
  };

  // Obserwuj zmiany w przewijaniu
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollButtons);
      // Sprawdź początkowy stan
      checkScrollButtons();
      
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollButtons);
      };
    }
  }, [categories]);

  // Przewijanie w lewo i prawo
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-6">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="mb-4 flex items-center"
          >
            <FilterIcon className="mr-2 h-4 w-4" />
            Wszystkie kategorie
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>Wybierz kategorię</DialogTitle>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 py-4">
            {filteredCategories.map((category) => (
              <Card 
                key={category.id} 
                className={`cursor-pointer hover:border-primary transition-colors ${selectedCategory === category.id ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => handleCategorySelect(category.id)}
              >
                <CardContent className="p-4 flex items-center justify-center text-center h-full">
                  <div className="flex flex-col items-center gap-2">
                    {getCategoryIcon(category.name)}
                    <span>{category.name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="bg-background my-4 relative">
        {showLeftArrow && (
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md bg-background"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        
        <div className="relative overflow-hidden mx-8">
          <div 
            className="flex space-x-2 overflow-x-auto py-2 scrollbar-hide"
            ref={scrollContainerRef}
            onScroll={checkScrollButtons}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                className="whitespace-nowrap rounded-full flex items-center gap-2 px-6 flex-shrink-0"
                onClick={() => onCategorySelect(category.id)}
              >
                {getCategoryIcon(category.name)}
                {category.name}
              </Button>
            ))}
          </div>
        </div>
        
        {showRightArrow && (
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md bg-background"
            onClick={scrollRight}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
