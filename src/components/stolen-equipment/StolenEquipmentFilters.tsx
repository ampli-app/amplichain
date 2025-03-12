
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface StolenEquipmentFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStatus: string[];
  setSelectedStatus: (status: string[]) => void;
  onReportClick: () => void;
}

export function StolenEquipmentFilters({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  onReportClick
}: StolenEquipmentFiltersProps) {
  const toggleStatus = (status: string) => {
    if (selectedStatus.includes(status)) {
      setSelectedStatus(selectedStatus.filter(s => s !== status));
    } else {
      setSelectedStatus([...selectedStatus, status]);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Filtry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="search">Szukaj</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                id="search"
                placeholder="Szukaj po nazwie, opisie..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="verified" 
                  checked={selectedStatus.includes('verified')}
                  onCheckedChange={() => toggleStatus('verified')}
                />
                <Label htmlFor="verified" className="cursor-pointer">Zweryfikowany</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="unverified" 
                  checked={selectedStatus.includes('unverified')}
                  onCheckedChange={() => toggleStatus('unverified')}
                />
                <Label htmlFor="unverified" className="cursor-pointer">Oczekuje weryfikacji</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="recovered" 
                  checked={selectedStatus.includes('recovered')}
                  onCheckedChange={() => toggleStatus('recovered')}
                />
                <Label htmlFor="recovered" className="cursor-pointer">Odzyskany</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <Button 
            className="w-full" 
            onClick={onReportClick}
          >
            Zgłoś kradzież
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
