
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Post } from '@/types/social';
import { showErrorToast, showSuccessToast } from './postHelpers';

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
    try {
      if (!user) {
        showErrorToast("Błąd", "Musisz być zalogowany, aby utworzyć post");
        return;
      }
      
      setLoading(true);
      
      // Przygotuj dane posta
      const postData = {
        user_id: user.id,
        content,
        media_url: mediaUrl || null
      };
      
      console.log("Tworzenie posta z danymi:", postData);
      
      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select();
      
      if (error) {
        console.error('Error creating post:', error);
        showErrorToast("Błąd", "Nie udało się utworzyć posta: " + error.message);
        return;
      }
      
      console.log("Post utworzony pomyślnie:", data);
      
      // Pokaż powiadomienie o sukcesie
      showSuccessToast("Post został utworzony");
      
      // Zaktualizuj lokalny stan postów aby uwzględnić nowy post
      if (data && data.length > 0) {
        const newPost = data[0];
        
        try {
          // Pobierz dane profilu użytkownika
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, role')
            .eq('id', user.id)
            .single();
          
          if (profileError) {
            console.error('Error fetching profile data:', profileError);
          }
          
          console.log("Pobrane dane profilu:", profileData);
          
          const author = {
            name: profileData?.full_name || user.user_metadata?.full_name || 'Użytkownik',
            avatar: profileData?.avatar_url || user.user_metadata?.avatar_url || '/placeholder.svg',
            role: profileData?.role || user.user_metadata?.role || ''
          };
          
          console.log("Dane autora posta:", author);
          
          const formattedPost: Post = {
            id: newPost.id,
            userId: newPost.user_id,
            author,
            timeAgo: 'przed chwilą',
            content: newPost.content,
            mediaUrl: newPost.media_url,
            likes: 0,
            comments: 0,
            saves: 0,
            hasLiked: false,
            hasSaved: false,
            hashtags: []
          };
          
          console.log("Sformatowany post do dodania:", formattedPost);
          
          setPosts(prev => {
            console.log("Aktualny stan postów:", prev);
            const updatedPosts = [formattedPost, ...prev];
            console.log("Zaktualizowany stan postów:", updatedPosts);
            return updatedPosts;
          });
        } catch (profileFetchError) {
          console.error('Unexpected error fetching profile:', profileFetchError);
        }
      }
    } catch (err) {
      console.error('Unexpected error creating post:', err);
      showErrorToast("Błąd", "Wystąpił nieoczekiwany błąd podczas tworzenia posta");
    } finally {
      setLoading(false);
    }
  };

  return {
    createPost,
    loading
  };
};
