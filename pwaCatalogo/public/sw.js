// Sempre mude este número ao atualizar arquivos
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
  console.log("[SW] Instalando…");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Arquivos adicionados ao cache");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting(); // força novo SW imediatamente
});

// ATIVAÇÃO
self.addEventListener("activate", (event) => {
  console.log("[SW] Ativando…");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Cache antigo removido:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim(); // força as páginas a usarem o novo SW
});

// FETCH – sempre tenta pegar online primeiro
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((liveResponse) => {
        return liveResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
