import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Auto-hide offline message after 5 seconds
    if (!isOnline) {
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 5000);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  return (
    <>
      {/* Status indicator in navbar */}
      {!isOnline && (
        <div className="fixed top-16 left-0 right-0 z-40">
          <div className="bg-orange-500 text-white px-4 py-2 text-center text-sm">
            <WifiOff className="w-4 h-4 inline mr-2" />
            You're offline. Some features may be limited.
          </div>
        </div>
      )}

      {/* Floating status badge */}
      {showOfflineMessage && (
        <div className="fixed bottom-24 right-4 z-50 md:bottom-8">
          <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 flex items-center gap-2 shadow-lg">
            <WifiOff className="w-4 h-4" />
            <span>Offline Mode</span>
          </Badge>
        </div>
      )}
      
      {isOnline && showOfflineMessage && (
        <div className="fixed bottom-24 right-4 z-50 md:bottom-8">
          <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 flex items-center gap-2 shadow-lg">
            <Wifi className="w-4 h-4" />
            <span>Back Online</span>
          </Badge>
        </div>
      )}
    </>
  );
}