
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FilterIcon } from 'lucide-react';

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
  maxCategories?: number;
}

export function CategorySelection({
  categories,
  selectedCategory,
  onCategorySelect,
  showAllCategoriesInBar = true,
  maxCategories = 6
}: CategorySelectionProps) {
  // Dodaj kategorię "Wszystkie" jako oddzielny przycisk
  const showAllCategoriesButton = true;
  
  // Przygotowanie listy kategorii (bez "Wszystkie", które będzie osobnym przyciskiem)
  const filteredCategories = showAllCategoriesInBar
    ? categories.filter(cat => cat.id !== 'all')
    : categories.filter(cat => cat.id !== 'all');
  
  // Ogranicz liczbę kategorii, jeśli potrzeba
  const limitedCategories = filteredCategories.slice(0, maxCategories);

  return (
    <div className="mb-6">
      {showAllCategoriesButton && (
        <Button
          variant={selectedCategory === '' ? 'default' : 'outline'}
          className="mb-4 flex items-center"
          onClick={() => onCategorySelect('')}
        >
          <FilterIcon className="mr-2 h-4 w-4" />
          Wszystkie kategorie
        </Button>
      )}
      
      <div className="bg-background border rounded-lg overflow-hidden">
        <ScrollArea className="w-full">
          <div className="flex p-2">
            <div className="flex space-x-2 flex-nowrap">
              {limitedCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  className="whitespace-nowrap"
                  onClick={() => onCategorySelect(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
