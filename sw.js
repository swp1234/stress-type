const CACHE_NAME = 'stress-type-v1';
const ASSETS = [
  '/stress-type/',
  '/stress-type/index.html',
  '/stress-type/js/i18n.js',
  '/stress-type/js/locales/ko.json',
  '/stress-type/js/locales/en.json',
  '/stress-type/js/locales/ja.json',
  '/stress-type/js/locales/zh.json',
  '/stress-type/js/locales/hi.json',
  '/stress-type/js/locales/ru.json',
  '/stress-type/js/locales/es.json',
  '/stress-type/js/locales/pt.json',
  '/stress-type/js/locales/id.json',
  '/stress-type/js/locales/tr.json',
  '/stress-type/js/locales/de.json',
  '/stress-type/js/locales/fr.json',
  '/stress-type/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
