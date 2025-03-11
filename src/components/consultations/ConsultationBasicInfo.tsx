
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConsultationFormData } from './types';

interface ConsultationBasicInfoProps {
  formData: ConsultationFormData;
  onChange: (field: keyof ConsultationFormData, value: any) => void;
}

export function ConsultationBasicInfo({ formData, onChange }: ConsultationBasicInfoProps) {
  const { title, description, price, priceType, experienceYears } = formData;
  
  return (
    <>
      <div className="grid gap-3">
        <Label htmlFor="title">Tytuł oferty konsultacji</Label>
        <Input 
          id="title" 
          placeholder="np. Konsultacje z zakresu produkcji muzycznej"
          value={title}
          onChange={(e) => onChange('title', e.target.value)}
        />
      </div>
      
      <div className="grid gap-3">
        <Label htmlFor="description">Opis konsultacji</Label>
        <Textarea 
          id="description" 
          placeholder="Opisz szczegółowo zakres swoich konsultacji, swoje doświadczenie i co uczestnik może zyskać..."
          rows={4}
          value={description}
          onChange={(e) => onChange('description', e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-3">
          <Label htmlFor="price">Cena</Label>
          <div className="flex gap-2">
            <Input 
              id="price" 
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => onChange('price', e.target.value)}
              className="flex-1"
            />
            <Select value={priceType} onValueChange={(value) => onChange('priceType', value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Wybierz typ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="za godzinę">za godzinę</SelectItem>
                <SelectItem value="za sesję">za sesję</SelectItem>
                <SelectItem value="za projekt">za projekt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid gap-3">
          <Label htmlFor="experience">Lata doświadczenia</Label>
          <Input 
            id="experience" 
            type="number"
            placeholder="np. 5"
            min="0"
            value={experienceYears}
            onChange={(e) => onChange('experienceYears', e.target.value)}
          />
        </div>
      </div>
    </>
  );
}
