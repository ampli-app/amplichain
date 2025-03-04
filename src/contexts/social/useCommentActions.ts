
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Post, Comment } from '@/types/social';
import { Profile } from '@/types/messages';

export const useCommentActions = (user: any | null, setPosts: React.Dispatch<React.SetStateAction<Post[]>>) => {
  const [loading, setLoading] = useState(false);

  // Funkcja do dodawania komentarza do posta
  const commentOnPost = async (postId: string, content: string, parentId?: string): Promise<void> => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby dodać komentarz",
          variant: "destructive",
        });
        return;
      }
      
      setLoading(true);
      
      const commentData = {
        post_id: postId,
        user_id: user.id,
        content,
        parent_id: parentId || null
      };
      
      console.log("Dodawanie komentarza:", commentData);
      
      const { error } = await supabase
        .from('comments')
        .insert(commentData);
      
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
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do pobierania komentarzy do posta
  const getPostComments = async (postId: string, parentId?: string): Promise<Comment[]> => {
    try {
      setLoading(true);
      
      // Pobierz komentarze
      let query = supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (parentId) {
        query = query.eq('parent_id', parentId);
      } else {
        query = query.is('parent_id', null);
      }
      
      const { data: commentsData, error: commentsError } = await query;
      
      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
        return [];
      }
      
      console.log("Pobrane surowe komentarze:", commentsData);
      
      if (!commentsData || commentsData.length === 0) {
        return [];
      }
      
      // Pobierz dane profilowe dla wszystkich autorów komentarzy w jednym zapytaniu
      const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .in('id', userIds);
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }
      
      // Utwórz mapę profili dla szybkiego dostępu
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
      
      const commentsWithMetadata: Comment[] = await Promise.all(
        (commentsData || []).map(async (comment) => {
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
          
          // Znajdź profil autora komentarza
          const profile = profilesMap.get(comment.user_id);
          
          return {
            id: comment.id,
            postId: comment.post_id,
            parentId: comment.parent_id,
            userId: comment.user_id,
            author: {
              name: profile?.full_name || 'Nieznany użytkownik',
              avatar: profile?.avatar_url || '/placeholder.svg',
              role: profile?.role || '',
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
      
      console.log("Przetworzone komentarze:", commentsWithMetadata);
      return commentsWithMetadata;
    } catch (err) {
      console.error('Unexpected error fetching comments:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do polubienia komentarza
  const likeComment = async (commentId: string): Promise<void> => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby polubić komentarz",
          variant: "destructive",
        });
        return;
      }
      
      setLoading(true);
      
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
      
      toast({
        title: "Sukces",
        description: "Komentarz został polubiony",
      });
    } catch (err) {
      console.error('Unexpected error liking comment:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas polubienia komentarza",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do usunięcia polubienia komentarza
  const unlikeComment = async (commentId: string): Promise<void> => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby usunąć polubienie",
          variant: "destructive",
        });
        return;
      }
      
      setLoading(true);
      
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
      
      toast({
        title: "Sukces",
        description: "Polubienie komentarza zostało usunięte",
      });
    } catch (err) {
      console.error('Unexpected error unliking comment:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas usuwania polubienia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    commentOnPost,
    getPostComments,
    likeComment,
    unlikeComment,
    loading
  };
};
