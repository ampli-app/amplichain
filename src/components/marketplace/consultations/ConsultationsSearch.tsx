
import { Search, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ConsultationsSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddConsultationClick: () => void;
}

export function ConsultationsSearch({
  searchQuery,
  onSearchChange,
  onAddConsultationClick
}: ConsultationsSearchProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Szukaj konsultacji..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <Button onClick={onAddConsultationClick}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Dodaj konsultację
      </Button>
    </div>
  );
}
