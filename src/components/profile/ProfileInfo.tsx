
import { MapPin, Globe, Calendar, Users } from 'lucide-react';
import { ProfileData } from '@/types/profile';

interface ProfileInfoProps {
  profileData: ProfileData | null;
}

export function ProfileInfo({ profileData }: ProfileInfoProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold">
        {profileData?.full_name || "Użytkownik"}
      </h1>
      
      <div className="flex items-center text-muted-foreground mb-2">
        <span className="text-sm">@{profileData?.username || "użytkownik"}</span>
        {profileData?.role && (
          <>
            <span className="mx-2">•</span>
            <span className="text-sm">{profileData.role}</span>
          </>
        )}
      </div>
      
      {profileData?.bio && (
        <p className="text-muted-foreground mt-2 mb-4 max-w-2xl">
          {profileData.bio}
        </p>
      )}
      
      <div className="flex flex-wrap gap-3 mt-2">
        {profileData?.location && (
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{profileData.location}</span>
          </div>
        )}
        
        {profileData?.website && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Globe className="h-4 w-4 mr-1" />
            <a 
              href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              {profileData.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
        
        {profileData?.joined_date && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Dołączył {new Date(profileData.joined_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>
      
      <div className="flex gap-4 mt-4">
        <div className="flex items-center">
          <span className="font-semibold mr-1">{profileData?.followers || 0}</span>
          <span className="text-muted-foreground">Obserwujących</span>
        </div>
        <div className="flex items-center">
          <span className="font-semibold mr-1">{profileData?.following || 0}</span>
          <span className="text-muted-foreground">Obserwuje</span>
        </div>
      </div>
    </div>
  );
}
