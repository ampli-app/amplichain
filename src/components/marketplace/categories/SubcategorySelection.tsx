
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollableCategories } from './ScrollableCategories';
import { CategoryButton } from './CategoryButton';
import { Subcategory } from '../types';
import { Loader2 } from 'lucide-react';

interface SubcategorySelectionProps {
  categoryId: string | null;
  selectedSubcategory: string | null;
  onSubcategorySelect: (subcategoryId: string | null) => void;
}

export function SubcategorySelection({
  categoryId,
  selectedSubcategory,
  onSubcategorySelect
}: SubcategorySelectionProps) {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categoryId) {
      fetchSubcategories(categoryId);
    } else {
      setSubcategories([]);
    }
  }, [categoryId]);

  const fetchSubcategories = async (categoryId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryId)
        .order('name');

      if (error) {
        console.error('Błąd podczas pobierania podkategorii:', error);
        return;
      }

      setSubcategories(data || []);
    } catch (err) {
      console.error('Nieoczekiwany błąd:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!categoryId) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (subcategories.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 mb-6">
      <ScrollableCategories>
        <CategoryButton
          key="all-subcategories"
          id={null}
          name="Wszystkie podkategorie"
          isSelected={selectedSubcategory === null}
          onClick={() => onSubcategorySelect(null)}
        />
        {subcategories.map((subcategory) => (
          <CategoryButton
            key={subcategory.id}
            id={subcategory.id}
            name={subcategory.name}
            isSelected={selectedSubcategory === subcategory.id}
            onClick={() => onSubcategorySelect(subcategory.id)}
          />
        ))}
      </ScrollableCategories>
    </div>
  );
}
