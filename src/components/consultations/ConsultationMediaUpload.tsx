
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MediaPreview } from '@/utils/mediaUtils';
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
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    
    const newFiles = Array.from(event.target.files).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    const updatedFiles = [...media, ...newFiles];
    
    if (updatedFiles.length > 6) {
      alert(`Można dodać maksymalnie 6 zdjęć`);
      onChange('media', updatedFiles.slice(0, 6));
    } else {
      onChange('media', updatedFiles);
    }
  };
  
  return (
    <div className="grid gap-3">
      <Label>Zdjęcia konsultacji</Label>
      
      <MediaPreview 
        imageUrls={media.map(m => m.url || m.preview)} 
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
          onChange={handleFileChange}
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
