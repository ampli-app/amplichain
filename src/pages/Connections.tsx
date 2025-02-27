
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useSocial, UserConnectionStatus } from '@/contexts/SocialContext';
import { 
  Search, 
  Users, 
  UserPlus, 
  UserMinus, 
  UserCheck, 
  Bell, 
  MessageSquare,
  Check,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Connections() {
  const { 
    users, 
    currentUser, 
    followUser, 
    unfollowUser,
    sendConnectionRequest,
    acceptConnectionRequest,
    declineConnectionRequest,
    removeConnection
  } = useSocial();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'following' | 'connections' | 'pending'>('all');
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  // Filter users based on search query and active tab
  const filteredUsers = users.filter(user => {
    // Don't show current user
    if (user.isCurrentUser) return false;
    
    // Filter by search query
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Filter by connection status
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rhythm-500 h-4 w-4" />
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
                {renderUserList(filteredUsers)}
              </TabsContent>
              
              <TabsContent value="following">
                {renderUserList(filteredUsers)}
              </TabsContent>
              
              <TabsContent value="connections">
                {renderUserList(filteredUsers)}
              </TabsContent>
              
              <TabsContent value="pending">
                {renderUserList(filteredUsers)}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
  
  function renderUserList(users: typeof filteredUsers) {
    if (users.length === 0) {
      return (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <p className="text-rhythm-500 mb-2">No users found</p>
            {searchQuery && (
              <Button variant="link" onClick={() => setSearchQuery('')}>
                Clear search
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
