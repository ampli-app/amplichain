
import { Bell } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSocial } from '@/contexts/SocialContext';
import { Notification } from '@/contexts/social/types';

export function Notifications() {
  const { notifications, unreadNotifications, markNotificationAsRead, markAllNotificationsAsRead } = useSocial();
  const [open, setOpen] = useState(false);
  
  const handleNotificationClick = (notificationId: string) => {
    markNotificationAsRead(notificationId);
  };
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative" size="icon">
          <Bell className="h-5 w-5" />
          {unreadNotifications > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Powiadomienia</span>
          {notifications.length > 0 && (
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto text-xs"
              onClick={() => markAllNotificationsAsRead()}
            >
              Oznacz wszystkie jako przeczytane
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="py-4 px-2 text-center text-muted-foreground">
            Brak powiadomień
          </div>
        ) : (
          <DropdownMenuGroup>
            {notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id}
                className={`flex items-start py-2 px-4 hover:bg-accent ${!notification.read ? 'bg-accent/40' : ''}`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <strong>{notification.from.name}</strong>
                    {!notification.read && (
                      <span className="h-2 w-2 bg-primary rounded-full"></span>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.type === 'follow' && 'zaczął(ęła) Cię obserwować'}
                    {notification.type === 'connection_request' && 'wysłał(a) Ci zaproszenie do połączenia'}
                    {notification.type === 'connection_accepted' && 'zaakceptował(a) Twoje zaproszenie do połączenia'}
                    {notification.type === 'like' && 'polubił(a) Twój post'}
                    {notification.type === 'comment' && 'skomentował(a) Twój post'}
                  </p>
                  
                  <span className="text-xs text-muted-foreground mt-1">{notification.time}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
