
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useSocial, Notification } from '@/contexts/SocialContext';
import { 
  Bell, 
  UserCheck, 
  UserPlus, 
  Heart, 
  MessageCircle,
  Check
} from 'lucide-react';

export function Notifications() {
  const { 
    notifications, 
    unreadNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
  } = useSocial();
  
  const [isOpen, setIsOpen] = useState(false);
  
  // Mark as read when opening the notification popover
  useEffect(() => {
    if (isOpen && unreadNotifications > 0) {
      const timer = setTimeout(() => {
        markAllNotificationsAsRead();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, unreadNotifications, markAllNotificationsAsRead]);

  const getNotificationContent = (notification: Notification) => {
    switch (notification.type) {
      case 'follow':
        return (
          <>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                <span className="font-semibold">{notification.from.name}</span> started following you
              </p>
              <p className="text-xs text-rhythm-500">{notification.time}</p>
            </div>
          </>
        );
      case 'connection_request':
        return (
          <>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                <span className="font-semibold">{notification.from.name}</span> sent you a connection request
              </p>
              <p className="text-xs text-rhythm-500">{notification.time}</p>
            </div>
            <div className="flex gap-1">
              <Button size="sm" className="h-7 px-2 text-xs">Accept</Button>
              <Button size="sm" variant="outline" className="h-7 px-2 text-xs">Decline</Button>
            </div>
          </>
        );
      case 'connection_accepted':
        return (
          <>
            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                <span className="font-semibold">{notification.from.name}</span> accepted your connection request
              </p>
              <p className="text-xs text-rhythm-500">{notification.time}</p>
            </div>
          </>
        );
      case 'like':
        return (
          <>
            <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
              <Heart className="h-4 w-4 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                <span className="font-semibold">{notification.from.name}</span> liked your post
              </p>
              <p className="text-xs text-rhythm-500">{notification.time}</p>
            </div>
          </>
        );
      case 'comment':
        return (
          <>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                <span className="font-semibold">{notification.from.name}</span> commented on your post
              </p>
              <p className="text-xs text-rhythm-500">{notification.time}</p>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadNotifications > 0 && (
            <Badge className="absolute top-0 right-0 h-5 min-w-5 flex items-center justify-center p-1 text-xs">
              {unreadNotifications}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3">
          <h4 className="font-semibold">Notifications</h4>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs"
              onClick={markAllNotificationsAsRead}
            >
              <Check className="mr-1 h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-rhythm-500">
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-1 py-1.5">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors cursor-pointer ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={notification.from.avatar} alt={notification.from.name} />
                    <AvatarFallback>{notification.from.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {getNotificationContent(notification)}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2 text-center">
              <Button variant="link" size="sm" className="text-xs">
                View all notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
