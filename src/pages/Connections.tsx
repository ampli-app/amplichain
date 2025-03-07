
import { useState, useEffect } from 'react';
import { useSocial } from '@/contexts/SocialContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { toast } from '@/components/ui/use-toast';
import { ConnectionSearch } from '@/components/connections/ConnectionSearch';
import { ConnectionTabs } from '@/components/connections/ConnectionTabs';
import { ConnectionsGrid } from '@/components/connections/ConnectionsGrid';
import { SocialUser } from '@/contexts/social/types';
import { supabase } from '@/integrations/supabase/client';

export default function Connections() {
  const { 
    users, 
    sendConnectionRequest, 
    acceptConnectionRequest, 
    declineConnectionRequest, 
    removeConnection,
    followUser,
    unfollowUser,
    currentUser
  } = useSocial();
  
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<SocialUser[]>([]);
  const [followingState, setFollowingState] = useState<Record<string, boolean>>({});
  
  // Ładuj informacje o obserwowanych użytkownikach
  useEffect(() => {
    const loadFollowingState = async () => {
      if (!currentUser) return;
      
      try {
        const { data: followingsData, error } = await supabase
          .from('followings')
          .select('following_id')
          .eq('follower_id', currentUser.id);
          
        if (error) {
          console.error('Error loading followings data:', error);
          return;
        }
        
        const followingMap: Record<string, boolean> = {};
        followingsData.forEach(item => {
          followingMap[item.following_id] = true;
        });
        
        setFollowingState(followingMap);
      } catch (err) {
        console.error('Unexpected error loading followings:', err);
      }
    };
    
    loadFollowingState();
  }, [currentUser]);
  
  useEffect(() => {
    let result = [...users].filter(user => !user.isCurrentUser);
    
    // Oznacz użytkowników obserwowanych
    result = result.map(user => ({
      ...user,
      isFollowing: followingState[user.id] || false
    }));
    
    if (activeTab === 'connected') {
      result = result.filter(user => user.connectionStatus === 'connected');
    } else if (activeTab === 'pending') {
      result = result.filter(user => 
        user.connectionStatus === 'pending_sent' || 
        user.connectionStatus === 'pending_received'
      );
    } else if (activeTab === 'followers') {
      // Użytkownicy, którzy obserwują bieżącego użytkownika
      result = result.filter(user => user.isFollower);
    } else if (activeTab === 'following') {
      // Użytkownicy, których bieżący użytkownik obserwuje
      result = result.filter(user => followingState[user.id]);
    }
    
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(query) ||
        (user.username && user.username.toLowerCase().includes(query)) ||
        (user.role && user.role.toLowerCase().includes(query))
      );
    }
    
    setFilteredUsers(result);
  }, [users, activeTab, search, currentUser, followingState]);
  
  const handleConnect = async (userId: string) => {
    await sendConnectionRequest(userId);
    setFollowingState(prev => ({...prev, [userId]: true}));
  };
  
  const handleAccept = async (userId: string) => {
    await acceptConnectionRequest(userId);
    setFollowingState(prev => ({...prev, [userId]: true}));
  };
  
  const handleDecline = async (userId: string) => {
    await removeConnection(userId);
  };
  
  const handleRemove = async (userId: string, keepFollowing: boolean = false) => {
    await removeConnection(userId, keepFollowing);
    
    // Tylko jeśli nie zachowujemy obserwacji, aktualizujemy stan followingState
    if (!keepFollowing) {
      setFollowingState(prev => ({...prev, [userId]: false}));
      toast({
        title: "Połączenie usunięte",
        description: "Pomyślnie usunięto połączenie z użytkownikiem.",
      });
    } else {
      toast({
        title: "Zaproszenie anulowane",
        description: "Pomyślnie anulowano zaproszenie. Nadal obserwujesz użytkownika.",
      });
    }
  };
  
  const handleFollow = async (userId: string) => {
    await followUser(userId);
    setFollowingState(prev => ({...prev, [userId]: true}));
  };
  
  const handleUnfollow = async (userId: string) => {
    await unfollowUser(userId);
    setFollowingState(prev => ({...prev, [userId]: false}));
    toast({
      title: "Obserwacja zakończona",
      description: "Pomyślnie przestałeś obserwować użytkownika.",
    });
  };

  // Dane wejściowe dla komponentu ConnectionTabs
  const connectedUsers = users.filter(u => u.connectionStatus === 'connected');
  const pendingUsers = users.filter(u => 
    u.connectionStatus === 'pending_sent' || 
    u.connectionStatus === 'pending_received'
  );
  // Użytkownicy, którzy obserwują bieżącego użytkownika
  const followerUsers = users.filter(u => u.isFollower);
  // Użytkownicy, których obserwuje bieżący użytkownik
  const followingUsersCount = Object.keys(followingState).filter(id => followingState[id]).length;
  const allUsers = users.filter(u => !u.isCurrentUser);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20 pb-16">
        <div className="container px-4 mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold mb-4">Połączenia</h1>
          
          <ConnectionSearch 
            search={search}
            setSearch={setSearch}
          />
          
          <ConnectionTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            allUsers={allUsers}
            connectedUsers={connectedUsers}
            pendingUsers={pendingUsers}
            followerUsers={followerUsers}
            followingCount={followingUsersCount}
          >
            <ConnectionsGrid 
              users={filteredUsers}
              onConnect={handleConnect}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onRemove={handleRemove}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
            />
          </ConnectionTabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
