
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ConsultationFormData } from './types';

interface ConsultationLocationOptionsProps {
  formData: ConsultationFormData;
  onChange: (field: keyof ConsultationFormData, value: any) => void;
}

export function ConsultationLocationOptions({ formData, onChange }: ConsultationLocationOptionsProps) {
  const { isOnline, isInPerson, location } = formData;
  
  return (
    <div className="grid gap-3">
      <Label>Sposób prowadzenia konsultacji</Label>
      <div className="flex flex-col gap-4">
        <div className="flex items-center space-x-2">
          <Switch 
            checked={isOnline} 
            onCheckedChange={(checked) => onChange('isOnline', checked)}
            id="online"
          />
          <Label htmlFor="online" className="font-normal cursor-pointer">Online (zdalna)</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            checked={isInPerson} 
            onCheckedChange={(checked) => onChange('isInPerson', checked)}
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
              onChange={(e) => onChange('location', e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
