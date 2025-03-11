
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

// Kategorie konsultacji
const consultationCategories = [
  { id: 'composition', name: 'Kompozycja' },
  { id: 'arrangement', name: 'Aranżacja' },
  { id: 'production', name: 'Produkcja muzyczna' },
  { id: 'mixing', name: 'Mix i mastering' },
  { id: 'instruments', name: 'Instrumenty muzyczne' },
  { id: 'vocals', name: 'Wokal' },
  { id: 'theory', name: 'Teoria muzyki' },
  { id: 'recording', name: 'Nagrywanie' },
  { id: 'live_sound', name: 'Realizacja dźwięku na żywo' }
];

interface CategoriesSectionProps {
  selectedCategories: string[];
  toggleCategory: (category: string) => void;
}

export function CategoriesSection({
  selectedCategories,
  toggleCategory,
}: CategoriesSectionProps) {
  return (
    <div className="grid gap-3">
      <Label>Kategorie konsultacji</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {consultationCategories.map(category => (
          <div 
            key={category.id}
            className="flex items-center space-x-2"
          >
            <Checkbox 
              id={`category-${category.id}`}
              checked={selectedCategories.includes(category.name)}
              onCheckedChange={() => toggleCategory(category.name)}
            />
            <Label 
              htmlFor={`category-${category.id}`}
              className="font-normal cursor-pointer"
            >
              {category.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
