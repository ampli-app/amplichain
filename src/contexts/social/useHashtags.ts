
import { useState } from 'react';
import { Post, Hashtag } from '@/types/social';
import { supabase } from '@/integrations/supabase/client';
import { enrichPostWithMetadata } from './postsHelpers';

export const useHashtags = (userId: string | undefined) => {
  const [loading, setLoading] = useState(false);

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
      
      // Przetwarzanie postów
      const postsWithMetadata = [];
      
      for (const post of postsData || []) {
        const enrichedPost = await enrichPostWithMetadata(post, userId);
        postsWithMetadata.push(enrichedPost);
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

  return {
    getPostsByHashtag,
    getPopularHashtags,
    loading
  };
};
