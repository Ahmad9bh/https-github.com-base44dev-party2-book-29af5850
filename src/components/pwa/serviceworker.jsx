const CACHE_NAME = 'party2go-v1';
const urlsToCache = [
  '/',
  '/Browse',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Background sync for offline bookings
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-booking') {
    event.waitUntil(syncBookings());
  }
});

async function syncBookings() {
  // Implement offline booking sync logic
  console.log('Syncing offline bookings...');
}