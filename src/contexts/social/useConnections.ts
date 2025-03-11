
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { SocialUser } from './types';

export const useConnections = (currentUserId?: string) => {
  const [users, setUsers] = useState<SocialUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUserId) {
      fetchUserSuggestions().then(suggestions => {
        setUsers(suggestions);
      });
    }
  }, [currentUserId]);

  const fetchUserProfile = async (userId: string): Promise<SocialUser | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio, role, followers, following, connections')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      if (data) {
        return {
          id: data.id,
          name: data.full_name || data.username || '',
          username: data.username || '',
          avatar: data.avatar_url || '',
          role: data.role || 'user',
          bio: data.bio || '',
          connectionStatus: 'none',
          followersCount: data.followers || 0,
          followingCount: data.following || 0,
          connectionsCount: data.connections || 0,
        };
      }
      return null;
    } catch (error) {
      console.error('Błąd podczas pobierania profilu użytkownika:', error);
      return null;
    }
  };

  const followUser = async (userId: string) => {
    try {
      if (!currentUserId) throw new Error('Użytkownik musi być zalogowany');

      const { error } = await supabase
        .from('followings')
        .insert([{ follower_id: currentUserId, following_id: userId }]);

      if (error) throw error;
      return Promise.resolve();
    } catch (error) {
      console.error('Błąd podczas obserwowania użytkownika:', error);
      return Promise.reject(error);
    }
  };

  const unfollowUser = async (userId: string) => {
    try {
      if (!currentUserId) throw new Error('Użytkownik musi być zalogowany');

      const { error } = await supabase
        .from('followings')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', userId);

      if (error) throw error;
      return Promise.resolve();
    } catch (error) {
      console.error('Błąd podczas anulowania obserwowania użytkownika:', error);
      return Promise.reject(error);
    }
  };

  const fetchUserConnections = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select(`
          user_id1, user_id2,
          profiles1:profiles!connections_user_id1_fkey(id, username, full_name, avatar_url),
          profiles2:profiles!connections_user_id2_fkey(id, username, full_name, avatar_url)
        `)
        .or(`user_id1.eq.${userId},user_id2.eq.${userId}`);

      if (error) throw error;

      // Przekształć dane, aby zawsze zwracać profil drugiego użytkownika
      const connections = data?.map(conn => {
        const isUser1 = conn.user_id1 === userId;
        const otherProfile = isUser1 ? conn.profiles2 : conn.profiles1;
        
        return {
          id: otherProfile.id,
          username: otherProfile.username,
          full_name: otherProfile.full_name,
          avatar_url: otherProfile.avatar_url
        };
      }) || [];

      return connections;
    } catch (error) {
      console.error('Błąd podczas pobierania połączeń użytkownika:', error);
      return [];
    }
  };

  const fetchUserSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio, role, followers, following, connections')
        .limit(5);

      if (error) throw error;

      return data.map(profile => ({
        id: profile.id,
        name: profile.full_name || profile.username || '',
        username: profile.username || '',
        avatar: profile.avatar_url || '',
        role: profile.role || 'user',
        bio: profile.bio || '',
        connectionStatus: 'none',
        followersCount: profile.followers || 0,
        followingCount: profile.following || 0,
        connectionsCount: profile.connections || 0,
      })) as SocialUser[];
    } catch (error) {
      console.error('Błąd podczas pobierania sugestii użytkowników:', error);
      return [];
    }
  };

  const sendConnectionRequest = async (targetUserId: string) => {
    try {
      if (!currentUserId) throw new Error('Użytkownik musi być zalogowany');

      const { error } = await supabase
        .from('connection_requests')
        .insert([{ sender_id: currentUserId, receiver_id: targetUserId }]);

      if (error) throw error;
      
      toast({
        title: "Sukces",
        description: "Zaproszenie zostało wysłane",
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Błąd podczas wysyłania zaproszenia:', error);
      
      toast({
        title: "Błąd",
        description: "Nie udało się wysłać zaproszenia",
        variant: "destructive",
      });
      
      return Promise.reject(error);
    }
  };

  const acceptConnectionRequest = async (requestId: string) => {
    try {
      // Najpierw pobierz dane zaproszenia
      const { data: requestData, error: requestError } = await supabase
        .from('connection_requests')
        .select('sender_id, receiver_id')
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;

      // Utwórz nowe połączenie
      const { error: connectionError } = await supabase
        .from('connections')
        .insert([{ 
          user_id1: requestData.sender_id, 
          user_id2: requestData.receiver_id 
        }]);

      if (connectionError) throw connectionError;

      // Usuń zaproszenie
      const { error: deleteError } = await supabase
        .from('connection_requests')
        .delete()
        .eq('id', requestId);

      if (deleteError) throw deleteError;

      toast({
        title: "Sukces",
        description: "Zaproszenie zostało zaakceptowane",
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Błąd podczas akceptowania zaproszenia:', error);
      
      toast({
        title: "Błąd",
        description: "Nie udało się zaakceptować zaproszenia",
        variant: "destructive",
      });
      
      return Promise.reject(error);
    }
  };

  const declineConnectionRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('connection_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;
      
      toast({
        title: "Sukces",
        description: "Zaproszenie zostało odrzucone",
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Błąd podczas odrzucania zaproszenia:', error);
      
      toast({
        title: "Błąd",
        description: "Nie udało się odrzucić zaproszenia",
        variant: "destructive",
      });
      
      return Promise.reject(error);
    }
  };

  const removeConnection = async (connectionId: string, keepFollowing: boolean = false) => {
    try {
      if (!currentUserId) throw new Error('Użytkownik musi być zalogowany');

      // Znajdź dane połączenia
      const { data, error: findError } = await supabase
        .from('connections')
        .select('user_id1, user_id2')
        .or(`id.eq.${connectionId}`)
        .single();

      if (findError) throw findError;

      // Usuń połączenie
      const { error: deleteError } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (deleteError) throw deleteError;

      // Jeśli użytkownik nie chce dalej obserwować drugiego użytkownika
      if (!keepFollowing) {
        const otherUserId = data.user_id1 === currentUserId ? data.user_id2 : data.user_id1;
        
        // Usuń relację obserwowania
        await unfollowUser(otherUserId);
      }
      
      toast({
        title: "Sukces",
        description: "Połączenie zostało usunięte",
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Błąd podczas usuwania połączenia:', error);
      
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć połączenia",
        variant: "destructive",
      });
      
      return Promise.reject(error);
    }
  };

  return {
    users,
    loading,
    fetchUserProfile,
    followUser,
    unfollowUser,
    fetchUserConnections,
    fetchUserSuggestions,
    sendConnectionRequest,
    acceptConnectionRequest,
    declineConnectionRequest,
    removeConnection
  };
};
