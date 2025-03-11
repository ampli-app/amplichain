
import { supabase } from '@/integrations/supabase/client';
import { MediaFile } from '../types';

export const uploadConsultationImages = async (
  consultationId: string, 
  mediaFiles: MediaFile[]
): Promise<string[]> => {
  const uploadedImages: string[] = [];
  
  // First add existing images (URLs)
  for (const item of mediaFiles) {
    if (item.url) {
      uploadedImages.push(item.url);
    }
  }
  
  // Then upload new files
  for (const item of mediaFiles) {
    if (item.file) {
      try {
        const fileName = `${Date.now()}_${item.file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('consultations')
          .upload(`${consultationId}/${fileName}`, item.file);
          
        if (uploadError) throw uploadError;
        
        if (uploadData) {
          const { data: urlData } = supabase.storage
            .from('consultations')
            .getPublicUrl(`${consultationId}/${fileName}`);
            
          if (urlData) {
            uploadedImages.push(urlData.publicUrl);
          }
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  }
  
  return uploadedImages;
};
