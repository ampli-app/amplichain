
import { useState, useEffect } from 'react';
import { useSocial } from '@/contexts/SocialContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
    if (!userId || !currentUser) return;
    
    try {
      const socialProfile = await fetchUserProfile(userId);
      if (socialProfile) {
        setConnectionStatus(socialProfile.connectionStatus || 'none');
        
        // Bezpośrednio sprawdź relację obserwowania z bazy danych
        const { data: followData, error: followError } = await supabase
          .from('followings')
          .select('*')
          .eq('follower_id', currentUser.id)
          .eq('following_id', userId)
          .single();
          
        if (followError && followError.code !== 'PGRST116') {
          console.error('Error checking follow status:', followError);
        }
        
        // Ustaw isFollowing na podstawie danych z bazy
        setIsFollowing(!!followData);
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
        // Zachowaj status połączenia
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
