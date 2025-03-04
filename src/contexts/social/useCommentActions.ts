
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Post, Comment } from '@/types/social';

export const useCommentActions = (user: any | null, setPosts: React.Dispatch<React.SetStateAction<Post[]>>) => {
  const [loading, setLoading] = useState(false);

  // Funkcja do dodawania komentarza do posta
  const commentOnPost = async (postId: string, content: string, parentId?: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby dodać komentarz",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
          parent_id: parentId
        });
      
      if (error) {
        console.error('Error adding comment:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się dodać komentarza",
          variant: "destructive",
        });
        return;
      }
      
      // Aktualizuj stan lokalny - zwiększ licznik komentarzy posta
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, comments: post.comments + 1 } 
            : post
        )
      );
      
      toast({
        title: "Sukces",
        description: parentId ? "Odpowiedź została dodana" : "Komentarz został dodany",
      });
    } catch (err) {
      console.error('Unexpected error adding comment:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas dodawania komentarza",
        variant: "destructive",
      });
    }
  };

  // Funkcja do pobierania komentarzy do posta
  const getPostComments = async (postId: string, parentId?: string): Promise<Comment[]> => {
    try {
      let query = supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (*)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (parentId) {
        query = query.eq('parent_id', parentId);
      } else {
        query = query.is('parent_id', null);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching comments:', error);
        return [];
      }
      
      const commentsWithMetadata: Comment[] = await Promise.all(
        (data || []).map(async (comment) => {
          // Pobierz liczbę polubień komentarza
          const { count: likesCount } = await supabase
            .from('comment_likes')
            .select('*', { count: 'exact', head: true })
            .eq('comment_id', comment.id);
          
          // Pobierz liczbę odpowiedzi na komentarz
          const { count: repliesCount } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('parent_id', comment.id);
          
          // Sprawdź, czy zalogowany użytkownik polubił komentarz
          let hasLiked = false;
          
          if (user) {
            const { data: likeData } = await supabase
              .from('comment_likes')
              .select('*')
              .eq('comment_id', comment.id)
              .eq('user_id', user.id)
              .maybeSingle();
            
            hasLiked = !!likeData;
          }
          
          // Oblicz czas względny
          const createdDate = new Date(comment.created_at);
          const now = new Date();
          const diffInSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);
          
          let timeAgo;
          if (diffInSeconds < 60) {
            timeAgo = `${diffInSeconds} sek. temu`;
          } else if (diffInSeconds < 3600) {
            timeAgo = `${Math.floor(diffInSeconds / 60)} min. temu`;
          } else if (diffInSeconds < 86400) {
            timeAgo = `${Math.floor(diffInSeconds / 3600)} godz. temu`;
          } else {
            timeAgo = `${Math.floor(diffInSeconds / 86400)} dni temu`;
          }
          
          // Ensure profileData is properly extracted and defaulted
          const profileData = comment.profiles || {};
          
          return {
            id: comment.id,
            postId: comment.post_id,
            parentId: comment.parent_id,
            userId: comment.user_id,
            author: {
              name: profileData.full_name || '',
              avatar: profileData.avatar_url || '/placeholder.svg',
              role: profileData.role || '',
            },
            content: comment.content,
            createdAt: comment.created_at,
            timeAgo,
            likes: likesCount || 0,
            replies: repliesCount || 0,
            hasLiked
          };
        })
      );
      
      return commentsWithMetadata;
    } catch (err) {
      console.error('Unexpected error fetching comments:', err);
      return [];
    }
  };

  // Funkcja do polubienia komentarza
  const likeComment = async (commentId: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby polubić komentarz",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('comment_likes')
        .insert({
          comment_id: commentId,
          user_id: user.id
        });
      
      if (error) {
        if (error.code === '23505') { // Naruszenie ograniczenia unique
          toast({
            title: "Informacja",
            description: "Już polubiłeś ten komentarz",
          });
        } else {
          console.error('Error liking comment:', error);
          toast({
            title: "Błąd",
            description: "Nie udało się polubić komentarza",
            variant: "destructive",
          });
        }
        return;
      }
    } catch (err) {
      console.error('Unexpected error liking comment:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas polubienia komentarza",
        variant: "destructive",
      });
    }
  };

  // Funkcja do usunięcia polubienia komentarza
  const unlikeComment = async (commentId: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby usunąć polubienie",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error unliking comment:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się usunąć polubienia",
          variant: "destructive",
        });
        return;
      }
    } catch (err) {
      console.error('Unexpected error unliking comment:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas usuwania polubienia",
        variant: "destructive",
      });
    }
  };

  return {
    commentOnPost,
    getPostComments,
    likeComment,
    unlikeComment
  };
};
