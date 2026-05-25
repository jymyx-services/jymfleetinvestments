import { Badge } from '../common/Badge'

export function InvestorDetail({ user }) {
  if (!user) return null

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center
                        justify-center font-bold text-emerald-400">
          {user.full_name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{user.full_name}</p>
          <p className="text-xs text-slate-500 font-mono">{user.investor_code}</p>
        </div>
        <Badge status={user.status} />
      </div>

      {[
        { label: 'Email',   value: user.email   },
        { label: 'Phone',   value: user.phone   },
        { label: 'Role',    value: user.role    },
        { label: 'Joined',  value: new Date(user.created_at).toLocaleDateString() }
      ].map((row, i, arr) => (
        <div key={row.label}
          className={`flex justify-between items-center px-5 py-3
                      ${i < arr.length - 1 ? 'border-b border-white/5' : ''}`}>
          <span className="text-xs text-slate-500 uppercase tracking-wider">{row.label}</span>
          <span className="text-sm text-white">{row.value || '—'}</span>
        </div>
      ))}
    </div>
  )
}