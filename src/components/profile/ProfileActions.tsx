
import { Button } from '@/components/ui/button';
import { Pencil, UserPlus, UserMinus, UserCheck, Clock, MessageCircle } from 'lucide-react';

interface ProfileActionsProps {
  isOwnProfile: boolean;
  connectionStatus: 'none' | 'following' | 'connected' | 'pending_sent' | 'pending_received';
  isFollowing: boolean;
  onEditProfileClick: () => void;
  handleConnectionAction: () => void;
  handleFollow: () => void;
  handleSendMessage: () => void;
}

export function ProfileActions({
  isOwnProfile,
  connectionStatus,
  isFollowing,
  onEditProfileClick,
  handleConnectionAction,
  handleFollow,
  handleSendMessage
}: ProfileActionsProps) {
  
  const getConnectionButtonText = () => {
    switch(connectionStatus) {
      case 'connected':
        return "Usuń połączenie";
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
  
  // Po wysłaniu zaproszenia do połączenia, użytkownik automatycznie zaczyna obserwować
  const shouldShowAsFollowing = isFollowing || connectionStatus === 'pending_sent';
  
  // Jeśli to profil użytkownika, pokazujemy tylko przycisk edycji
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
  
  // Dla innych użytkowników pokazujemy wszystkie przyciski
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
        variant={shouldShowAsFollowing ? "outline" : "secondary"}
        className="gap-2 w-full"
        onClick={handleFollow}
      >
        {shouldShowAsFollowing ? (
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

      <Button 
        variant="secondary"
        className="gap-2 w-full"
        onClick={handleSendMessage}
      >
        <MessageCircle className="h-4 w-4" />
        Wyślij wiadomość
      </Button>
    </div>
  );
}
