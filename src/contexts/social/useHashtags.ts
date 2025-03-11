
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Hashtag } from '@/types/social';

export const useHashtags = () => {
  const followHashtag = async (hashtag: string) => {
    try {
      // Implementacja obserwowania hashtagu
      return Promise.resolve();
    } catch (error) {
      console.error('Error following hashtag:', error);
      return Promise.reject(error);
    }
  };

  const unfollowHashtag = async (hashtag: string) => {
    try {
      // Implementacja przestania obserwowania hashtagu
      return Promise.resolve();
    } catch (error) {
      console.error('Error unfollowing hashtag:', error);
      return Promise.reject(error);
    }
  };

  const fetchTrendingHashtags = async () => {
    try {
      const { data, error } = await supabase
        .from('hashtags')
        .select('id, name, count')
        .order('count', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Błąd podczas pobierania trendujących hashtagów:', error);
      return [];
    }
  };

  const getPopularHashtags = async (): Promise<Hashtag[]> => {
    try {
      const { data, error } = await supabase
        .from('hashtags')
        .select('id, name, count')
        .order('count', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Błąd podczas pobierania popularnych hashtagów:', error);
      return [];
    }
  };

  return {
    followHashtag,
    unfollowHashtag,
    fetchTrendingHashtags,
    getPopularHashtags
  };
};
