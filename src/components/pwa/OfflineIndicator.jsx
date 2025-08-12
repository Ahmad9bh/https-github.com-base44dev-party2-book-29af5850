import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-red-600 text-white p-3 rounded-lg shadow-lg flex items-center gap-3 z-50">
      <WifiOff className="w-5 h-5" />
      <div>
        <h4 className="font-semibold">You're Offline</h4>
        <p className="text-sm">Some features may be unavailable.</p>
      </div>
    </div>
  );
}