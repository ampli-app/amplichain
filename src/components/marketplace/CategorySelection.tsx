
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FilterIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';

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
  const [open, setOpen] = useState(false);

  // Przygotowanie listy kategorii (bez "Wszystkie", które będzie osobnym przyciskiem)
  const filteredCategories = showAllCategoriesInBar
    ? categories.filter(cat => cat.id !== 'all')
    : categories.filter(cat => cat.id !== 'all');
  
  // Ogranicz liczbę kategorii, jeśli potrzeba
  const limitedCategories = filteredCategories.slice(0, maxCategories);

  const handleCategorySelect = (categoryId: string) => {
    onCategorySelect(categoryId);
    setOpen(false);
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
                  <div>
                    {category.name}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
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
