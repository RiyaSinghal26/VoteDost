const CACHE_NAME = 'voter-dost-v1.2'; // Bumped for fresh install
const ASSETS = [
    'index.html',
    'styles.css',
    'script.js',
    'worker.js',
    'manifest.json'
];

// Install Event
self.addEventListener('install', (e) => {
    self.skipWaiting(); // Force the waiting service worker to become the active service worker.
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Activate Event - Clear old caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

// Fetch Event (Network-first for development, fallback to cache)
self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request).catch(() => caches.match(e.request))
    );
});
