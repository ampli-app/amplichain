
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
  // Sprawdzamy, czy użytkownik jest obserwowany
  const isUserFollowing = user.connectionStatus === 'following';

  const renderConnectionButtons = () => {
    switch(user.connectionStatus) {
      case 'none':
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
            Anuluj zaproszenie
          </Button>
        );
      case 'pending_received':
        return (
          <div className="flex gap-2">
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
    
    // Sprawdź tutaj, czy connectionStatus to 'following'
    return isUserFollowing ? (
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
    <div className="flex gap-2">
      {renderFollowButton()}
      {renderConnectionButtons()}
    </div>
  );
}
