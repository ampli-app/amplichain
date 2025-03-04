
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Post, Comment } from '@/types/social';

export const usePostActions = (user: any | null, setPosts: React.Dispatch<React.SetStateAction<Post[]>>) => {
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
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby utworzyć post",
          variant: "destructive",
        });
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
        toast({
          title: "Błąd",
          description: "Nie udało się utworzyć posta: " + error.message,
          variant: "destructive",
        });
        return;
      }
      
      console.log("Post utworzony pomyślnie:", data);
      
      // Pokaż powiadomienie o sukcesie
      toast({
        title: "Sukces",
        description: "Post został utworzony",
      });
      
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
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas tworzenia posta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do polubienia posta
  const likePost = async (postId: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby polubić post",
          variant: "destructive",
        });
        return;
      }
      
      setLoading(true);
      
      const { error } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: user.id
        });
      
      if (error) {
        if (error.code === '23505') { // Naruszenie ograniczenia unique
          toast({
            title: "Informacja",
            description: "Już polubiłeś ten post",
          });
        } else {
          console.error('Error liking post:', error);
          toast({
            title: "Błąd",
            description: "Nie udało się polubić posta",
            variant: "destructive",
          });
        }
        return;
      }
      
      // Aktualizuj stan lokalny
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, hasLiked: true, likes: post.likes + 1 } 
            : post
        )
      );
      
      toast({
        title: "Sukces",
        description: "Post został polubiony",
      });
    } catch (err) {
      console.error('Unexpected error liking post:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas polubienia posta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do usunięcia polubienia posta
  const unlikePost = async (postId: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby usunąć polubienie",
          variant: "destructive",
        });
        return;
      }
      
      setLoading(true);
      
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error unliking post:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się usunąć polubienia",
          variant: "destructive",
        });
        return;
      }
      
      // Aktualizuj stan lokalny
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, hasLiked: false, likes: Math.max(0, post.likes - 1) } 
            : post
        )
      );
      
      toast({
        title: "Sukces",
        description: "Polubienie zostało usunięte",
      });
    } catch (err) {
      console.error('Unexpected error unliking post:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas usuwania polubienia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do zapisania posta
  const savePost = async (postId: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby zapisać post",
          variant: "destructive",
        });
        return;
      }
      
      setLoading(true);
      
      const { error } = await supabase
        .from('saved_posts')
        .insert({
          post_id: postId,
          user_id: user.id
        });
      
      if (error) {
        if (error.code === '23505') { // Naruszenie ograniczenia unique
          toast({
            title: "Informacja",
            description: "Już zapisałeś ten post",
          });
        } else {
          console.error('Error saving post:', error);
          toast({
            title: "Błąd",
            description: "Nie udało się zapisać posta",
            variant: "destructive",
          });
        }
        return;
      }
      
      // Aktualizuj stan lokalny
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, hasSaved: true, saves: post.saves + 1 } 
            : post
        )
      );
      
      toast({
        title: "Sukces",
        description: "Post został zapisany",
      });
    } catch (err) {
      console.error('Unexpected error saving post:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas zapisywania posta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do usunięcia zapisanego posta
  const unsavePost = async (postId: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby usunąć zapis",
          variant: "destructive",
        });
        return;
      }
      
      setLoading(true);
      
      const { error } = await supabase
        .from('saved_posts')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error unsaving post:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się usunąć zapisu",
          variant: "destructive",
        });
        return;
      }
      
      // Aktualizuj stan lokalny
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, hasSaved: false, saves: Math.max(0, post.saves - 1) } 
            : post
        )
      );
      
      toast({
        title: "Sukces",
        description: "Zapis posta został usunięty",
      });
    } catch (err) {
      console.error('Unexpected error unsaving post:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd podczas usuwania zapisu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    createPost,
    likePost,
    unlikePost,
    savePost,
    unsavePost,
    loading
  };
};
