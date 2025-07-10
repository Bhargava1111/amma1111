// Service Worker for Push Notifications
const CACHE_NAME = 'manafoods-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/favicon.ico'
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Activate service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle fetch requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  try {
    const data = event.data.json();
    console.log('Push notification data:', data);

    const notificationTitle = data.title || 'MANAfoods Notification';
    const notificationOptions = {
      body: data.body || data.message || 'New notification',
      icon: data.icon || '/favicon.ico',
      badge: data.badge || '/favicon.ico',
      tag: data.tag || 'default',
      data: data.data || {},
      actions: getNotificationActions(data.type || 'default'),
      requireInteraction: data.priority === 'urgent' || data.priority === 'high',
      silent: data.silent || false,
      timestamp: Date.now()
    };

    event.waitUntil(
      self.registration.showNotification(notificationTitle, notificationOptions)
    );

  } catch (error) {
    console.error('Error handling push notification:', error);
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('MANAfoods Notification', {
        body: 'You have a new notification',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'fallback',
        data: { fallback: true }
      })
    );
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const data = event.notification.data || {};
  const url = data.actionUrl || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if app is not open
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  // Track notification dismissal
  const data = event.notification.data || {};
  if (data.trackDismissal) {
    fetch('/api/notifications/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'dismissed',
        notificationId: data.id,
        timestamp: Date.now()
      })
    }).catch(error => {
      console.error('Error tracking notification dismissal:', error);
    });
  }
});

// Get notification actions based on type
function getNotificationActions(type) {
  switch (type) {
    case 'order':
      return [
        { action: 'view', title: '👀 View Order', icon: '/icons/view.png' },
        { action: 'dismiss', title: '✕ Dismiss', icon: '/icons/dismiss.png' }
      ];
    case 'promotion':
      return [
        { action: 'view', title: '🎉 View Offer', icon: '/icons/view.png' },
        { action: 'dismiss', title: '❌ Not Interested', icon: '/icons/dismiss.png' }
      ];
    case 'system':
      return [
        { action: 'view', title: '📋 View Details', icon: '/icons/view.png' },
        { action: 'dismiss', title: '✓ OK', icon: '/icons/dismiss.png' }
      ];
    case 'campaign':
      return [
        { action: 'view', title: '📢 View Campaign', icon: '/icons/view.png' },
        { action: 'dismiss', title: '✕ Dismiss', icon: '/icons/dismiss.png' }
      ];
    default:
      return [
        { action: 'dismiss', title: '✕ Dismiss', icon: '/icons/dismiss.png' }
      ];
  }
}

// Handle background sync (for offline notifications)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync notifications when back online
      syncNotifications()
    );
  }
});

// Sync notifications when back online
async function syncNotifications() {
  try {
    const response = await fetch('/api/notifications/sync');
    if (response.ok) {
      const data = await response.json();
      console.log('Notifications synced:', data);
    }
  } catch (error) {
    console.error('Error syncing notifications:', error);
  }
}

// Handle message from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker loaded successfully'); 