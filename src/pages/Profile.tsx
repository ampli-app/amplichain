import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSocial } from '@/contexts/SocialContext';
import { toast } from '@/components/ui/use-toast';

import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { ProfileLoadingState } from '@/components/profile/ProfileLoadingState';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { ChangeAvatarModal } from '@/components/profile/ChangeAvatarModal';
import { useProfileData } from '@/hooks/useProfileData';
import { useMarketplaceActions } from '@/hooks/useMarketplaceActions';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';

interface ProfileConnection {
  id: string;
  full_name: string;
  avatar_url?: string;
  username?: string;
  [key: string]: any;
}

export default function Profile() {
  const { user, isLoggedIn } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangeAvatarOpen, setIsChangeAvatarOpen] = useState(false);
  const [commonConnections, setCommonConnections] = useState<ProfileConnection[]>([]);
  
  const defaultTab = searchParams.get('tab') || 'info';
  const marketplaceTab = searchParams.get('marketplaceTab') || 'products';

  useEffect(() => {
    console.log("Profile page loaded, auth state:", { isLoggedIn, user, userId });

    if (!isLoggedIn && !userId) {
      console.log("Not logged in and no userId provided, redirecting to login");
      navigate('/login');
      return;
    }
    
    const targetUserId = userId || (user && user.id);
    console.log("Target user ID:", targetUserId);
    
    if (user && targetUserId === user.id) {
      setIsOwnProfile(true);
    } else {
      setIsOwnProfile(false);
      
      if (user && targetUserId) {
        fetchCommonConnections(user.id, targetUserId);
      }
    }
  }, [isLoggedIn, navigate, userId, user]);

  const fetchCommonConnections = async (currentUserId: string, targetUserId: string) => {
    try {
      const { data: currentUserConnections, error: currentUserError } = await supabase
        .from('connections')
        .select('user_id1, user_id2')
        .or(`user_id1.eq.${currentUserId},user_id2.eq.${currentUserId}`);
        
      if (currentUserError) {
        console.error('Error fetching current user connections:', currentUserError);
        return;
      }
      
      const { data: targetUserConnections, error: targetUserError } = await supabase
        .from('connections')
        .select('user_id1, user_id2')
        .or(`user_id1.eq.${targetUserId},user_id2.eq.${targetUserId}`);
        
      if (targetUserError) {
        console.error('Error fetching target user connections:', targetUserError);
        return;
      }
      
      const currentUserConnectionIds = new Set<string>();
      currentUserConnections.forEach(conn => {
        if (conn.user_id1 === currentUserId) {
          currentUserConnectionIds.add(conn.user_id2);
        } else {
          currentUserConnectionIds.add(conn.user_id1);
        }
      });
      
      const commonIds: string[] = [];
      targetUserConnections.forEach(conn => {
        const connectedUserId = conn.user_id1 === targetUserId ? conn.user_id2 : conn.user_id1;
        if (currentUserConnectionIds.has(connectedUserId)) {
          commonIds.push(connectedUserId);
        }
      });
      
      if (commonIds.length > 0) {
        const { data: commonProfilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', commonIds);

        if (profilesError) {
          console.error('Error fetching common profiles:', profilesError);
          setCommonConnections([]);
          return;
        }

        setCommonConnections(commonProfilesData || []);
      } else {
        setCommonConnections([]);
      }
    } catch (error) {
      console.error('Unexpected error fetching common connections:', error);
      setCommonConnections([]);
    }
  };

  const profileId = userId || (user?.id);
  
  const { 
    profileData, 
    userProducts, 
    userServices, 
    userConsultations,
    userEducation,
    userExperience,
    userProjects,
    isLoading,
    fetchProfileData
  } = useProfileData(profileId, isOwnProfile);
  
  const {
    handleDeleteProduct,
    handleDeleteService,
    handleDeleteConsultation
  } = useMarketplaceActions(user?.id || "");
  
  const {
    connectionStatus,
    isFollowing,
    handleConnectionAction,
    handleFollow
  } = useConnectionStatus(userId, isOwnProfile);

  const handleProfileUpdated = () => {
    if (profileId) {
      fetchProfileData(profileId);
    }
  };

  const handleAvatarClick = () => {
    if (isOwnProfile) {
      setIsChangeAvatarOpen(true);
    }
  };

  const handleAvatarChanged = (newAvatarUrl: string) => {
    if (profileData) {
      handleProfileUpdated();
    }
  };

  if (!isLoggedIn && !userId) {
    return <ProfileLoadingState isLoading={false} />;
  }

  if (isLoading) {
    return <ProfileLoadingState isLoading={true} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 mx-auto">
          <ProfileHeader 
            profileData={profileData}
            isOwnProfile={isOwnProfile}
            connectionStatus={connectionStatus}
            onEditProfileClick={() => setIsEditProfileOpen(true)}
            onAvatarClick={handleAvatarClick}
            handleConnectionAction={handleConnectionAction}
            handleFollow={handleFollow}
            isFollowing={isFollowing}
            commonConnections={commonConnections}
          />
          
          <ProfileTabs
            profileId={profileId || ""}
            isOwnProfile={isOwnProfile}
          />
        </div>
      </main>
      
      <Footer />
      
      {profileData && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          onProfileUpdated={handleProfileUpdated}
          currentProfile={profileData}
        />
      )}
      
      {isOwnProfile && (
        <ChangeAvatarModal
          isOpen={isChangeAvatarOpen}
          onClose={() => setIsChangeAvatarOpen(false)}
          onAvatarChanged={handleAvatarChanged}
          currentAvatarUrl={profileData?.avatar_url || '/placeholder.svg'}
        />
      )}
    </div>
  );
}
