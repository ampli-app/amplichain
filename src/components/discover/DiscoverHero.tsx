
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export interface DiscoverHeroProps {
  onSearch: (query: string) => void;
}

export function DiscoverHero({ onSearch }: DiscoverHeroProps) {
  return (
    <div className="w-full mb-8">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          className="w-full pl-10 py-6 text-base"
          placeholder="Czego szukasz? Sprzęt, usługi, współpraca, projekty..."
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  );
}
