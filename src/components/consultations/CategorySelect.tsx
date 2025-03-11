
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  category_id: string;
}

interface CategorySelectProps {
  categoryId: string | undefined;
  setCategoryId: (id: string) => void;
  subcategoryId: string | undefined;
  setSubcategoryId: (id: string) => void;
}

export function CategorySelect({
  categoryId,
  setCategoryId,
  subcategoryId,
  setSubcategoryId
}: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [availableSubcategories, setAvailableSubcategories] = useState<Subcategory[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  useEffect(() => {
    if (categoryId) {
      setAvailableSubcategories(subcategories.filter(sub => sub.category_id === categoryId));
      if (subcategoryId && !subcategories.find(sub => sub.id === subcategoryId && sub.category_id === categoryId)) {
        setSubcategoryId('');
      }
    } else {
      setAvailableSubcategories([]);
      setSubcategoryId('');
    }
  }, [categoryId, subcategories]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('consultation_categories')
      .select('*')
      .order('name');

    if (!error && data) {
      setCategories(data);
    }
  };

  const fetchSubcategories = async () => {
    const { data, error } = await supabase
      .from('consultation_subcategories')
      .select('*')
      .order('name');

    if (!error && data) {
      setSubcategories(data);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <Label htmlFor="category">Kategoria konsultacji</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Wybierz kategorię" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {categoryId && (
        <div className="grid gap-3">
          <Label htmlFor="subcategory">Podkategoria</Label>
          <Select value={subcategoryId} onValueChange={setSubcategoryId}>
            <SelectTrigger id="subcategory">
              <SelectValue placeholder="Wybierz podkategorię" />
            </SelectTrigger>
            <SelectContent>
              {availableSubcategories.map((subcategory) => (
                <SelectItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
