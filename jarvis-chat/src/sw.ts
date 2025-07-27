/// <reference lib="webworker" />

const CACHE_NAME = 'jarvis-chat-v1';
const RUNTIME_CACHE = 'jarvis-runtime-v1';

// App shell files to cache on install
const STATIC_CACHE_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

const sw = self as unknown as ServiceWorkerGlobalScope;

// Install event - cache app shell
sw.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[SW] Install event');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell');
        return cache.addAll(STATIC_CACHE_FILES);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker
        return sw.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
sw.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[SW] Activate event');

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              // Delete old caches
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        // Take control of all clients
        return sw.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
sw.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache for API requests
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches
      .match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(request).then(response => {
          // Don't cache non-successful responses
          if (
            !response ||
            response.status !== 200 ||
            response.type !== 'basic'
          ) {
            return response;
          }

          // Cache the response
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(request, responseToCache);
          });

          return response;
        });
      })
      .catch(() => {
        // Fallback for HTML requests - serve app shell
        if (request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/index.html');
        }
      })
  );
});

// Handle service worker updates
sw.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    sw.skipWaiting();
  }
});

export {};
