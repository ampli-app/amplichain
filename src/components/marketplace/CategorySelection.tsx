
import { useState } from 'react';
import { CategoryDialog } from './categories/CategoryDialog';
import { CategoryButton } from './categories/CategoryButton';
import { ScrollableCategories } from './categories/ScrollableCategories';

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

export function CategorySelection({
  categories,
  selectedCategory,
  onCategorySelect,
  showAllCategoriesInBar = true,
}: CategorySelectionProps) {
  const [open, setOpen] = useState(false);

  // Przygotowanie listy kategorii (bez "Wszystkie", które będzie osobnym przyciskiem)
  const filteredCategories = showAllCategoriesInBar
    ? categories.filter(cat => cat.id !== 'all')
    : categories.filter(cat => cat.id !== 'all');

  return (
    <div className="mb-6">
      <CategoryDialog
        categories={filteredCategories}
        selectedCategory={selectedCategory}
        onCategorySelect={onCategorySelect}
        open={open}
        setOpen={setOpen}
      />
      
      <ScrollableCategories>
        {filteredCategories.map((category) => (
          <CategoryButton
            key={category.id}
            id={category.id}
            name={category.name}
            isSelected={selectedCategory === category.id}
            onClick={() => onCategorySelect(category.id)}
          />
        ))}
      </ScrollableCategories>
    </div>
  );
}
