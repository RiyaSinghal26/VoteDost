const CACHE_NAME = 'voter-dost-v1';
const ASSETS = [
    'index.html',
    'styles.css',
    'script.js',
    'manifest.json',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;900&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.0/vanilla-tilt.min.js'
];

// Install Event
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching static assets');
            return cache.addAll(ASSETS);
        })
    );
});

// Fetch Event (Stale-while-revalidate)
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Return cached version but fetch update in background
                fetch(e.request).then((networkResponse) => {
                    caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse));
                });
                return cachedResponse;
            }
            return fetch(e.request);
        })
    );
});
