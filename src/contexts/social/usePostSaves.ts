
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Post } from '@/types/social';
import { showErrorToast, showSuccessToast, isUserOwnPost } from './postHelpers';

export const usePostSaves = (
  user: any | null, 
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>
) => {
  const [loading, setLoading] = useState(false);

  // Funkcja do zapisania posta
  const savePost = async (postId: string) => {
    try {
      if (!user) {
        showErrorToast("Błąd", "Musisz być zalogowany, aby zapisać post");
        return;
      }
      
      setLoading(true);
      
      // Sprawdź, czy użytkownik próbuje zapisać własny post
      const isOwnPost = await isUserOwnPost(supabase, postId, user.id);
      
      if (isOwnPost) {
        showErrorToast("Błąd", "Nie możesz zapisać własnego posta");
        return;
      }
      
      const { error } = await supabase
        .from('saved_posts')
        .insert({
          post_id: postId,
          user_id: user.id
        });
      
      if (error) {
        if (error.code === '23505') { // Naruszenie ograniczenia unique
          showErrorToast("Informacja", "Już zapisałeś ten post");
        } else {
          console.error('Error saving post:', error);
          showErrorToast("Błąd", "Nie udało się zapisać posta");
        }
        return;
      }
      
      // Aktualizuj stan lokalny
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, hasSaved: true, saves: post.saves + 1 } 
            : post
        )
      );
      
      showSuccessToast("Post został zapisany");
    } catch (err) {
      console.error('Unexpected error saving post:', err);
      showErrorToast("Błąd", "Wystąpił nieoczekiwany błąd podczas zapisywania posta");
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do usunięcia zapisanego posta
  const unsavePost = async (postId: string) => {
    try {
      if (!user) {
        showErrorToast("Błąd", "Musisz być zalogowany, aby usunąć zapis");
        return;
      }
      
      setLoading(true);
      
      const { error } = await supabase
        .from('saved_posts')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error unsaving post:', error);
        showErrorToast("Błąd", "Nie udało się usunąć zapisu");
        return;
      }
      
      // Aktualizuj stan lokalny
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, hasSaved: false, saves: Math.max(0, post.saves - 1) } 
            : post
        )
      );
      
      showSuccessToast("Zapis posta został usunięty");
    } catch (err) {
      console.error('Unexpected error unsaving post:', err);
      showErrorToast("Błąd", "Wystąpił nieoczekiwany błąd podczas usuwania zapisu");
    } finally {
      setLoading(false);
    }
  };

  return {
    savePost,
    unsavePost,
    loading
  };
};
