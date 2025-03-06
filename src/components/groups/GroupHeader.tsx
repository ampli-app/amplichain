
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group } from '@/types/group';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, Bell, BellOff, Share2, User } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface GroupHeaderProps {
  group: Group;
}

export function GroupHeader({ group }: GroupHeaderProps) {
  const navigate = useNavigate();
  const [isJoined, setIsJoined] = useState(group.isMember);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  
  const handleJoinGroup = () => {
    setIsJoined(true);
    toast({
      title: "Dołączono do grupy",
      description: `Zostałeś członkiem grupy "${group.name}"`,
    });
  };
  
  const handleLeaveGroup = () => {
    setIsJoined(false);
    toast({
      title: "Opuszczono grupę",
      description: `Opuściłeś grupę "${group.name}"`,
    });
  };
  
  const toggleNotifications = () => {
    setIsNotificationsEnabled(!isNotificationsEnabled);
    toast({
      title: isNotificationsEnabled ? "Powiadomienia wyłączone" : "Powiadomienia włączone",
      description: isNotificationsEnabled 
        ? "Nie będziesz otrzymywać powiadomień z tej grupy" 
        : "Będziesz otrzymywać powiadomienia z tej grupy",
    });
  };
  
  const handleShareGroup = () => {
    const groupUrl = `${window.location.origin}/groups/${group.id}`;
    navigator.clipboard.writeText(groupUrl);
    toast({
      title: "Link skopiowany",
      description: "Link do grupy został skopiowany do schowka.",
    });
  };
  
  const handleViewMembers = () => {
    // When clicking on members, scroll to members tab or open members modal
    document.getElementById('members-tab')?.click();
  };

  return (
    <div className="relative">
      {/* Cover image */}
      <div className="h-48 md:h-64 lg:h-80 w-full overflow-hidden relative">
        <img 
          src={group.coverImage}
          alt={`Okładka grupy ${group.name}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>
      
      {/* Group info */}
      <div className="container px-4 mx-auto relative">
        <div className="flex flex-col md:flex-row md:items-end -mt-20 md:-mt-16 pb-4 relative z-10">
          {/* Profile image */}
          <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
            <Avatar className="w-32 h-32 md:w-36 md:h-36 border-4 border-background shadow-lg">
              <AvatarImage 
                src={group.profileImage || group.coverImage} 
                alt={group.name} 
                className="object-cover"
              />
              <AvatarFallback className="text-4xl">
                {group.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          
          {/* Group details */}
          <div className="flex-grow">
            <div className="bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{group.name}</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant={group.isPrivate ? "outline" : "secondary"}>
                      {group.isPrivate ? 'Prywatna' : 'Publiczna'}
                    </Badge>
                    <div 
                      className="flex items-center gap-1 text-sm text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={handleViewMembers}
                    >
                      <Users className="h-4 w-4" />
                      <span>{group.memberCount} {group.memberCount === 1 ? 'członek' : 
                        group.memberCount % 10 >= 2 && group.memberCount % 10 <= 4 && 
                        (group.memberCount % 100 < 10 || group.memberCount % 100 > 20) ? 
                        'członków' : 'członków'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {group.isAdmin && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-1"
                      onClick={() => {/* Open group settings */}}
                    >
                      <Settings className="h-4 w-4" />
                      Ustawienia
                    </Button>
                  )}
                  
                  {isJoined ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1"
                        onClick={toggleNotifications}
                      >
                        {isNotificationsEnabled ? (
                          <>
                            <BellOff className="h-4 w-4" />
                            <span className="hidden sm:inline">Wyłącz powiadomienia</span>
                          </>
                        ) : (
                          <>
                            <Bell className="h-4 w-4" />
                            <span className="hidden sm:inline">Włącz powiadomienia</span>
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1 hover:bg-red-100 dark:hover:bg-red-950"
                        onClick={handleLeaveGroup}
                      >
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Opuść grupę</span>
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="default" 
                      size="sm"
                      className="gap-1"
                      onClick={handleJoinGroup}
                    >
                      <User className="h-4 w-4" />
                      Dołącz do grupy
                    </Button>
                  )}
                  
                  <Button 
                    variant="secondary" 
                    size="icon"
                    className="h-9 w-9"
                    onClick={handleShareGroup}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
