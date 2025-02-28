
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
  UserCircle,
  Heart,
  Slash,
  CircleSlash,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

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
  const [activeTab, setActiveTab] = useState<'all' | 'following' | 'followers' | 'connections' | 'pending'>('all');
  const [searchResults, setSearchResults] = useState<typeof users>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        console.error('Błąd wyszukiwania:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery, searchUsers]);

  const handleSendConnectionRequest = async (userId: string) => {
    try {
      await sendConnectionRequest(userId);
    } catch (error) {
      console.error("Błąd podczas wysyłania zaproszenia:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się wysłać zaproszenia do połączenia. Spróbuj ponownie później.",
        variant: "destructive",
      });
    }
  };

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
                <h1 className="text-2xl font-bold mb-2">Łącz się z profesjonalistami z branży</h1>
                <p className="text-rhythm-600 mb-6">
                  Zaloguj się, aby zobaczyć swoją sieć, obserwować profesjonalistów z branży i łączyć się z rówieśnikami.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <Link to="/login" className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Zaloguj się
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/signup">Utwórz konto</Link>
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

  const getStatusBadge = (status: UserConnectionStatus | undefined, isFollower?: boolean) => {
    const badges = [];
    
    // Wyświetl badge dla połączeń tylko gdy nie jesteśmy na zakładce "following"
    if (status && activeTab !== 'following') {
      switch (status) {
        case 'connected':
          badges.push(
            <Badge key="connected" variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
              <UserCheck className="mr-1 h-3 w-3" />
              Połączeni
            </Badge>
          );
          break;
        case 'pending_sent':
          badges.push(
            <Badge key="pending_sent" variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
              <Bell className="mr-1 h-3 w-3" />
              Zaproszenie wysłane
            </Badge>
          );
          break;
        case 'pending_received':
          badges.push(
            <Badge key="pending_received" variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
              <Bell className="mr-1 h-3 w-3" />
              Zaproszenie otrzymane
            </Badge>
          );
          break;
      }
    }
    
    // Badge dla obserwujących tylko gdy nie jesteśmy na zakładce "followers"
    if (activeTab === 'following') {
      // W zakładce "Obserwowani" pokazujemy, czy dana osoba nas obserwuje czy nie
      if (isFollower) {
        badges.push(
          <Badge key="follower" variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20">
            <Heart className="mr-1 h-3 w-3" />
            Obserwuje Cię
          </Badge>
        );
      } else {
        badges.push(
          <Badge key="not-follower" variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/20">
            <CircleSlash className="mr-1 h-3 w-3" />
            Nie obserwuje Cię
          </Badge>
        );
      }
    } else if (activeTab === 'followers') {
      // W zakładce "Obserwujący" pokazujemy, czy my obserwujemy daną osobę czy nie
      if (status === 'following' || status === 'connected') {
        badges.push(
          <Badge key="following" variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <Eye className="mr-1 h-3 w-3" />
            Obserwujesz
          </Badge>
        );
      } else {
        badges.push(
          <Badge key="not-following" variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/20">
            <Slash className="mr-1 h-3 w-3" />
            Nie obserwujesz
          </Badge>
        );
      }
    }
    
    return badges.length > 0 ? <div className="flex flex-wrap gap-1.5">{badges}</div> : null;
  };

  const getConnectionAction = (status: UserConnectionStatus | undefined, userId: string) => {
    // Dla zakładki obserwujących pokaż tylko przyciski do połączenia, bez przycisku do przestania obserwowania
    if (activeTab === 'followers' && status !== 'connected' && status !== 'pending_sent' && status !== 'pending_received') {
      return (
        <div className="flex gap-2">
          {/* Tutaj była linia z błędem. Zmieniamy warunek na sprawdzanie, czy status nie jest 'following' lub 'connected' */}
          {status !== 'following' && status !== 'connected' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => followUser(userId)}
            >
              <UserPlus className="h-4 w-4" />
              Obserwuj
            </Button>
          )}
          <Button 
            size="sm" 
            className="gap-1"
            onClick={() => handleSendConnectionRequest(userId)}
          >
            <Users className="h-4 w-4" />
            Połącz
          </Button>
        </div>
      );
    }

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
              Obserwuj
            </Button>
            <Button 
              size="sm" 
              className="gap-1"
              onClick={() => handleSendConnectionRequest(userId)}
            >
              <Users className="h-4 w-4" />
              Połącz
            </Button>
          </div>
        );
      case 'following':
        // Nie pokazuj przycisku "przestań obserwować" w zakładce "Obserwujący"
        if (activeTab === 'followers') {
          return (
            <Button 
              size="sm" 
              className="gap-1"
              onClick={() => handleSendConnectionRequest(userId)}
            >
              <Users className="h-4 w-4" />
              Połącz
            </Button>
          );
        }
        
        return (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => unfollowUser(userId)}
            >
              <UserMinus className="h-4 w-4" />
              Przestań obserwować
            </Button>
            <Button 
              size="sm" 
              className="gap-1"
              onClick={() => handleSendConnectionRequest(userId)}
            >
              <Users className="h-4 w-4" />
              Połącz
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
              Wiadomość
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={() => removeConnection(userId)}
            >
              <UserMinus className="h-4 w-4" />
              Usuń
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
            Zaproszenie wysłane
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
              Akceptuj
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 text-red-500 hover:text-red-600"
              onClick={() => declineConnectionRequest(userId)}
            >
              <X className="h-4 w-4" />
              Odrzuć
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const displayUsers = searchQuery.trim() ? searchResults : 
    users.filter(user => {
      if (user.isCurrentUser) return false;
      
      switch (activeTab) {
        case 'following':
          return user.connectionStatus === 'following' || user.connectionStatus === 'connected';
        case 'followers':
          return user.isFollower === true;
        case 'connections':
          return user.connectionStatus === 'connected';
        case 'pending':
          return user.connectionStatus === 'pending_sent' || user.connectionStatus === 'pending_received';
        default:
          return true;
      }
    });

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
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Moja sieć</h1>
              <p className="text-rhythm-600">
                Buduj swoją sieć zawodową, łącząc się ze specjalistami z branży
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isSearching ? 'text-primary animate-pulse' : 'text-rhythm-500'} h-4 w-4`} />
                <Input 
                  placeholder="Szukaj osób według imienia, stanowiska lub nazwy użytkownika..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Tabs 
              value={activeTab} 
              onValueChange={(v) => setActiveTab(v as 'all' | 'following' | 'followers' | 'connections' | 'pending')}
              className="mb-8"
            >
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="all" className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  Wszyscy
                </TabsTrigger>
                <TabsTrigger value="following" className="flex items-center gap-1.5">
                  <UserPlus className="h-4 w-4" />
                  Obserwowani
                </TabsTrigger>
                <TabsTrigger value="followers" className="flex items-center gap-1.5">
                  <Heart className="h-4 w-4" />
                  Obserwujący
                </TabsTrigger>
                <TabsTrigger value="connections" className="flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4" />
                  Połączenia
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex items-center gap-1.5">
                  <Bell className="h-4 w-4" />
                  Oczekujące
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                {renderUserList(displayUsers)}
              </TabsContent>
              
              <TabsContent value="following">
                {renderUserList(displayUsers)}
              </TabsContent>
              
              <TabsContent value="followers">
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
                    : activeTab === 'followers'
                      ? "Nikt jeszcze Cię nie obserwuje"
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
                    </div>
                    <p className="text-rhythm-500">@{user.username}</p>
                  </div>
                  
                  <div className="sm:self-start">
                    {getConnectionAction(user.connectionStatus, user.id)}
                  </div>
                </div>
                
                <div className="my-2">
                  {getStatusBadge(user.connectionStatus, user.isFollower)}
                </div>
                
                <p className="my-2">{user.role}</p>
                
                <div className="flex gap-4 text-sm">
                  <span className="text-rhythm-600">
                    <strong>{user.followersCount}</strong> obserwujących
                  </span>
                  <span className="text-rhythm-600">
                    <strong>{user.connectionsCount}</strong> połączeń
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
