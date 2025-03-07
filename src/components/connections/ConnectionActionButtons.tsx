import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, UserCheck, Clock, X } from 'lucide-react';
import { SocialUser } from '@/contexts/social/types';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface ConnectionActionButtonsProps { 
  user: SocialUser;
  onConnect: (userId: string) => void;
  onAccept: (userId: string) => void;
  onDecline: (userId: string) => void;
  onRemove: (userId: string, keepFollowing?: boolean) => void;
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
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'cancel_invitation' | 'remove_connection'>('remove_connection');
  
  // Określamy, czy użytkownik jest obserwowany
  // Uwaga: Teraz automatycznie obserwujemy użytkownika po wysłaniu zaproszenia do połączenia
  const isFollowing = user.isFollowing || 
                     user.connectionStatus === 'connected' ||
                     user.connectionStatus === 'pending_sent';
    //||
                    // (user.connectionStatus === 'pending_received' && user.isFollower);

  const handleRemoveClick = (userId: string, action: 'cancel_invitation' | 'remove_connection') => {
    // Otwórz dialog potwierdzenia zamiast od razu usuwać połączenie
    setDialogAction(action);
    setConfirmDialogOpen(true);
  };

  const handleConfirmRemove = () => {
    // Zamknij dialog i wykonaj akcję usunięcia
    setConfirmDialogOpen(false);
    
    // Dla anulowania zaproszenia, chcemy zachować obserwowanie (keepFollowing=true)
    // Dla usuwania połączenia, chcemy usunąć obserwowanie (keepFollowing=false - domyślnie)
    if (dialogAction === 'cancel_invitation') {
      onRemove(user.id, true); // Zachowaj obserwowanie przy anulowaniu zaproszenia
    } else {
      onRemove(user.id); // Usuń obserwowanie przy usuwaniu połączenia (domyślne zachowanie)
    }
  };

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
            onClick={() => handleRemoveClick(user.id, 'cancel_invitation')}
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
            onClick={() => handleRemoveClick(user.id, 'remove_connection')}
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
  
  const getDialogTitle = () => {
    return dialogAction === 'cancel_invitation' ? 'Potwierdź anulowanie' : 'Potwierdź usunięcie';
  };

  const getDialogDescription = () => {
    return dialogAction === 'cancel_invitation' 
      ? `Czy na pewno chcesz anulować zaproszenie do połączenia z ${user.name}?`
      : `Czy na pewno chcesz usunąć połączenie z ${user.name}?`;
  };

  const getConfirmButtonText = () => {
    return dialogAction === 'cancel_invitation' ? 'Tak, anuluj' : 'Tak, usuń';
  };
  
  return (
    <>
      <div className="flex flex-col w-full space-y-2">
        {renderFollowButton()}
        {renderConnectionButtons()}
      </div>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
            <DialogDescription>
              {getDialogDescription()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setConfirmDialogOpen(false)}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleConfirmRemove}>
              {getConfirmButtonText()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
