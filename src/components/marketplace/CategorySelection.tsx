
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  // Dodaj kategorię "Wszystkie"
  const allCategories = showAllCategoriesInBar
    ? [{ id: 'all', name: 'Wszystkie', slug: 'all-categories', description: null }, ...categories]
    : categories;

  // Ogranicz liczbę kategorii, jeśli potrzeba
  const limitedCategories = allCategories.slice(0, maxCategories);

  return (
    <div className="mb-6 bg-background border rounded-lg overflow-hidden">
      <ScrollArea className="w-full">
        <div className="flex justify-center p-1">
          <div className="flex space-x-1 flex-nowrap">
            {limitedCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === (category.id === 'all' ? '' : category.id) ? 'default' : 'outline'}
                className="whitespace-nowrap"
                onClick={() => onCategorySelect(category.id === 'all' ? '' : category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
