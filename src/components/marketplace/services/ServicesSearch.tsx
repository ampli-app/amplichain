
import { Search, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ServicesSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddServiceClick: () => void;
}

export function ServicesSearch({ 
  searchQuery, 
  onSearchChange, 
  onAddServiceClick 
}: ServicesSearchProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
        <Input 
          placeholder="Szukaj usług..." 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <Button onClick={onAddServiceClick}>
        <Briefcase className="h-4 w-4 mr-2" />
        Dodaj swoją usługę
      </Button>
    </div>
  );
}
