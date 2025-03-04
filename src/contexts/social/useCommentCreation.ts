
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showErrorToast, showSuccessToast } from './commentHelpers';
import { Post } from '@/types/social';

export const useCommentCreation = (
  user: any | null, 
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>
) => {
  const [loading, setLoading] = useState(false);

  // Funkcja aktualizująca licznik komentarzy posta
  const updatePostCommentCount = (postId: string, increment: number) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId ? { ...post, comments: post.comments + increment } : post
      )
    );
  };

  // Funkcja dodająca komentarz do posta
  const commentOnPost = async (postId: string, content: string, parentId?: string) => {
    if (!user) {
      showErrorToast("Błąd", "Musisz być zalogowany, aby dodać komentarz");
      return;
    }
    
    setLoading(true);
    
    try {
      // Sprawdź czy parentId nie jest sam odpowiedzią
      if (parentId) {
        const { data: parentComment } = await supabase
          .from('comments')
          .select('parent_id')
          .eq('id', parentId)
          .single();
        
        if (parentComment && parentComment.parent_id !== null) {
          showErrorToast("Błąd", "Nie można dodawać odpowiedzi do odpowiedzi");
          return;
        }
      }
      
      // Dodaj komentarz do bazy danych
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
          parent_id: parentId || null,
        })
        .select();
      
      if (error) {
        console.error('Error adding comment:', error);
        showErrorToast("Błąd", "Nie udało się dodać komentarza");
        return;
      }
      
      console.log("Komentarz dodany pomyślnie:", data);
      
      // Aktualizuj liczbę komentarzy w lokalnym stanie postów
      updatePostCommentCount(postId, 1);
      
      showSuccessToast("Komentarz został dodany");
    } catch (err) {
      console.error('Unexpected error adding comment:', err);
      showErrorToast("Błąd", "Wystąpił nieoczekiwany błąd podczas dodawania komentarza");
    } finally {
      setLoading(false);
    }
  };

  return {
    commentOnPost,
    loading
  };
};
