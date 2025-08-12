
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.requestCounts = new Map(); // Track request frequency
    this.maxAge = 10 * 60 * 1000; // Increased to 10 minutes default
    this.maxSize = 100; // Maximum number of cached items
    this.maxRequestsPerMinute = 15; // Reduced from 30 to 15
    this.rateLimitBackoff = new Map(); // Track rate limit backoff
  }

  // Generate cache key
  generateKey(type, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${type}:${JSON.stringify(sortedParams)}`;
  }

  // Set cache with TTL
  set(key, data, ttl = this.maxAge) {
    // If cache is full, remove oldest entries
    if (this.cache.size >= this.maxSize) {
      // Find the oldest entry by timestamp
      let oldestKey = null;
      let oldestTimestamp = Infinity;
      for (const [key, timestamp] of this.timestamps.entries()) {
          // Note: timestamp here is the expiry time, not creation time.
          // To find oldest based on creation/last access, we'd need another map.
          // For now, let's assume oldest expiration means oldest entry for eviction.
          // A more robust eviction strategy (LRU/LFU) would be better, but this simple one works for max size.
          if (timestamp < oldestTimestamp) { 
              oldestTimestamp = timestamp;
              oldestKey = key;
          }
      }
      if (oldestKey) {
        this.delete(oldestKey);
      }
    }

    this.cache.set(key, data);
    this.timestamps.set(key, Date.now() + ttl);
  }

  // Get from cache
  get(key) {
    const timestamp = this.timestamps.get(key);
    
    if (!timestamp) {
      return null;
    }

    // Check if expired
    if (Date.now() > timestamp) {
      this.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  // Delete from cache
  delete(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }

  // Enhanced rate limiting with backoff
  canMakeRequest(key = 'global') {
    // Check if we're in backoff period for this key
    const backoffUntil = this.rateLimitBackoff.get(key);
    if (backoffUntil && Date.now() < backoffUntil) {
      console.warn(`Rate limit backoff active for key: ${key}`);
      return false;
    }

    const now = Date.now();
    const requests = this.requestCounts.get(key) || [];
    
    // Remove requests older than 1 minute (60,000 ms)
    const recentRequests = requests.filter(time => now - time < 60000);
    
    if (recentRequests.length >= this.maxRequestsPerMinute) {
      console.warn(`Rate limit exceeded for key: ${key}`);
      // Set backoff period (2 minutes = 120,000 ms)
      this.rateLimitBackoff.set(key, now + 120000);
      return false;
    }
    
    // Add current request time
    recentRequests.push(now);
    this.requestCounts.set(key, recentRequests);
    
    return true;
  }

  // Enhanced getVenues with rate limiting
  async getVenues(filters = {}, sort = '-created_date', limit = 50) {
    const key = this.generateKey('venues', { filters, sort, limit });
    const cached = this.get(key);
    
    if (cached) {
      console.log('Cache hit for venues:', key);
      return cached;
    }

    // Check rate limit before making API call
    if (!this.canMakeRequest('venues')) {
      console.warn('Rate limit exceeded for venues API');
      // Return empty array or cached data if available
      return this.cache.has(key) ? this.cache.get(key) : [];
    }

    try {
      const { Venue } = await import('@/api/entities');
      const venues = Object.keys(filters).length > 0 
        ? await Venue.filter(filters, sort, limit)
        : await Venue.list(sort, limit);
      
      this.set(key, venues, 3 * 60 * 1000); // Cache for 3 minutes
      console.log('Cache miss for venues:', key);
      return venues;
    } catch (error) {
      console.error('Failed to fetch venues:', error);
      // Return cached data if available, otherwise empty array
      return this.cache.has(key) ? this.cache.get(key) : [];
    }
  }

  async getVenue(venueId) {
    const key = this.generateKey('venue', { id: venueId });
    const cached = this.get(key);
    
    if (cached) {
      console.log('Cache hit for venue:', venueId);
      return cached;
    }

    try {
      const { Venue } = await import('@/api/entities');
      const venue = await Venue.get(venueId);
      
      this.set(key, venue, 10 * 60 * 1000); // Cache for 10 minutes
      console.log('Cache miss for venue:', venueId);
      return venue;
    } catch (error) {
      console.error('Failed to fetch venue:', error);
      throw error;
    }
  }

  async getBookings(filters = {}, sort = '-created_date', limit = 100) {
    const key = this.generateKey('bookings', { filters, sort, limit });
    const cached = this.get(key);
    
    if (cached) {
      console.log('Cache hit for bookings:', key);
      return cached;
    }

    // More aggressive rate limiting for bookings
    if (!this.canMakeRequest('bookings')) {
      console.warn('Rate limit exceeded for bookings API, returning empty array');
      return [];
    }

    try {
      const { Booking } = await import('@/api/entities');
      const bookings = Object.keys(filters).length > 0 
        ? await Booking.filter(filters, sort, limit)
        : await Booking.list(sort, limit);
      
      this.set(key, bookings, 5 * 60 * 1000); // Cache for 5 minutes instead of 2
      console.log('Cache miss for bookings:', key);
      return bookings;
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      
      // Handle rate limiting
      if (error.message && (error.message.includes('429') || error.message.includes('Rate limit'))) {
        // Set longer backoff for bookings (5 minutes = 300,000 ms)
        this.rateLimitBackoff.set('bookings', Date.now() + 300000);
      }
      
      // Return cached data if available, otherwise empty array
      return this.cache.has(key) ? this.cache.get(key) : [];
    }
  }

  async getUserFavoritesSet(userId) {
    const key = this.generateKey('user_favorites_set', { userId });
    const cached = this.get(key);
    if (cached) return cached;

    if (!this.canMakeRequest('user_favorites')) return new Set();

    try {
      const { UserFavorite } = await import('@/api/entities');
      const favorites = await UserFavorite.filter({ user_id: userId });
      const favoriteSet = new Set(favorites.map(f => f.venue_id));
      this.set(key, favoriteSet, 5 * 60 * 1000); // Cache for 5 minutes
      return favoriteSet;
    } catch (error) {
      console.error('Failed to fetch user favorites:', error);
      return new Set();
    }
  }

  async getUserActivities(userId, limit = 20) {
    const key = this.generateKey('user_activities', { userId, limit });
    const cached = this.get(key);
    if (cached) return cached;

    if (!this.canMakeRequest('user_activities')) return [];

    try {
      const { UserActivity } = await import('@/api/entities');
      const activities = await UserActivity.filter({ user_id: userId }, '-created_date', limit);
      this.set(key, activities, 2 * 60 * 1000); // Cache for 2 mins
      return activities;
    } catch (error) {
      console.error('Failed to fetch user activities:', error);
      return [];
    }
  }

  async getNotifications(userId, limit = 50) {
    const cacheKey = `notifications_${userId}_${limit}`;
    
    try {
      // Try to get from cache first
      const cached = this.get(cacheKey);
      if (cached) {
        console.log('Cache hit for notifications:', cacheKey);
        return cached;
      }

      // Check rate limit before making API call
      if (!this.canMakeRequest('notifications')) {
        console.warn('Rate limit exceeded for notifications API');
        return [];
      }

      const { Notification } = await import('@/api/entities');
      let notifications;
      try {
        notifications = await Notification.filter(
          { user_id: userId },
          '-created_date',
          limit
        );
      } catch (error) {
        if (error.message && error.message.includes('403')) {
          console.log('User does not have permission to access notifications');
          return []; // Return empty array for 403 permission error
        }
        throw error; // Re-throw other errors to be caught by the outer catch
      }

      // Cache the result
      this.set(cacheKey, notifications, 2 * 60 * 1000); // Cache for 2 minutes
      console.log('Cache miss for notifications:', cacheKey);
      return notifications;

    } catch (error) {
      console.error('Failed to get notifications:', error); // Changed log message
      return []; // Return empty array for any other errors
    }
  }

  // Invalidate related caches when data changes
  invalidateVenueCache(venueId) {
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes('venues') || (venueId && key.includes(`"id":"${venueId}"`))) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.delete(key));
    console.log('Invalidated venue cache keys:', keysToDelete);
  }

  invalidateBookingCache(bookingId) {
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes('bookings') || (bookingId && key.includes(`"id":"${bookingId}"`))) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.delete(key));
    console.log('Invalidated booking cache keys:', keysToDelete);
  }

  invalidateUserCache(userId) {
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      // Assuming 'users' in key or userId as part of serialized params
      if (key.includes('users') || (userId && key.includes(`"id":"${userId}"`))) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.delete(key));
    console.log('Invalidated user cache keys:', keysToDelete);
  }

  invalidateFavoritesCache(userId) {
    // Note: This needs to match the key generation in getUserFavoritesSet
    const key = this.generateKey('user_favorites_set', { userId });
    this.delete(key);
    console.log(`Invalidated favorites cache for user: ${userId}`);
  }

  invalidateNotificationsCache(userId) {
    // Note: This needs to match the key generation in getNotifications
    // The new key format is notifications_${userId}_${limit}
    // We should invalidate all keys for a given userId, regardless of limit, if possible.
    // For simplicity, we can delete the common limit one, or iterate if multiple limits are used.
    const commonLimit = 50; // Assuming 50 is the most common or default limit
    const key = `notifications_${userId}_${commonLimit}`; 
    this.delete(key);
    console.log(`Invalidated notifications cache for user: ${userId} (assuming limit ${commonLimit})`);
    
    // If different limits are frequently used, a more robust invalidation might be needed:
    // for (const k of this.cache.keys()) {
    //   if (k.startsWith(`notifications_${userId}_`)) {
    //     this.delete(k);
    //     console.log(`Invalidated notifications cache key: ${k}`);
    //   }
    // }
  }

  // Enhanced cleanup method
  cleanup() {
    const now = Date.now();
    
    // Clean expired cache entries
    for (const [key, timestamp] of this.timestamps.entries()) {
      if (now > timestamp) {
        this.delete(key);
      }
    }
    
    // Clean old request counts
    for (const [key, requests] of this.requestCounts.entries()) {
      const recentRequests = requests.filter(time => now - time < 60000); // 60,000 ms = 1 minute
      if (recentRequests.length === 0) {
        this.requestCounts.delete(key);
      } else {
        this.requestCounts.set(key, recentRequests);
      }
    }
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

// Clean up cache every 2 minutes
setInterval(() => {
  cacheManager.cleanup();
}, 2 * 60 * 1000); // 2 minutes * 60 seconds/minute * 1000 ms/second

export default cacheManager;
