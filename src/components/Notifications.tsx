
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
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsList, setNotificationsList] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  // Simulate the social context if it's not available
  const socialContext = useSocial ? useSocial() : null;
  
  useEffect(() => {
    if (socialContext) {
      setUnreadCount(socialContext.unreadNotifications);
      setNotificationsList(socialContext.notifications);
    } else {
      // Mock data if context is not available
      setUnreadCount(2);
      setNotificationsList([
        {
          id: "notif1",
          type: "follow",
          from: {
            id: "user124",
            name: "Sarah Johnson",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop"
          },
          read: false,
          time: "2h ago"
        },
        {
          id: "notif2",
          type: "connection_request",
          from: {
            id: "user127",
            name: "James Wilson",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHByb2Zlc3Npb25hbCUyMG1hbnxlbnwwfHwwfHx8MA%3D%3D"
          },
          read: false,
          time: "5h ago"
        }
      ]);
    }
  }, [socialContext]);
  
  const markAllAsRead = () => {
    if (socialContext) {
      socialContext.markAllNotificationsAsRead();
    } else {
      setUnreadCount(0);
      setNotificationsList(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    }
  };
  
  const markAsRead = (id: string) => {
    if (socialContext) {
      socialContext.markNotificationAsRead(id);
    } else {
      setNotificationsList(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };
  
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
          {unreadCount > 0 && (
            <Badge className="absolute top-0 right-0 h-5 min-w-5 flex items-center justify-center p-1 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3">
          <h4 className="font-semibold">Notifications</h4>
          {notificationsList.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs"
              onClick={markAllAsRead}
            >
              <Check className="mr-1 h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="max-h-[400px]">
          {notificationsList.length === 0 ? (
            <div className="py-8 text-center text-sm text-rhythm-500">
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-1 py-1.5">
              {notificationsList.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors cursor-pointer ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
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
        {notificationsList.length > 0 && (
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
