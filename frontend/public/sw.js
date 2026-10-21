self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: 'Cheta reminder', message: 'You have a new reminder.' };
  event.waitUntil(self.registration.showNotification(data.title, { body: data.message, icon: '/icon-192.png', data: { url: data.url || '/dashboard/notifications' } }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data?.url || '/dashboard/notifications'));
});
