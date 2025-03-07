
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSocial } from '@/contexts/SocialContext';
import { UserPlus, Check, Users, UserCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { SocialUser } from '@/contexts/social/types';
import { supabase } from '@/integrations/supabase/client';

export function UserSuggestions() {
  const { users, followUser, unfollowUser, sendConnectionRequest, currentUser } = useSocial();
  const [loading, setLoading] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState<SocialUser[]>([]);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});
  
  // Przygotuj sugestie użytkowników
  useEffect(() => {
    const getRandomSuggestions = () => {
      const filteredUsers = users.filter(user => 
        user.connectionStatus === 'none' && !user.isCurrentUser
      );
      
      // Losowo wybierz 3 użytkowników
      const shuffled = [...filteredUsers].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 3);
    };
    
    if (users.length > 0) {
      const suggestions = getRandomSuggestions();
      setSuggestedUsers(suggestions);
      
      // Sprawdź status obserwowania dla każdego sugerowanego użytkownika
      if (currentUser) {
        suggestions.forEach(async user => {
          try {
            const { data } = await supabase
              .from('followings')
              .select('*')
              .eq('follower_id', currentUser.id)
              .eq('following_id', user.id)
              .single();
              
            setFollowingStatus(prev => ({
              ...prev,
              [user.id]: !!data
            }));
          } catch (error) {
            console.error('Error checking follow status:', error);
          }
        });
      }
      
      setLoading(false);
    }
  }, [users, currentUser]);
  
  const handleConnect = async (userId: string) => {
    await sendConnectionRequest(userId);
    // Po wysłaniu zaproszenia do połączenia, użytkownik automatycznie zaczyna obserwować
    setFollowingStatus(prev => ({
      ...prev,
      [userId]: true
    }));
  };
  
  const handleFollow = async (userId: string, isFollowing: boolean) => {
    if (isFollowing) {
      await unfollowUser(userId);
      setFollowingStatus(prev => ({
        ...prev,
        [userId]: false
      }));
    } else {
      await followUser(userId);
      setFollowingStatus(prev => ({
        ...prev,
        [userId]: true
      }));
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Osoby, które mogą Cię zainteresować</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  
  if (suggestedUsers.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Osoby, które mogą Cię zainteresować</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestedUsers.map(user => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <Link 
                  to={`/profile/${user.id}`} 
                  className="font-medium hover:underline"
                >
                  {user.name}
                </Link>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {user.connectionStatus === 'none' && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8"
                    onClick={() => handleFollow(user.id, followingStatus[user.id] || false)}
                  >
                    {followingStatus[user.id] ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Obserwujesz
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3.5 w-3.5 mr-1" />
                        Obserwuj
                      </>
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    className="h-8"
                    onClick={() => handleConnect(user.id)}
                  >
                    <Users className="h-3.5 w-3.5 mr-1" />
                    Połącz
                  </Button>
                </>
              )}
              
              {user.connectionStatus === 'following' && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8" 
                    onClick={() => handleFollow(user.id, true)}
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Obserwujesz
                  </Button>
                  <Button 
                    size="sm" 
                    className="h-8"
                    onClick={() => handleConnect(user.id)}
                  >
                    <Users className="h-3.5 w-3.5 mr-1" />
                    Połącz
                  </Button>
                </>
              )}
              
              {user.connectionStatus === 'pending_sent' && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8"
                    onClick={() => handleFollow(user.id, followingStatus[user.id] || true)}
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Obserwujesz
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8" 
                    disabled
                  >
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    Wysłano
                  </Button>
                </>
              )}
              
              {user.connectionStatus === 'connected' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8" 
                  disabled
                >
                  <UserCheck className="h-3.5 w-3.5 mr-1" />
                  Połączony
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
