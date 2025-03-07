
import { Link } from 'react-router-dom';
import { SocialUser } from '@/contexts/social/types';
import { User } from 'lucide-react';
import { ConnectionActionButtons } from './ConnectionActionButtons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface ConnectionsGridProps {
  users: SocialUser[];
  onConnect: (userId: string) => void;
  onAccept: (userId: string) => void;
  onDecline: (userId: string) => void;
  onRemove: (userId: string) => void;
  onFollow: (userId: string) => void;
  onUnfollow: (userId: string) => void;
}

export function ConnectionsGrid({ 
  users, 
  onConnect, 
  onAccept, 
  onDecline, 
  onRemove,
  onFollow,
  onUnfollow
}: ConnectionsGridProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Nie znaleziono pasujących użytkowników</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {users.map(user => (
        <Card key={user.id} className="flex flex-col h-full">
          <CardContent className="pt-4 pb-2 flex-grow">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 flex-shrink-0">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              
              <div className="min-w-0">
                <Link 
                  to={`/profile/${user.id}`}
                  className="font-medium text-lg hover:underline truncate block"
                >
                  {user.name}
                </Link>
                <p className="text-sm text-muted-foreground truncate">{user.role}</p>
                
                {user.connectionStatus === 'pending_received' && (
                  <Badge variant="outline" className="mt-1">Prośba o połączenie</Badge>
                )}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="pt-2 pb-4 border-t flex flex-col items-stretch">
            <ConnectionActionButtons 
              user={user}
              onConnect={onConnect}
              onAccept={onAccept}
              onDecline={onDecline}
              onRemove={onRemove}
              onFollow={onFollow}
              onUnfollow={onUnfollow}
            />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
