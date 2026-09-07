// Service Worker for ADMINISTRASI GURU KREATIF (PWA Offline & Cloud Sync)
const CACHE_NAME = 'agk-offline-cache-v2';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
  'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Precache partial error:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests (e.g. POST to APIs)
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle HTML navigation requests: Network First, Fallback to Cached index.html
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // Handle Static Assets (JS, CSS, SVGs, Fonts, Images, KaTeX): Stale While Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch((err) => {
          // If offline and no cache match, return fallback
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
