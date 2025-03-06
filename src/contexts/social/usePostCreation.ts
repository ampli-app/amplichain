
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { Post } from '@/types/social';

export const usePostCreation = (
  user: any | null, 
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>
) => {
  const [loading, setLoading] = useState(false);

  // Funkcja do tworzenia nowego posta
  const createPost = async (
    content: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video',
    mediaFiles?: Array<{url: string, type: 'image' | 'video'}>
  ) => {
    if (!user) {
      console.error('Użytkownik musi być zalogowany, aby utworzyć post');
      return;
    }

    try {
      setLoading(true);

      // Utwórz nowy post
      const { data: postData, error: postError } = await supabase
        .from('feed_posts')
        .insert({
          content,
          user_id: user.id,
          is_poll: false
        })
        .select()
        .single();

      if (postError || !postData) {
        console.error('Błąd podczas tworzenia posta:', postError);
        return;
      }

      // Dodaj media, jeśli istnieje
      if (mediaFiles && mediaFiles.length > 0) {
        // Dodaj wszystkie media
        const mediaInserts = mediaFiles.map(media => ({
          post_id: postData.id,
          url: media.url,
          type: media.type
        }));

        const { error: mediaError } = await supabase
          .from('feed_post_media')
          .insert(mediaInserts);

        if (mediaError) {
          console.error('Błąd podczas dodawania mediów:', mediaError);
        }
      } else if (mediaUrl && mediaType) {
        // Dodaj pojedyncze medium (dla kompatybilności wstecznej)
        const { error: mediaError } = await supabase
          .from('feed_post_media')
          .insert({
            post_id: postData.id,
            url: mediaUrl,
            type: mediaType
          });

        if (mediaError) {
          console.error('Błąd podczas dodawania mediów:', mediaError);
        }
      }

      // Zaktualizuj stan postów (dodaj nowy post na początku)
      setPosts(prevPosts => [
        {
          id: postData.id,
          userId: user.id,
          content: postData.content,
          author: {
            name: user.name || user.full_name || 'Użytkownik',
            avatar: user.avatar || user.avatar_url || '',
            role: user.role || ''
          },
          createdAt: postData.created_at,
          timeAgo: 'przed chwilą',
          likes: 0,
          comments: 0,
          isPoll: false,
          userLiked: false,
          media: mediaFiles ? mediaFiles.map(m => ({
            url: m.url,
            type: m.type
          })) : mediaUrl && mediaType ? [{ url: mediaUrl, type: mediaType }] : undefined,
        },
        ...prevPosts
      ]);

    } catch (error) {
      console.error('Nieoczekiwany błąd podczas tworzenia posta:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    createPost,
    loading
  };
};
