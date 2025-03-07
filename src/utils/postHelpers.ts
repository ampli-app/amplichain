
import { supabase } from '@/integrations/supabase/client';
import { extractHashtags } from '@/utils/mediaUtils';

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
  const hashtags = extractHashtags(content);
  if (hashtags.length === 0) return;
  
  for (const tag of hashtags) {
    try {
      // Sprawdź czy hashtag już istnieje
      const { data: existingTag, error: lookupError } = await supabase
        .from('hashtags')
        .select('id')
        .eq('name', tag.toLowerCase())
        .maybeSingle();
        
      if (lookupError) {
        console.error(`Błąd podczas sprawdzania hashtaga ${tag}:`, lookupError);
        continue;
      }
      
      let hashtagId;
      
      if (existingTag) {
        // Jeśli hashtag istnieje, użyj jego ID
        hashtagId = existingTag.id;
      } else {
        // Jeśli hashtag nie istnieje, utwórz nowy
        const { data: newTag, error: insertError } = await supabase
          .from('hashtags')
          .insert([{ name: tag.toLowerCase() }])
          .select('id')
          .single();
        
        if (insertError) {
          console.error(`Błąd podczas tworzenia hashtaga ${tag}:`, insertError);
          continue;
        }
        
        hashtagId = newTag.id;
      }
      
      // Zamiast bezpośredniego zapytania SQL, użyjmy funkcji unikającej niejednoznaczności kolumn
      const { error: linkError } = await supabase.rpc(
        'link_post_hashtag',
        { 
          p_post_id: postId,
          p_hashtag_id: hashtagId
        }
      );
      
      if (linkError) {
        console.error(`Błąd podczas łączenia posta z hashtagiem ${tag}:`, linkError);
      }
    } catch (error) {
      console.error(`Nieoczekiwany błąd podczas łączenia posta z hashtagiem ${tag}:`, error);
    }
  }
}

/**
 * Zapisuje pliki mediów (zdjęcia, wideo, dokumenty) powiązane z postem
 */
export async function savePostMedia(postId: string, media: Array<any>) {
  if (media.length === 0) return;
  
  const mediaPromises = media.map(async (mediaItem) => {
    if (mediaItem.file) {
      const publicUrl = await uploadMediaToStorage(mediaItem.file, 'feed_media');
      
      if (publicUrl) {
        if (mediaItem.type === 'document') {
          return supabase
            .from('feed_post_files')
            .insert({
              post_id: postId,
              name: mediaItem.name || 'Plik',
              url: publicUrl,
              type: mediaItem.fileType || 'application/octet-stream',
              size: mediaItem.size || 0
            });
        } else {
          return supabase
            .from('feed_post_media')
            .insert({
              post_id: postId,
              url: publicUrl,
              type: mediaItem.type
            });
        }
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
  }
}

/**
 * Uploaduje pliki mediów do storage
 */
import { uploadMediaToStorage } from '@/utils/mediaUtils';
