// Bayrak Atlası – çevrimdışı önbellek. Oyunda değişiklik yapınca VERSION'u artır.
const VERSION = 'v1';
const CACHE = 'bayrak-atlasi-' + VERSION;
const CORE = ['./', 'index.html', 'manifest.json', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
const MAP = 'https://cdn.jsdelivr.net/npm/echarts@4.9.0/map/js/world.js';

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(CORE);
    try { const r = await fetch(MAP, {mode: 'cors'}); if (r.ok) await c.put(MAP, r); } catch (_) {}
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

// Önce önbellekten aç (metroda anında açılır), internet varsa arka planda yeni sürümü indir.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(req, {ignoreSearch: true});
    const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const r = await net;
    return r || (req.mode === 'navigate' ? (await c.match('index.html')) : Response.error());
  })());
});
