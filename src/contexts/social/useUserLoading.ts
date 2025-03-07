
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SocialUser, UserConnectionStatus } from './types';

export const useUserLoading = (user: any | null) => {
  const [loading, setLoading] = useState(false);

  const loadUsers = async (setUsers: React.Dispatch<React.SetStateAction<SocialUser[]>>) => {
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
          isFollowing: followingIds.has(profile.id),
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

  const fetchUserProfile = async (userId: string): Promise<SocialUser | null> => {
    try {
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
      let isFollowing = false;
      
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
                isFollowing = true;
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
        
        // Sprawdź czy użytkownik jest obserwowany
        const { data: followingData } = await supabase
          .from('followings')
          .select('*')
          .eq('follower_id', user.id)
          .eq('following_id', userId)
          .single();
          
        if (followingData) {
          isFollowing = true;
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
        isFollowing,
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

  return {
    loading,
    loadUsers,
    fetchUserProfile,
    searchUsers
  };
};
