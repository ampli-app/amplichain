
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  Music, 
  HeadphonesIcon, 
  Guitar, 
  Drum, 
  Piano,
  Users 
} from 'lucide-react';

interface GroupCategoryFilterProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export const groupCategories = [
  { id: "production", name: "Produkcja", icon: <Music className="h-4 w-4" /> },
  { id: "vocals", name: "Wokal", icon: <Mic className="h-4 w-4" /> },
  { id: "engineering", name: "Realizacja dźwięku", icon: <HeadphonesIcon className="h-4 w-4" /> },
  { id: "guitar", name: "Gitara", icon: <Guitar className="h-4 w-4" /> },
  { id: "piano", name: "Pianino", icon: <Piano className="h-4 w-4" /> },
  { id: "drums", name: "Perkusja", icon: <Drum className="h-4 w-4" /> },
  { id: "all", name: "Wszystkie", icon: <Users className="h-4 w-4" /> }
];

export function GroupCategoryFilter({ selectedCategory, setSelectedCategory }: GroupCategoryFilterProps) {
  return (
    <div className="flex overflow-x-auto py-2 gap-2 no-scrollbar">
      {groupCategories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          className="flex items-center gap-2 whitespace-nowrap"
          onClick={() => setSelectedCategory(category.id)}
        >
          {category.icon}
          <span>{category.name}</span>
        </Button>
      ))}
    </div>
  );
}
