
import React, { RefObject } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export interface MediaFile {
  file?: File;
  preview?: string;
  url?: string;
  type?: string;
}

export const handleFileUpload = (
  e: React.ChangeEvent<HTMLInputElement>,
  media: MediaFile[],
  setMedia: React.Dispatch<React.SetStateAction<MediaFile[]>>,
  fileInputRef: RefObject<HTMLInputElement>
) => {
  if (!e.target.files?.length) return;
  
  const newFiles = Array.from(e.target.files).map(file => ({
    file,
    preview: URL.createObjectURL(file),
    type: file.type.startsWith('image/') ? 'image' : 'file'
  }));
  
  const updatedFiles = [...media, ...newFiles];
  
  if (updatedFiles.length > 6) {
    alert(`Można dodać maksymalnie 6 plików`);
    setMedia(updatedFiles.slice(0, 6));
  } else {
    setMedia(updatedFiles);
  }
  
  // Reset input
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};

export const uploadMediaToStorage = async (file: File, path: string): Promise<string | null> => {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const fullPath = `${path}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from(path.split('/')[0])
      .upload(fullPath.substring(path.split('/')[0].length + 1), file);
    
    if (error) throw error;
    
    if (data) {
      const { data: urlData } = supabase.storage
        .from(path.split('/')[0])
        .getPublicUrl(fullPath.substring(path.split('/')[0].length + 1));
      
      if (urlData) {
        return urlData.publicUrl;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error uploading media:', error);
    return null;
  }
};

interface MediaPreviewProps {
  media?: MediaFile[];
  imageUrls?: string[];
  onRemoveMedia: (index: number) => void;
  disabled?: boolean;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  media,
  imageUrls,
  onRemoveMedia,
  disabled = false
}) => {
  const urls = media 
    ? media.map(m => m.preview || m.url) 
    : imageUrls || [];
  
  if (!urls.length) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      {urls.map((url, index) => (
        url && (
          <div key={index} className="relative rounded-md overflow-hidden aspect-square group border">
            <img 
              src={url} 
              alt={`Preview ${index + 1}`} 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback for invalid images
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            <Button 
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 opacity-80 hover:opacity-100"
              onClick={() => onRemoveMedia(index)}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )
      ))}
    </div>
  );
};
