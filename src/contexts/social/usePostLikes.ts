
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Post } from '@/types/social';
import { showErrorToast, showSuccessToast, isUserOwnPost } from './postHelpers';

export const usePostLikes = (
  user: any | null, 
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>
) => {
  const [loading, setLoading] = useState(false);

  // Funkcja do polubienia posta
  const likePost = async (postId: string) => {
    try {
      if (!user) {
        showErrorToast("Błąd", "Musisz być zalogowany, aby polubić post");
        return;
      }
      
      setLoading(true);
      
      // Sprawdź, czy użytkownik próbuje polubić własny post
      const isOwnPost = await isUserOwnPost(supabase, postId, user.id);
      
      if (isOwnPost) {
        showErrorToast("Błąd", "Nie możesz polubić własnego posta");
        return;
      }
      
      const { error } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: user.id
        });
      
      if (error) {
        if (error.code === '23505') { // Naruszenie ograniczenia unique
          showErrorToast("Informacja", "Już polubiłeś ten post");
        } else {
          console.error('Error liking post:', error);
          showErrorToast("Błąd", "Nie udało się polubić posta");
        }
        return;
      }
      
      // Aktualizuj stan lokalny
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, hasLiked: true, likes: post.likes + 1 } 
            : post
        )
      );
      
      showSuccessToast("Post został polubiony");
    } catch (err) {
      console.error('Unexpected error liking post:', err);
      showErrorToast("Błąd", "Wystąpił nieoczekiwany błąd podczas polubienia posta");
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do usunięcia polubienia posta
  const unlikePost = async (postId: string) => {
    try {
      if (!user) {
        showErrorToast("Błąd", "Musisz być zalogowany, aby usunąć polubienie");
        return;
      }
      
      setLoading(true);
      
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error unliking post:', error);
        showErrorToast("Błąd", "Nie udało się usunąć polubienia");
        return;
      }
      
      // Aktualizuj stan lokalny
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, hasLiked: false, likes: Math.max(0, post.likes - 1) } 
            : post
        )
      );
      
      showSuccessToast("Polubienie zostało usunięte");
    } catch (err) {
      console.error('Unexpected error unliking post:', err);
      showErrorToast("Błąd", "Wystąpił nieoczekiwany błąd podczas usuwania polubienia");
    } finally {
      setLoading(false);
    }
  };

  return {
    likePost,
    unlikePost,
    loading
  };
};
