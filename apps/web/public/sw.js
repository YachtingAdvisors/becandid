// ============================================================
// Be Candid — Service Worker (Push Notifications)
// Handles incoming push events and notification clicks.
// Registered from PushPermissionBanner on the dashboard.
// ============================================================

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
