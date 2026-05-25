const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

export function useAdminPush() {
  async function subscribe(api) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    if (!VAPID_PUBLIC_KEY) return

    try {
      const reg      = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()

      const sub = existing || await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })

      await api.post('/notifications/admin/push/subscribe', {
        subscription: sub.toJSON()
      })

      console.log('[AdminPush] Subscribed')
    } catch (err) {
      console.warn('[AdminPush] Subscription failed:', err)
    }
  }

  return { subscribe }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = window.atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}



