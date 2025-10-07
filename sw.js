const CACHE_NAME = 'ai-expense-tracker-v1';

// On install, cache the main app shell so the app can load offline.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll([
          '/',
          '/index.html'
      ]);
    })
  );
});

// On fetch, serve from cache if available, otherwise fetch from network and cache the result.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // Check if we received a valid response.
        // We don't cache non-200 responses or opaque responses from third-party CDNs without CORS.
        if (!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'cors')) {
          return response;
        }

        // Clone the response. A response is a stream and can only be consumed once.
        // We need one for the browser and one for the cache.
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          // Do not cache API calls to the Gemini API.
          if (!event.request.url.includes('generativelanguage')) {
              cache.put(event.request, responseToCache);
          }
        });

        return response;
      });
    })
  );
});

// On activate, clean up old, unused caches.
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
