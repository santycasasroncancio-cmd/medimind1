const CACHE = 'medimind-v3';
const ASSETS = ['/', '/index.html', '/manifest.json', '/icons/icon-192x192.png', '/icons/icon-512x512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
  self.clients.matchAll().then(clients => {
    clients.forEach(client => client.postMessage({type:'RELOAD'}));
  });
});

self.addEventListener('fetch', e => {
  if(e.request.url.includes('/.netlify/functions/') ||
     e.request.url.includes('firebase') ||
     e.request.url.includes('googleapis')) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
