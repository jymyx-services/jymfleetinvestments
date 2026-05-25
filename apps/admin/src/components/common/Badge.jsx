export function Badge({ status }) {
  const map = {
    active:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    idle:     'bg-amber-500/15   text-amber-400   border-amber-500/20',
    retired:  'bg-slate-500/15   text-slate-400   border-slate-500/20',
    pending:  'bg-blue-500/15    text-blue-400    border-blue-500/20',
    approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/15     text-red-400     border-red-500/20',
    available:'bg-blue-500/15    text-blue-400    border-blue-500/20',
    consumed: 'bg-slate-500/15   text-slate-400   border-slate-500/20',
    expired:  'bg-red-500/15     text-red-400     border-red-500/20',
    revoked:  'bg-red-500/15     text-red-400     border-red-500/20'
  }
  const labels = {
    active: 'Active', idle: 'Idle', retired: 'Retired',
    pending: 'Pending', approved: 'Approved', rejected: 'Rejected',
    available: 'Available', consumed: 'Used', expired: 'Expired', revoked: 'Revoked'
  }
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${map[status] || map.idle}`}>
      {labels[status] || status}
    </span>
  )
}