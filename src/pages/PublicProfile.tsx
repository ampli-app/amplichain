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
    
    if (user && userId && isLoggedIn) {
      fetchCommonConnections();
    }
  }, [isLoggedIn, navigate, userId, user]);

  const fetchCommonConnections = async () => {
    try {
      const { data: userConnections, error: userConnError } = await supabase
        .from('connections')
        .select('receiver_id, sender_id')
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .eq('status', 'accepted');

      if (userConnError) {
        console.error('Error fetching user connections:', userConnError);
        return;
      }

      const { data: profileConnections, error: profileConnError } = await supabase
        .from('connections')
        .select('receiver_id, sender_id')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (profileConnError) {
        console.error('Error fetching profile connections:', profileConnError);
        return;
      }

      if (!userConnections || !profileConnections) {
        return;
      }

      const userConnectedIds = userConnections.map(conn => 
        conn.sender_id === user?.id ? conn.receiver_id : conn.sender_id
      );
      
      const profileConnectedIds = profileConnections.map(conn =>
        conn.sender_id === userId ? conn.receiver_id : conn.sender_id
      );

      const commonIds = userConnectedIds.filter(id => profileConnectedIds.includes(id));

      if (commonIds.length > 0) {
        const { data: commonProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', commonIds);

        if (profilesError) {
          console.error('Error fetching common profiles:', profilesError);
          return;
        }

        setCommonConnections(commonProfiles || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

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
  
  const {
    connectionStatus,
    isFollowing,
    handleConnectionAction,
    handleFollow
  } = useConnectionStatus(userId, false);

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
            isOwnProfile={false}
            connectionStatus={connectionStatus}
            onEditProfileClick={() => {}}
            onAvatarClick={() => {}}
            handleConnectionAction={handleConnectionAction}
            handleFollow={handleFollow}
            isFollowing={isFollowing}
            commonConnections={commonConnections}
            handleSendMessage={handleSendMessage}
          />
          
          <ProfileTabs
            defaultTab="feed"
            isOwnProfile={false}
            profileId={userId}
            userProjects={userProjects}
            userProducts={userProducts}
            userExperience={userExperience}
            userEducation={userEducation}
            onDeleteProduct={() => Promise.resolve()}
            onDeleteService={() => Promise.resolve()}
            onDeleteConsultation={() => Promise.resolve()}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
