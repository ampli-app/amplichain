
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MediaFile } from '@/components/social/MediaPreview';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import { uploadMediaToStorage } from '@/utils/mediaUtils';

interface UseGroupPostCreationProps {
  onPostCreated?: () => void;
}

export function useGroupPostCreation({ onPostCreated }: UseGroupPostCreationProps = {}) {
  const { user } = useAuth();
  const { id: groupId } = useParams<{ id: string }>();
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
    
    if (!groupId) {
      toast({
        title: "Błąd",
        description: "Nie można utworzyć posta - brak identyfikatora grupy",
        variant: "destructive",
      });
      return;
    }
    
    if (isPollMode) {
      // Validate poll options
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
      // 1. Utwórz post
      const { data: postData, error: postError } = await supabase
        .from('group_posts')
        .insert({
          group_id: groupId,
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
          .from('group_post_poll_options')
          .insert(pollOptionsData);
        
        if (pollOptionsError) {
          throw new Error(`Błąd podczas dodawania opcji ankiety: ${pollOptionsError.message}`);
        }
      }
      
      // 3. Jeśli są media, prześlij je do Storage i zapisz w bazie danych
      if (media.length > 0) {
        // Prześlij pliki do Supabase Storage
        const mediaPromises = media.map(async (mediaItem) => {
          if (mediaItem.file) {
            const publicUrl = await uploadMediaToStorage(mediaItem.file, `group_media/${groupId}`);
            
            if (publicUrl) {
              if (mediaItem.type === 'document') {
                // Zapisz jako plik
                return supabase
                  .from('group_post_files')
                  .insert({
                    post_id: postId,
                    name: mediaItem.name || 'Plik',
                    url: publicUrl,
                    type: mediaItem.fileType || 'application/octet-stream',
                    size: mediaItem.size || 0
                  });
              } else {
                // Zapisz jako media (zdjęcie lub wideo)
                return supabase
                  .from('group_post_media')
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
      
      // Pokaż komunikat sukcesu
      toast({
        title: "Post utworzony",
        description: "Twój post został pomyślnie opublikowany w grupie",
      });
      
      // Resetuj formularz
      resetForm();
      
      // Callback po utworzeniu posta
      if (onPostCreated) {
        onPostCreated();
      } else {
        // Odśwież posty - symulacja odświeżenia strony, ponieważ zakładamy,
        // że inne komponenty będą aktualizować widok postów
        window.location.reload();
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
