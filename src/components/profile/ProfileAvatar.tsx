
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Camera } from 'lucide-react';
import { ProfileData } from '@/types/profile';

interface ProfileAvatarProps {
  profileData: ProfileData | null;
  isOwnProfile: boolean;
  onAvatarClick: () => void;
}

export function ProfileAvatar({ profileData, isOwnProfile, onAvatarClick }: ProfileAvatarProps) {
  return (
    <div className="flex-shrink-0">
      <div className={`relative group ${isOwnProfile ? 'cursor-pointer' : ''}`} onClick={isOwnProfile ? onAvatarClick : undefined}>
        <Avatar className="h-24 w-24 md:h-32 md:w-32 rounded-xl">
          <AvatarImage 
            src={profileData?.avatar_url || '/placeholder.svg'} 
            alt={profileData?.full_name || 'User'} 
            className="object-cover"
          />
          <AvatarFallback className="text-4xl">
            <User className="h-12 w-12" />
          </AvatarFallback>
        </Avatar>
        {isOwnProfile && (
          <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="h-8 w-8 text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
