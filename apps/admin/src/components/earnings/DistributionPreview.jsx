import { motion }  from 'framer-motion'
import { Button }  from '../common/Button'
import { fadeSlideUp } from '../../animations/variants/page.variants'

function fmt(v) { return Number(v || 0).toLocaleString() }

export function DistributionPreview({ preview, onConfirm, confirming, error }) {
  if (!preview) return null

  return (
    <motion.div
      variants={fadeSlideUp}
      initial="hidden"
      animate="visible"
      className="glass-card p-5 flex flex-col gap-3"
    >
      <h3 className="text-sm font-semibold text-white mb-1">Distribution preview</h3>

      {[
        { label: 'Gross earned',       value: `UGX ${fmt(preview.grossAmount)}`,   color: 'text-white' },
        { label: `Company cut (${preview.companyCutPercent}%)`,
                                       value: `− UGX ${fmt(preview.companyCut)}`,  color: 'text-red-400' },
        { label: 'Distributable',      value: `UGX ${fmt(preview.distributable)}`, color: 'text-emerald-400' },
        { label: 'Per unit value',     value: `UGX ${fmt(preview.perUnitValue)}`,  color: 'text-white' },
        { label: 'Total investors',    value: preview.totalInvestors,              color: 'text-white' }
      ].map(row => (
        <div key={row.label}
          className="flex justify-between items-center py-2
                     border-b border-white/5 last:border-0">
          <span className="text-xs text-slate-500">{row.label}</span>
          <span className={`text-sm font-semibold font-mono ${row.color}`}>{row.value}</span>
        </div>
      ))}

      <div className="bg-amber-500/10 border border-amber-500/20
                      rounded-xl px-4 py-3 text-xs text-amber-400 mt-1">
        This will instantly credit {preview.totalInvestors} investor
        {preview.totalInvestors !== 1 ? 's' : ''} and send push notifications.
        This action cannot be undone.
      </div>

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}

      <Button size="lg" loading={confirming} onClick={onConfirm}>
        Confirm and distribute
      </Button>
    </motion.div>
  )
}