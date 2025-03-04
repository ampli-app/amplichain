
import { Post } from '@/types/social';
import { supabase } from '@/integrations/supabase/client';

// Funkcja do obliczania względnego czasu
export const calculateTimeAgo = (createdAt: string): string => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} sek. temu`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)} min. temu`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)} godz. temu`;
  } else {
    return `${Math.floor(diffInSeconds / 86400)} dni temu`;
  }
};

// Funkcja do pobierania danych profilu użytkownika
export const fetchUserProfile = async (userId: string) => {
  const { data: profileData } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, role')
    .eq('id', userId)
    .maybeSingle();
    
  return profileData;
};

// Funkcja do sprawdzania, czy użytkownik polubił post
export const checkPostLiked = async (postId: string, userId: string | undefined) => {
  if (!userId) return false;
  
  const { data: likeData } = await supabase
    .from('post_likes')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();
  
  return !!likeData;
};

// Funkcja do sprawdzania, czy użytkownik zapisał post
export const checkPostSaved = async (postId: string, userId: string | undefined) => {
  if (!userId) return false;
  
  const { data: saveData } = await supabase
    .from('saved_posts')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();
  
  return !!saveData;
};

// Funkcja do pobierania liczby polubień posta
export const fetchPostLikesCount = async (postId: string) => {
  const { count } = await supabase
    .from('post_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);
  
  return count || 0;
};

// Funkcja do pobierania liczby komentarzy posta
export const fetchPostCommentsCount = async (postId: string) => {
  const { count } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);
  
  return count || 0;
};

// Funkcja do pobierania liczby zapisań posta
export const fetchPostSavesCount = async (postId: string) => {
  const { count } = await supabase
    .from('saved_posts')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);
  
  return count || 0;
};

// Funkcja do pobierania metadanych dla posta
export const enrichPostWithMetadata = async (post: any, userId: string | undefined): Promise<Post> => {
  // Pobierz dane profilu użytkownika
  const profileData = await fetchUserProfile(post.user_id);
      
  // Pobierz liczbę polubień, komentarzy i zapisów posta
  const likesCount = await fetchPostLikesCount(post.id);
  const commentsCount = await fetchPostCommentsCount(post.id);
  const savesCount = await fetchPostSavesCount(post.id);
  
  // Sprawdź, czy zalogowany użytkownik polubił i zapisał post
  const hasLiked = await checkPostLiked(post.id, userId);
  const hasSaved = await checkPostSaved(post.id, userId);
  
  // Wyodrębnij hashtagi
  const hashtags = post.post_hashtags?.map((ph: any) => ph.hashtags.name) || [];
  
  // Oblicz czas względny
  const timeAgo = calculateTimeAgo(post.created_at);
  
  return {
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
    likes: likesCount,
    comments: commentsCount,
    saves: savesCount,
    hasLiked,
    hasSaved,
    hashtags
  };
};
