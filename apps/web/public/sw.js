// ============================================================
// Be Candid — Service Worker
// Handles push notifications, offline caching, and fallback.
// Registered from PushPermissionBanner on the dashboard.
// ============================================================

const CACHE_NAME = 'becandid-v1';
const OFFLINE_URL = '/offline';

// App shell resources to pre-cache on install
const APP_SHELL = [
  OFFLINE_URL,
  '/manifest.json',
  '/logo.png',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon-32x32.png',
];

// ─── Lifecycle ──────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch: network-first with offline fallback ─────────────

self.addEventListener('fetch', (event) => {
  // Only handle GET navigation requests for offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(OFFLINE_URL).then((cached) => cached || new Response('Offline', { status: 503 }))
      )
    );
    return;
  }

  // For other requests: try network, fall back to cache
  if (event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses for static assets
          if (response.ok && (event.request.url.match(/\.(css|js|woff2?|png|svg|ico)$/))) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});

// ─── Push Notifications ─────────────────────────────────────

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Be Candid', body: event.data.text() };
  }

  const { title = 'Be Candid', body = '', data = {} } = payload;

  const options = {
    body,
    icon: '/favicon-32x32.png',
    badge: '/favicon-32x32.png',
    data,
    tag: data.tag || 'be-candid-notification',
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing tab if one is open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Otherwise open a new window
      return clients.openWindow(url);
    })
  );
});
