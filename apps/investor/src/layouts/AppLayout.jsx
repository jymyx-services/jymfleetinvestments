import { useEffect }        from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence }          from 'framer-motion'
import { pageVariants }     from '@/animations/variants/page.variants'
import { useFleetStore }    from '@/store/fleet.store'
import { investmentService } from '@/services/investment.service'
import { useWebSocket }     from '@/hooks/useWebSocket'


const NAV = [
  { path: '/dashboard',     label: 'Home',    icon: HomeIcon },
  { path: '/investments',   label: 'Invest',  icon: ChartIcon },
  { path: '/notifications', label: 'Alerts',  icon: BellIcon, badge: true },
  { path: '/profile',       label: 'Profile', icon: UserIcon }
]

export function AppLayout() {
  const location       = useLocation()
  const navigate       = useNavigate()
  const unreadCount    = useFleetStore(s => s.unreadCount)
  const setUnreadCount = useFleetStore(s => s.setUnreadCount)

  useWebSocket()

  useEffect(() => {
    investmentService.getUnreadCount()
      .then(r => setUnreadCount(r.data.data.count))
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col max-w-md mx-auto relative">
      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px]
                      bg-emerald-500/6 blur-[90px] rounded-full pointer-events-none z-0" />

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-24 px-5 pt-6 z-10 relative">
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
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md
                      glass border-t border-white/5 z-50">
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
                            ${active ? 'text-emerald-400' : 'text-slate-600 hover:text-slate-400'}`}
              >
                <div className="relative">
                  <Icon size={20} />
                  {item.badge && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4
                                     bg-emerald-500 text-white text-[9px] font-bold
                                     rounded-full flex items-center justify-center px-0.5">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
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

// Inline SVG icons — no icon library dependency
function HomeIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}
function ChartIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
    </svg>
  )
}
function BellIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}
function UserIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}