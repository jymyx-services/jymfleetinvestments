import { motion } from 'framer-motion'
import { staggerContainer, fadeSlideUp } from '@/animations/variants/list.variants'

export function EarningsTable({ history = [] }) {
  if (history.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-sm text-slate-500">No earnings recorded yet</p>
      </div>
    )
  }

  const fmt = (v) => Number(v || 0).toLocaleString()

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-UG', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-3 px-4 py-2.5 border-b border-white/5">
        {['Date', 'Fleet gross', 'My credit'].map(h => (
          <span key={h} className="text-[10px] uppercase tracking-wider text-slate-500
                                   font-medium text-right first:text-left">
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <motion.div
        variants={staggerContainer(0.04)}
        initial="hidden"
        animate="visible"
      >
        {history.map((row, idx) => (
          <motion.div
            key={idx}
            variants={fadeSlideUp}
            className="grid grid-cols-3 px-4 py-3 border-b border-white/4
                       last:border-0 hover:bg-white/2 transition-colors"
          >
            <span className="text-xs text-slate-400">{formatDate(row.earning_date)}</span>
            <span className="text-xs text-slate-300 text-right font-mono">
              {fmt(row.fleet_gross)}
            </span>
            <span className={`text-xs text-right font-mono font-medium
                              ${Number(row.gross_credit) > 0
                                ? 'text-emerald-400'
                                : 'text-slate-500'}`}>
              {Number(row.gross_credit) > 0
                ? `+ ${fmt(row.gross_credit)}`
                : '—'}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}