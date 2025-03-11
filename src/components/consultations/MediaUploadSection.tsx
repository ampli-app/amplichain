
import { useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MediaPreview, MediaFile } from '@/components/social/MediaPreview';
import { handleFileUpload } from '@/utils/mediaUtils';

interface MediaUploadSectionProps {
  media: MediaFile[];
  setMedia: (media: MediaFile[]) => void;
  disabled?: boolean;
}

export function MediaUploadSection({ media, setMedia, disabled = false }: MediaUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  return (
    <div className="grid gap-3">
      <Label>Zdjęcia</Label>
      <div className="grid gap-4">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="cursor-pointer"
          onChange={(e) => handleFileUpload(e, media, setMedia, fileInputRef)}
          disabled={disabled}
        />
        <p className="text-sm text-muted-foreground">
          Możesz dodać maksymalnie 6 zdjęć. Dozwolone formaty: JPG, PNG.
        </p>
        <MediaPreview
          media={media}
          onRemoveMedia={(index) => {
            const updatedMedia = media.filter((_, i) => i !== index);
            setMedia(updatedMedia);
          }}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
