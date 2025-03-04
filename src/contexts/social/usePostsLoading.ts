
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Post } from '@/types/social';
import { enrichPostWithMetadata } from './postsHelpers';
import { useHashtags } from './useHashtags';
import { useRealtimeSubscriptions } from './useRealtimeSubscriptions';

export const usePostsLoading = (user: any | null) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { getPostsByHashtag, getPopularHashtags } = useHashtags(user?.id);
  const { setUpRealtimeSubscriptions } = useRealtimeSubscriptions(() => loadPosts());

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
        const enrichedPost = await enrichPostWithMetadata(post, user?.id);
        postsWithMetadata.push(enrichedPost);
      }
      
      setPosts(postsWithMetadata);
    } catch (err) {
      console.error('Unexpected error loading posts:', err);
    } finally {
      setLoading(false);
    }
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
