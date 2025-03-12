
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Music, Tv2, Radio, Disc3, Headphones, Mic2, Guitar, Layers, BoomBox, FileAudio } from 'lucide-react';

interface CategoryInterface {
  id: string;
  name: string;
  icon: string;
}

interface StolenEquipmentCategoriesProps {
  categories: CategoryInterface[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Guitar':
      return <Guitar className="h-4 w-4" />;
    case 'Synth':
      return <Tv2 className="h-4 w-4" />;
    case 'Studio':
      return <Radio className="h-4 w-4" />;
    case 'Accessories':
      return <Disc3 className="h-4 w-4" />;
    case 'Interface':
      return <Layers className="h-4 w-4" />;
    case 'Controller':
      return <BoomBox className="h-4 w-4" />;
    case 'Microphone':
      return <Mic2 className="h-4 w-4" />;
    case 'Monitor':
      return <Headphones className="h-4 w-4" />;
    case 'Software':
      return <FileAudio className="h-4 w-4" />;
    case 'All':
    default:
      return <Music className="h-4 w-4" />;
  }
};

export function StolenEquipmentCategories({
  categories,
  selectedCategory,
  onCategorySelect
}: StolenEquipmentCategoriesProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap pb-4">
      <div className="flex space-x-2 py-4">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => onCategorySelect(category.id)}
          >
            {getIconComponent(category.icon)}
            {category.name}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
