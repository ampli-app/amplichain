
import { supabase } from '@/integrations/supabase/client';
import { Post, Hashtag } from '@/types/social';
import { formatTimeAgo } from './timeFormatUtils';

/**
 * Pobiera posty zawierające określony hashtag
 */
export async function fetchPostsByHashtag(hashtagName: string, userId?: string): Promise<Post[]> {
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
    
    // Znajdź posty z tym hashtagiem
    const { data: postIds, error: postsError } = await supabase
      .from('feed_post_hashtags')
      .select('post_id')
      .eq('hashtag_id', hashtagData.id);
    
    if (postsError || !postIds.length) {
      console.error('Błąd podczas wyszukiwania postów z hashtagiem:', postsError);
      return [];
    }
    
    // Pobierz pełne dane postów
    const postIdsArray = postIds.map(item => item.post_id);
    
    const { data: postsData, error: postsDataError } = await supabase
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
      .in('id', postIdsArray)
      .order('created_at', { ascending: false });
    
    if (postsDataError) {
      console.error('Błąd podczas pobierania postów:', postsDataError);
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
    return postsData.map(post => {
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
      
      const userVoted = post.is_poll && userId ? 
        (post.feed_post_poll_options?.find(option => 
          option.feed_post_poll_votes?.some(vote => vote.user_id === userId)
        )?.id || undefined) : 
        undefined;
      
      const userLiked = userId ? post.feed_post_likes?.some(like => like.user_id === userId) : false;
      
      return {
        id: post.id,
        userId: post.user_id,
        content: post.content,
        author,
        createdAt: post.created_at,
        timeAgo: formatTimeAgo(new Date(post.created_at)),
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
  } catch (error) {
    console.error('Nieoczekiwany błąd podczas pobierania postów z hashtagiem:', error);
    return [];
  }
}

/**
 * Pobiera listę popularnych hashtagów
 */
export async function fetchPopularHashtags(): Promise<Hashtag[]> {
  try {
    // Pobierz wszystkie hashtagi
    const { data: hashtagsData, error: hashtagsError } = await supabase
      .from('hashtags')
      .select('id, name');
      
    if (hashtagsError) {
      console.error('Błąd podczas pobierania hashtagów:', hashtagsError);
      return [];
    }
    
    // Pobierz liczbę postów dla każdego hashtaga
    const hashtagsWithCounts = await Promise.all(
      hashtagsData.map(async (tag) => {
        const { count, error: countError } = await supabase
          .from('feed_post_hashtags')
          .select('*', { count: 'exact', head: true })
          .eq('hashtag_id', tag.id);
          
        return {
          id: tag.id,
          name: tag.name,
          postsCount: countError ? 0 : (count || 0)
        };
      })
    );
    
    // Posortuj hashtagi według liczby postów malejąco i ogranicz do 10
    return hashtagsWithCounts
      .sort((a, b) => b.postsCount - a.postsCount)
      .slice(0, 10);
      
  } catch (error) {
    console.error('Nieoczekiwany błąd podczas pobierania popularnych hashtagów:', error);
    return [];
  }
}
