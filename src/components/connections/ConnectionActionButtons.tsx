
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, UserCheck, Clock, X } from 'lucide-react';
import { SocialUser } from '@/contexts/social/types';

interface ConnectionActionButtonsProps { 
  user: SocialUser;
  onConnect: (userId: string) => void;
  onAccept: (userId: string) => void;
  onDecline: (userId: string) => void;
  onRemove: (userId: string) => void;
  onFollow: (userId: string) => void;
  onUnfollow: (userId: string) => void;
}

export function ConnectionActionButtons({ 
  user, 
  onConnect, 
  onAccept, 
  onDecline, 
  onRemove, 
  onFollow, 
  onUnfollow 
}: ConnectionActionButtonsProps) {
  // Określamy, czy użytkownik jest obserwowany na podstawie relacji w bazie danych
  // lub jeśli mamy aktywne połączenie (connected), które automatycznie oznacza obserwację
  const isFollowing = user.connectionStatus === 'following' || 
                     user.connectionStatus === 'connected' || 
                     user.connectionStatus === 'pending_sent';

  const renderConnectionButtons = () => {
    switch(user.connectionStatus) {
      case 'none':
        return (
          <Button 
            size="sm" 
            className="whitespace-nowrap"
            onClick={() => onConnect(user.id)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Połącz
          </Button>
        );
      case 'following':
        return (
          <Button 
            size="sm" 
            className="whitespace-nowrap"
            onClick={() => onConnect(user.id)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Połącz
          </Button>
        );
      case 'pending_sent':
        return (
          <Button 
            variant="outline" 
            size="sm" 
            className="whitespace-nowrap"
            onClick={() => onRemove(user.id)}
          >
            <Clock className="h-4 w-4 mr-2" />
            Anuluj
          </Button>
        );
      case 'pending_received':
        return (
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button 
              size="sm"
              className="whitespace-nowrap"
              onClick={() => onAccept(user.id)}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Akceptuj
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="whitespace-nowrap"
              onClick={() => onDecline(user.id)}
            >
              <X className="h-4 w-4 mr-2" />
              Odrzuć
            </Button>
          </div>
        );
      case 'connected':
        return (
          <Button 
            variant="outline" 
            size="sm"
            className="whitespace-nowrap"
            onClick={() => onRemove(user.id)}
          >
            <UserMinus className="h-4 w-4 mr-2" />
            Usuń
          </Button>
        );
      default:
        return null;
    }
  };

  const renderFollowButton = () => {
    if (user.connectionStatus === 'connected') return null;
    
    // Wyświetlaj obserwujesz dla pending_received jeśli użytkownik jest zarazem obserwowany
    return isFollowing ? (
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => onUnfollow(user.id)}
      >
        <UserCheck className="h-4 w-4 mr-2" />
        Obserwujesz
      </Button>
    ) : (
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => onFollow(user.id)}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Obserwuj
      </Button>
    );
  };
  
  return (
    <div className="flex flex-col items-end space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
      {renderFollowButton()}
      {renderConnectionButtons()}
    </div>
  );
}
