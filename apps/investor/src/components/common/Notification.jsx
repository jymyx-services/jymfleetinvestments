import { motion }        from 'framer-motion'
import { itemVariants }  from '@/animations/variants/card.variants'

const typeConfig = {
  earnings_credited: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: EarningsIcon },
  referral_bonus:    { color: 'text-blue-400',    bg: 'bg-blue-500/10',    icon: ReferralIcon },
  fleet_active:      { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: FleetIcon    },
  fleet_idle:        { color: 'text-amber-400',   bg: 'bg-amber-500/10',   icon: FleetIcon    },
  sale_approved:     { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: SaleIcon     },
  sale_rejected:     { color: 'text-red-400',     bg: 'bg-red-500/10',     icon: SaleIcon     },
  system:            { color: 'text-slate-400',   bg: 'bg-slate-500/10',   icon: SystemIcon   }
}

export function NotifItem({ notif, onRead }) {
  const config = typeConfig[notif.type] || typeConfig.system
  const Icon   = config.icon

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1)   return 'just now'
    if (mins < 60)  return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs  < 24)  return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <motion.div
      variants={itemVariants}
      onClick={() => !notif.is_read && onRead?.(notif.id)}
      className={`flex gap-3 p-4 rounded-2xl border transition-colors duration-200 cursor-pointer
                  ${notif.is_read
                    ? 'border-white/5 bg-white/2'
                    : 'border-emerald-500/15 bg-emerald-500/5'}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                       flex-shrink-0 ${config.bg}`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className={`text-sm font-medium leading-snug
                            ${notif.is_read ? 'text-slate-300' : 'text-white'}`}>
            {notif.title}
          </span>
          <span className="text-[10px] text-slate-600 flex-shrink-0 mt-0.5">
            {timeAgo(notif.created_at)}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.body}</p>
      </div>

      {!notif.is_read && (
        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
      )}
    </motion.div>
  )
}

function EarningsIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  )
}
function ReferralIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}
function FleetIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  )
}
function SaleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  )
}
function SystemIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}