
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SocialUser, Notification } from './social/types';
import { useNotifications } from './social/useNotifications';
import { usePosts } from './social/usePosts';
import { useConnections } from './social/useConnections';
import { useHashtags } from './social/useHashtags';
import { useProfile } from './social/useProfile';

interface SocialContextProps {
  isInitialized: boolean;
  notifications: Notification[];
  unreadNotifications: number;
  currentUser: SocialUser | null;
  users: SocialUser[];
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markNotificationsAsRead: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  fetchUserPosts: (userId: string) => Promise<any[]>;
  fetchFeedPosts: () => Promise<any[]>;
  fetchUserProfile: (userId: string) => Promise<SocialUser | null>;
  addPost: (postData: any) => Promise<any>;
  createPost: (content: string, mediaUrl?: string, mediaType?: string, mediaFiles?: Array<{ url: string, type: string }>) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  addComment: (postId: string, comment: string) => Promise<void>;
  fetchPostComments: (postId: string) => Promise<any[]>;
  followHashtag: (hashtag: string) => Promise<void>;
  unfollowHashtag: (hashtag: string) => Promise<void>;
  fetchTrendingHashtags: () => Promise<any[]>;
  getPopularHashtags: () => Promise<any[]>;
  fetchUserConnections: (userId: string) => Promise<any[]>;
  fetchUserSuggestions: () => Promise<any[]>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  sendConnectionRequest: (targetUserId: string) => Promise<void>;
  acceptConnectionRequest: (requestId: string) => Promise<void>;
  declineConnectionRequest: (requestId: string) => Promise<void>;
  removeConnection: (connectionId: string, keepFollowing?: boolean) => Promise<void>;
}

const SocialContext = createContext<SocialContextProps | null>(null);

export const SocialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Inicjalizacja wszystkich potrzebnych hooków
  const notificationsHook = useNotifications();
  const postsHook = usePosts();
  const connectionsHook = useConnections();
  const hashtagsHook = useHashtags();
  const profileHook = useProfile();

  useEffect(() => {
    // Inicjalizacja kontekstu
    setIsInitialized(true);
  }, []);

  // Połącz wszystkie hooki w jeden kontekst
  const contextValue: SocialContextProps = {
    isInitialized,
    // Z useNotifications
    notifications: notificationsHook.notifications,
    unreadNotifications: notificationsHook.unreadNotifications,
    refreshNotifications: notificationsHook.refreshNotifications,
    markNotificationsAsRead: notificationsHook.markNotificationsAsRead,
    markNotificationAsRead: notificationsHook.markNotificationAsRead,
    markAllNotificationsAsRead: notificationsHook.markAllNotificationsAsRead,
    
    // Z useProfile
    currentUser: profileHook.currentUser,
    loading: profileHook.loading,
    
    // Z useConnections
    users: connectionsHook.users,
    fetchUserProfile: connectionsHook.fetchUserProfile,
    followUser: connectionsHook.followUser,
    unfollowUser: connectionsHook.unfollowUser,
    fetchUserConnections: connectionsHook.fetchUserConnections,
    fetchUserSuggestions: connectionsHook.fetchUserSuggestions,
    sendConnectionRequest: connectionsHook.sendConnectionRequest,
    acceptConnectionRequest: connectionsHook.acceptConnectionRequest,
    declineConnectionRequest: connectionsHook.declineConnectionRequest,
    removeConnection: connectionsHook.removeConnection,
    
    // Z usePosts
    fetchUserPosts: postsHook.fetchUserPosts,
    fetchFeedPosts: postsHook.fetchFeedPosts,
    addPost: postsHook.addPost,
    createPost: postsHook.createPost,
    likePost: postsHook.likePost,
    unlikePost: postsHook.unlikePost,
    addComment: postsHook.addComment,
    fetchPostComments: postsHook.fetchPostComments,
    
    // Z useHashtags
    followHashtag: hashtagsHook.followHashtag,
    unfollowHashtag: hashtagsHook.unfollowHashtag,
    fetchTrendingHashtags: hashtagsHook.fetchTrendingHashtags,
    getPopularHashtags: hashtagsHook.getPopularHashtags
  };

  return (
    <SocialContext.Provider value={contextValue}>
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
