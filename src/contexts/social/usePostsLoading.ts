
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Post, Hashtag } from '@/types/social';
import { formatTimeAgo } from '@/utils/dateUtils';

export const usePostsLoading = (user: any | null) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Funkcja do pobierania postów
  const loadPosts = async () => {
    try {
      setLoading(true);
      
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
        .order('created_at', { ascending: false });
        
      if (postsError) {
        console.error('Błąd podczas pobierania postów:', postsError);
        return;
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
      
      // Przetwórz dane na format Post
      const formattedPosts: Post[] = postsData?.map(post => {
        const authorProfile = usersData?.find(user => user.id === post.user_id);
        
        // Utwórz obiekt autora z danymi z profilu lub domyślnymi wartościami
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
        const userVoted = post.is_poll && user ? 
          (post.feed_post_poll_options?.find(option => 
            option.feed_post_poll_votes?.some(vote => vote.user_id === user.id)
          )?.id || undefined) : 
          undefined;
        
        const timeAgo = formatTimeAgo(new Date(post.created_at));
        
        // Sprawdź, czy bieżący użytkownik polubił post
        const userLiked = user ? post.feed_post_likes?.some(like => like.user_id === user.id) : false;
        
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
          files: files.length > 0 ? files : undefined
        };
      }) || [];
      
      setPosts(formattedPosts);
    } catch (error) {
      console.error('Nieoczekiwany błąd podczas pobierania postów:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do pobierania postów po hashtagu
  const getPostsByHashtag = async (hashtag: string): Promise<Post[]> => {
    try {
      setLoading(true);
      
      // Najpierw znajdź id hashtagu
      const { data: hashtagData, error: hashtagError } = await supabase
        .from('hashtags')
        .select('id')
        .eq('name', hashtag.toLowerCase())
        .single();
        
      if (hashtagError || !hashtagData) {
        console.error('Błąd podczas pobierania hashtagu:', hashtagError);
        return [];
      }
      
      // Pobierz powiązane posty
      const { data: postHashtags, error: postHashtagsError } = await supabase
        .from('feed_post_hashtags')
        .select('post_id')
        .eq('hashtag_id', hashtagData.id);
        
      if (postHashtagsError || !postHashtags) {
        console.error('Błąd podczas pobierania powiązań z hashtagami:', postHashtagsError);
        return [];
      }
      
      const postIds = postHashtags.map(ph => ph.post_id);
      
      if (postIds.length === 0) {
        return [];
      }
      
      // Pobierz szczegóły postów
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
        
      if (postsError || !postsData) {
        console.error('Błąd podczas pobierania postów po hashtagu:', postsError);
        return [];
      }
      
      // Pobierz dane autorów postów
      const userIds = [...new Set(postsData.map(post => post.user_id))];
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .in('id', userIds);

      if (usersError) {
        console.error('Błąd podczas pobierania danych użytkowników:', usersError);
      }
      
      // Przetwórz posty tak samo jak w loadPosts
      return postsData.map(post => {
        // ... analogiczna logika jak w loadPosts
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
        
        const userVoted = post.is_poll && user ? 
          (post.feed_post_poll_options?.find(option => 
            option.feed_post_poll_votes?.some(vote => vote.user_id === user.id)
          )?.id || undefined) : 
          undefined;
        
        const timeAgo = formatTimeAgo(new Date(post.created_at));
        
        const userLiked = user ? post.feed_post_likes?.some(like => like.user_id === user.id) : false;
        
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
          files: files.length > 0 ? files : undefined
        };
      });
    } catch (error) {
      console.error('Nieoczekiwany błąd podczas pobierania postów po hashtagu:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do pobierania popularnych hashtagów
  const getPopularHashtags = async (): Promise<Hashtag[]> => {
    try {
      const { data, error } = await supabase
        .from('hashtags')
        .select('id, name, feed_post_hashtags(id)')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) {
        console.error('Błąd podczas pobierania popularnych hashtagów:', error);
        return [];
      }
      
      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        postsCount: item.feed_post_hashtags ? item.feed_post_hashtags.length : 0
      }));
    } catch (error) {
      console.error('Nieoczekiwany błąd podczas pobierania popularnych hashtagów:', error);
      return [];
    }
  };

  // Ustaw słuchacza zmian w czasie rzeczywistym
  const setUpRealtimeSubscriptions = () => {
    if (!user) return () => {};
    
    const postChangesChannel = supabase
      .channel('public:feed_posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'feed_posts' },
        () => {
          loadPosts();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(postChangesChannel);
    };
  };

  return {
    posts,
    setPosts,
    loading,
    loadPosts,
    getPostsByHashtag,
    getPopularHashtags,
    setUpRealtimeSubscriptions
  };
};
