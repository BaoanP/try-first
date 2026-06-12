var CACHE_NAME = 'word-app-v1';
var ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icons/icon-72x72.png',
    './icons/icon-96x96.png',
    './icons/icon-128x128.png',
    './icons/icon-144x144.png',
    './icons/icon-152x152.png',
    './icons/icon-192x192.png',
    './icons/icon-384x384.png',
    './icons/icon-512x512.png'
];

// Install: cache all core assets
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(names) {
            return Promise.all(
                names.filter(function(name) {
                    return name !== CACHE_NAME;
                }).map(function(name) {
                    return caches.delete(name);
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch: cache-first for assets, network-first for navigation
self.addEventListener('fetch', function(event) {
    var request = event.request;
    if (request.mode === 'navigate') {
        // Navigation: network first, fallback to cache
        event.respondWith(
            fetch(request).catch(function() {
                return caches.match(request);
            })
        );
    } else {
        // Assets: cache first, fallback to network
        event.respondWith(
            caches.match(request).then(function(cached) {
                return cached || fetch(request).then(function(response) {
                    return caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(request, response.clone());
                        return response;
                    });
                });
            })
        );
    }
});
