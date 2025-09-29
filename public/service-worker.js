const CACHE_VERSION = 'hunydev-cache-v1';
const PRECACHE_URLS = [
  '/',
  '/index.css',
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
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then(match => match || caches.match('/'))),
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
