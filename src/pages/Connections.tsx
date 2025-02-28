
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useSocial, UserConnectionStatus } from '@/contexts/SocialContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search, 
  Users, 
  UserPlus, 
  UserMinus, 
  UserCheck, 
  Bell, 
  MessageSquare,
  Check,
  X,
  LogIn,
  UserCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Connections() {
  const { isLoggedIn } = useAuth();
  const { 
    users, 
    currentUser, 
    followUser, 
    unfollowUser,
    sendConnectionRequest,
    acceptConnectionRequest,
    declineConnectionRequest,
    removeConnection,
    searchUsers,
    loading
  } = useSocial();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'following' | 'connections' | 'pending'>('all');
  const [searchResults, setSearchResults] = useState<typeof users>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Wykonaj wyszukiwanie z opóźnieniem
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const delaySearch = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery, searchUsers]);

  // If user is not logged in, show a prompt to log in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 pt-24 pb-16 flex items-center">
          <div className="container px-4 mx-auto">
            <div className="max-w-md mx-auto text-center">
              <div className="p-8 border rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm shadow-sm">
                <div className="mb-6 p-3 w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <UserCircle className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Connect with Industry Professionals</h1>
                <p className="text-rhythm-600 mb-6">
                  Sign in to view your network, follow industry professionals, and connect with peers.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link to="/login" className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/signup">Create Account</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  const getConnectionAction = (status: UserConnectionStatus | undefined, userId: string) => {
    switch (status) {
      case 'none':
        return (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => followUser(userId)}
            >
              <UserPlus className="h-4 w-4" />
              Follow
            </Button>
            <Button 
              size="sm" 
              className="gap-1"
              onClick={() => sendConnectionRequest(userId)}
            >
              <Users className="h-4 w-4" />
              Connect
            </Button>
          </div>
        );
      case 'following':
        return (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => unfollowUser(userId)}
            >
              <UserMinus className="h-4 w-4" />
              Unfollow
            </Button>
            <Button 
              size="sm" 
              className="gap-1"
              onClick={() => sendConnectionRequest(userId)}
            >
              <Users className="h-4 w-4" />
              Connect
            </Button>
          </div>
        );
      case 'connected':
        return (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => {
                window.location.href = '/messages';
              }}
            >
              <MessageSquare className="h-4 w-4" />
              Message
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={() => removeConnection(userId)}
            >
              <UserMinus className="h-4 w-4" />
              Remove
            </Button>
          </div>
        );
      case 'pending_sent':
        return (
          <Button 
            variant="outline" 
            size="sm" 
            disabled
            className="gap-1"
          >
            <Bell className="h-4 w-4" />
            Request Sent
          </Button>
        );
      case 'pending_received':
        return (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="gap-1 bg-green-600 hover:bg-green-700"
              onClick={() => acceptConnectionRequest(userId)}
            >
              <Check className="h-4 w-4" />
              Accept
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 text-red-500 hover:text-red-600"
              onClick={() => declineConnectionRequest(userId)}
            >
              <X className="h-4 w-4" />
              Decline
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: UserConnectionStatus | undefined) => {
    switch (status) {
      case 'following':
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <UserPlus className="mr-1 h-3 w-3" />
            Following
          </Badge>
        );
      case 'connected':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            <UserCheck className="mr-1 h-3 w-3" />
            Connected
          </Badge>
        );
      case 'pending_sent':
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
            <Bell className="mr-1 h-3 w-3" />
            Request Sent
          </Badge>
        );
      case 'pending_received':
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            <Bell className="mr-1 h-3 w-3" />
            Request Received
          </Badge>
        );
      default:
        return null;
    }
  };

  // Display users based on search or filtered by tab
  const displayUsers = searchQuery.trim() ? searchResults : 
    users.filter(user => {
      // Wykluczenie obecnego użytkownika i filtracja według zakładki
      if (user.isCurrentUser) return false;
      
      switch (activeTab) {
        case 'following':
          return user.connectionStatus === 'following';
        case 'connections':
          return user.connectionStatus === 'connected';
        case 'pending':
          return user.connectionStatus === 'pending_sent' || user.connectionStatus === 'pending_received';
        default:
          return true;
      }
    });

  // Stan ładowania dla całej strony
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">Ładowanie danych...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">My Network</h1>
              <p className="text-rhythm-600">
                Build your professional network by connecting with industry peers
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isSearching ? 'text-primary animate-pulse' : 'text-rhythm-500'} h-4 w-4`} />
                <Input 
                  placeholder="Search for people by name, role or username..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Tabs 
              value={activeTab} 
              onValueChange={(v) => setActiveTab(v as 'all' | 'following' | 'connections' | 'pending')}
              className="mb-8"
            >
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all" className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  All People
                </TabsTrigger>
                <TabsTrigger value="following" className="flex items-center gap-1.5">
                  <UserPlus className="h-4 w-4" />
                  Following
                </TabsTrigger>
                <TabsTrigger value="connections" className="flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4" />
                  Connections
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex items-center gap-1.5">
                  <Bell className="h-4 w-4" />
                  Pending
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                {renderUserList(displayUsers)}
              </TabsContent>
              
              <TabsContent value="following">
                {renderUserList(displayUsers)}
              </TabsContent>
              
              <TabsContent value="connections">
                {renderUserList(displayUsers)}
              </TabsContent>
              
              <TabsContent value="pending">
                {renderUserList(displayUsers)}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
  
  function renderUserList(users: typeof displayUsers) {
    // Stan ładowania dla samego wyszukiwania
    if (isSearching) {
      return (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-rhythm-500">Wyszukiwanie użytkowników...</p>
          </CardContent>
        </Card>
      );
    }
    
    if (users.length === 0) {
      return (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <p className="text-rhythm-500 mb-2">
              {searchQuery.trim() 
                ? "Nie znaleziono użytkowników pasujących do zapytania" 
                : activeTab === 'all'
                  ? "Nie znaleziono żadnych użytkowników"
                  : activeTab === 'following'
                    ? "Nie obserwujesz jeszcze nikogo"
                    : activeTab === 'connections'
                      ? "Nie masz jeszcze żadnych połączeń"
                      : "Nie masz żadnych oczekujących zaproszeń"
              }
            </p>
            {searchQuery && (
              <Button variant="link" onClick={() => setSearchQuery('')}>
                Wyczyść wyszukiwanie
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="space-y-4">
        {users.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="glass-card rounded-xl p-5 border"
          >
            <div className="flex flex-col sm:flex-row gap-5">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      {getStatusBadge(user.connectionStatus)}
                    </div>
                    <p className="text-rhythm-500">@{user.username}</p>
                  </div>
                  
                  <div className="sm:self-start">
                    {getConnectionAction(user.connectionStatus, user.id)}
                  </div>
                </div>
                
                <p className="my-2">{user.role}</p>
                
                <div className="flex gap-4 text-sm">
                  <span className="text-rhythm-600">
                    <strong>{user.followersCount}</strong> followers
                  </span>
                  <span className="text-rhythm-600">
                    <strong>{user.connectionsCount}</strong> connections
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }
}
