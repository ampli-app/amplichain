
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SocialContextType, SocialUser } from './types';
import { useCurrentUser } from './useCurrentUser';
import { useUserActions } from './useUserActions';
import { usePostsLoading } from './usePostsLoading';
import { usePostCreation } from './usePostCreation';
import { useNotifications } from './useNotifications';

const SocialContext = createContext<SocialContextType | null>(null);

export const SocialProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoggedIn } = useAuth();
  const [users, setUsers] = useState<SocialUser[]>([]);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  
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
    posts,
    setPosts,
    loading: postsLoading,
    loadPosts,
    getPostsByHashtag,
    getPopularHashtags,
    setUpRealtimeSubscriptions
  } = usePostsLoading(user);
  
  const {
    createPost,
    loading: postCreationLoading
  } = usePostCreation(user, setPosts);
  
  // Wrapper dla createPost, który obsługuje globalny stan ładowania
  const wrappedCreatePost = async (
    content: string, 
    mediaUrl?: string, 
    mediaType?: 'image' | 'video',
    mediaFiles?: Array<{url: string, type: 'image' | 'video'}>
  ) => {
    setIsCreatingPost(true);
    try {
      await createPost(content, mediaUrl, mediaType, mediaFiles);
    } finally {
      setIsCreatingPost(false);
    }
  };
  
  const {
    notifications,
    unreadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useNotifications();
  
  useEffect(() => {
    if (isLoggedIn && user) {
      loadCurrentUserProfile();
      loadPosts();
      loadUsers();
      const cleanupFn = setUpRealtimeSubscriptions();
      
      return cleanupFn;
    } else {
      setCurrentUser(null);
    }
  }, [isLoggedIn, user]);

  // Połącz wszystkie stany ładowania w jeden
  const loading = postsLoading || postCreationLoading || isCreatingPost;
  
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
      createPost: wrappedCreatePost,
      getPostComments: async () => [],
      markNotificationAsRead,
      markAllNotificationsAsRead,
      getPostsByHashtag,
      getPopularHashtags,
      loading
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
