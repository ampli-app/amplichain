import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

export const uploadMediaToStorage = async (file: File, bucketName: string = 'media'): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;
    
    console.log(`Przesyłanie pliku do bucketa ${bucketName}:`, filePath, 'typ:', file.type, 'rozmiar:', file.size);
    
    // Używamy określonego bucketa (domyślnie 'media')
    const { data, error } = await supabase.storage
      .from(bucketName)
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
      .from(bucketName)
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
