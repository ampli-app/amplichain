
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  Mic, 
  Music, 
  Music2, 
  Monitor, 
  Gamepad2, 
  Package, 
  Laptop, 
  ListFilter, 
  Headphones,
  Guitar,
  Settings,
  Briefcase
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";

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
}

export function CategorySelection({ categories, selectedCategory, onCategorySelect }: CategorySelectionProps) {
  const [showCategoriesDialog, setShowCategoriesDialog] = useState(false);

  const getCategoryIcon = (categoryName: string) => {
    switch(categoryName.toLowerCase()) {
      case 'akcesoria':
        return <Package className="h-5 w-5" />;
      case 'gitary':
        return <Guitar className="h-5 w-5" />;
      case 'instrumenty':
        return <Music className="h-5 w-5" />;
      case 'interfejsy audio':
        return <Music2 className="h-5 w-5" />;
      case 'kontrolery':
        return <Gamepad2 className="h-5 w-5" />;
      case 'mikrofony':
        return <Mic className="h-5 w-5" />;
      case 'monitory':
        return <Monitor className="h-5 w-5" />;
      case 'słuchawki':
        return <Headphones className="h-5 w-5" />;
      case 'oprogramowanie':
        return <Laptop className="h-5 w-5" />;
      case 'studio nagrań':
        return <Mic className="h-5 w-5" />;
      case 'mix i mastering':
        return <Settings className="h-5 w-5" />;
      case 'produkcja muzyczna':
        return <Music className="h-5 w-5" />;
      case 'lekcje muzyki':
        return <Music2 className="h-5 w-5" />;
      case 'kompozycja':
        return <Music className="h-5 w-5" />;
      case 'aranżacja':
        return <Music2 className="h-5 w-5" />;
      case 'występy na żywo':
        return <Mic className="h-5 w-5" />;
      case 'wynajem sprzętu':
        return <Package className="h-5 w-5" />;
      case 'naprawa instrumentów':
        return <Settings className="h-5 w-5" />;
      case 'usługi':
        return <Briefcase className="h-5 w-5" />;
      default:
        return <ListFilter className="h-5 w-5" />;
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    onCategorySelect(categoryId);
    setShowCategoriesDialog(false);
  };

  return (
    <div className="flex flex-col items-start gap-2 mb-4">
      {/* Przycisk "Wszystkie kategorie" nad belką z kategoriami */}
      <Button
        variant="outline"
        className="flex gap-2 items-center self-start"
        onClick={() => setShowCategoriesDialog(true)}
      >
        <ListFilter className="h-5 w-5" />
        <span>Wszystkie kategorie</span>
      </Button>
      
      <div className="w-full bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-sm mb-1 rounded-md overflow-hidden">
        <div className="flex overflow-x-auto py-2 px-1">
          {categories.slice(0, 7).map((category) => (
            <Button 
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              className="flex-shrink-0 flex gap-2 items-center h-10 px-4 py-2 mx-1"
              onClick={() => onCategorySelect(category.id)}
            >
              {getCategoryIcon(category.name)}
              <span>{category.name}</span>
            </Button>
          ))}
        </div>
      </div>
      
      <Dialog open={showCategoriesDialog} onOpenChange={setShowCategoriesDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Wszystkie kategorie</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {categories.map((category) => (
              <div 
                key={category.id}
                className={`rounded-lg border p-4 cursor-pointer transition-all 
                ${selectedCategory === category.id 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:border-primary hover:text-primary"}
                `}
                onClick={() => handleCategorySelect(category.id)}
              >
                <div className="flex items-center gap-2">
                  {getCategoryIcon(category.name)}
                  <span className="font-medium">{category.name}</span>
                </div>
                {category.description && (
                  <p className="text-xs mt-1 opacity-80">{category.description}</p>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
