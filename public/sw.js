// EmbedKit service worker: cache-first navigation, network fallback.
// Static shell only; generator pages are same-origin static HTML.
const CACHE = 'embedkit-v1';
const PRECACHE = [
  '/embedkit/',
  '/embedkit/en/',
  '/embedkit/ru/',
  '/embedkit/manifest.webmanifest',
  '/embedkit/favicon.svg',
  '/embedkit/icons/icon-192.png',
  '/embedkit/icons/icon-512.png',
  '/embedkit/icons/apple-touch-icon.png',
  '/embedkit/offline.html',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req)
          .then((res) => {
            if (res.ok && url.pathname.startsWith('/embedkit/')) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => (req.mode === 'navigate' ? caches.match('/embedkit/offline.html') : undefined)),
    ),
  );
});
