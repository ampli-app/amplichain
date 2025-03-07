
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ConnectionSearchProps {
  search: string;
  setSearch: (value: string) => void;
}

export function ConnectionSearch({ search, setSearch }: ConnectionSearchProps) {
  return (
    <div className="mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          className="pl-10"
          placeholder="Szukaj połączeń..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </div>
  );
}
