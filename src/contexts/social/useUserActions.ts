
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { SocialUser, UserConnectionStatus } from './types';

export const useUserActions = (user: any | null, setUsers: React.Dispatch<React.SetStateAction<SocialUser[]>>, currentUser: SocialUser | null, setCurrentUser: React.Dispatch<React.SetStateAction<SocialUser | null>>) => {
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      if (!user) return;
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        return;
      }

      const { data: followingsData, error: followingsError } = await supabase
        .from('followings')
        .select('*')
        .eq('follower_id', user.id);

      if (followingsError) {
        console.error('Error loading followings:', followingsError);
      }

      const { data: followersData, error: followersError } = await supabase
        .from('followings')
        .select('*')
        .eq('following_id', user.id);

      if (followersError) {
        console.error('Error loading followers:', followersError);
      }

      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select('*')
        .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`);

      if (connectionsError) {
        console.error('Error loading connections:', connectionsError);
      }

      const { data: sentRequestsData, error: sentRequestsError } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('sender_id', user.id)
        .eq('status', 'pending');

      if (sentRequestsError) {
        console.error('Error loading sent connection requests:', sentRequestsError);
      }

      const { data: receivedRequestsData, error: receivedRequestsError } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('receiver_id', user.id)
        .eq('status', 'pending');

      if (receivedRequestsError) {
        console.error('Error loading received connection requests:', receivedRequestsError);
      }

      const followingIds = new Set((followingsData || []).map(f => f.following_id));
      const followerIds = new Set((followersData || []).map(f => f.follower_id));
      
      const connectionIds = new Set(
        (connectionsData || []).flatMap(c => {
          if (c.user_id1 === user.id) return [c.user_id2];
          if (c.user_id2 === user.id) return [c.user_id1];
          return [];
        })
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
          isFollower: followerIds.has(profile.id),
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

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: users } = await supabase
        .from('users')
        .select('*');

      const cachedUser = users.find(u => u.id === userId);
      if (cachedUser) return cachedUser;

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

      let connectionStatus: UserConnectionStatus = 'none';
      let isFollower = false;
      
      if (user) {
        const { data: connectionData } = await supabase
          .from('connections')
          .select('*')
          .or(`and(user_id1.eq.${user.id},user_id2.eq.${userId}),and(user_id1.eq.${userId},user_id2.eq.${user.id})`)
          .single();

        if (connectionData) {
          connectionStatus = 'connected';
        } else {
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
        
        const { data: followerData } = await supabase
          .from('followings')
          .select('*')
          .eq('follower_id', userId)
          .eq('following_id', user.id)
          .single();
          
        if (followerData) {
          isFollower = true;
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
        isFollower,
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

      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? { ...u, connectionStatus: 'following', followersCount: u.followersCount + 1 } 
            : u
        )
      );

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

      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? { ...u, connectionStatus: 'none', followersCount: Math.max(0, u.followersCount - 1) } 
            : u
        )
      );

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

      const { data: existingConnection } = await supabase
        .from('connections')
        .select('*')
        .or(`and(user_id1.eq.${user.id},user_id2.eq.${userId}),and(user_id1.eq.${userId},user_id2.eq.${user.id})`)
        .maybeSingle();

      if (existingConnection) {
        toast({
          title: "Informacja",
          description: "Jesteś już połączony z tym użytkownikiem.",
        });
        return;
      }

      const { data: incomingRequest, error: checkIncomingError } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('sender_id', userId)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (checkIncomingError) {
        console.error('Error checking incoming request:', checkIncomingError);
      }

      if (incomingRequest) {
        toast({
          title: "Informacja",
          description: "Ten użytkownik już wysłał Ci zaproszenie. Możesz je zaakceptować w zakładce 'Oczekujące'.",
        });
        return;
      }

      const { data: pendingRequest, error: checkPendingError } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('sender_id', user.id)
        .eq('receiver_id', userId)
        .eq('status', 'pending')
        .maybeSingle();

      if (checkPendingError) {
        console.error('Error checking pending request:', checkPendingError);
      }

      if (pendingRequest) {
        toast({
          title: "Informacja",
          description: "Zaproszenie do tego użytkownika jest już aktywne.",
        });
        return;
      }

      const { data: existingRequest, error: checkExistingError } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('sender_id', user.id)
        .eq('receiver_id', userId)
        .or('status.eq.accepted,status.eq.rejected')
        .maybeSingle();

      if (checkExistingError) {
        console.error('Error checking existing request:', checkExistingError);
      }

      const { data: followingData, error: checkFollowingError } = await supabase
        .from('followings')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle();

      if (checkFollowingError) {
        console.error('Error checking if following:', checkFollowingError);
      }

      if (!followingData) {
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

      const { error: insertError } = await supabase
        .from('connection_requests')
        .insert({
          sender_id: user.id,
          receiver_id: userId,
          status: 'pending'
        });

      if (insertError) {
        console.error('Error creating new connection request:', insertError);
        toast({
          title: "Błąd",
          description: "Nie udało się utworzyć nowego zaproszenia do połączenia.",
          variant: "destructive",
        });
        return;
      }

      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? { ...u, connectionStatus: 'pending_sent' } 
            : u
        )
      );

      toast({
        title: "Sukces",
        description: "Zaproszenie do połączenia zostało wysłane.",
      });

      loadUsers();
    } catch (err) {
      console.error('Unexpected error sending connection request:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd.",
        variant: "destructive",
      });
    }
  };

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

      const { error: connectionError } = await supabase
        .from('connections')
        .insert({
          user_id1: user.id < userId ? user.id : userId,
          user_id2: user.id < userId ? userId : user.id
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

      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? { ...u, connectionStatus: 'connected', connectionsCount: u.connectionsCount + 1 } 
            : u
        )
      );

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

      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId 
            ? { ...u, connectionStatus: 'following', connectionsCount: Math.max(0, u.connectionsCount - 1) } 
            : u
        )
      );

      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          connectionsCount: Math.max(0, currentUser.connectionsCount - 1)
        });
      }

      toast({
        title: "Sukces",
        description: "Połączenie zostało usunięte. Nadal obserwujesz tego użytkownika i on nadal Cię obserwuje.",
      });

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

  return {
    loadUsers,
    fetchUserProfile,
    searchUsers,
    followUser,
    unfollowUser,
    sendConnectionRequest,
    acceptConnectionRequest,
    declineConnectionRequest,
    removeConnection
  };
};
