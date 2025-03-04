
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SocialUser } from './types';

export const useCurrentUser = (user: any | null) => {
  const [currentUser, setCurrentUser] = useState<SocialUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCurrentUserProfile = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        setCurrentUser(null);
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
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

  return {
    currentUser,
    setCurrentUser,
    loadCurrentUserProfile
  };
};
