
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConsultationFormData } from './types';
import { Plus, Tag, X } from 'lucide-react';

interface ConsultationTagsProps {
  formData: ConsultationFormData;
  onChange: (field: keyof ConsultationFormData, value: any) => void;
}

export function ConsultationTags({ formData, onChange }: ConsultationTagsProps) {
  const [tagInput, setTagInput] = useState('');
  const { tags } = formData;
  
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      onChange('tags', [...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    onChange('tags', tags.filter(tag => tag !== tagToRemove));
  };
  
  return (
    <div className="grid gap-3">
      <Label>Tagi (słowa kluczowe)</Label>
      <div className="flex gap-2">
        <Input 
          placeholder="Dodaj tag i naciśnij Enter"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
        />
        <Button type="button" size="icon" onClick={addTag}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map(tag => (
            <Badge key={tag} variant="secondary" className="px-2 py-1 gap-1">
              <Tag className="h-3 w-3" />
              {tag}
              <button 
                className="ml-1 hover:text-destructive"
                onClick={() => removeTag(tag)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
