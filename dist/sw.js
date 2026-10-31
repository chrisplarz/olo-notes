const CACHE = 'loyly-journal-shell-v59';
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './assets/olo-notes-logo.svg', './assets/paper.svg', './assets/botanical.svg', './assets/mood-1.svg', './assets/mood-2.svg', './assets/mood-3.svg', './assets/mood-4.svg', './assets/mood-5.svg', './assets/rituals/mindful-reset.jpg', './assets/rituals/first-dip.jpg', './assets/rituals/nordic-contrast.jpg', './assets/rituals/pure-sauna.jpg'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
