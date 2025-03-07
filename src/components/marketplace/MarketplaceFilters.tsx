
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { SlidersHorizontal, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MarketplaceFiltersProps {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  minPrice: string;
  setMinPrice: (price: string) => void;
  maxPrice: string;
  setMaxPrice: (price: string) => void;
  showTestingOnly: boolean;
  setShowTestingOnly: (value: boolean) => void;
  selectedConditions: string[];
  setSelectedConditions: (conditions: string[]) => void;
  maxProductPrice: number;
  handlePriceInputChange: () => void;
  handleApplyFilters: () => void;
  productConditions: string[];
  showConditionFilter?: boolean;
  showTestingFilter?: boolean;
}

export function MarketplaceFilters({
  priceRange,
  setPriceRange,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  showTestingOnly,
  setShowTestingOnly,
  selectedConditions,
  setSelectedConditions,
  maxProductPrice,
  handlePriceInputChange,
  handleApplyFilters,
  productConditions,
  showConditionFilter = true,
  showTestingFilter = true
}: MarketplaceFiltersProps) {
  const handleConditionChange = (condition: string, checked: boolean) => {
    if (checked) {
      // Create a new array with the condition added
      setSelectedConditions([...selectedConditions, condition]);
    } else {
      // Create a new array with the condition filtered out
      setSelectedConditions(selectedConditions.filter(c => c !== condition));
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Zakres cenowy
        </h3>
        <div className="pt-2 pb-2 px-1">
          <Slider
            defaultValue={[0, maxProductPrice]}
            value={priceRange}
            min={0}
            max={999999}
            step={1000}
            onValueChange={(value) => {
              setPriceRange(value as [number, number]);
              setMinPrice(value[0].toString());
              setMaxPrice(value[1].toString());
            }}
            className="my-6"
          />
          <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
            <span>{new Intl.NumberFormat('pl-PL', {
              style: 'currency',
              currency: 'PLN',
              maximumFractionDigits: 0
            }).format(priceRange[0])}</span>
            <span>
              {priceRange[1] >= 999999 
                ? "999 999+ PLN" 
                : new Intl.NumberFormat('pl-PL', {
                    style: 'currency',
                    currency: 'PLN',
                    maximumFractionDigits: 0
                  }).format(priceRange[1])
              }
            </span>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <div className="flex-1">
            <Label htmlFor="minPrice">Min</Label>
            <Input
              id="minPrice"
              placeholder="Min"
              className="text-sm"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={handlePriceInputChange}
              type="number"
              min="0"
              max="999999"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="maxPrice">Max</Label>
            <Input
              id="maxPrice"
              placeholder="Max"
              className="text-sm"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={handlePriceInputChange}
              type="number"
              min="0"
              max="999999"
            />
          </div>
        </div>
      </div>
      
      {showConditionFilter && (
        <div className="glass-card rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
          <h3 className="font-semibold mb-3">Stan</h3>
          <div className="space-y-2">
            {productConditions.map((condition) => (
              <div key={condition} className="flex items-center">
                <label className="flex items-center w-full cursor-pointer hover:text-primary transition-colors">
                  <input 
                    type="checkbox" 
                    className="mr-2 accent-primary"
                    checked={selectedConditions.includes(condition)}
                    onChange={(e) => handleConditionChange(condition, e.target.checked)}
                  />
                  {condition}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {showTestingFilter && (
        <div className="glass-card rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Wypróbuj przed zakupem
          </h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <label className="flex items-center w-full cursor-pointer hover:text-primary transition-colors">
                <input 
                  type="checkbox" 
                  className="mr-2 accent-primary"
                  checked={showTestingOnly}
                  onChange={(e) => setShowTestingOnly(e.target.checked)}
                />
                Dostępne do testów
              </label>
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              <p>Wypróbuj sprzęt przez tydzień przed podjęciem decyzji o zakupie.</p>
              <div className="flex items-center mt-2">
                <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
                  Wynajem tygodniowy
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Button className="w-full" onClick={handleApplyFilters}>Zastosuj filtry</Button>
    </div>
  );
}
