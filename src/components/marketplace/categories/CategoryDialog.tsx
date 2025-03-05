
import { Button } from '@/components/ui/button';
import { FilterIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryIcon } from '../icons/CategoryIcon';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface CategoryDialogProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function CategoryDialog({
  categories,
  selectedCategory,
  onCategorySelect,
  open,
  setOpen
}: CategoryDialogProps) {
  const handleCategorySelect = (categoryId: string) => {
    onCategorySelect(categoryId);
    setOpen(false);
  };

  return (
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
          {categories.map((category) => (
            <Card 
              key={category.id} 
              className={`cursor-pointer hover:border-primary transition-colors ${selectedCategory === category.id ? 'border-primary bg-primary/5' : ''}`}
              onClick={() => handleCategorySelect(category.id)}
            >
              <CardContent className="p-4 flex items-center justify-center text-center h-full">
                <div className="flex flex-col items-center gap-2">
                  <CategoryIcon categoryName={category.name} />
                  <span>{category.name}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
