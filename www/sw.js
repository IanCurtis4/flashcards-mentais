const CACHE_NAME = 'mindmap-flashcards-cache-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  './styles.css',
  './custom.css',
  './main.js',
  './assets/inter.css',
  './assets/icons/192.png',
  './assets/icons/512.png',
  './assets/fonts/inter-400.woff2',
  './assets/fonts/inter-500.woff2',
  './assets/fonts/inter-700.woff2'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(
      names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.url.startsWith('http') && !event.request.url.includes(self.location.origin)) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(res => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, res.clone());
          return res;
        });
      }).catch(() => {
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
