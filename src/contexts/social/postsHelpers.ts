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

// Funkcja do pobierania liczby komentarzy posta
export const fetchPostCommentsCount = async (postId: string) => {
  // Usuwamy faktyczne sprawdzenie komentarzy, ponieważ tabela została usunięta
  return 0;
};

// Funkcja do pobierania metadanych dla posta
export const enrichPostWithMetadata = async (post: any, userId: string | undefined): Promise<Post> => {
  // Pobierz dane profilu użytkownika
  const profileData = await fetchUserProfile(post.user_id);
      
  // Pobierz liczbę komentarzy - zawsze 0 po usunięciu tabeli
  const commentsCount = 0;
  
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
    likes: 0,
    comments: commentsCount,
    hashtags
  };
};
