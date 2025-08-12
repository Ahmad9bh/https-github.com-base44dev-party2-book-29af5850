import { useEffect } from 'react';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export default function PushNotificationManager() {
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          if (subscription === null) {
            // Not subscribed yet, maybe prompt user
          } else {
            // Already subscribed
            sendSubscriptionToBackend(subscription);
          }
        });
      });
    }
  }, []);

  const subscribeUser = async () => {
    const applicationServerKey = urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY'); // Replace with your key
    try {
      const subscription = await navigator.serviceWorker.ready.then(reg => 
        reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey,
        })
      );
      console.log('User is subscribed.');
      await sendSubscriptionToBackend(subscription);
    } catch (error) {
      console.error('Failed to subscribe the user: ', error);
    }
  };

  const sendSubscriptionToBackend = async (subscription) => {
    try {
      const user = await User.me();
      await User.updateMyUserData({
        push_subscription: JSON.stringify(subscription)
      });
    } catch (error) {
      console.error('Failed to send push subscription to backend.', error);
    }
  };

  // Maybe add a button in user settings to trigger subscribeUser()
  return null;
}