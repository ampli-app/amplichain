
import { useState } from 'react';
import { Post, Hashtag } from '@/types/social';
import { fetchPostsByHashtag, fetchPopularHashtags } from '@/utils/hashtagDataUtils';

/**
 * Hook do zarządzania i pobierania hashtagów
 */
export const useHashtags = (userId: string | undefined) => {
  const [loading, setLoading] = useState(false);

  /**
   * Pobiera posty z określonym hashtagiem
   */
  const getPostsByHashtag = async (hashtagName: string): Promise<Post[]> => {
    setLoading(true);
    try {
      const posts = await fetchPostsByHashtag(hashtagName, userId);
      return posts;
    } catch (error) {
      console.error('Błąd w useHashtags.getPostsByHashtag:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Pobiera popularne hashtagi
   */
  const getPopularHashtags = async (): Promise<Hashtag[]> => {
    try {
      return await fetchPopularHashtags();
    } catch (error) {
      console.error('Błąd w useHashtags.getPopularHashtags:', error);
      return [];
    }
  };
  
  return {
    getPostsByHashtag,
    getPopularHashtags,
    loading
  };
};
