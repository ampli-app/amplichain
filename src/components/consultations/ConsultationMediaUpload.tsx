
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MediaPreview, handleFileUpload } from '@/utils/mediaUtils';
import { ImageIcon } from 'lucide-react';
import { ConsultationFormData, MediaFile } from './types';

interface ConsultationMediaUploadProps {
  formData: ConsultationFormData;
  onChange: (field: keyof ConsultationFormData, value: any) => void;
  isLoading?: boolean;
}

export function ConsultationMediaUpload({ formData, onChange, isLoading = false }: ConsultationMediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { media } = formData;
  
  const handleRemoveMedia = (index: number) => {
    const updatedMedia = media.filter((_, i) => i !== index);
    onChange('media', updatedMedia);
  };
  
  return (
    <div className="grid gap-3">
      <Label>Zdjęcia konsultacji</Label>
      
      <MediaPreview 
        media={media} 
        onRemoveMedia={handleRemoveMedia} 
        disabled={isLoading}
      />
      
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={(e) => handleFileUpload(e, media, (newMedia) => onChange('media', newMedia), fileInputRef)}
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || media.length >= 6}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Dodaj zdjęcia
        </Button>
        <p className="text-xs text-muted-foreground">
          Maksymalnie 6 zdjęć. Obsługiwane formaty: JPG, PNG.
        </p>
      </div>
    </div>
  );
}
