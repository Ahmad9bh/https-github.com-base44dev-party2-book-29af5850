class RateLimitCache {
  constructor() {
    this.cache = new Map();
    this.requestTimes = new Map();
    this.maxRequestsPerMinute = 50;
    this.cacheExpiryTime = 5 * 60 * 1000; // 5 minutes
  }

  // Check if we can make a request (rate limiting)
  canMakeRequest(key) {
    const now = Date.now();
    const requests = this.requestTimes.get(key) || [];
    
    // Remove requests older than 1 minute
    const recentRequests = requests.filter(time => now - time < 60000);
    
    if (recentRequests.length >= this.maxRequestsPerMinute) {
      return false;
    }
    
    // Add current request time
    recentRequests.push(now);
    this.requestTimes.set(key, recentRequests);
    
    return true;
  }

  // Get from cache
  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > this.cacheExpiryTime) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  // Set cache
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Clear expired cache entries
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheExpiryTime) {
        this.cache.delete(key);
      }
    }
    
    // Clean up old request times
    for (const [key, requests] of this.requestTimes.entries()) {
      const recentRequests = requests.filter(time => now - time < 60000);
      if (recentRequests.length === 0) {
        this.requestTimes.delete(key);
      } else {
        this.requestTimes.set(key, recentRequests);
      }
    }
  }
}

// Create singleton instance
const rateLimitCache = new RateLimitCache();

// Clean up cache every 5 minutes
setInterval(() => {
  rateLimitCache.cleanup();
}, 5 * 60 * 1000);

export default rateLimitCache;