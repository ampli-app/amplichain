
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FilterIcon, Music, Mic, Headphones, Guitar, Piano, Drum } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
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
  showAllCategoriesInBar = true
}: CategorySelectionProps) {
  const [open, setOpen] = useState(false);

  // Przygotowanie listy kategorii (bez "Wszystkie", które będzie osobnym przyciskiem)
  const filteredCategories = showAllCategoriesInBar
    ? categories.filter(cat => cat.id !== 'all')
    : categories.filter(cat => cat.id !== 'all');

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
      
      <div className="bg-background my-4">
        <ScrollArea className="w-full">
          <div className="flex p-2">
            <div className="flex space-x-2 flex-nowrap">
              {filteredCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  className="whitespace-nowrap rounded-full flex items-center gap-2 px-6"
                  onClick={() => onCategorySelect(category.id)}
                >
                  {getCategoryIcon(category.name)}
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
