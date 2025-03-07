
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
        
        // Sprawdź czy użytkownik jest obserwowany na podstawie statusu połączenia
        // lub na podstawie danych z serwera w przypadku, gdy status połączenia nie jest jednoznaczny
        const isUserFollowed = await checkIfUserIsFollowed(userId);
        setIsFollowing(isUserFollowed);
      }
    } catch (err) {
      console.error('Error fetching social profile:', err);
    }
  };

  // Nowa funkcja pomocnicza do sprawdzania czy użytkownik jest obserwowany
  const checkIfUserIsFollowed = async (targetUserId: string) => {
    if (!currentUser) return false;
    
    try {
      const { data, error } = await fetch(`/api/followings?followerId=${currentUser.id}&followingId=${targetUserId}`)
        .then(res => res.json());
        
      if (error) {
        console.error('Error checking follow status:', error);
        return false;
      }
      
      return data && data.length > 0;
    } catch (err) {
      console.error('Error in checkIfUserIsFollowed:', err);
      return false;
    }
  };

  const handleConnectionAction = async () => {
    if (!userId) return;
    
    try {
      switch (connectionStatus) {
        case 'none':
        case 'following':
          await sendConnectionRequest(userId);
          setConnectionStatus('pending_sent');
          // Nie zmieniaj statusu obserwacji - powinien pozostać taki sam
          break;
        case 'connected':
          await removeConnection(userId);
          // Zachowaj stan obserwowania
          setConnectionStatus('following');
          break;
        case 'pending_sent':
          await removeConnection(userId);
          setConnectionStatus('following');
          break;
        case 'pending_received':
          await removeConnection(userId);
          setConnectionStatus('none');
          break;
      }
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
        // Aktualizuj status połączenia tylko jeśli jest 'following'
        if (connectionStatus === 'following') {
          setConnectionStatus('none');
        }
      } else {
        await followUser(userId);
        setIsFollowing(true);
        // Aktualizuj status połączenia na 'following' tylko jeśli był 'none'
        if (connectionStatus === 'none') {
          setConnectionStatus('following');
        }
      }
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
