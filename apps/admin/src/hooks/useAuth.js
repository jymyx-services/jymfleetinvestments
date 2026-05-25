import { useEffect }                        from 'react'
import { useAuthStore }                     from '../store/auth.store'
import { setAccessToken }                   from '../services/api'
import { adminService }                     from '../services/admin.service'

const ADMIN_ROLES = ['admin', 'superadmin']

export function useAuth() {
  const { user, isLoading, setAuth, clearAuth } = useAuthStore()

  useEffect(() => {
    let cancelled = false

    async function restore() {
      try {
        const r1    = await adminService.refresh()
        const token = r1.data.data.accessToken
        setAccessToken(token)         
        const r2 = await adminService.me()
        const u  = r2.data.data.user

        if (!ADMIN_ROLES.includes(u.role)) {
          if (!cancelled) clearAuth()
          return
        }

        if (!cancelled) setAuth(u, token)
      } catch {
        if (!cancelled) clearAuth()
      }
    }

    restore()
    return () => { cancelled = true }
  }, [])

  return { user, isLoading, setAuth, clearAuth }
}