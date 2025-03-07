
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
  // Określamy, czy użytkownik jest obserwowany
  // Uwaga: Teraz automatycznie obserwujemy użytkownika po wysłaniu zaproszenia do połączenia
  const isFollowing = user.isFollowing || 
                     user.connectionStatus === 'connected' ||
                     user.connectionStatus === 'pending_sent';
    //||
                    // (user.connectionStatus === 'pending_received' && user.isFollower);

  const renderConnectionButtons = () => {
    switch(user.connectionStatus) {
      case 'none':
        return (
          <Button 
            size="sm" 
            className="whitespace-nowrap w-full"
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
            className="whitespace-nowrap w-full"
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
            className="whitespace-nowrap w-full"
            onClick={() => onRemove(user.id)}
          >
            <Clock className="h-4 w-4 mr-2" />
            Anuluj
          </Button>
        );
      case 'pending_received':
        return (
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button 
              size="sm"
              className="whitespace-nowrap col-span-1"
              onClick={() => onAccept(user.id)}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Akceptuj
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="whitespace-nowrap col-span-1"
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
            className="whitespace-nowrap w-full"
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
    return isFollowing ? (
      <Button 
        variant="ghost" 
        size="sm"
        className="w-full"
        onClick={() => onUnfollow(user.id)}
      >
        <UserCheck className="h-4 w-4 mr-2" />
        Obserwujesz
      </Button>
    ) : (
      <Button 
        variant="ghost" 
        size="sm"
        className="w-full"
        onClick={() => onFollow(user.id)}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Obserwuj
      </Button>
    );
  };
  
  return (
    <div className="flex flex-col w-full space-y-2">
      {renderFollowButton()}
      {renderConnectionButtons()}
    </div>
  );
}
