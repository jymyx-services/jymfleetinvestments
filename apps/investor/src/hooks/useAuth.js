import { useEffect }      from 'react'
import { useAuthStore }   from '@/store/auth.store'
import { authService }    from '@/services/auth.service'
import { setAccessToken } from '@/services/api'

export function useAuth() {
  const { user, isLoading, setAuth, clearAuth } = useAuthStore()

  useEffect(() => {
    let cancelled = false

    async function restore() {
      try {
        const refreshRes  = await authService.refresh()
        const accessToken = refreshRes.data.data.accessToken
        setAccessToken(accessToken)
        const meRes = await authService.me()
        const u     = meRes.data.data.user

        // Investor app must never accept admin accounts
        if (u.role === 'admin' || u.role === 'superadmin') {
          if (!cancelled) clearAuth()
          return
        }

        if (!cancelled) setAuth(u, accessToken)
      } catch {
        if (!cancelled) clearAuth()
      }
    }

    restore()
    return () => { cancelled = true }
  }, [])

  return { user, isLoading, setAuth, clearAuth }
}