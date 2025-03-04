
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Post, Comment } from '@/types/social';

export const useCommentActions = (user: any | null, setPosts: React.Dispatch<React.SetStateAction<Post[]>>) => {
  const [loading, setLoading] = useState(false);

  const commentOnPost = async (postId: string, content: string) => {
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
      
      // Dodaj komentarz do bazy danych
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
          parent_id: null, // komentarz najwyższego poziomu
        })
        .select();
      
      if (error) {
        console.error('Error adding comment:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się dodać komentarza",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Komentarz dodany pomyślnie:", data);
      
      // Aktualizuj liczbę komentarzy w lokalnym stanie postów
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId ? { ...post, comments: post.comments + 1 } : post
        )
      );
      
      toast({
        title: "Sukces",
        description: "Komentarz został dodany",
      });
      
      return data[0];
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
      
      setLoading(true);
      
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
        description: "Polubienie zostało usunięte",
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

  const getPostComments = async (postId: string): Promise<Comment[]> => {
    try {
      console.log("Fetching comments for post:", postId);
      
      // Pobierz komentarze główne (parent_id is null)
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .eq('parent_id', null)
        .order('created_at', { ascending: true });
      
      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
        throw commentsError;
      }
      
      console.log("Raw comments data:", commentsData);
      
      if (!commentsData || commentsData.length === 0) {
        return [];
      }
      
      // Pobierz wszystkie ID użytkowników komentarzy
      const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
      
      // Pobierz informacje o profilach tych użytkowników
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .in('id', userIds);
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }
      
      // Utwórz mapę profilów dla szybkiego dostępu
      const profilesMap = profilesData.reduce((map, profile) => {
        map[profile.id] = profile;
        return map;
      }, {});
      
      // Pobierz liczbę polubień dla każdego komentarza
      const likesCounts = await Promise.all(
        commentsData.map(async (comment) => {
          const { count, error } = await supabase
            .from('comment_likes')
            .select('*', { count: 'exact', head: true })
            .eq('comment_id', comment.id);
          
          if (error) {
            console.error(`Error fetching likes for comment ${comment.id}:`, error);
            return { commentId: comment.id, count: 0 };
          }
          
          return { commentId: comment.id, count };
        })
      );
      
      // Utwórz mapę liczby polubień
      const likesMap = likesCounts.reduce((map, item) => {
        map[item.commentId] = item.count;
        return map;
      }, {});
      
      // Sprawdź, czy użytkownik polubił każdy komentarz
      const userLikes = user ? await Promise.all(
        commentsData.map(async (comment) => {
          const { data, error } = await supabase
            .from('comment_likes')
            .select('*')
            .eq('comment_id', comment.id)
            .eq('user_id', user.id);
          
          if (error) {
            console.error(`Error checking if user liked comment ${comment.id}:`, error);
            return { commentId: comment.id, liked: false };
          }
          
          return { commentId: comment.id, liked: data.length > 0 };
        })
      ) : [];
      
      // Utwórz mapę polubień użytkownika
      const userLikesMap = userLikes.reduce((map, item) => {
        map[item.commentId] = item.liked;
        return map;
      }, {});
      
      // Pobierz liczbę odpowiedzi dla każdego komentarza
      const repliesCounts = await Promise.all(
        commentsData.map(async (comment) => {
          const { count, error } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('parent_id', comment.id);
          
          if (error) {
            console.error(`Error fetching replies for comment ${comment.id}:`, error);
            return { commentId: comment.id, count: 0 };
          }
          
          return { commentId: comment.id, count };
        })
      );
      
      // Utwórz mapę liczby odpowiedzi
      const repliesMap = repliesCounts.reduce((map, item) => {
        map[item.commentId] = item.count;
        return map;
      }, {});
      
      // Połącz wszystkie dane w format Comment[]
      const formattedComments: Comment[] = commentsData.map(comment => {
        const profile = profilesMap[comment.user_id] || {
          full_name: 'Użytkownik',
          avatar_url: '/placeholder.svg',
          role: ''
        };
        
        return {
          id: comment.id,
          content: comment.content,
          postId: comment.post_id,
          userId: comment.user_id,
          parentId: comment.parent_id,
          createdAt: comment.created_at,
          author: {
            name: profile.full_name,
            avatar: profile.avatar_url || '/placeholder.svg',
            role: profile.role || ''
          },
          likes: likesMap[comment.id] || 0,
          hasLiked: userLikesMap[comment.id] || false,
          replies: repliesMap[comment.id] || 0
        };
      });
      
      console.log("Formatted comments:", formattedComments);
      return formattedComments;
    } catch (err) {
      console.error('Error in getPostComments:', err);
      throw err;
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
