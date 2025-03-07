
import { useState, useEffect } from 'react';
import { useSocial } from '@/contexts/SocialContext';
import { toast } from '@/components/ui/use-toast';

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
  const [isFollowing, setIsFollowing] = useState(false);

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
        setIsFollowing(socialProfile.connectionStatus === 'following');
      }
    } catch (err) {
      console.error('Error fetching social profile:', err);
    }
  };

  const handleConnectionAction = async () => {
    if (!userId) return;
    
    try {
      switch (connectionStatus) {
        case 'none':
          await sendConnectionRequest(userId);
          setConnectionStatus('pending_sent');
          break;
        case 'following':
          // Działanie pozostaje takie samo jak było
          await unfollowUser(userId);
          setConnectionStatus('none');
          setIsFollowing(false);
          break;
        case 'connected':
          await removeConnection(userId);
          // Po usunięciu połączenia użytkownik pozostaje obserwujący
          setConnectionStatus('following');
          setIsFollowing(true);
          break;
        case 'pending_sent':
          // Anuluj zaproszenie (użyj tego samego removeConnection)
          await removeConnection(userId);
          setConnectionStatus('none');
          break;
      }
      
      // Odśwież profil, aby mieć pewność, że stan jest aktualny
      fetchSocialProfile();
    } catch (err) {
      console.error('Error in handleConnectionAction:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił problem podczas wykonywania akcji.",
        variant: "destructive",
      });
    }
  };
  
  const handleFollow = async () => {
    if (!userId) return;
    
    try {
      if (isFollowing) {
        await unfollowUser(userId);
        setIsFollowing(false);
        if (connectionStatus === 'following') {
          setConnectionStatus('none');
        }
      } else {
        await followUser(userId);
        setIsFollowing(true);
        if (connectionStatus === 'none') {
          setConnectionStatus('following');
        }
      }
      
      // Odśwież profil, aby mieć pewność, że stan jest aktualny
      fetchSocialProfile();
    } catch (err) {
      console.error('Error in handleFollow:', err);
      toast({
        title: "Błąd",
        description: "Wystąpił problem podczas wykonywania akcji obserwacji.",
        variant: "destructive",
      });
    }
  };

  return {
    connectionStatus,
    isFollowing,
    handleConnectionAction,
    handleFollow,
    refreshConnectionStatus: fetchSocialProfile
  };
}
