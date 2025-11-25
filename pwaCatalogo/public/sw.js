importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

if (workbox) {
  workbox.precaching.precacheAndRoute([
    { url: '/', revision: '1' },
    { url: '/index.html', revision: '1' },
    { url: '/offline.html', revision: '1' },
    { url: '/css/style.css', revision: '1' }
  ]);

  // Páginas - fallback
  workbox.routing.registerRoute(
    ({request}) => request.mode === 'navigate',
    async ({event}) => {
      try {
        return await workbox.strategies.NetworkFirst({
          cacheName: 'pages-cache'
        }).handle({event});
      } catch (err) {
        return caches.match('/offline.html');
      }
    }
  );

  // Cache de imagens
  workbox.routing.registerRoute(
    ({request}) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'images-cache'
    })
  );

  // Cache de JS e CSS
  workbox.routing.registerRoute(
    ({request}) =>
      request.destination === 'script' ||
      request.destination === 'style',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'static-cache'
    })
  );

} else {
  console.log("Workbox falhou");
}
