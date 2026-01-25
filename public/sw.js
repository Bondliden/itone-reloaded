const CACHE_NAME = 'itone-studio-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline recordings
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  try {
    // Get offline data from IndexedDB
    const offlineRecordings = await getOfflineRecordings();
    
    // Upload each recording
    for (const recording of offlineRecordings) {
      await uploadRecording(recording);
    }
    
    // Clear offline data after successful sync
    await clearOfflineRecordings();
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getOfflineRecordings() {
  // Implementation would use IndexedDB
  return [];
}

async function uploadRecording(recording) {
  // Implementation would upload to server
  return Promise.resolve();
}

async function clearOfflineRecordings() {
  // Implementation would clear IndexedDB
  return Promise.resolve();
}