import { useEffect, useRef } from 'react'
import { useAuthStore }       from '@/store/auth.store'
import { useFleetStore }      from '@/store/fleet.store'

const WS_URL = import.meta.env.VITE_WS_URL

export function useWebSocket() {
  const accessToken     = useAuthStore(s => s.accessToken)
  const incrementUnread = useFleetStore(s => s.incrementUnread)
  const wsRef           = useRef(null)
  const timerRef        = useRef(null)

  useEffect(() => {
    if (!accessToken || !WS_URL) return

    let cancelled = false

    function connect() {
      if (cancelled) return

      const ws = new WebSocket(`${WS_URL}/ws`)
      wsRef.current = ws

      ws.onopen = () => {
        if (cancelled) { ws.close(); return }
        ws.send(JSON.stringify({ type: 'auth', token: accessToken }))
      }

      ws.onmessage = (event) => {
        if (cancelled) return
        try {
          const msg = JSON.parse(event.data)
          if ([
            'distribution',
            'earnings_credited',
            'referral_bonus',
            'fleet_active', 
            'fleet_idle', 
            'sale_approved',
            'sale_rejected'
          ].includes(msg.type)) {
            incrementUnread()
            window.dispatchEvent(new CustomEvent('jfi:notification', { detail: msg }))
          }
        } catch { /* ignore */ }
      }

      ws.onerror = () => { /* handled by onclose */ }

      ws.onclose = () => {
        if (cancelled) return
        timerRef.current = setTimeout(connect, 4000)
      }
    }

    connect()

    return () => {
      cancelled = true
      clearTimeout(timerRef.current)
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.close()
      }
    }
  }, [accessToken])
}