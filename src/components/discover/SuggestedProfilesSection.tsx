
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSocial } from '@/contexts/SocialContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus, Users, UserCheck, Check } from 'lucide-react';
import { SocialUser } from '@/contexts/social/types';

interface SuggestedProfilesSectionProps {
  fullView?: boolean;
}

export function SuggestedProfilesSection({ fullView = false }: SuggestedProfilesSectionProps) {
  const { users, followUser, sendConnectionRequest } = useSocial();
  const [suggestedUsers, setSuggestedUsers] = useState<SocialUser[]>([]);
  
  useEffect(() => {
    if (users.length > 0) {
      // Filtruj użytkowników - tylko ci, z którymi nie mamy połączenia
      const filtered = users.filter(user => 
        user.connectionStatus === 'none' && !user.isCurrentUser
      );
      
      if (fullView) {
        // W widoku pełnym pokazuj wszystkich
        setSuggestedUsers(filtered);
      } else {
        // W widoku podstawowym wybierz losowo max 3 użytkowników
        const shuffled = [...filtered].sort(() => 0.5 - Math.random());
        setSuggestedUsers(shuffled.slice(0, 3));
      }
    }
  }, [users, fullView]);
  
  if (suggestedUsers.length === 0) {
    return null;
  }
  
  const handleConnect = (userId: string) => {
    sendConnectionRequest(userId);
  };
  
  const handleFollow = (userId: string) => {
    followUser(userId);
  };
  
  // Widok pełny dla strony Discover
  if (fullView) {
    return (
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-6">Sugerowani użytkownicy</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {suggestedUsers.map(user => (
            <Card key={user.id} className="overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 h-20"></div>
              <div className="px-4 pb-5 pt-0 -mt-10 text-center">
                <Avatar className="border-4 border-background mx-auto h-16 w-16">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Link to={`/profile/${user.id}`} className="block mt-2 font-medium text-lg hover:underline">
                  {user.name}
                </Link>
                <p className="text-sm text-muted-foreground mb-4">{user.role}</p>
                
                <div className="flex justify-center gap-2">
                  {user.connectionStatus === 'none' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleFollow(user.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Obserwuj
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleConnect(user.id)}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Połącz
                      </Button>
                    </>
                  )}
                  
                  {user.connectionStatus === 'following' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Obserwujesz
                    </Button>
                  )}
                  
                  {user.connectionStatus === 'pending_sent' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Wysłano
                    </Button>
                  )}
                  
                  {user.connectionStatus === 'connected' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Połączony
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  // Standardowy widok dla sidebara
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
                    onClick={() => handleFollow(user.id)}
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-1" />
                    Obserwuj
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8" 
                  disabled
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Obserwujesz
                </Button>
              )}
              
              {user.connectionStatus === 'pending_sent' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8" 
                  disabled
                >
                  <UserCheck className="h-3.5 w-3.5 mr-1" />
                  Wysłano
                </Button>
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
