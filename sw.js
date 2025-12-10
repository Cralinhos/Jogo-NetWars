const CACHE_NAME = 'netwars-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/mobile-navbar.js',
  '/Images/Logo.png',
  '/Images/Bg-centro.png',
  '/Images/imagem1.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia de cache: Cache First, Fall back to Network
self.addEventListener('fetch', (event) => {
  // Ignorar requisições que não são GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retorna do cache se encontrado
      if (response) {
        return response;
      }

      // Caso contrário, faz requisição à rede
      return fetch(event.request).then((response) => {
        // Verifica se é uma resposta válida
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clona a resposta para armazenar no cache
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Se falhar, tenta retornar do cache
        return caches.match(event.request);
      });
    })
  );
});
