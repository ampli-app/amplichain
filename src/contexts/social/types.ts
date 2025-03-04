
import { Post, Comment, Hashtag } from "@/types/social";

export type UserConnectionStatus = 'none' | 'following' | 'connected' | 'pending_sent' | 'pending_received';

export interface SocialUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: string;
  bio?: string;
  connectionStatus?: UserConnectionStatus;
  isCurrentUser?: boolean;
  isFollower?: boolean;
  followersCount: number;
  followingCount: number;
  connectionsCount: number;
}

export interface Notification {
  id: string;
  type: 'follow' | 'connection_request' | 'connection_accepted' | 'like' | 'comment';
  from: {
    id: string;
    name: string;
    avatar: string;
  };
  read: boolean;
  time: string;
  postId?: string;
}

export interface SocialContextType {
  currentUser: SocialUser | null;
  users: SocialUser[];
  posts: Post[];
  notifications: Notification[];
  unreadNotifications: number;
  fetchUserProfile: (userId: string) => Promise<SocialUser | null>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  sendConnectionRequest: (userId: string) => Promise<void>;
  acceptConnectionRequest: (userId: string) => Promise<void>;
  declineConnectionRequest: (userId: string) => Promise<void>;
  removeConnection: (userId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<SocialUser[]>;
  createPost: (content: string, mediaUrl?: string, mediaType?: 'image' | 'video', mediaFiles?: Array<{url: string, type: 'image' | 'video'}>) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  savePost: (postId: string) => Promise<void>;
  unsavePost: (postId: string) => Promise<void>;
  commentOnPost: (postId: string, content: string, parentId?: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  unlikeComment: (commentId: string) => Promise<void>;
  getPostComments: (postId: string, parentId?: string) => Promise<Comment[]>;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  getPostsByHashtag: (hashtag: string) => Promise<Post[]>;
  getPopularHashtags: () => Promise<Hashtag[]>;
  loading: boolean;
}
