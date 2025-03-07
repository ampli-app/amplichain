
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { usePostValidator } from '@/hooks/usePostValidator';
import { processHashtags, addPollOptions, savePostMedia } from '@/utils/postHelpers';
import { type MediaFile } from '@/components/social/MediaPreview';

interface UsePostSubmitProps {
  userId: string | undefined;
  onSuccess?: () => void;
}

export function usePostSubmit({ userId, onSuccess }: UsePostSubmitProps) {
  const [loading, setLoading] = useState(false);
  const { validatePost } = usePostValidator();
  
  /**
   * Wysyła post do bazy danych
   */
  const submitPost = async (
    content: string,
    isPollMode: boolean,
    pollOptions: string[],
    media: MediaFile[]
  ) => {
    // Walidacja danych
    const isValid = validatePost({
      userId,
      content,
      isPollMode,
      pollOptions,
      mediaCount: media.length
    });
    
    if (!isValid || !userId) return;
    
    setLoading(true);
    
    try {
      // 1. Utwórz post w tabeli feed_posts
      const { data: postData, error: postError } = await supabase
        .from('feed_posts')
        .insert({
          user_id: userId,
          content: content.trim(),
          is_poll: isPollMode
        })
        .select('id')
        .single();
      
      if (postError) {
        throw new Error(`Błąd podczas tworzenia posta: ${postError.message}`);
      }
      
      const postId = postData.id;
      
      // 2. Jeśli to ankieta, dodaj opcje
      if (isPollMode) {
        await addPollOptions(postId, pollOptions);
      }
      
      // 3. Ręczne przetwarzanie hashtagów
      await processHashtags(content, postId);
      
      // 4. Przetwarzanie mediów
      await savePostMedia(postId, media);
      
      toast({
        title: "Post utworzony",
        description: "Twój post został pomyślnie opublikowany",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error('Błąd podczas tworzenia posta:', error);
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Wystąpił błąd podczas tworzenia posta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    submitPost,
    loading
  };
}
