
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';

export type MediaFile = {
  url: string;
  type: 'image' | 'video' | 'document';
  name?: string;
  size?: number;
  fileType?: string;
  file?: File;
};

export const handleFileUpload = (
  event: React.ChangeEvent<HTMLInputElement>,
  currentMedia: MediaFile[],
  setMedia: (media: MediaFile[]) => void,
  fileInputRef: React.RefObject<HTMLInputElement>
) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  
  // Check if we don't exceed the maximum files limit (6)
  if (currentMedia.length + files.length > 6) {
    toast({
      title: "Limit plików",
      description: "Możesz dodać maksymalnie 6 plików do jednego posta",
      variant: "destructive",
    });
    return;
  }
  
  const newMedia: MediaFile[] = [...currentMedia];
  
  Array.from(files).forEach(file => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const isDocument = !isImage && !isVideo;
    
    const mediaType = isImage ? 'image' as const : 
                    isVideo ? 'video' as const : 
                    'document' as const;
    
    const url = URL.createObjectURL(file);
    
    newMedia.push({ 
      url, 
      type: mediaType,
      name: file.name,
      size: file.size,
      fileType: file.type,
      file: file
    });
  });
  
  setMedia(newMedia);
  
  // Reset file input
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};

export const uploadMediaToStorage = async (file: File, pathPrefix: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${pathPrefix}/${fileName}`;
    
    console.log('Przesyłanie pliku do bucketa media:', filePath, 'typ:', file.type, 'rozmiar:', file.size);
    
    // Używamy bucketa 'media'
    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file);
    
    if (error) {
      console.error('Błąd podczas przesyłania pliku:', error);
      toast({
        title: "Błąd przesyłania",
        description: `Nie udało się przesłać pliku: ${error.message}`,
        variant: "destructive",
      });
      return null;
    }
    
    // Pobierz publiczny URL pliku
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);
    
    console.log('Plik przesłany pomyślnie, URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Nieoczekiwany błąd podczas przesyłania pliku:', error);
    toast({
      title: "Błąd przesyłania",
      description: "Wystąpił nieoczekiwany błąd podczas przesyłania pliku",
      variant: "destructive",
    });
    return null;
  }
};

export const extractHashtags = (content: string): string[] => {
  const hashtagRegex = /#(\w+)/g;
  const matches = content.match(hashtagRegex);
  if (!matches) return [];
  
  return [...new Set(matches.map(tag => tag.substring(1).toLowerCase()))];
};

// Komponent do podglądu mediów
export const MediaPreview: React.FC<{
  media: MediaFile[];
  onRemoveMedia: (index: number) => void;
  disabled?: boolean;
}> = ({ media, onRemoveMedia, disabled = false }) => {
  if (media.length === 0) return null;
  
  return (
    <div className="grid grid-cols-3 gap-2 my-2">
      {media.map((item, index) => (
        <div key={index} className="relative group rounded overflow-hidden border border-border aspect-square">
          {item.type === 'image' && (
            <img
              src={item.url}
              alt={item.name || `Zdjęcie ${index + 1}`}
              className="w-full h-full object-cover"
            />
          )}
          {item.type === 'video' && (
            <video
              src={item.url}
              className="w-full h-full object-cover"
              controls
            />
          )}
          {item.type === 'document' && (
            <div className="flex items-center justify-center w-full h-full bg-muted p-2 text-center">
              <div>
                <p className="font-medium truncate max-w-full">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.fileType}</p>
              </div>
            </div>
          )}
          
          <Button
            className="absolute top-1 right-1 h-6 w-6 p-0 bg-background/80 hover:bg-background text-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            size="icon"
            variant="destructive"
            onClick={() => onRemoveMedia(index)}
            disabled={disabled}
            type="button"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
};
