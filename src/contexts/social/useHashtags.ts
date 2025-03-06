
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Post, Hashtag } from '@/types/social';

export const useHashtags = (userId: string | undefined) => {
  const [loading, setLoading] = useState(false);

  // Pobierz posty z określonym hashtagiem
  const getPostsByHashtag = async (hashtagName: string): Promise<Post[]> => {
    setLoading(true);
    try {
      // Znajdź id hashtaga
      const { data: hashtagData, error: hashtagError } = await supabase
        .from('hashtags')
        .select('id')
        .eq('name', hashtagName.toLowerCase())
        .maybeSingle();
      
      if (hashtagError || !hashtagData) {
        console.error('Błąd podczas wyszukiwania hashtaga:', hashtagError);
        return [];
      }
      
      // Znajdź posty z tym hashtagiem - dodajemy aliasy do zapytania, aby uniknąć niejednoznaczności
      const { data: hashtagPostsData, error: hashtagPostsError } = await supabase
        .from('feed_post_hashtags')
        .select('post_id')
        .eq('hashtag_id', hashtagData.id);
      
      if (hashtagPostsError || !hashtagPostsData.length) {
        console.error('Błąd podczas wyszukiwania postów z hashtagiem:', hashtagPostsError);
        return [];
      }
      
      // Pobierz pełne dane postów
      const postIds = hashtagPostsData.map(item => item.post_id);
      
      const { data: postsData, error: postsError } = await supabase
        .from('feed_posts')
        .select(`
          id,
          content,
          created_at,
          is_poll,
          user_id,
          feed_post_media (id, url, type),
          feed_post_files (id, name, url, type, size),
          feed_post_poll_options (
            id, 
            text,
            feed_post_poll_votes (id, user_id)
          ),
          feed_post_likes (id, user_id),
          feed_post_comments (id)
        `)
        .in('id', postIds)
        .order('created_at', { ascending: false });
      
      if (postsError) {
        console.error('Błąd podczas pobierania postów:', postsError);
        return [];
      }
      
      // Pobierz dane autorów postów
      const userIds = [...new Set(postsData?.map(post => post.user_id) || [])];
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .in('id', userIds);

      if (usersError) {
        console.error('Błąd podczas pobierania danych użytkowników:', usersError);
      }
      
      // Konwertuj dane do formatu Post
      const formattedPosts: Post[] = postsData.map(post => {
        const authorProfile = usersData?.find(user => user.id === post.user_id);
        
        const author = authorProfile ? {
          name: authorProfile.full_name || 'Nieznany użytkownik',
          avatar: authorProfile.avatar_url || '',
          role: authorProfile.role || ''
        } : { 
          name: 'Nieznany użytkownik', 
          avatar: '', 
          role: ''
        };
        
        const media = post.feed_post_media?.map(media => ({
          url: media.url,
          type: media.type as 'image' | 'video'
        })) || [];
        
        const files = post.feed_post_files?.map(file => ({
          name: file.name,
          url: file.url,
          type: file.type,
          size: file.size
        })) || [];
        
        const pollOptions = post.is_poll ? post.feed_post_poll_options?.map(option => ({
          id: option.id,
          text: option.text,
          votes: option.feed_post_poll_votes?.length || 0
        })) : undefined;
        
        // Sprawdź, czy użytkownik zagłosował
        const userVoted = post.is_poll && userId ? 
          (post.feed_post_poll_options?.find(option => 
            option.feed_post_poll_votes?.some(vote => vote.user_id === userId)
          )?.id || undefined) : 
          undefined;
        
        const timeAgo = formatTimeAgo(new Date(post.created_at));
        
        // Sprawdź, czy bieżący użytkownik polubił post
        const userLiked = userId ? post.feed_post_likes?.some(like => like.user_id === userId) : false;
        
        return {
          id: post.id,
          userId: post.user_id,
          content: post.content,
          author,
          createdAt: post.created_at,
          timeAgo,
          isPoll: post.is_poll || false,
          pollOptions,
          userVoted,
          userLiked,
          likes: post.feed_post_likes?.length || 0,
          comments: post.feed_post_comments?.length || 0,
          media: media.length > 0 ? media : undefined,
          files: files.length > 0 ? files : undefined,
          hashtags: [hashtagName]
        };
      });
      
      return formattedPosts;
    } catch (error) {
      console.error('Nieoczekiwany błąd podczas pobierania postów z hashtagiem:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // Pobierz popularne hashtagi
  const getPopularHashtags = async (): Promise<Hashtag[]> => {
    try {
      // Użyjmy bardziej precyzyjnego zapytania z aliasami dla tabel
      const { data, error } = await supabase
        .from('hashtags')
        .select(`
          id,
          name,
          feed_post_hashtags!inner(hashtag_id)
        `)
        .order('name');
        
      if (error) {
        console.error('Błąd podczas pobierania hashtagów:', error);
        return [];
      }
      
      // Przetwórz dane i policz posty dla każdego hashtaga
      const hashtags: Hashtag[] = data.map(tag => {
        return {
          id: tag.id,
          name: tag.name,
          postsCount: Array.isArray(tag.feed_post_hashtags) ? tag.feed_post_hashtags.length : 0
        };
      })
      .sort((a, b) => b.postsCount - a.postsCount)
      .slice(0, 10);
      
      return hashtags;
    } catch (error) {
      console.error('Nieoczekiwany błąd podczas pobierania popularnych hashtagów:', error);
      return [];
    }
  };
  
  return {
    getPostsByHashtag,
    getPopularHashtags,
    loading
  };
};

// Funkcja pomocnicza do formatowania czasu
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffMonth / 12);

  if (diffYear > 0) {
    return `${diffYear} ${diffYear === 1 ? 'rok' : diffYear < 5 ? 'lata' : 'lat'} temu`;
  } else if (diffMonth > 0) {
    return `${diffMonth} ${diffMonth === 1 ? 'miesiąc' : diffMonth < 5 ? 'miesiące' : 'miesięcy'} temu`;
  } else if (diffDay > 0) {
    return `${diffDay} ${diffDay === 1 ? 'dzień' : 'dni'} temu`;
  } else if (diffHour > 0) {
    return `${diffHour} ${diffHour === 1 ? 'godz.' : 'godz.'} temu`;
  } else if (diffMin > 0) {
    return `${diffMin} ${diffMin === 1 ? 'min.' : 'min.'} temu`;
  } else {
    return 'przed chwilą';
  }
}
