// Service Worker per Fracassa Autolinee PWA
const CACHE_NAME = 'fracassa-autolinee-v2';
const STATIC_CACHE = 'fracassa-static-v2';
const DYNAMIC_CACHE = 'fracassa-dynamic-v2';

// File da cachare immediatamente all'installazione
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Installazione: cachare file statici
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static files');
      return cache.addAll(STATIC_FILES);
    })
  );
  self.skipWaiting();
});

// Attivazione: pulire vecchie cache
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name !== STATIC_CACHE && name !== DYNAMIC_CACHE;
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  return self.clients.claim();
});

// Fetch: strategia Network-First con fallback a cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip API calls to external services (Turso, etc.)
  if (request.url.includes('turso.io') || request.url.includes('libsql')) {
    return;
  }

  event.respondWith(
    // Prova prima dalla rete
    fetch(request)
      .then((response) => {
        // Se la risposta è valida, salva in cache dinamica
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Se la rete fallisce, usa la cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Se non c'è in cache e è una pagina HTML, mostra pagina offline
          if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/');
          }
        });
      })
  );
});

// Gestione messaggi (per aggiornamenti futuri)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

