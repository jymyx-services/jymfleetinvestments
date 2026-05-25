import { useEffect, useRef, useState }    from 'react'
import { motion }                          from 'framer-motion'
import { investmentService }               from '@/services/investment.service'
import { useFleetStore }                   from '@/store/fleet.store'
import { NotifItem }                       from '@/components/common/Notification'
import { Loader }                          from '@/components/common/Loader'
import { TourGuide }                       from '@/components/common/TourGuide'
import { useTour }                         from '@/hooks/useTour'
import { listVariants, fadeSlideUp }       from '@/animations/variants/list.variants'

export function NotificationsPage() {
  const resetUnread    = useFleetStore(s => s.resetUnread)
  const setUnreadCount = useFleetStore(s => s.setUnreadCount)

  const [notifs,  setNotifs]  = useState([])
  const [loading, setLoading] = useState(true)

  // Tour ref
  const tourListRef = useRef(null)

  const TOUR_STEPS = [
    {
      ref:   tourListRef,
      title: 'Your notifications',
      body:  'Every time a fleet you invested in earns money, a notification appears here showing exactly what the fleet made and your personal credit. Tap any notification to mark it as read and clear the badge.'
    }
  ]

  const { active, step, next, skip, total } = useTour('notifications', TOUR_STEPS)

  useEffect(() => {
    load()
    investmentService.markAllRead()
      .then(() => {
        resetUnread()
        setUnreadCount(0)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    function onNotif(e) {
      const msg      = e.detail
      const newNotif = {
        id:         Date.now().toString(),
        type:       msg.type || 'earnings_credited',
        title:      msg.title || `${msg.fleetName} earnings`,
        body:       msg.myCredit
          ? `You received UGX ${Number(msg.myCredit).toLocaleString()} for ${msg.earningDate}`
          : 'New update received',
        is_read:    true,
        created_at: new Date().toISOString(),
        data:       msg
      }
      setNotifs(prev => [newNotif, ...prev])
    }
    window.addEventListener('jfi:notification', onNotif)
    return () => window.removeEventListener('jfi:notification', onNotif)
  }, [])

  async function load() {
    try {
      const r = await investmentService.getNotifications(50)
      setNotifs(r.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkOne(id) {
    setNotifs(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    )
    await investmentService.markOneRead(id).catch(() => {})
  }

  if (loading) return <Loader />

  const unread = notifs.filter(n => !n.is_read).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Notifications</h1>
        {unread > 0 && (
          <span className="text-xs text-emerald-400 font-medium">
            {unread} unread
          </span>
        )}
      </div>

      {notifs.length === 0 ? (
        <motion.div
          variants={fadeSlideUp}
          initial="hidden"
          animate="visible"
          className="glass-card p-10 text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/5
                          flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <p className="text-sm text-slate-500">No notifications yet</p>
          <p className="text-xs text-slate-600 mt-1">
            You will be notified when your fleet earns
          </p>
        </motion.div>
      ) : (
        <motion.div
          ref={tourListRef}
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-2"
        >
          {notifs.map(notif => (
            <NotifItem
              key={notif.id}
              notif={notif}
              onRead={handleMarkOne}
            />
          ))}
        </motion.div>
      )}

      <TourGuide
        steps={TOUR_STEPS}
        step={step}
        active={active}
        onNext={next}
        onSkip={skip}
        total={total}
      />
    </div>
  )
}