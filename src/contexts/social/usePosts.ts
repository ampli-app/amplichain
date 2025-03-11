
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const usePosts = (userId?: string) => {
  const [loading, setLoading] = useState(false);

  const fetchUserPosts = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('feed_posts')
        .select(`
          id, 
          content, 
          created_at, 
          updated_at,
          user_id,
          profiles!feed_posts_user_id_fkey (id, username, full_name, avatar_url),
          feed_post_likes (id, user_id),
          feed_post_media (id, url, type),
          feed_post_comments (
            id, 
            content, 
            created_at, 
            user_id,
            profiles!feed_post_comments_user_id_fkey (id, username, full_name, avatar_url)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Błąd podczas pobierania postów użytkownika:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('feed_posts')
        .select(`
          id, 
          content, 
          created_at, 
          updated_at,
          user_id,
          profiles!feed_posts_user_id_fkey (id, username, full_name, avatar_url),
          feed_post_likes (id, user_id),
          feed_post_media (id, url, type),
          feed_post_comments (
            id, 
            content, 
            created_at, 
            user_id,
            profiles!feed_post_comments_user_id_fkey (id, username, full_name, avatar_url)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Błąd podczas pobierania postów do feedu:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addPost = async (postData: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('feed_posts')
        .insert([postData])
        .select();

      if (error) throw error;
      return data?.[0] || {};
    } catch (error) {
      console.error('Błąd podczas dodawania posta:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się dodać posta.",
        variant: "destructive",
      });
      return Promise.reject(error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (
    content: string, 
    mediaUrl?: string, 
    mediaType?: string, 
    mediaFiles?: Array<{ url: string, type: string }>
  ) => {
    try {
      if (!userId) throw new Error('Użytkownik musi być zalogowany');
      
      setLoading(true);
      
      // Podstawowe dane posta
      const postData = {
        content,
        user_id: userId,
        media_url: mediaUrl,
        media_type: mediaType
      };
      
      // Dodaj post
      const { data, error } = await supabase
        .from('feed_posts')
        .insert([postData])
        .select();

      if (error) throw error;
      
      const postId = data?.[0]?.id;
      
      // Jeśli są pliki multimedialne, dodaj je do posta
      if (postId && mediaFiles && mediaFiles.length > 0) {
        // Implementacja dodawania plików multimedialnych do posta
        // To jest uproszczone, w rzeczywistej aplikacji byłoby bardziej rozbudowane
        for (const mediaFile of mediaFiles) {
          await supabase
            .from('post_media')
            .insert([{
              post_id: postId,
              url: mediaFile.url,
              type: mediaFile.type
            }]);
        }
      }
      
      toast({
        title: "Sukces",
        description: "Post został utworzony",
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Błąd podczas tworzenia posta:', error);
      
      toast({
        title: "Błąd",
        description: "Nie udało się utworzyć posta",
        variant: "destructive",
      });
      
      return Promise.reject(error);
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (postId: string) => {
    try {
      if (!userId) throw new Error('Użytkownik musi być zalogowany');
      
      const { error } = await supabase
        .from('post_likes')
        .insert([{ post_id: postId, user_id: userId }]);

      if (error) throw error;
      return Promise.resolve();
    } catch (error) {
      console.error('Błąd podczas polubienia posta:', error);
      return Promise.reject(error);
    }
  };

  const unlikePost = async (postId: string) => {
    try {
      if (!userId) throw new Error('Użytkownik musi być zalogowany');
      
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (error) throw error;
      return Promise.resolve();
    } catch (error) {
      console.error('Błąd podczas usuwania polubienia posta:', error);
      return Promise.reject(error);
    }
  };

  const addComment = async (postId: string, comment: string) => {
    try {
      if (!userId) throw new Error('Użytkownik musi być zalogowany');
      
      const { error } = await supabase
        .from('post_comments')
        .insert([{ 
          post_id: postId, 
          user_id: userId,
          content: comment
        }]);

      if (error) throw error;
      return Promise.resolve();
    } catch (error) {
      console.error('Błąd podczas dodawania komentarza:', error);
      return Promise.reject(error);
    }
  };

  const fetchPostComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          id, content, created_at,
          user_id, 
          profiles:profiles(id, username, full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Błąd podczas pobierania komentarzy posta:', error);
      return [];
    }
  };

  return {
    loading,
    fetchUserPosts,
    fetchFeedPosts,
    addPost,
    createPost,
    likePost,
    unlikePost,
    addComment,
    fetchPostComments
  };
};
