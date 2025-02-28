
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

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
  isFollower?: boolean;
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
  fetchUserProfile: (userId: string) => Promise<SocialUser | null>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  sendConnectionRequest: (userId: string) => Promise<void>;
  acceptConnectionRequest: (userId: string) => Promise<void>;
  declineConnectionRequest: (userId: string) => Promise<void>;
  removeConnection: (userId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<SocialUser[]>;
  createPost: (content: string, mediaUrl?: string, mediaType?: 'image' | 'video') => void;
  likePost: (postId: string) => void;
  unlikePost: (postId: string) => void;
  commentOnPost: (postId: string, comment: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  loading: boolean;
}

const SocialContext = createContext<SocialContextType | null>(null);

export const SocialProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoggedIn } = useAuth();
  const [currentUser, setCurrentUser] = useState<SocialUser | null>(null);
  const [users, setUsers] = useState<SocialUser[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  
  const unreadNotifications = notifications.filter(notif => !notif.read).length;
  
  // Załaduj profil aktualnego użytkownika oraz innych użytkowników
  useEffect(() => {
    if (isLoggedIn && user) {
      loadCurrentUserProfile();
      loadUsers();
    } else {
      setCurrentUser(null);
      setLoading(false);
    }
  }, [isLoggedIn, user]);
  
  // Pobierz profil aktualnego zalogowanego użytkownika
  const loadCurrentUserProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (error) {
        console.error('Error loading current user profile:', error);
        return;
      }

      if (data) {
        setCurrentUser({
          id: data.id,
          name: data.full_name || '',
          username: data.username || '',
          avatar: data.avatar_url || '/placeholder.svg',
          role: data.role || '',
          bio: data.bio,
          isCurrentUser: true,
          followersCount: data.followers || 0,
          followingCount: data.following || 0,
          connectionsCount: data.connections || 0
        });
      }
    } catch (err) {
      console.error('Unexpected error loading current user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Pobierz innych użytkowników i ich status połączenia z bieżącym użytkownikiem
  const loadUsers = async () => {
    try {
      setLoading(true);
      
      if (!user) return;
      
      // Pobierz wszystkie profile z wyjątkiem bieżącego użytkownika
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        return;
      }

      // Pobierz informacje o obserwowaniach
      const { data: followingsData, error: followingsError } = await supabase
        .from('followings')
        .select('*')
        .eq('follower_id', user.id);

      if (followingsError) {
        console.error('Error loading followings:', followingsError);
      }

      // Pobierz informacje o połączeniach
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select('*')
        .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`);

      if (connectionsError) {
        console.error('Error loading connections:', connectionsError);
      }

      // Pobierz informacje o wysłanych zaproszeniach do połączenia
      const { data: sentRequestsData, error: sentRequestsError } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('sender_id', user.id)
        .eq('status', 'pending');

      if (sentRequestsError) {
        console.error('Error loading sent connection requests:', sentRequestsError);
      }

      // Pobierz informacje o otrzymanych zaproszeniach do połączenia
      const { data: receivedRequestsData, error: receivedRequestsError } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (receivedRequestsError) {
        console.error('Error loading received connection requests:', receivedRequestsError);
      }

      // Zbuduj mapę użytkowników ze statusami połączeń
      const followingIds = new Set((followingsData || []).map(f => f.following_id));
      const connectionIds = new Set(
        (connectionsData || []).flatMap(c => [c.user_id1, c.user_id2]).filter(id => id !== user.id)
      );
      const sentRequestIds = new Set((sentRequestsData || []).map(r => r.receiver_id));
      const receivedRequestIds = new Set((receivedRequestsData || []).map(r => r.sender_id));

      const usersList = (profilesData || []).map(profile => {
        let connectionStatus: UserConnectionStatus = 'none';
        
        if (connectionIds.has(profile.id)) {
          connectionStatus = 'connected';
        } else if (sentRequestIds.has(profile.id)) {
          connectionStatus = 'pending_sent';
        } else if (receivedRequestIds.has(profile.id)) {
          connectionStatus = 'pending_received';
        } else if (followingIds.has(profile.id)) {
          connectionStatus = 'following';
        }

        return {
          id: profile.id,
          name: profile.full_name || '',
          username: profile.username || '',
          avatar: profile.avatar_url || '/placeholder.svg',
          role: profile.role || '',
          bio: profile.bio,
          connectionStatus,
          followersCount: profile.followers || 0,
          followingCount: profile.following || 0,
          connectionsCount: profile.connections || 0
        };
      });

      setUsers(usersList);
    } catch (err) {
      console.error('Unexpected error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Pobierz profil konkretnego użytkownika
  const fetchUserProfile = async (userId: string) => {
    try {
      // Sprawdź, czy już mamy tego użytkownika w pamięci
      const cachedUser = users.find(u => u.id === userId);
      if (cachedUser) return cachedUser;

      // Jeśli nie, pobierz z bazy
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (!data) return null;

      // Określ status połączenia
      let connectionStatus: UserConnectionStatus = 'none';
      
      if (user) {
        // Sprawdź, czy jest w połączeniach
        const { data: connectionData } = await supabase
          .from('connections')
          .select('*')
          .or(`and(user_id1.eq.${user.id},user_id2.eq.${userId}),and(user_id1.eq.${userId},user_id2.eq.${user.id})`)
          .single();

        if (connectionData) {
          connectionStatus = 'connected';
        } else {
          // Sprawdź wysłane zaproszenia
          const { data: sentRequest } = await supabase
            .from('connection_requests')
            .select('*')
            .eq('sender_id', user.id)
            .eq('receiver_id', userId)
            .eq('status', 'pending')
            .single();

          if (sentRequest) {
            connectionStatus = 'pending_sent';
          } else {
            // Sprawdź otrzymane zaproszenia
            const { data: receivedRequest } = await supabase
              .from('connection_requests')
              .select('*')
              .eq('sender_id', userId)
              .eq('receiver_id', user.id)
              .eq('status', 'pending')
              .single();

            if (receivedRequest) {
              connectionStatus = 'pending_received';
            } else {
              // Sprawdź obserwowanie
              const { data: followingData } = await supabase
                .from('followings')
                .select('*')
                .eq('follower_id', user.id)
                .eq('following_id', userId)
                .single();

              if (followingData) {
                connectionStatus = 'following';
              }
            }
          }
        }
      }

      const userProfile: SocialUser = {
        id: data.id,
        name: data.full_name || '',
        username: data.username || '',
        avatar: data.avatar_url || '/placeholder.svg',
        role: data.role || '',
        bio: data.bio,
        connectionStatus,
        followersCount: data.followers || 0,
        followingCount: data.following || 0,
        connectionsCount: data.connections || 0
      };

      return userProfile;
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      return null;
    }
  };

  // Wyszukiwanie użytkowników
  const searchUsers = async (query: string): Promise<SocialUser[]> => {
    try {
      if (!query.trim()) return [];

      const searchTerm = query.toLowerCase().trim();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .neq('id', user?.id || '');

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      if (!data || data.length === 0) return [];

      // Określ status połączenia dla każdego użytkownika
      const userProfiles = await Promise.all(
        data.map(async (profile) => {
          const userProfile = await fetchUserProfile(profile.id);
          return userProfile;
        })
      );

      return userProfiles.filter(Boolean) as SocialUser[];
    } catch (err) {
      console.error('Error in searchUsers:', err);
      return [];
    }
  };

  // Obserwuj użytkownika
  const followUser = async (userId: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby obserwować użytkowników.",
          variant: "destructive",
        });
        return;
      }

      // Dodaj wpis do tabeli followings
      const { error } = await supabase
        .from('followings')
        .insert({
          follower_id: user.id,
          following_id: userId
        });

      if (error) {
        console.error('Error following user:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się obserwować użytkownika.",
          variant: "destructive",
        });
        return;
      }

      // Aktualizuj stan lokalny
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? { ...u, connectionStatus: 'following', followersCount: u.followersCount + 1 } 
            : u
        )
      );

      // Aktualizuj licznik obserwowanych dla currentUser
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          followingCount: currentUser.followingCount + 1
        });
      }

      toast({
        title: "Sukces",
        description: "Pomyślnie obserwujesz użytkownika.",
      });

      // Odśwież dane
      loadUsers();
    } catch (err) {
      console.error('Unexpected error following user:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd.",
        variant: "destructive",
      });
    }
  };

  // Przestań obserwować użytkownika
  const unfollowUser = async (userId: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby przestać obserwować użytkowników.",
          variant: "destructive",
        });
        return;
      }

      // Najpierw sprawdź, czy istnieje połączenie między użytkownikami
      const { data: connectionData } = await supabase
        .from('connections')
        .select('*')
        .or(`and(user_id1.eq.${user.id},user_id2.eq.${userId}),and(user_id1.eq.${userId},user_id2.eq.${user.id})`)
        .single();

      if (connectionData) {
        toast({
          title: "Nie można przestać obserwować",
          description: "Nie możesz przestać obserwować użytkownika, z którym masz połączenie. Najpierw usuń połączenie.",
          variant: "destructive",
        });
        return;
      }

      // Usuń wpis z tabeli followings
      const { error } = await supabase
        .from('followings')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) {
        console.error('Error unfollowing user:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się przestać obserwować użytkownika.",
          variant: "destructive",
        });
        return;
      }

      // Aktualizuj stan lokalny
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? { ...u, connectionStatus: 'none', followersCount: Math.max(0, u.followersCount - 1) } 
            : u
        )
      );

      // Aktualizuj licznik obserwowanych dla currentUser
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          followingCount: Math.max(0, currentUser.followingCount - 1)
        });
      }

      toast({
        title: "Sukces",
        description: "Pomyślnie przestałeś obserwować użytkownika.",
      });

      // Odśwież dane
      loadUsers();
    } catch (err) {
      console.error('Unexpected error unfollowing user:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd.",
        variant: "destructive",
      });
    }
  };

  // Wyślij zaproszenie do połączenia
  const sendConnectionRequest = async (userId: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby wysłać zaproszenie do połączenia.",
          variant: "destructive",
        });
        return;
      }

      // Sprawdź, czy zaproszenie już istnieje
      const { data: existingRequest, error: checkError } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('sender_id', user.id)
        .eq('receiver_id', userId)
        .maybeSingle();

      if (existingRequest) {
        toast({
          title: "Informacja",
          description: "Zaproszenie do tego użytkownika zostało już wysłane.",
        });
        return;
      }

      // Sprawdź, czy osoba już obserwuje użytkownika - jeśli nie, najpierw obserwuj
      const { data: followingData } = await supabase
        .from('followings')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      if (!followingData) {
        // Najpierw dodaj obserwowanie
        const { error: followError } = await supabase
          .from('followings')
          .insert({
            follower_id: user.id,
            following_id: userId
          });

        if (followError) {
          console.error('Error auto-following before connection request:', followError);
        }
      }

      // Dodaj wpis do tabeli connection_requests
      const { error } = await supabase
        .from('connection_requests')
        .insert({
          sender_id: user.id,
          receiver_id: userId,
          status: 'pending'
        });

      if (error) {
        console.error('Error sending connection request:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się wysłać zaproszenia do połączenia.",
          variant: "destructive",
        });
        return;
      }

      // Aktualizuj stan lokalny
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? { ...u, connectionStatus: 'pending_sent', followersCount: u.followersCount + (!followingData ? 1 : 0) } 
            : u
        )
      );

      // Aktualizuj licznik obserwowanych dla currentUser jeśli auto-obserwowanie było potrzebne
      if (!followingData && currentUser) {
        setCurrentUser({
          ...currentUser,
          followingCount: currentUser.followingCount + 1
        });
      }

      toast({
        title: "Sukces",
        description: "Zaproszenie do połączenia zostało wysłane.",
      });

      // Odśwież dane
      loadUsers();
    } catch (err) {
      console.error('Unexpected error sending connection request:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd.",
        variant: "destructive",
      });
      throw err; // Rzucamy błąd, aby obsłużyć go w komponencie
    }
  };

  // Akceptuj zaproszenie do połączenia
  const acceptConnectionRequest = async (userId: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby zaakceptować zaproszenie.",
          variant: "destructive",
        });
        return;
      }

      // Znajdź zaproszenie
      const { data: requestData, error: findError } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('sender_id', userId)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .single();

      if (findError || !requestData) {
        console.error('Error finding connection request:', findError);
        toast({
          title: "Błąd",
          description: "Nie znaleziono zaproszenia do połączenia.",
          variant: "destructive",
        });
        return;
      }

      // 1. Zaktualizuj status zaproszenia
      const { error: updateError } = await supabase
        .from('connection_requests')
        .update({ status: 'accepted' })
        .eq('id', requestData.id);

      if (updateError) {
        console.error('Error updating connection request:', updateError);
        toast({
          title: "Błąd",
          description: "Nie udało się zaktualizować zaproszenia.",
          variant: "destructive",
        });
        return;
      }

      // 2. Utwórz nowe połączenie
      // Upewnij się, że user_id1 < user_id2 (zgodnie z naszym ograniczeniem)
      const user_id1 = user.id < userId ? user.id : userId;
      const user_id2 = user.id < userId ? userId : user.id;
      
      const { error: connectionError } = await supabase
        .from('connections')
        .insert({
          user_id1,
          user_id2
        });

      if (connectionError) {
        console.error('Error creating connection:', connectionError);
        toast({
          title: "Błąd",
          description: "Nie udało się utworzyć połączenia.",
          variant: "destructive",
        });
        return;
      }

      // Aktualizuj stan lokalny
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? { ...u, connectionStatus: 'connected', connectionsCount: u.connectionsCount + 1 } 
            : u
        )
      );

      // Aktualizuj licznik połączeń dla currentUser
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          connectionsCount: currentUser.connectionsCount + 1
        });
      }

      toast({
        title: "Sukces",
        description: "Zaproszenie zostało zaakceptowane, połączenie utworzone.",
      });

      // Odśwież dane
      loadUsers();
    } catch (err) {
      console.error('Unexpected error accepting connection request:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd.",
        variant: "destructive",
      });
    }
  };

  // Odrzuć zaproszenie do połączenia
  const declineConnectionRequest = async (userId: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby odrzucić zaproszenie.",
          variant: "destructive",
        });
        return;
      }

      // Znajdź i odrzuć zaproszenie
      const { error } = await supabase
        .from('connection_requests')
        .update({ status: 'rejected' })
        .eq('sender_id', userId)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (error) {
        console.error('Error declining connection request:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się odrzucić zaproszenia.",
          variant: "destructive",
        });
        return;
      }

      // Aktualizuj stan lokalny
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? { ...u, connectionStatus: 'none' } 
            : u
        )
      );

      toast({
        title: "Sukces",
        description: "Zaproszenie zostało odrzucone.",
      });

      // Odśwież dane
      loadUsers();
    } catch (err) {
      console.error('Unexpected error declining connection request:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd.",
        variant: "destructive",
      });
    }
  };

  // Usuń połączenie
  const removeConnection = async (userId: string) => {
    try {
      if (!user) {
        toast({
          title: "Błąd",
          description: "Musisz być zalogowany, aby usunąć połączenie.",
          variant: "destructive",
        });
        return;
      }

      // Znajdź i usuń połączenie
      const { error } = await supabase
        .from('connections')
        .delete()
        .or(`and(user_id1.eq.${user.id},user_id2.eq.${userId}),and(user_id1.eq.${userId},user_id2.eq.${user.id})`);

      if (error) {
        console.error('Error removing connection:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się usunąć połączenia.",
          variant: "destructive",
        });
        return;
      }

      // Po usunięciu połączenia, zaktualizuj status - teraz jesteśmy tylko obserwującymi
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? { ...u, connectionStatus: 'following', connectionsCount: Math.max(0, u.connectionsCount - 1) } 
            : u
        )
      );

      // Aktualizuj licznik połączeń dla currentUser
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          connectionsCount: Math.max(0, currentUser.connectionsCount - 1)
        });
      }

      toast({
        title: "Sukces",
        description: "Połączenie zostało usunięte. Nadal obserwujesz tego użytkownika.",
      });

      // Odśwież dane
      loadUsers();
    } catch (err) {
      console.error('Unexpected error removing connection:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd.",
        variant: "destructive",
      });
    }
  };

  // Tymczasowe puste funkcje, mogłyby być zaimplementowane w przyszłości
  const createPost = (content: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
    console.log('Create post functionality not implemented');
  };
  
  const likePost = (postId: string) => {
    console.log('Like post functionality not implemented');
  };
  
  const unlikePost = (postId: string) => {
    console.log('Unlike post functionality not implemented');
  };
  
  const commentOnPost = (postId: string, comment: string) => {
    console.log('Comment post functionality not implemented');
  };
  
  const markNotificationAsRead = (notificationId: string) => {
    console.log('Mark notification as read functionality not implemented');
  };
  
  const markAllNotificationsAsRead = () => {
    console.log('Mark all notifications as read functionality not implemented');
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
      searchUsers,
      createPost,
      likePost,
      unlikePost,
      commentOnPost,
      markNotificationAsRead,
      markAllNotificationsAsRead,
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
