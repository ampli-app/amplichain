
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Pencil, 
  MapPin, 
  Globe, 
  Calendar, 
  Users,
  Share2,
  Camera,
  User
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { ProfileData } from '@/types/profile';

interface ProfileHeaderProps {
  profileData: ProfileData | null;
  isOwnProfile: boolean;
  connectionStatus: 'none' | 'following' | 'connected' | 'pending_sent' | 'pending_received';
  onEditProfileClick: () => void;
  onAvatarClick: () => void;
  handleConnectionAction: () => void;
  handleFollow: () => void;
}

export function ProfileHeader({ 
  profileData, 
  isOwnProfile, 
  connectionStatus, 
  onEditProfileClick, 
  onAvatarClick,
  handleConnectionAction,
  handleFollow
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
        
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between">
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
            
            <div className="mt-4 sm:mt-0 flex flex-col sm:items-end gap-2">
              {isOwnProfile ? (
                <Button 
                  onClick={onEditProfileClick}
                  className="gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edytuj profil
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button 
                    variant={connectionStatus === 'connected' || connectionStatus === 'pending_sent' ? "outline" : "default"}
                    className="gap-2 w-full"
                    onClick={handleConnectionAction}
                  >
                    <Users className="h-4 w-4" />
                    {connectionStatus === 'connected' ? "Usuń z kontaktów" :
                     connectionStatus === 'pending_sent' ? "Anuluj zaproszenie" :
                     connectionStatus === 'pending_received' ? "Odpowiedz na zaproszenie" :
                     "Dodaj do kontaktów"}
                  </Button>
                  
                  <Button 
                    variant={connectionStatus === 'following' ? "outline" : "secondary"}
                    className="gap-2 w-full"
                    onClick={handleFollow}
                  >
                    {connectionStatus === 'following' ? "Obserwujesz" : "Obserwuj"}
                  </Button>
                </div>
              )}
              
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
