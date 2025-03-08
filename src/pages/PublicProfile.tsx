
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSocial } from '@/contexts/SocialContext';
import { toast } from '@/components/ui/use-toast';

import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { ProfileLoadingState } from '@/components/profile/ProfileLoadingState';
import { useProfileData } from '@/hooks/useProfileData';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';

export default function PublicProfile() {
  const { user, isLoggedIn } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [commonConnections, setCommonConnections] = useState(0);
  
  // Sprawdzamy, czy to strona profilowa użytkownika zalogowanego
  useEffect(() => {
    console.log("Publiczny profil, dane autoryzacji:", { isLoggedIn, user, userId });

    if (!userId) {
      console.log("Brak userId, przekierowuję na stronę główną");
      navigate('/');
      return;
    }
    
    if (user && userId === user.id) {
      console.log("To Twój profil, przekierowuję na stronę profilu");
      navigate('/profile');
      return;
    }
    
    // Pobieranie wspólnych połączeń dla zalogowanego użytkownika
    if (user && userId && isLoggedIn) {
      fetchCommonConnections(user.id, userId);
    }
  }, [isLoggedIn, navigate, userId, user]);

  // Zoptymalizowana funkcja do pobierania wspólnych połączeń
  const fetchCommonConnections = async (currentUserId: string, targetUserId: string) => {
    try {
      // Get connections for both users in one query to reduce database calls
      const { data, error } = await supabase
        .from('connections')
        .select('user_id1, user_id2, status')
        .or(`user_id1.eq.${currentUserId},user_id2.eq.${currentUserId},user_id1.eq.${targetUserId},user_id2.eq.${targetUserId}`)
        .eq('status', 'accepted');
      
      if (error) {
        console.error('Error fetching connections:', error);
        return;
      }
      
      if (!data || data.length === 0) {
        setCommonConnections(0);
        return;
      }
      
      // Build sets of connections for each user
      const currentUserConnections = new Set<string>();
      const targetUserConnections = new Set<string>();
      
      data.forEach(conn => {
        // Add current user's connections
        if (conn.user_id1 === currentUserId) {
          currentUserConnections.add(conn.user_id2);
        } else if (conn.user_id2 === currentUserId) {
          currentUserConnections.add(conn.user_id1);
        }
        
        // Add target user's connections
        if (conn.user_id1 === targetUserId) {
          targetUserConnections.add(conn.user_id2);
        } else if (conn.user_id2 === targetUserId) {
          targetUserConnections.add(conn.user_id1);
        }
      });
      
      // Count common connections
      let common = 0;
      for (const id of currentUserConnections) {
        if (targetUserConnections.has(id)) {
          common++;
        }
      }
      
      setCommonConnections(common);
    } catch (error) {
      console.error('Unexpected error fetching common connections:', error);
    }
  };

  // Pobierz dane profilu i powiązane informacje
  const { 
    profileData, 
    userProducts, 
    userServices, 
    userConsultations,
    userEducation,
    userExperience,
    userProjects,
    isLoading
  } = useProfileData(userId, false);
  
  // Pobierz status połączenia i obserwacji
  const {
    connectionStatus,
    isFollowing,
    handleConnectionAction,
    handleFollow
  } = useConnectionStatus(userId, false);

  // Wyświetl stany ładowania
  if (isLoading) {
    return <ProfileLoadingState isLoading={true} />;
  }

  if (!userId || !profileData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Nie znaleziono profilu</h2>
            <p className="text-muted-foreground mb-6">
              Profil o podanym identyfikatorze nie istnieje lub nie masz do niego dostępu.
            </p>
            <Link to="/" className="text-primary hover:underline">
              Powrót do strony głównej
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Przekieruj do strony wiadomości z użytkownikiem
  const handleSendMessage = () => {
    navigate(`/messages/user/${userId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <ProfileHeader 
            profileData={profileData}
            isOwnProfile={false} // Zawsze false dla publicznego profilu
            connectionStatus={connectionStatus}
            onEditProfileClick={() => {}} // Funkcja pusta, nie będzie używana
            onAvatarClick={() => {}} // Funkcja pusta, nie będzie używana
            handleConnectionAction={handleConnectionAction}
            handleFollow={handleFollow}
            isFollowing={isFollowing}
            commonConnections={commonConnections}
            handleSendMessage={handleSendMessage}
          />
          
          <ProfileTabs
            defaultTab="feed"
            isOwnProfile={false} // Zawsze false dla publicznego profilu
            profileId={userId}
            userProjects={userProjects}
            userProducts={userProducts}
            userExperience={userExperience}
            userEducation={userEducation}
            onDeleteProduct={() => Promise.resolve()} // Funkcja pusta, nie będzie używana
            onDeleteService={() => Promise.resolve()} // Funkcja pusta, nie będzie używana
            onDeleteConsultation={() => Promise.resolve()} // Funkcja pusta, nie będzie używana
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
