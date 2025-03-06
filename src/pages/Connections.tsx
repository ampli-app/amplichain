
import { useState, useEffect } from 'react';
import { useSocial } from '@/contexts/SocialContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { UserPlus, UserMinus, Search, User, UserCheck, Clock, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserConnectionStatus, SocialUser } from '@/contexts/social/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

// Komponent interfejsu użytkownika do łączenia/rozłączania
const ConnectionActionButtons = ({ 
  user, 
  onConnect, 
  onAccept, 
  onDecline, 
  onRemove, 
  onFollow, 
  onUnfollow 
}: { 
  user: SocialUser;
  onConnect: (userId: string) => void;
  onAccept: (userId: string) => void;
  onDecline: (userId: string) => void;
  onRemove: (userId: string) => void;
  onFollow: (userId: string) => void;
  onUnfollow: (userId: string) => void;
}) => {
  const renderConnectionButtons = () => {
    switch(user.connectionStatus) {
      case 'none':
        return (
          <Button 
            size="sm" 
            className="whitespace-nowrap"
            onClick={() => onConnect(user.id)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Połącz
          </Button>
        );
      case 'pending_sent':
        return (
          <Button 
            variant="outline" 
            size="sm" 
            className="whitespace-nowrap"
            disabled
          >
            <Clock className="h-4 w-4 mr-2" />
            Oczekujące
          </Button>
        );
      case 'pending_received':
        return (
          <div className="flex gap-2">
            <Button 
              size="sm"
              className="whitespace-nowrap"
              onClick={() => onAccept(user.id)}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Akceptuj
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="whitespace-nowrap"
              onClick={() => onDecline(user.id)}
            >
              <X className="h-4 w-4 mr-2" />
              Odrzuć
            </Button>
          </div>
        );
      case 'connected':
        return (
          <Button 
            variant="outline" 
            size="sm"
            className="whitespace-nowrap"
            onClick={() => onRemove(user.id)}
          >
            <UserMinus className="h-4 w-4 mr-2" />
            Usuń
          </Button>
        );
      default:
        return null;
    }
  };

  const renderFollowButton = () => {
    if (user.connectionStatus === 'connected') return null;
    
    return user.isFollower ? (
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => onUnfollow(user.id)}
      >
        <UserCheck className="h-4 w-4 mr-2" />
        Obserwujesz
      </Button>
    ) : (
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => onFollow(user.id)}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Obserwuj
      </Button>
    );
  };
  
  return (
    <div className="flex gap-2">
      {renderFollowButton()}
      {renderConnectionButtons()}
    </div>
  );
};

export default function Connections() {
  const { 
    users, 
    sendConnectionRequest, 
    acceptConnectionRequest, 
    declineConnectionRequest, 
    removeConnection,
    followUser,
    unfollowUser
  } = useSocial();
  
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<SocialUser[]>([]);
  
  useEffect(() => {
    // Filtruj użytkowników na podstawie zakładki i wyszukiwania
    let result = [...users].filter(user => !user.isCurrentUser);
    
    // Filtruj według zakładki
    if (activeTab === 'connected') {
      result = result.filter(user => user.connectionStatus === 'connected');
    } else if (activeTab === 'pending') {
      result = result.filter(user => 
        user.connectionStatus === 'pending_sent' || 
        user.connectionStatus === 'pending_received'
      );
    } else if (activeTab === 'followers') {
      result = result.filter(user => user.isFollower);
    }
    
    // Filtruj według wyszukiwania
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(query) ||
        (user.username && user.username.toLowerCase().includes(query)) ||
        (user.role && user.role.toLowerCase().includes(query))
      );
    }
    
    setFilteredUsers(result);
  }, [users, activeTab, search]);
  
  const handleConnect = async (userId: string) => {
    await sendConnectionRequest(userId);
  };
  
  const handleAccept = async (userId: string) => {
    await acceptConnectionRequest(userId);
  };
  
  const handleDecline = async (userId: string) => {
    await declineConnectionRequest(userId);
  };
  
  const handleRemove = async (userId: string) => {
    await removeConnection(userId);
  };
  
  const handleFollow = async (userId: string) => {
    await followUser(userId);
  };
  
  const handleUnfollow = async (userId: string) => {
    await unfollowUser(userId);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20 pb-16">
        <div className="container px-4 mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold mb-4">Połączenia</h1>
          
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                className="pl-10"
                placeholder="Szukaj połączeń..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">
                Wszyscy
                <Badge className="ml-2 bg-primary/10 text-primary hover:bg-primary/10 border-none">
                  {users.filter(u => !u.isCurrentUser).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="connected">
                Połączeni
                <Badge className="ml-2 bg-primary/10 text-primary hover:bg-primary/10 border-none">
                  {users.filter(u => u.connectionStatus === 'connected').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending">
                Oczekujące
                <Badge className="ml-2 bg-primary/10 text-primary hover:bg-primary/10 border-none">
                  {users.filter(u => 
                    u.connectionStatus === 'pending_sent' || 
                    u.connectionStatus === 'pending_received'
                  ).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="followers">
                Obserwujący
                <Badge className="ml-2 bg-primary/10 text-primary hover:bg-primary/10 border-none">
                  {users.filter(u => u.isFollower).length}
                </Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-0 mt-0">
              {filteredUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredUsers.map(user => (
                    <div 
                      key={user.id}
                      className="border rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-14 w-14">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <Link 
                            to={`/profile/${user.id}`}
                            className="font-medium text-lg hover:underline"
                          >
                            {user.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">{user.role}</p>
                          
                          {user.connectionStatus === 'pending_received' && (
                            <Badge variant="outline" className="mt-1">Prośba o połączenie</Badge>
                          )}
                        </div>
                      </div>
                      
                      <ConnectionActionButtons 
                        user={user}
                        onConnect={handleConnect}
                        onAccept={handleAccept}
                        onDecline={handleDecline}
                        onRemove={handleRemove}
                        onFollow={handleFollow}
                        onUnfollow={handleUnfollow}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">Nie znaleziono pasujących użytkowników</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
