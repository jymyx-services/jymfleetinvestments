import { motion }      from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { fadeSlideUp } from '../../animations/variants/page.variants'

export function PendingActions({ pendingSales = [] }) {
  const navigate = useNavigate()

  if (pendingSales.length === 0) return null

  return (
    <motion.div variants={fadeSlideUp}
      whileHover={{ y: -2 }}
      onClick={() => navigate('/admin/unit-sales')}
      className="glass-card p-4 cursor-pointer border border-red-500/20
                 hover:border-red-500/40 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Unit sale requests</p>
            <p className="text-xs text-slate-500">
              {pendingSales.length} awaiting approval
            </p>
          </div>
        </div>
        <span className="bg-red-500/15 border border-red-500/20 text-red-400
                         text-xs font-bold px-2.5 py-1 rounded-full">
          {pendingSales.length}
        </span>
      </div>
    </motion.div>
  )
}