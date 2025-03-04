
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Post, Comment } from '@/types/social';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

// Pomocnicza funkcja do formatowania czasu
const formatTimeAgo = (dateString: string) => {
  try {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: pl
    });
  } catch (err) {
    console.error('Błąd formatowania daty:', err);
    return 'jakiś czas temu';
  }
};

// Pomocnicza funkcja do pokazywania powiadomień o błędach
const showErrorToast = (title: string, description: string) => {
  toast({
    title,
    description,
    variant: "destructive",
  });
};

// Pomocnicza funkcja do pokazywania powiadomień o sukcesie
const showSuccessToast = (description: string) => {
  toast({
    title: "Sukces",
    description,
  });
};

export const useCommentActions = (user: any | null, setPosts: React.Dispatch<React.SetStateAction<Post[]>>) => {
  const [loading, setLoading] = useState(false);

  // Funkcja dodająca komentarz do posta
  const commentOnPost = async (postId: string, content: string, parentId?: string) => {
    if (!user) {
      showErrorToast("Błąd", "Musisz być zalogowany, aby dodać komentarz");
      return;
    }
    
    setLoading(true);
    
    try {
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

  // Funkcja aktualizująca licznik komentarzy posta
  const updatePostCommentCount = (postId: string, increment: number) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId ? { ...post, comments: post.comments + increment } : post
      )
    );
  };

  // Funkcja polubiająca komentarz
  const likeComment = async (commentId: string) => {
    if (!user) {
      showErrorToast("Błąd", "Musisz być zalogowany, aby polubić komentarz");
      return;
    }
    
    setLoading(true);
    
    try {
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

  // Funkcja pobierająca profile użytkowników
  const fetchUserProfiles = async (userIds: string[]) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, role')
      .in('id', userIds);
    
    if (error) {
      console.error('Error fetching profiles:', error);
      throw error;
    }
    
    return data;
  };

  // Funkcja pobierająca liczbę polubień komentarzy
  const fetchCommentsLikesCount = async (commentsIds: string[]) => {
    const result = await Promise.all(
      commentsIds.map(async (commentId) => {
        const { count, error } = await supabase
          .from('comment_likes')
          .select('*', { count: 'exact', head: true })
          .eq('comment_id', commentId);
        
        if (error) {
          console.error(`Error fetching likes for comment ${commentId}:`, error);
          return { commentId, count: 0 };
        }
        
        return { commentId, count };
      })
    );
    
    return result.reduce((map: any, item: any) => {
      map[item.commentId] = item.count;
      return map;
    }, {});
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

  // Funkcja pobierająca liczbę odpowiedzi na komentarze
  const fetchCommentsRepliesCount = async (commentsIds: string[]) => {
    const result = await Promise.all(
      commentsIds.map(async (commentId) => {
        const { count, error } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('parent_id', commentId);
        
        if (error) {
          console.error(`Error fetching replies for comment ${commentId}:`, error);
          return { commentId, count: 0 };
        }
        
        return { commentId, count };
      })
    );
    
    return result.reduce((map: any, item: any) => {
      map[item.commentId] = item.count;
      return map;
    }, {});
  };

  // Główna funkcja pobierająca komentarze do posta
  const getPostComments = async (postId: string, parentId?: string): Promise<Comment[]> => {
    try {
      console.log("Pobieranie komentarzy dla posta:", postId);
      
      // Poprawiona część - używamy is('parent_id', parentId || null) zamiast eq
      // Jest to kluczowa zmiana do rozwiązania problemu TypeScript
      const query = supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId);
      
      // Dodajemy warunek dla parent_id w zależności od tego, czy chcemy główne komentarze czy odpowiedzi
      if (parentId) {
        query.eq('parent_id', parentId);
      } else {
        query.is('parent_id', null);
      }
      
      const { data: commentsData, error: commentsError } = await query.order('created_at', { ascending: true });
      
      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
        throw commentsError;
      }
      
      console.log("Surowe dane komentarzy:", commentsData);
      
      if (!commentsData || commentsData.length === 0) {
        return [];
      }
      
      // Pobierz wszystkie ID użytkowników komentarzy
      const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
      
      // Pobierz informacje o profilach tych użytkowników
      const profilesData = await fetchUserProfiles(userIds);
      
      // Utwórz mapę profilów dla szybkiego dostępu
      const profilesMap = profilesData.reduce((map: any, profile: any) => {
        map[profile.id] = profile;
        return map;
      }, {});
      
      // Pobierz identyfikatory komentarzy
      const commentIds = commentsData.map(comment => comment.id);
      
      // Pobierz dodatkowe dane dla komentarzy
      const [likesMap, userLikesMap, repliesMap] = await Promise.all([
        fetchCommentsLikesCount(commentIds),
        fetchUserLikes(commentIds),
        fetchCommentsRepliesCount(commentIds)
      ]);
      
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
          timeAgo: formatTimeAgo(comment.created_at),
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
      
      console.log("Sformatowane komentarze:", formattedComments);
      return formattedComments;
    } catch (err) {
      console.error('Błąd w getPostComments:', err);
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
