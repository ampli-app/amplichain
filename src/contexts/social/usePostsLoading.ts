
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Post, Hashtag } from '@/types/social';

export const usePostsLoading = (user: any | null) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Funkcja do ładowania postów
  const loadPosts = async () => {
    try {
      setLoading(true);
      
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          post_hashtags!inner (
            hashtags:hashtag_id (name)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (postsError) {
        console.error('Error loading posts:', postsError);
        return;
      }
      
      let postsWithMetadata = [];
      
      for (const post of postsData || []) {
        // Pobierz dane profilu użytkownika
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, role')
          .eq('id', post.user_id)
          .maybeSingle();
          
        // Pobierz liczbę polubień posta
        const { count: likesCount } = await supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        // Pobierz liczbę komentarzy posta
        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        // Pobierz liczbę zapisań posta
        const { count: savesCount } = await supabase
          .from('saved_posts')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        // Sprawdź, czy zalogowany użytkownik polubił post
        let hasLiked = false;
        let hasSaved = false;
        
        if (user) {
          const { data: likeData } = await supabase
            .from('post_likes')
            .select('*')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .maybeSingle();
          
          hasLiked = !!likeData;
          
          const { data: saveData } = await supabase
            .from('saved_posts')
            .select('*')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .maybeSingle();
          
          hasSaved = !!saveData;
        }
        
        // Wyodrębnij hashtagi
        const hashtags = post.post_hashtags.map((ph: any) => ph.hashtags.name);
        
        // Oblicz czas względny
        const createdDate = new Date(post.created_at);
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
        
        postsWithMetadata.push({
          id: post.id,
          userId: post.user_id,
          author: {
            name: profileData?.full_name || '',
            avatar: profileData?.avatar_url || '/placeholder.svg',
            role: profileData?.role || '',
          },
          timeAgo,
          content: post.content,
          mediaUrl: post.media_url,
          mediaType: undefined,  // TO DO: uzupełnić typ media
          likes: likesCount || 0,
          comments: commentsCount || 0,
          saves: savesCount || 0,
          hasLiked,
          hasSaved,
          hashtags
        });
      }
      
      setPosts(postsWithMetadata);
    } catch (err) {
      console.error('Unexpected error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do pobierania postów z określonym hashtagiem
  const getPostsByHashtag = async (hashtag: string): Promise<Post[]> => {
    try {
      setLoading(true);
      
      const { data: hashtagData, error: hashtagError } = await supabase
        .from('hashtags')
        .select('id')
        .eq('name', hashtag.toLowerCase())
        .single();
      
      if (hashtagError || !hashtagData) {
        console.error('Error fetching hashtag:', hashtagError);
        return [];
      }
      
      const { data: postHashtagsData, error: postHashtagsError } = await supabase
        .from('post_hashtags')
        .select('post_id')
        .eq('hashtag_id', hashtagData.id);
      
      if (postHashtagsError) {
        console.error('Error fetching post hashtags:', postHashtagsError);
        return [];
      }
      
      const postIds = postHashtagsData.map(ph => ph.post_id);
      
      if (postIds.length === 0) {
        return [];
      }
      
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          post_hashtags (
            hashtags:hashtag_id (name)
          )
        `)
        .in('id', postIds)
        .order('created_at', { ascending: false });
      
      if (postsError) {
        console.error('Error fetching posts by hashtag:', postsError);
        return [];
      }
      
      // Przetwarzanie postów tak jak w funkcji loadPosts
      let postsWithMetadata = [];
      
      for (const post of postsData || []) {
        // Pobierz dane profilu użytkownika
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, role')
          .eq('id', post.user_id)
          .maybeSingle();
          
        // Pobierz liczbę polubień posta
        const { count: likesCount } = await supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        // Pobierz liczbę komentarzy posta
        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        // Pobierz liczbę zapisań posta
        const { count: savesCount } = await supabase
          .from('saved_posts')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        // Sprawdź, czy zalogowany użytkownik polubił post
        let hasLiked = false;
        let hasSaved = false;
        
        if (user) {
          const { data: likeData } = await supabase
            .from('post_likes')
            .select('*')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .maybeSingle();
          
          hasLiked = !!likeData;
          
          const { data: saveData } = await supabase
            .from('saved_posts')
            .select('*')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .maybeSingle();
          
          hasSaved = !!saveData;
        }
        
        // Wyodrębnij hashtagi
        const hashtags = post.post_hashtags.map((ph: any) => ph.hashtags.name);
        
        // Oblicz czas względny
        const createdDate = new Date(post.created_at);
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
        
        postsWithMetadata.push({
          id: post.id,
          userId: post.user_id,
          author: {
            name: profileData?.full_name || '',
            avatar: profileData?.avatar_url || '/placeholder.svg',
            role: profileData?.role || '',
          },
          timeAgo,
          content: post.content,
          mediaUrl: post.media_url,
          mediaType: undefined, // TO DO: uzupełnić typ media
          likes: likesCount || 0,
          comments: commentsCount || 0,
          saves: savesCount || 0,
          hasLiked,
          hasSaved,
          hashtags
        });
      }
      
      return postsWithMetadata;
    } catch (err) {
      console.error('Unexpected error fetching posts by hashtag:', err);
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
        .select(`
          id,
          name,
          post_hashtags (id)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching hashtags:', error);
        return [];
      }
      
      return data.map((hashtag) => ({
        id: hashtag.id,
        name: hashtag.name,
        postsCount: hashtag.post_hashtags.length
      })).sort((a, b) => b.postsCount - a.postsCount);
    } catch (err) {
      console.error('Unexpected error fetching hashtags:', err);
      return [];
    }
  };

  // Ustawienie słuchacza zmian w czasie rzeczywistym na odpowiednich tabelach
  const setUpRealtimeSubscriptions = () => {
    // Subskrypcja na zmiany w postach
    const postsChannel = supabase
      .channel('public:posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          loadPosts();
        }
      )
      .subscribe();
    
    // Subskrypcja na zmiany w polubieniach postów
    const likesChannel = supabase
      .channel('public:post_likes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_likes' },
        (payload) => {
          loadPosts();
        }
      )
      .subscribe();
      
    // Subskrypcja na zmiany w zapisanych postach
    const savedChannel = supabase
      .channel('public:saved_posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'saved_posts' },
        (payload) => {
          loadPosts();
        }
      )
      .subscribe();
    
    // Subskrypcja na zmiany w komentarzach
    const commentsChannel = supabase
      .channel('public:comments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        (payload) => {
          loadPosts();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(savedChannel);
      supabase.removeChannel(commentsChannel);
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
