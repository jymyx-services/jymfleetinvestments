const CACHE_NAME = 'jfi-v1'

const STATIC_ASSETS = [
  '/',
  '/index.html'
]

// Install — cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET and API requests
  if (event.request.method !== 'GET') return
  if (event.request.url.includes('/api/')) return
  if (event.request.url.includes('/ws')) return

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        return response
      })
      .catch(() => caches.match(event.request))
  )
})

// Push — show notification when app is closed
self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'JFI', body: event.data.text() }
  }

  const options = {
    body:    payload.body  || 'You have a new update',
    icon:    payload.icon  || '/icons/icon-192.png',
    badge:   payload.badge || '/icons/badge-72.png',
    data:    payload.data  || {},
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open',    title: 'Open JFI' },
      { action: 'dismiss', title: 'Dismiss'  }
    ],
    tag:            'jfi-notification',
    renotify:       true,
    requireInteraction: false
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'JFI', options)
  )
})

// Notification click — open or focus the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') return

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // If app is open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus()
          }
        }
        // Otherwise open a new window
        return clients.openWindow('/')
      })
  )
})

// Background sync — retry failed API calls when back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'jfi-sync') {
    event.waitUntil(Promise.resolve())
  }
})