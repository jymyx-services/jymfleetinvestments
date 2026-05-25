import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence }           from 'framer-motion'
import { useAuthStore }                      from '../store/auth.store'
import { adminService }                      from '../services/admin.service'
import { pageVariants }                      from '../animations/variants/page.variants'
import { useWebSocket }                      from '../hooks/useWebSocket'

const NAV = [
  { path: '/admin/dashboard',    label: 'Home',     icon: HomeIcon    },
  { path: '/admin/fleets',       label: 'Fleets',   icon: FleetIcon   },
  { path: '/admin/earnings',     label: 'Earnings', icon: ChartIcon   },
  { path: '/admin/investors',    label: 'Investors', icon: UsersIcon  },
  { path: '/admin/invite-codes', label: 'Codes',    icon: CodeIcon    }
]

export function AdminLayout() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const user      = useAuthStore(s => s.user)
  const clearAuth = useAuthStore(s => s.clearAuth)

  useWebSocket()

  async function handleLogout() {
    try { await adminService.logout() } catch { /* ignore */ }
    clearAuth()
    navigate('/admin/login', { replace: true })
  }

  const initials = user?.full_name
    ?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'A'

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col max-w-md mx-auto">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px]
                      bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none z-0"/>

      {/* Top bar */}
      <header className="glass border-b border-white/5 px-5 py-4
                         flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-base font-black tracking-tight text-white">JFI</span>
          <span className="text-xs text-slate-500 border border-white/10
                           px-2 py-0.5 rounded-full">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:block">
            {user?.full_name}
          </span>
          <button
            onClick={handleLogout}
            className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center
                       justify-center text-emerald-400 text-xs font-bold
                       hover:bg-emerald-500/25 transition-colors"
          >
            {initials}
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-24 px-5 pt-5 z-10 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2
                      w-full max-w-md glass border-t border-white/5 z-50">
        <div className="flex items-center">
          {NAV.map(item => {
            const active = location.pathname === item.path
            const Icon   = item.icon
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex-1 flex flex-col items-center gap-1 py-3.5
                            transition-colors duration-200 relative
                            ${active
                              ? 'text-emerald-400'
                              : 'text-slate-600 hover:text-slate-400'}`}
              >
                <Icon size={18}/>
                <span className="text-[9px] font-medium">{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="admin-nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2
                               w-6 h-0.5 bg-emerald-500 rounded-full"
                  />
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

function HomeIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}
function FleetIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13"/>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  )
}
function ChartIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
    </svg>
  )
}
function UsersIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}
function CodeIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/>
      <polyline points="8 6 2 12 8 18"/>
    </svg>
  )
}