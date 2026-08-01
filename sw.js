// sw.js — Recipes app-shell + runtime cache
//
// Kept deliberately simple: this app has no write API and no fast-changing
// data file to special-case (unlike hiking-journal's hikes.json), so every
// same-origin GET just gets cache-first with a background revalidate.
// New recipe pages get cached automatically the first time they're opened —
// no need to hardcode a page list here as recipes get added.
//
// Bump CACHE_VERSION to force a clean reset; routine edits self-heal within
// one reload via the background revalidate.
const CACHE_VERSION = 'v1';
const CACHE_NAME    = `recipes-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  './',
  './index.html',
  './style.css',
  './recipe-engine.js',
  './recipes.js',
  './apple-touch-icon.png',
  './favicon.ico',
  './favicon-32x32.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // Navigations get a redirect-safe handler. Recipes isn't behind Cloudflare
  // Access today so this shouldn't fire in practice, but it's cheap
  // insurance against the same Safari "has redirections" issue hit on
  // hiking-journal — any redirect (Pages trailing-slash normalization,
  // future gating, etc.) would otherwise risk the same bug.
  if (req.mode === 'navigate') { event.respondWith(navigateHandler(req)); return; }

  event.respondWith(cacheFirst(req));
});

async function navigateHandler(req) {
  try {
    const fresh = await fetch(req);
    if (!fresh.redirected) {
      if (fresh.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone());
      }
      return fresh;
    }
    const body = await fresh.arrayBuffer();
    return new Response(body, { status: fresh.status, statusText: fresh.statusText, headers: fresh.headers });
  } catch (err) {
    const cached = await caches.match(req);
    if (cached) return cached;
    throw err;
  }
}

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) {
    fetch(req).then(fresh => {
      if (fresh.ok) caches.open(CACHE_NAME).then(cache => cache.put(req, fresh));
    }).catch(() => {});
    return cached;
  }
  const fresh = await fetch(req);
  if (fresh.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(req, fresh.clone());
  }
  return fresh;
}
