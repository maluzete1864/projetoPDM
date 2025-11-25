const CACHE_VERSION = "v3";
const CACHE_NAME = `catalogo-cache-${CACHE_VERSION}`;

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/css/style.css",
  "/src/main.js",
  "/src/idb.js",
  "/manifest.json"
];

// INSTALAÇÃO
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// ATIVAÇÃO
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH – tenta online primeiro, depois cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
