const CACHE_NAME = 'perfume-zone-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            self.clients.claim()
        ])
    );
});

// Keep network requests working normally.
// Do not cache API or checkout requests.
self.addEventListener('fetch', (event) => {
    // Network-first browser behavior.
});
