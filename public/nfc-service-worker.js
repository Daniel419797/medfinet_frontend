const BUILD_ID = '__MEDFINET_BUILD_ID__';
const CACHE_PREFIX = 'medfinet-pwa-';
const SHELL_CACHE = `${CACHE_PREFIX}shell-${BUILD_ID}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}runtime-${BUILD_ID}`;
const BUILD_ASSETS = /*__MEDFINET_PRECACHE__*/[];
const APP_SHELL = [
  '/',
  '/nfc/scanner',
  '/nfc/offline',
  '/manifest.webmanifest',
  '/medfinet-nfc-icon.svg',
  '/medfinet-nfc-icon-192.png',
  '/medfinet-nfc-icon-512.png',
  '/medfinet-apple-touch-icon.png',
  ...BUILD_ASSETS,
];

function cacheable(response) {
  return response && response.ok && (response.type === 'basic' || response.type === 'default');
}

async function networkFirstNfcNavigation(request) {
  try {
    const response = await fetch(request);
    if (cacheable(response)) {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return (
      (await caches.match(request)) ||
      (await caches.match('/nfc/scanner')) ||
      Response.error()
    );
  }
}

async function cacheFirstAsset(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (cacheable(response)) {
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

async function notifyClients() {
  const windows = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });
  for (const client of windows) {
    client.postMessage({ type: 'MEDFINET_SYNC_REQUESTED' });
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll([...new Set(APP_SHELL)]))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== SHELL_CACHE && key !== RUNTIME_CACHE)
        .map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  if (
    event.request.method !== 'GET' ||
    requestUrl.origin !== self.location.origin ||
    requestUrl.pathname.startsWith('/api/')
  ) return;

  if (event.request.mode === 'navigate' && requestUrl.pathname.startsWith('/nfc/')) {
    event.respondWith(networkFirstNfcNavigation(event.request));
    return;
  }

  const staticAssetPath =
    requestUrl.pathname.startsWith('/assets/') ||
    requestUrl.pathname.startsWith('/images/') ||
    requestUrl.pathname.startsWith('/medfinet-');
  const cacheableAsset = ['style', 'script', 'image', 'font'].includes(event.request.destination);
  if (staticAssetPath && cacheableAsset) {
    event.respondWith(cacheFirstAsset(event.request));
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'medfinet-offline-sync') {
    event.waitUntil(notifyClients());
  }
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'MEDFINET_QUEUE_CHANGED') {
    const syncRequest = self.registration.sync
      ? self.registration.sync.register('medfinet-offline-sync').catch(() => notifyClients())
      : notifyClients();
    event.waitUntil(syncRequest);
  }
});
