
import { supabase } from '@/integrations/supabase/client';
import { Comment } from '@/types/social';
import { formatTimeAgo } from './commentHelpers';

export const useCommentsLoading = (user: any | null) => {
  
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
      
      // Pobierz komentarze główne lub odpowiedzi
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .is('parent_id', parentId || null) // Changed to handle null parent_id correctly
        .order('created_at', { ascending: true });
      
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

  // Funkcja sprawdzająca polubienia użytkownika (referencja funkcji z useCommentLikes)
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
    getPostComments
  };
};
