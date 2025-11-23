// Nombre de la cache
const CACHE_NAME = 'zamaha-v1.0';

// Archivos para cachear
const urlsToCache = [
  '/',
  '/index.html',
  '/zamaha-logo.png',
  '/icono-whatsapp.png',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

// Instalación - cachear archivos
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch - servir desde cache cuando sea posible
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Devuelve la respuesta cacheada o busca en la red
        return response || fetch(event.request);
      }
    )
  );
});