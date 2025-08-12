import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@/api/entities';
import { Notification } from '@/api/entities';
import { useToast } from '@/components/ui/toast';

const PushNotificationContext = createContext();

export const usePushNotifications = () => {
  return useContext(PushNotificationContext);
};

export const PushNotificationProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permission, setPermission] = useState(Notification.permission);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (e) {
        // Not logged in
      }
    };
    fetchUser();
  }, []);

  const requestPermission = useCallback(() => {
    if (permission === 'granted') {
      toast({ title: "You already have notifications enabled!" });
      return;
    }
    
    Notification.requestPermission().then((result) => {
      setPermission(result);
      if (result === 'granted') {
        toast({ title: 'Notifications Enabled!', description: 'You will now receive real-time updates.' });
      } else {
        toast({ title: 'Notifications Denied', description: 'You can enable them later in your browser settings.', variant: 'destructive' });
      }
    });
  }, [permission, toast]);

  const sendNotification = useCallback(async ({ userId, title, message, link, type }) => {
    if (!userId || !title || !message || !link || !type) {
      console.error("Missing required fields for sending notification");
      return;
    }

    try {
      // 1. Create a notification record in the database
      const dbNotification = await Notification.create({
        user_id: userId,
        title,
        message,
        link,
        type,
        is_read: false
      });

      // 2. If the current user is the one receiving the notification,
      //    and has granted permission, show a browser notification.
      //    (In a real app, this logic would be handled by a service worker and push server)
      if (user?.id === userId && permission === 'granted') {
        const pushNotification = new window.Notification(title, {
          body: message,
          icon: '/logo.png', // Add a logo to your public folder
        });

        pushNotification.onclick = () => {
          window.open(link, '_blank');
        };
      }
      return dbNotification;
    } catch (error) {
      console.error('Failed to send notification:', error);
      // Don't throw, as this might not be a critical failure
    }
  }, [user, permission]);
  
  const value = {
    requestPermission,
    sendNotification,
    permission
  };

  return (
    <PushNotificationContext.Provider value={value}>
      {children}
    </PushNotificationContext.Provider>
  );
};