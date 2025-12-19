const APP_VERSION = '2025.12.19.1';
const CACHE_VERSION = `hunydev-cache-v1-${APP_VERSION}`;
const OFFLINE_URL = '/offline.html';
const PRECACHE_URLS = [
  '/',
  OFFLINE_URL,
  '/site.webmanifest',
  '/icons/notebook_128x128.png',
  '/icons/notebook_192x192.png',
  '/icons/notebook_512x512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_VERSION)
            .map(oldKey => caches.delete(oldKey)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'GET_VERSION') {
    event.ports?.[0]?.postMessage?.({ version: APP_VERSION });
    if (!event.ports || event.ports.length === 0) {
      event.source?.postMessage?.({ type: 'VERSION_INFO', version: APP_VERSION });
    }
  }
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(event.request);
          const cache = await caches.open(CACHE_VERSION);
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        } catch (error) {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const offline = await caches.match(OFFLINE_URL);
          if (offline) return offline;
          return new Response('오프라인 상태입니다.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=UTF-8' },
          });
        }
      })(),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cacheResponse => {
      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_VERSION).then(cache => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => cacheResponse);

      return cacheResponse || fetchPromise;
    }),
  );
});
