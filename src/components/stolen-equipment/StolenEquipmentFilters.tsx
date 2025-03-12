
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface Category {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
}

interface StolenEquipmentFiltersProps {
  categories: Category[];
  locations: Location[];
  selectedCategory: string | null;
  setSelectedCategory: (categoryId: string | null) => void;
  selectedLocation: string | null;
  setSelectedLocation: (location: string | null) => void;
  selectedStatus: string | null;
  setSelectedStatus: (status: string | null) => void;
  onResetFilters: () => void;
}

export function StolenEquipmentFilters({
  categories,
  locations,
  selectedCategory,
  setSelectedCategory,
  selectedLocation,
  setSelectedLocation,
  selectedStatus,
  setSelectedStatus,
  onResetFilters
}: StolenEquipmentFiltersProps) {
  
  // State for mobile collapsibles
  const allOpen = true; // We can make this useState(false) later if needed
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-4">Filtry</h3>
        <Button 
          variant="ghost" 
          className="text-sm text-muted-foreground mb-2"
          onClick={onResetFilters}
        >
          Wyczyść wszystkie filtry
        </Button>
      </div>
      
      <Separator />
      
      {/* Status filter */}
      <Collapsible open={allOpen} className="space-y-2">
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-medium">
          Status
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <RadioGroup 
            value={selectedStatus || ""} 
            onValueChange={(value) => setSelectedStatus(value || null)}
            className="mt-2 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="status-all" />
              <Label htmlFor="status-all">Wszystkie</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="verified" id="status-verified" />
              <Label htmlFor="status-verified">Zweryfikowane</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unverified" id="status-unverified" />
              <Label htmlFor="status-unverified">Niezweryfikowane</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="recovered" id="status-recovered" />
              <Label htmlFor="status-recovered">Odzyskane</Label>
            </div>
          </RadioGroup>
        </CollapsibleContent>
      </Collapsible>
      
      <Separator />
      
      {/* Category filter */}
      <Collapsible open={allOpen} className="space-y-2">
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-medium">
          Kategoria
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <RadioGroup 
            value={selectedCategory || ""} 
            onValueChange={(value) => setSelectedCategory(value || null)}
            className="mt-2 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="category-all" />
              <Label htmlFor="category-all">Wszystkie kategorie</Label>
            </div>
            
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <RadioGroupItem value={category.id} id={`category-${category.id}`} />
                <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
              </div>
            ))}
          </RadioGroup>
        </CollapsibleContent>
      </Collapsible>
      
      <Separator />
      
      {/* Location filter */}
      <Collapsible open={allOpen} className="space-y-2">
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-medium">
          Lokalizacja
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <RadioGroup 
            value={selectedLocation || ""} 
            onValueChange={(value) => setSelectedLocation(value || null)}
            className="mt-2 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="location-all" />
              <Label htmlFor="location-all">Wszystkie lokalizacje</Label>
            </div>
            
            {locations.map((location) => (
              <div key={location.id} className="flex items-center space-x-2">
                <RadioGroupItem value={location.name} id={`location-${location.id}`} />
                <Label htmlFor={`location-${location.id}`}>{location.name}</Label>
              </div>
            ))}
          </RadioGroup>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
