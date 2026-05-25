export function Badge({ status }) {
  const map = {
    active:       'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    idle:         'bg-amber-500/15   text-amber-400   border-amber-500/20',
    pending:      'bg-blue-500/15    text-blue-400    border-blue-500/20',
    pending_sale: 'bg-orange-500/15  text-orange-400  border-orange-500/20',
    sold:         'bg-slate-500/15   text-slate-400   border-slate-500/20',
    suspended:    'bg-red-500/15     text-red-400     border-red-500/20',
    retired:      'bg-slate-500/15   text-slate-400   border-slate-500/20'
  }

  const labels = {
    active:       'Active',
    idle:         'Idle',
    pending:      'Pending',
    pending_sale: 'Sale Pending',
    sold:         'Sold',
    suspended:    'Suspended',
    retired:      'Retired'
  }

  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${map[status] || map.idle}`}>
      {labels[status] || status}
    </span>
  )
}