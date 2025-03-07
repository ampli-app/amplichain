
import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { ProfileData } from '@/types/profile';

import { ProfileAvatar } from './ProfileAvatar';
import { ProfileInfo } from './ProfileInfo';
import { ProfileActions } from './ProfileActions';

interface ProfileHeaderProps {
  profileData: ProfileData | null;
  isOwnProfile: boolean;
  connectionStatus: 'none' | 'following' | 'connected' | 'pending_sent' | 'pending_received';
  onEditProfileClick: () => void;
  onAvatarClick: () => void;
  handleConnectionAction: () => void;
  handleFollow: () => void;
  isFollowing?: boolean;
}

export function ProfileHeader({ 
  profileData, 
  isOwnProfile, 
  connectionStatus, 
  onEditProfileClick, 
  onAvatarClick,
  handleConnectionAction,
  handleFollow,
  isFollowing = false
}: ProfileHeaderProps) {
  
  const handleShareProfile = () => {
    const profileUrl = window.location.href;
    
    navigator.clipboard.writeText(profileUrl).then(
      () => {
        toast({
          title: "Link skopiowany",
          description: "Link do profilu został skopiowany do schowka.",
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: "Błąd",
          description: "Nie udało się skopiować linku.",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <div className="bg-card border rounded-xl p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-6">
        <ProfileAvatar 
          profileData={profileData} 
          isOwnProfile={isOwnProfile} 
          onAvatarClick={onAvatarClick} 
        />
        
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between">
            <ProfileInfo profileData={profileData} />
            
            <div className="mt-4 sm:mt-0 flex flex-col sm:items-end gap-2">
              <ProfileActions 
                isOwnProfile={isOwnProfile}
                connectionStatus={connectionStatus}
                isFollowing={isFollowing}
                onEditProfileClick={onEditProfileClick}
                handleConnectionAction={handleConnectionAction}
                handleFollow={handleFollow}
              />
              
              <Button variant="ghost" size="sm" onClick={handleShareProfile}>
                <Share2 className="h-4 w-4 mr-1" />
                Udostępnij profil
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
