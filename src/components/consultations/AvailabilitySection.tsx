
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

interface AvailabilitySectionProps {
  isOnline: boolean;
  setIsOnline: (value: boolean) => void;
  isInPerson: boolean;
  setIsInPerson: (value: boolean) => void;
  location: string;
  setLocation: (value: string) => void;
}

export function AvailabilitySection({
  isOnline,
  setIsOnline,
  isInPerson,
  setIsInPerson,
  location,
  setLocation,
}: AvailabilitySectionProps) {
  return (
    <div className="grid gap-3">
      <Label>Sposób prowadzenia konsultacji</Label>
      <div className="flex flex-col gap-4">
        <div className="flex items-center space-x-2">
          <Switch 
            checked={isOnline} 
            onCheckedChange={setIsOnline}
            id="online"
          />
          <Label htmlFor="online" className="font-normal cursor-pointer">Online (zdalna)</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            checked={isInPerson} 
            onCheckedChange={setIsInPerson}
            id="in-person"
          />
          <Label htmlFor="in-person" className="font-normal cursor-pointer">Stacjonarnie</Label>
        </div>
        
        {isInPerson && (
          <div className="pl-6 pt-2">
            <Label htmlFor="location" className="mb-2 block">Lokalizacja</Label>
            <Input 
              id="location" 
              placeholder="np. Warszawa, Kraków"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
