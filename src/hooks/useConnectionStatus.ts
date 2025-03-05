
import { useState, useEffect } from 'react';
import { useSocial } from '@/contexts/SocialContext';

export function useConnectionStatus(userId: string | undefined, isOwnProfile: boolean) {
  const { 
    currentUser, 
    fetchUserProfile,
    followUser, 
    unfollowUser, 
    sendConnectionRequest, 
    removeConnection
  } = useSocial();
  
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'following' | 'connected' | 'pending_sent' | 'pending_received'>('none');

  useEffect(() => {
    if (!isOwnProfile && userId && currentUser) {
      fetchSocialProfile();
    }
  }, [userId, currentUser, isOwnProfile]);

  const fetchSocialProfile = async () => {
    if (!userId) return;
    
    try {
      const socialProfile = await fetchUserProfile(userId);
      if (socialProfile) {
        setConnectionStatus(socialProfile.connectionStatus || 'none');
      }
    } catch (err) {
      console.error('Error fetching social profile:', err);
    }
  };

  const handleConnectionAction = () => {
    if (!userId) return;
    
    switch (connectionStatus) {
      case 'none':
        sendConnectionRequest(userId);
        setConnectionStatus('pending_sent');
        break;
      case 'following':
        unfollowUser(userId);
        setConnectionStatus('none');
        break;
      case 'connected':
        removeConnection(userId);
        setConnectionStatus('none');
        break;
      case 'pending_sent':
        setConnectionStatus('none');
        break;
      // For pending_received, the user should accept/decline via notifications
    }
  };
  
  const handleFollow = () => {
    if (!userId) return;
    
    if (connectionStatus === 'following') {
      unfollowUser(userId);
      setConnectionStatus('none');
    } else {
      followUser(userId);
      setConnectionStatus('following');
    }
  };

  return {
    connectionStatus,
    handleConnectionAction,
    handleFollow
  };
}
