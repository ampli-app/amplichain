
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CategorySelect } from './CategorySelect';

interface BasicInfoSectionProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  categoryId: string | undefined;
  setCategoryId: (value: string) => void;
  subcategoryId: string | undefined;
  setSubcategoryId: (value: string) => void;
}

export function BasicInfoSection({
  title,
  setTitle,
  description,
  setDescription,
  price,
  setPrice,
  categoryId,
  setCategoryId,
  subcategoryId,
  setSubcategoryId,
}: BasicInfoSectionProps) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <Label htmlFor="title">Tytuł oferty konsultacji</Label>
        <Input 
          id="title" 
          placeholder="np. Konsultacje z zakresu produkcji muzycznej"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      
      <CategorySelect
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        subcategoryId={subcategoryId}
        setSubcategoryId={setSubcategoryId}
      />
      
      <div className="grid gap-3">
        <Label htmlFor="description">Opis konsultacji</Label>
        <Textarea 
          id="description" 
          placeholder="Opisz szczegółowo zakres swoich konsultacji, swoje doświadczenie i co uczestnik może zyskać..."
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      
      <div className="grid gap-3">
        <Label htmlFor="price">Cena (PLN)</Label>
        <Input 
          id="price" 
          type="number"
          placeholder="0.00"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="flex-1"
        />
      </div>
    </div>
  );
}
