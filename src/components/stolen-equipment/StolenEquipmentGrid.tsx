
import { useState } from 'react';
import { Search, Filter, Grid3X3, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StolenEquipmentCard } from './StolenEquipmentCard';

interface StolenEquipmentItem {
  id: string;
  title: string;
  location: string;
  date: string;
  description: string;
  image: string;
  status: 'verified' | 'unverified' | 'recovered';
  category: string;
}

interface StolenEquipmentGridProps {
  items: StolenEquipmentItem[];
  onReportClick: () => void;
  viewMode: 'grid' | 'filters';
  setViewMode: (mode: 'grid' | 'filters') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function StolenEquipmentGrid({
  items,
  onReportClick,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery
}: StolenEquipmentGridProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Szukaj po nazwie, opisie..."
            className="pl-10 pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full"
              onClick={() => setSearchQuery('')}
            >
              ×
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setViewMode('filters')}
            className="lg:hidden"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {items.length === 0 ? (
        <div className="text-center py-12 border rounded-md">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">Nie znaleziono sprzętu</h3>
          <p className="text-muted-foreground mb-6">
            Spróbuj zmienić kryteria wyszukiwania lub zgłoś kradzież sprzętu
          </p>
          <Button onClick={onReportClick}>
            Zgłoś kradzież
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <StolenEquipmentCard key={item.id} item={item} />
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            <Button variant="outline">Załaduj więcej</Button>
          </div>
        </>
      )}
    </div>
  );
}
