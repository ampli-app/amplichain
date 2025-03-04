
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showErrorToast, showSuccessToast } from './commentHelpers';

export const useCommentLikes = (user: any | null) => {
  const [loading, setLoading] = useState(false);

  // Funkcja polubiająca komentarz
  const likeComment = async (commentId: string) => {
    if (!user) {
      showErrorToast("Błąd", "Musisz być zalogowany, aby polubić komentarz");
      return;
    }
    
    setLoading(true);
    
    try {
      // Sprawdź, czy użytkownik próbuje polubić własny komentarz
      const { data: commentData } = await supabase
        .from('comments')
        .select('user_id')
        .eq('id', commentId)
        .single();
      
      if (commentData && commentData.user_id === user.id) {
        showErrorToast("Błąd", "Nie możesz polubić własnego komentarza");
        return;
      }
      
      const { error } = await supabase
        .from('comment_likes')
        .insert({
          comment_id: commentId,
          user_id: user.id
        });
      
      if (error) {
        if (error.code === '23505') { // naruszenie unique constraint
          toast({
            title: "Informacja",
            description: "Już polubiłeś ten komentarz",
          });
        } else {
          console.error('Error liking comment:', error);
          showErrorToast("Błąd", "Nie udało się polubić komentarza");
        }
        return;
      }
      
      showSuccessToast("Komentarz został polubiony");
    } catch (err) {
      console.error('Unexpected error liking comment:', err);
      showErrorToast("Błąd", "Wystąpił nieoczekiwany błąd podczas polubienia komentarza");
    } finally {
      setLoading(false);
    }
  };

  // Funkcja usuwająca polubienie komentarza
  const unlikeComment = async (commentId: string) => {
    if (!user) {
      showErrorToast("Błąd", "Musisz być zalogowany, aby usunąć polubienie");
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error unliking comment:', error);
        showErrorToast("Błąd", "Nie udało się usunąć polubienia");
        return;
      }
      
      showSuccessToast("Polubienie zostało usunięte");
    } catch (err) {
      console.error('Unexpected error unliking comment:', err);
      showErrorToast("Błąd", "Wystąpił nieoczekiwany błąd podczas usuwania polubienia");
    } finally {
      setLoading(false);
    }
  };

  // Funkcja sprawdzająca polubienia użytkownika
  const fetchUserLikes = async (commentsIds: string[]) => {
    if (!user) return {};
    
    const result = await Promise.all(
      commentsIds.map(async (commentId) => {
        const { data, error } = await supabase
          .from('comment_likes')
          .select('*')
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
        
        if (error) {
          console.error(`Error checking if user liked comment ${commentId}:`, error);
          return { commentId, liked: false };
        }
        
        return { commentId, liked: data.length > 0 };
      })
    );
    
    return result.reduce((map: any, item: any) => {
      map[item.commentId] = item.liked;
      return map;
    }, {});
  };

  return {
    likeComment,
    unlikeComment,
    fetchUserLikes,
    loading
  };
};
