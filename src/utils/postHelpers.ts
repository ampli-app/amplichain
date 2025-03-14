import { supabase } from '@/integrations/supabase/client';
import { extractHashtags } from '@/utils/mediaUtils';
import { uploadMediaToStorage } from '@/utils/mediaUtils';

/**
 * Dodaje opcje ankiety do posta
 */
export async function addPollOptions(postId: string, pollOptions: string[]) {
  const validOptions = pollOptions.filter(option => option.trim() !== '');
  
  const pollOptionsData = validOptions.map(option => ({
    post_id: postId,
    text: option.trim()
  }));
  
  const { error } = await supabase
    .from('feed_post_poll_options')
    .insert(pollOptionsData);
  
  if (error) {
    throw new Error(`Błąd podczas dodawania opcji ankiety: ${error.message}`);
  }
}

/**
 * Przetwarza hashtagi i zapisuje je w bazie danych
 */
export async function processHashtags(content: string, postId: string) {
  // Używamy funkcji automatycznie przetwarzającej hashtagi
  // Hashtagi są wydobywane przez trigger extract_feed_hashtags po stworzeniu posta
  console.log('Przetwarzanie hashtagów dla posta:', postId);
  
  // Wypisujemy hashtagi w logach (ale nie modyfikujemy nic - trigger to zrobi)
  const hashtags = extractHashtags(content);
  if (hashtags.length > 0) {
    console.log('Wykryte hashtagi:', hashtags);
  }
}

/**
 * Zapisuje pliki mediów (zdjęcia, wideo, dokumenty) powiązane z postem
 */
export async function savePostMedia(postId: string, media: Array<any>) {
  if (media.length === 0) return;
  
  console.log('Zapisuję media dla posta:', postId, 'liczba mediów:', media.length);
  
  const mediaPromises = media.map(async (mediaItem) => {
    if (mediaItem.file) {
      try {
        console.log('Rozpoczynam przesyłanie pliku:', mediaItem.file.name, 'typ:', mediaItem.type);
        const publicUrl = await uploadMediaToStorage(mediaItem.file, 'feed_media');
        
        if (publicUrl) {
          console.log('Otrzymano URL pliku:', publicUrl, 'typ:', mediaItem.type);
          
          if (mediaItem.type === 'document') {
            const { data, error } = await supabase
              .from('feed_post_files')
              .insert({
                post_id: postId,
                name: mediaItem.name || 'Plik',
                url: publicUrl,
                type: mediaItem.fileType || 'application/octet-stream',
                size: mediaItem.size || 0
              });
              
            if (error) {
              console.error('Błąd podczas zapisywania pliku:', error);
              return { error };
            }
            console.log('Plik dokumentu zapisany pomyślnie');
            return { data };
          } else {
            const { data, error } = await supabase
              .from('feed_post_media')
              .insert({
                post_id: postId,
                url: publicUrl,
                type: mediaItem.type
              });
              
            if (error) {
              console.error('Błąd podczas zapisywania media:', error);
              return { error };
            }
            console.log('Media zapisane pomyślnie');
            return { data };
          }
        } else {
          console.error('Nie udało się uzyskać URL dla przesłanego pliku');
        }
      } catch (uploadError) {
        console.error('Błąd podczas przesyłania pliku:', uploadError);
        return { error: uploadError };
      }
    }
    return null;
  });
  
  const mediaResults = await Promise.all(mediaPromises);
  const mediaErrors = mediaResults
    .filter(result => result && result.error)
    .map(result => result?.error);
  
  if (mediaErrors.length > 0) {
    console.error('Błędy podczas zapisywania mediów:', mediaErrors);
  } else {
    console.log('Media zapisane pomyślnie, liczba mediów:', mediaResults.filter(r => r !== null).length);
  }
}
