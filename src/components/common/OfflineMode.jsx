import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function OfflineMode() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (showReconnected) {
    return (
      <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom">
        <Card className="bg-green-600 border-green-600 text-white">
          <CardContent className="p-3 flex items-center gap-3">
            <Wifi className="w-5 h-5" />
            <div>
              <p className="font-medium">Back Online</p>
              <p className="text-sm opacity-90">Connection restored</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Card className="bg-amber-600 border-amber-600 text-white">
        <CardContent className="p-3 flex items-center gap-3">
          <WifiOff className="w-5 h-5" />
          <div>
            <p className="font-medium">You're Offline</p>
            <p className="text-sm opacity-90">Some features may be limited</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}