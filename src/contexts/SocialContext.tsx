
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SocialContextType, SocialUser } from './social/types';
import { useCurrentUser } from './social/useCurrentUser';
import { useUserActions } from './social/useUserActions';
import { useNotifications } from './social/useNotifications';
import { useHashtags } from './social/useHashtags';
import { Post, Comment } from '@/types/social';

const SocialContext = createContext<SocialContextType | null>(null);

export const SocialProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoggedIn } = useAuth();
  const [users, setUsers] = useState<SocialUser[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Użyj zrefaktoryzowanych hooków
  const { currentUser, setCurrentUser, loadCurrentUserProfile } = useCurrentUser(user);
  
  const { 
    loadUsers,
    fetchUserProfile, 
    searchUsers, 
    followUser, 
    unfollowUser, 
    sendConnectionRequest, 
    acceptConnectionRequest, 
    declineConnectionRequest, 
    removeConnection 
  } = useUserActions(user, setUsers, currentUser, setCurrentUser);
  
  const {
    getPostsByHashtag,
    getPopularHashtags
  } = useHashtags(user?.id);
  
  const {
    notifications,
    unreadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useNotifications();
  
  // Funkcja do pobierania postów
  const loadPosts = async () => {
    try {
      setLoading(true);
      
      const { data: postsData, error: postsError } = await supabase
        .from('feed_posts')
        .select(`
          id,
          content,
          created_at,
          is_poll,
          user_id,
          feed_post_media (id, url, type),
          feed_post_files (id, name, url, type, size),
          feed_post_poll_options (
            id, 
            text,
            feed_post_poll_votes (id, user_id)
          ),
          feed_post_likes (id, user_id),
          feed_post_comments (id)
        `)
        .order('created_at', { ascending: false });
        
      if (postsError) {
        console.error('Błąd podczas pobierania postów:', postsError);
        return;
      }
      
      // Pobierz dane autorów postów
      const userIds = [...new Set(postsData?.map(post => post.user_id) || [])];
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .in('id', userIds);

      if (usersError) {
        console.error('Błąd podczas pobierania danych użytkowników:', usersError);
      }
      
      // Pobierz hashtagi dla każdego posta
      const postIds = postsData?.map(post => post.id) || [];
      const { data: hashtagsData, error: hashtagsError } = await supabase
        .from('feed_post_hashtags')
        .select(`
          post_id,
          hashtags (id, name)
        `)
        .in('post_id', postIds);
        
      if (hashtagsError) {
        console.error('Błąd podczas pobierania hashtagów:', hashtagsError);
      }
      
      // Pogrupuj hashtagi według post_id
      const hashtagsByPostId: Record<string, string[]> = {};
      hashtagsData?.forEach(item => {
        if (item.post_id && item.hashtags) {
          if (!hashtagsByPostId[item.post_id]) {
            hashtagsByPostId[item.post_id] = [];
          }
          hashtagsByPostId[item.post_id].push(item.hashtags.name);
        }
      });
      
      // Przetwórz dane na format Post
      const formattedPosts: Post[] = postsData?.map(post => {
        const authorProfile = usersData?.find(user => user.id === post.user_id);
        
        // Utwórz obiekt autora z danymi z profilu lub domyślnymi wartościami
        const author = authorProfile ? {
          name: authorProfile.full_name || 'Nieznany użytkownik',
          avatar: authorProfile.avatar_url || '',
          role: authorProfile.role || ''
        } : { 
          name: 'Nieznany użytkownik', 
          avatar: '', 
          role: ''
        };
        
        // Pobierz media posta (zdjęcia i wideo)
        const media = post.feed_post_media?.map(media => ({
          url: media.url,
          type: media.type as 'image' | 'video'
        })) || [];
        
        const files = post.feed_post_files?.map(file => ({
          name: file.name,
          url: file.url,
          type: file.type,
          size: file.size
        })) || [];
        
        const pollOptions = post.is_poll ? post.feed_post_poll_options?.map(option => ({
          id: option.id,
          text: option.text,
          votes: option.feed_post_poll_votes?.length || 0
        })) : undefined;
        
        // Sprawdź, czy użytkownik zagłosował
        const userVoted = post.is_poll && user ? 
          (post.feed_post_poll_options?.find(option => 
            option.feed_post_poll_votes?.some(vote => vote.user_id === user.id)
          )?.id || undefined) : 
          undefined;
        
        const timeAgo = formatTimeAgo(new Date(post.created_at));
        
        // Sprawdź, czy bieżący użytkownik polubił post
        const userLiked = user ? post.feed_post_likes?.some(like => like.user_id === user.id) : false;
        
        return {
          id: post.id,
          userId: post.user_id,
          content: post.content,
          author,
          createdAt: post.created_at,
          timeAgo,
          isPoll: post.is_poll || false,
          pollOptions,
          userVoted,
          userLiked,
          likes: post.feed_post_likes?.length || 0,
          comments: post.feed_post_comments?.length || 0,
          media: media.length > 0 ? media : undefined,
          files: files.length > 0 ? files : undefined,
          hashtags: hashtagsByPostId[post.id] || []
        };
      }) || [];
      
      setPosts(formattedPosts);
    } catch (error) {
      console.error('Nieoczekiwany błąd podczas pobierania postów:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Funkcja do tworzenia nowego posta
  const createPost = async (
    content: string, 
    mediaUrl?: string, 
    mediaType?: 'image' | 'video',
    mediaFiles?: Array<{url: string, type: 'image' | 'video'}>
  ) => {
    if (!user) {
      return;
    }
    
    setIsCreatingPost(true);
    try {
      // Ta funkcja jest już nieużywana - posty są tworzone bezpośrednio w komponencie FeedPostCreate
      console.log("Funkcja createPost w SocialContext jest przestarzała i została zastąpiona przez bezpośrednie tworzenie postów w komponencie");
    } finally {
      setIsCreatingPost(false);
    }
  };
  
  // Funkcja do pobierania komentarzy (zaślepka)
  const getPostComments = async (postId: string, parentId?: string): Promise<Comment[]> => {
    return [];
  };
  
  useEffect(() => {
    if (isLoggedIn && user) {
      loadCurrentUserProfile();
      loadPosts();
      loadUsers();
      
      // Ustaw słuchacza zmian w czasie rzeczywistym
      const postChangesChannel = supabase
        .channel('public:feed_posts')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'feed_posts' },
          () => {
            loadPosts();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(postChangesChannel);
      };
    } else {
      setCurrentUser(null);
    }
  }, [isLoggedIn, user]);
  
  return (
    <SocialContext.Provider value={{
      currentUser,
      users,
      posts,
      notifications,
      unreadNotifications,
      fetchUserProfile,
      followUser,
      unfollowUser,
      sendConnectionRequest,
      acceptConnectionRequest,
      declineConnectionRequest,
      removeConnection,
      searchUsers,
      createPost,
      getPostComments,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      getPostsByHashtag,
      getPopularHashtags,
      loading: loading || isCreatingPost
    }}>
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};

// Funkcja pomocnicza do formatowania czasu
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffMonth / 12);

  if (diffYear > 0) {
    return `${diffYear} ${diffYear === 1 ? 'rok' : diffYear < 5 ? 'lata' : 'lat'} temu`;
  } else if (diffMonth > 0) {
    return `${diffMonth} ${diffMonth === 1 ? 'miesiąc' : diffMonth < 5 ? 'miesiące' : 'miesięcy'} temu`;
  } else if (diffDay > 0) {
    return `${diffDay} ${diffDay === 1 ? 'dzień' : 'dni'} temu`;
  } else if (diffHour > 0) {
    return `${diffHour} ${diffHour === 1 ? 'godz.' : 'godz.'} temu`;
  } else if (diffMin > 0) {
    return `${diffMin} ${diffMin === 1 ? 'min.' : 'min.'} temu`;
  } else {
    return 'przed chwilą';
  }
}
