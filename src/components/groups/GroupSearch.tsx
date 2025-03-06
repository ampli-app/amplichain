
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface GroupSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function GroupSearch({ searchQuery, setSearchQuery }: GroupSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        placeholder="Szukaj grup..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 h-12 text-base"
      />
    </div>
  );
}
