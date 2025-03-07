
import { Button } from '@/components/ui/button';
import { Pencil, UserPlus, UserCheck, UserMinus, Clock } from 'lucide-react';

interface ProfileActionsProps {
  isOwnProfile: boolean;
  connectionStatus: 'none' | 'following' | 'connected' | 'pending_sent' | 'pending_received';
  isFollowing: boolean;
  onEditProfileClick: () => void;
  handleConnectionAction: () => void;
  handleFollow: () => void;
}

export function ProfileActions({
  isOwnProfile,
  connectionStatus,
  isFollowing,
  onEditProfileClick,
  handleConnectionAction,
  handleFollow
}: ProfileActionsProps) {
  
  const getConnectionButtonText = () => {
    switch(connectionStatus) {
      case 'connected':
        return "Usuń z kontaktów";
      case 'pending_sent':
        return "Anuluj zaproszenie";
      case 'pending_received':
        return "Odpowiedz na zaproszenie";
      default:
        return "Połącz";
    }
  };

  const getConnectionButtonIcon = () => {
    switch(connectionStatus) {
      case 'connected':
        return <UserMinus className="h-4 w-4" />;
      case 'pending_sent':
        return <Clock className="h-4 w-4" />;
      case 'pending_received':
        return <UserCheck className="h-4 w-4" />;
      default:
        return <UserPlus className="h-4 w-4" />;
    }
  };
  
  if (isOwnProfile) {
    return (
      <Button 
        onClick={onEditProfileClick}
        className="gap-2"
      >
        <Pencil className="h-4 w-4" />
        Edytuj profil
      </Button>
    );
  }
  
  return (
    <div className="flex flex-col gap-2">
      <Button 
        variant={connectionStatus === 'connected' || connectionStatus === 'pending_sent' ? "outline" : "default"}
        className="gap-2 w-full"
        onClick={handleConnectionAction}
      >
        {getConnectionButtonIcon()}
        {getConnectionButtonText()}
      </Button>
      
      <Button 
        variant={isFollowing ? "outline" : "secondary"}
        className="gap-2 w-full"
        onClick={handleFollow}
      >
        {isFollowing ? (
          <>
            <UserCheck className="h-4 w-4" />
            Obserwujesz
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            Obserwuj
          </>
        )}
      </Button>
    </div>
  );
}
