
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { uploadMediaToStorage, extractHashtags } from '@/utils/mediaUtils';
import { type MediaFile } from '@/components/social/MediaPreview';

interface UsePostCreationProps {
  onPostCreated?: () => void;
}

export function usePostCreation({ onPostCreated }: UsePostCreationProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isPollMode, setIsPollMode] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  
  const togglePollMode = () => {
    if (isPollMode) {
      setPollOptions(['', '']);
    }
    setIsPollMode(!isPollMode);
  };
  
  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };
  
  const resetForm = () => {
    setContent('');
    setIsPollMode(false);
    setPollOptions(['', '']);
    setMedia([]);
  };
  
  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Wymagane logowanie",
        description: "Musisz być zalogowany, aby utworzyć post",
        variant: "destructive",
      });
      return;
    }
    
    if (isPollMode) {
      const filledOptions = pollOptions.filter(option => option.trim() !== '');
      if (filledOptions.length < 2) {
        toast({
          title: "Nieprawidłowa ankieta",
          description: "Ankieta musi mieć co najmniej 2 uzupełnione opcje",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (!content.trim() && media.length === 0 && !isPollMode) {
      toast({
        title: "Pusty post",
        description: "Post musi zawierać tekst, ankietę lub media",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // 1. Utwórz post w tabeli feed_posts
      const { data: postData, error: postError } = await supabase
        .from('feed_posts')
        .insert({
          user_id: user.id,
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
        const validOptions = pollOptions.filter(option => option.trim() !== '');
        
        const pollOptionsData = validOptions.map(option => ({
          post_id: postId,
          text: option.trim()
        }));
        
        const { error: pollOptionsError } = await supabase
          .from('feed_post_poll_options')
          .insert(pollOptionsData);
        
        if (pollOptionsError) {
          throw new Error(`Błąd podczas dodawania opcji ankiety: ${pollOptionsError.message}`);
        }
      }
      
      // 3. Ręczne przetwarzanie hashtagów zamiast polegania na triggerze
      const hashtags = extractHashtags(content);
      if (hashtags.length > 0) {
        for (const tag of hashtags) {
          // 3.1 Sprawdź czy hashtag już istnieje
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
            // 3.2 Jeśli hashtag istnieje, użyj jego ID
            hashtagId = existingTag.id;
          } else {
            // 3.3 Jeśli hashtag nie istnieje, utwórz nowy
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
          
          // 3.4 Powiąż hashtag z postem
          const { error: linkError } = await supabase
            .from('feed_post_hashtags')
            .insert([{ post_id: postId, hashtag_id: hashtagId }]);
          
          if (linkError) {
            console.error(`Błąd podczas łączenia posta z hashtagiem ${tag}:`, linkError);
          }
        }
      }
      
      // 4. Przetwarzanie mediów
      if (media.length > 0) {
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
      
      toast({
        title: "Post utworzony",
        description: "Twój post został pomyślnie opublikowany",
      });
      
      resetForm();
      
      if (onPostCreated) {
        onPostCreated();
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
    content,
    setContent,
    isPollMode,
    pollOptions,
    setPollOptions,
    media,
    setMedia,
    loading,
    togglePollMode,
    removeMedia,
    handleSubmit
  };
}
