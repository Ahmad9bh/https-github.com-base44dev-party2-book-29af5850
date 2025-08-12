import React, { useEffect, useState, useRef } from 'react';
import { Notification } from '@/api/entities';
import { User } from '@/api/entities';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, XCircle, MessageCircle, CreditCard, Calendar, Home } from 'lucide-react';

const NOTIFICATION_ICONS = {
  booking_approved: <CheckCircle className="w-5 h-5 text-green-600" />,
  booking_rejected: <XCircle className="w-5 h-5 text-red-600" />,
  new_message: <MessageCircle className="w-5 h-5 text-blue-600" />,
  payment_received: <CreditCard className="w-5 h-5 text-green-600" />,
  booking_cancelled: <XCircle className="w-5 h-5 text-orange-600" />,
  booking_modified: <Calendar className="w-5 h-5 text-blue-600" />,
  venue_approved: <Home className="w-5 h-5 text-green-600" />
};

class RealtimeNotificationService {
  constructor() {
    this.subscribers = new Set();
    this.isPolling = false;
    this.pollingInterval = null;
    this.lastCheck = new Date();
    this.hasPermissions = true;
    this.consecutiveErrors = 0;
    this.maxRetries = 3;
    this.rateLimitBackoff = 60000; // 1 minute backoff
    this.isRateLimited = false;
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    this.startPolling();
    return () => {
      this.subscribers.delete(callback);
      if (this.subscribers.size === 0) {
        this.stopPolling();
      }
    };
  }

  async startPolling() {
    if (this.isPolling || !this.hasPermissions || this.isRateLimited) return;
    
    this.isPolling = true;
    // Increased polling interval to reduce API calls
    this.pollingInterval = setInterval(async () => {
      await this.checkForNewNotifications();
    }, 120000); // 2 minutes instead of 1 minute

    // Initial check with longer delay to avoid startup rush
    setTimeout(() => {
      this.checkForNewNotifications();
    }, 10000); // 10 seconds instead of 2 seconds
  }

  stopPolling() {
    this.isPolling = false;
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  async checkForNewNotifications() {
    if (this.isRateLimited) return;

    try {
      const user = await User.me();
      
      // Use regular Notification entity with more conservative filtering
      const newNotifications = await Notification.filter(
        { 
          user_id: user.id,
          is_read: false
        },
        '-created_date',
        3 // Reduced from 5 to 3 to minimize data transfer
      );

      // Only process truly new notifications (created after last check)
      const actuallyNew = newNotifications.filter(notification => 
        new Date(notification.created_date) > this.lastCheck
      );

      if (actuallyNew.length > 0) {
        // Notify all subscribers
        this.subscribers.forEach(callback => {
          actuallyNew.forEach(notification => callback(notification));
        });

        this.lastCheck = new Date();
        this.consecutiveErrors = 0; // Reset error count on success
      }
    } catch (error) {
      this.consecutiveErrors++;
      
      // Handle rate limiting specifically
      if (error.message && (error.message.includes('429') || error.message.includes('Rate limit'))) {
        console.warn('Notification service rate limited, backing off');
        this.isRateLimited = true;
        this.stopPolling();
        
        // Resume after backoff period
        setTimeout(() => {
          this.isRateLimited = false;
          this.consecutiveErrors = 0;
          this.hasPermissions = true;
          if (this.subscribers.size > 0) {
            this.startPolling();
          }
        }, this.rateLimitBackoff);
        
        return;
      }
      
      // Log different types of errors differently
      if (error.message && (error.message.includes('403') || error.message.includes('Forbidden'))) {
        console.log('User does not have permission to access notifications');
        this.hasPermissions = false;
        this.stopPolling();
      } else if (error.message && error.message.includes('Network Error')) {
        console.warn('Network error checking notifications, will retry');
        if (this.consecutiveErrors <= 2) {
          console.error('Network error details:', error);
        }
      } else {
        console.error('Failed to check for new notifications:', error);
      }

      // Stop polling if too many consecutive errors
      if (this.consecutiveErrors >= this.maxRetries) {
        console.warn('Too many consecutive notification errors, stopping polling');
        this.stopPolling();
        // Re-enable after 10 minutes instead of 5
        setTimeout(() => {
          this.consecutiveErrors = 0;
          this.hasPermissions = true;
          this.isRateLimited = false;
        }, 10 * 60 * 1000);
      }
    }
  }

  async createNotification(userId, type, title, message, data = {}) {
    try {
      await Notification.create({
        user_id: userId,
        type,
        title,
        message,
        link: data.link || '',
        is_read: false
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }
}

// Singleton instance
const realtimeService = new RealtimeNotificationService();

export default function RealtimeNotificationManager({ user }) {
  const [notifications, setNotifications] = useState([]);
  const { toast } = useToast();
  const audioRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const handleNewNotification = (notification) => {
      // Add to local state
      setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only 5 most recent

      // Play notification sound (only if user has interacted with page)
      if (audioRef.current && document.hasFocus()) {
        audioRef.current.play().catch(() => {
          // Ignore autoplay restrictions
        });
      }

      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
        duration: 5000,
        action: notification.link ? (
          <Button 
            size="sm" 
            onClick={() => window.location.href = notification.link}
            className="ml-2"
          >
            View
          </Button>
        ) : null
      });

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    };

    const unsubscribe = realtimeService.subscribe(handleNewNotification);
    return unsubscribe;
  }, [user, toast]);

  const handleDismiss = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    // Mark as read with error handling
    Notification.update(notificationId, { is_read: true }).catch(() => {
      // Ignore errors when marking as read
    });
  };

  if (!user) return null;

  return (
    <>
      {/* Notification Sound */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBDOH1e/PgTEGJW3B7+OZSA0PVqXh8LplHgo2jdXzzn0vBiZwwO/hkEILElqs5O+oVRQKRZ/g8r1jHQUzhNXuzYExBiVowO7imUgODFOk4O+6ZRsKNojU8Mp+LgUlb7/t3JE/CRZYqOPuqVYUCkOa3+y+YhwGMoHU8M2BMQUkZb7t35pID
" type="audio/wav" />
      </audio>

      {/* Floating Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-white rounded-lg shadow-lg border p-4 transform transition-all duration-300 ease-in-out animate-in slide-in-from-right"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {NOTIFICATION_ICONS[notification.type] || <Bell className="w-5 h-5 text-gray-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {notification.message}
                </p>
                {notification.link && (
                  <button
                    onClick={() => window.location.href = notification.link}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium mt-2 block"
                  >
                    View Details →
                  </button>
                )}
              </div>
              <button
                onClick={() => handleDismiss(notification.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export { realtimeService };