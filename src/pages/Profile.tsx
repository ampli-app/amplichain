
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

export default function Profile() {
  const { user, isLoggedIn } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangeAvatarOpen, setIsChangeAvatarOpen] = useState(false);
  
  const defaultTab = searchParams.get('tab') || 'portfolio';
  const marketplaceTab = searchParams.get('marketplaceTab') || 'products';

  // Determine if this is the user's own profile
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
    }
  }, [isLoggedIn, navigate, userId, user]);

  // Get the profile ID to use for data fetching
  const profileId = userId || (user?.id);
  
  // Use custom hooks
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
      // We don't need to update profileData directly as fetchProfileData will be called
      handleProfileUpdated();
    }
  };

  // Display loading or login required states
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
          />
          
          <ProfileTabs
            defaultTab={defaultTab}
            isOwnProfile={isOwnProfile}
            profileId={profileId || ""}
            userProjects={userProjects}
            userProducts={userProducts}
            userExperience={userExperience}
            userEducation={userEducation}
            onDeleteProduct={handleDeleteProduct}
            onDeleteService={handleDeleteService}
            onDeleteConsultation={handleDeleteConsultation}
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
