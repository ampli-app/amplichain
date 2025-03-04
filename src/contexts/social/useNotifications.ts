
import { useState } from 'react';
import { Notification } from './types';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true } 
          : notif
      )
    );
  };
  
  const markAllNotificationsAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notif => ({ ...notif, read: true }))
    );
  };
  
  return {
    notifications,
    setNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadNotifications: notifications.filter(notif => !notif.read).length
  };
};
