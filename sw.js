// Static shell and the single pinned rendering dependency are cached atomically.
const CACHE = 'gk-shell-v1.4.0-5cb4fe8f';
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const PRECACHE = [
  "./index.html",
  "./manifest.webmanifest",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./src/client/app.js",
  "./src/client/architecture.js",
  "./src/client/audio.js",
  "./src/client/boot.js",
  "./src/client/feedback.js",
  "./src/client/figures.js",
  "./src/client/fog-texture.js",
  "./src/client/geometry.js",
  "./src/client/input.js",
  "./src/client/model.js",
  "./src/client/render.js",
  "./src/client/score.js",
  "./src/client/soundscape.js",
  "./src/client/storage.js",
  "./src/client/style.css",
  "./src/client/ui.js",
  "./src/client/visuals.js",
  "./src/sim/data.js",
  "./src/sim/fog.js",
  "./src/sim/index.js",
  "./src/sim/rng.js",
  THREE_URL
];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(PRECACHE.map(url => new Request(url, {mode:'cors',cache:'reload'})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('gk-') && name !== CACHE).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin && url.href !== THREE_URL) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(event.request);
    if (cached) return cached;
    if (event.request.mode === 'navigate') return await cache.match('./index.html') || fetch(event.request);
    return fetch(event.request);
  })());
});
