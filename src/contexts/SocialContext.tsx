
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserConnectionStatus = 'none' | 'following' | 'connected' | 'pending_sent' | 'pending_received';

export interface Post {
  id: string;
  userId: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  timeAgo: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: number;
  comments: number;
  hasLiked?: boolean;
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

export interface SocialUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: string;
  bio?: string;
  connectionStatus?: UserConnectionStatus;
  isCurrentUser?: boolean;
  followersCount: number;
  followingCount: number;
  connectionsCount: number;
}

interface SocialContextType {
  currentUser: SocialUser | null;
  users: SocialUser[];
  posts: Post[];
  notifications: Notification[];
  unreadNotifications: number;
  fetchUserProfile: (userId: string) => SocialUser | null;
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  sendConnectionRequest: (userId: string) => void;
  acceptConnectionRequest: (userId: string) => void;
  declineConnectionRequest: (userId: string) => void;
  removeConnection: (userId: string) => void;
  createPost: (content: string, mediaUrl?: string, mediaType?: 'image' | 'video') => void;
  likePost: (postId: string) => void;
  unlikePost: (postId: string) => void;
  commentOnPost: (postId: string, comment: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
}

const SocialContext = createContext<SocialContextType | null>(null);

// Mock data
const mockUsers: SocialUser[] = [
  {
    id: "user123",
    name: "Alex Thompson",
    username: "alexthompson",
    avatar: "/placeholder.svg",
    role: "Music Producer",
    followersCount: 854,
    followingCount: 235,
    connectionsCount: 312,
    isCurrentUser: true
  },
  {
    id: "user124",
    name: "Sarah Johnson",
    username: "sarahjohnson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop",
    role: "Senior Producer",
    followersCount: 1243,
    followingCount: 352,
    connectionsCount: 451,
    connectionStatus: 'following'
  },
  {
    id: "user125",
    name: "Marcus Rivera",
    username: "marcusrivera",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop",
    role: "Artist Manager",
    followersCount: 967,
    followingCount: 210,
    connectionsCount: 378,
    connectionStatus: 'connected'
  },
  {
    id: "user126",
    name: "Maya Reeves",
    username: "mayareeves",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D",
    role: "Recording Artist",
    followersCount: 2341,
    followingCount: 512,
    connectionsCount: 289,
    connectionStatus: 'pending_sent'
  },
  {
    id: "user127",
    name: "James Wilson",
    username: "jameswilson",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHByb2Zlc3Npb25hbCUyMG1hbnxlbnwwfHwwfHx8MA%3D%3D",
    role: "Sound Engineer",
    followersCount: 756,
    followingCount: 243,
    connectionsCount: 189,
    connectionStatus: 'pending_received'
  }
];

const mockPosts: Post[] = [
  {
    id: "post1",
    userId: "user124",
    author: {
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop",
      role: "Music Producer"
    },
    timeAgo: "2h ago",
    content: "Just wrapped up an amazing session with the talented @JamesBrown. The new single is going to blow everyone away! 🎵 #MusicProduction #NewRelease",
    likes: 46,
    comments: 8
  },
  {
    id: "post2",
    userId: "user125",
    author: {
      name: "Marcus Rivera",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop",
      role: "Studio Engineer"
    },
    timeAgo: "5h ago",
    content: "Testing out the new SSL console today at the studio. The clarity and warmth this thing delivers is next level. What's your favorite mixing console?",
    mediaUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop",
    mediaType: "image",
    likes: 29,
    comments: 12
  },
  {
    id: "post3",
    userId: "user126",
    author: {
      name: "Maya Reeves",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmVzc2lvbmFsJTIwd29tYW58ZW58MHx8MHx8fDA%3D",
      role: "A&R Executive"
    },
    timeAgo: "1d ago",
    content: "Looking for emerging indie artists with strong songwriting skills for a new project. Send me your demos if you think you've got what it takes!",
    likes: 73,
    comments: 24,
    hasLiked: true
  }
];

const mockNotifications: Notification[] = [
  {
    id: "notif1",
    type: "follow",
    from: {
      id: "user124",
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop"
    },
    read: false,
    time: "2h ago"
  },
  {
    id: "notif2",
    type: "connection_request",
    from: {
      id: "user127",
      name: "James Wilson",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHByb2Zlc3Npb25hbCUyMG1hbnxlbnwwfHwwfHx8MA%3D%3D"
    },
    read: false,
    time: "5h ago"
  },
  {
    id: "notif3",
    type: "like",
    from: {
      id: "user125",
      name: "Marcus Rivera",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"
    },
    read: true,
    time: "1d ago",
    postId: "post1"
  }
];

export const SocialProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<SocialUser[]>(mockUsers);
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  
  const currentUser = users.find(user => user.isCurrentUser) || null;
  
  const unreadNotifications = notifications.filter(notif => !notif.read).length;
  
  const fetchUserProfile = (userId: string) => {
    return users.find(user => user.id === userId) || null;
  };
  
  const followUser = (userId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, connectionStatus: 'following', followersCount: user.followersCount + 1 } 
          : user.isCurrentUser 
            ? { ...user, followingCount: user.followingCount + 1 } 
            : user
      )
    );
    
    const targetUser = users.find(user => user.id === userId);
    if (targetUser) {
      const newNotification: Notification = {
        id: `notif${Date.now()}`,
        type: 'follow',
        from: {
          id: currentUser?.id || '',
          name: currentUser?.name || '',
          avatar: currentUser?.avatar || ''
        },
        read: false,
        time: 'Just now'
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  };
  
  const unfollowUser = (userId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, connectionStatus: 'none', followersCount: Math.max(0, user.followersCount - 1) } 
          : user.isCurrentUser 
            ? { ...user, followingCount: Math.max(0, user.followingCount - 1) } 
            : user
      )
    );
  };
  
  const sendConnectionRequest = (userId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, connectionStatus: 'pending_sent' } 
          : user
      )
    );
    
    const targetUser = users.find(user => user.id === userId);
    if (targetUser) {
      const newNotification: Notification = {
        id: `notif${Date.now()}`,
        type: 'connection_request',
        from: {
          id: currentUser?.id || '',
          name: currentUser?.name || '',
          avatar: currentUser?.avatar || ''
        },
        read: false,
        time: 'Just now'
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  };
  
  const acceptConnectionRequest = (userId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, connectionStatus: 'connected', connectionsCount: user.connectionsCount + 1 } 
          : user.isCurrentUser 
            ? { ...user, connectionsCount: user.connectionsCount + 1 } 
            : user
      )
    );
    
    const targetUser = users.find(user => user.id === userId);
    if (targetUser) {
      const newNotification: Notification = {
        id: `notif${Date.now()}`,
        type: 'connection_accepted',
        from: {
          id: currentUser?.id || '',
          name: currentUser?.name || '',
          avatar: currentUser?.avatar || ''
        },
        read: false,
        time: 'Just now'
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  };
  
  const declineConnectionRequest = (userId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, connectionStatus: 'none' } 
          : user
      )
    );
  };
  
  const removeConnection = (userId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, connectionStatus: 'none', connectionsCount: Math.max(0, user.connectionsCount - 1) } 
          : user.isCurrentUser 
            ? { ...user, connectionsCount: Math.max(0, user.connectionsCount - 1) } 
            : user
      )
    );
  };
  
  const createPost = (content: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
    if (!currentUser) return;
    
    const newPost: Post = {
      id: `post${Date.now()}`,
      userId: currentUser.id,
      author: {
        name: currentUser.name,
        avatar: currentUser.avatar,
        role: currentUser.role
      },
      timeAgo: 'Just now',
      content,
      mediaUrl,
      mediaType,
      likes: 0,
      comments: 0
    };
    
    setPosts(prev => [newPost, ...prev]);
  };
  
  const likePost = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1, hasLiked: true } 
          : post
      )
    );
    
    const targetPost = posts.find(post => post.id === postId);
    if (targetPost) {
      const newNotification: Notification = {
        id: `notif${Date.now()}`,
        type: 'like',
        from: {
          id: currentUser?.id || '',
          name: currentUser?.name || '',
          avatar: currentUser?.avatar || ''
        },
        read: false,
        time: 'Just now',
        postId
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  };
  
  const unlikePost = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, likes: Math.max(0, post.likes - 1), hasLiked: false } 
          : post
      )
    );
  };
  
  const commentOnPost = (postId: string, comment: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, comments: post.comments + 1 } 
          : post
      )
    );
    
    const targetPost = posts.find(post => post.id === postId);
    if (targetPost) {
      const newNotification: Notification = {
        id: `notif${Date.now()}`,
        type: 'comment',
        from: {
          id: currentUser?.id || '',
          name: currentUser?.name || '',
          avatar: currentUser?.avatar || ''
        },
        read: false,
        time: 'Just now',
        postId
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  };
  
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true } 
          : notif
      )
    );
  };
  
  const markAllNotificationsAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notif => ({ ...notif, read: true }))
    );
  };
  
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
      createPost,
      likePost,
      unlikePost,
      commentOnPost,
      markNotificationAsRead,
      markAllNotificationsAsRead
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
