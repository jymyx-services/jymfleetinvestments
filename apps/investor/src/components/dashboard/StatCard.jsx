import { motion } from 'framer-motion'
import { itemVariants } from '@/animations/variants/card.variants'
import { EarningsCounter } from './EarningsCounter'

export function StatCard({ label, value, isCredit = false, prefix = 'UGX ' }) {
  return (
    <motion.div variants={itemVariants}
      className="glass-card p-4 flex flex-col gap-1.5 flex-1">
      <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
      <EarningsCounter
        value={value}
        prefix={prefix}
        className={`text-base font-semibold font-mono tabular-nums
                    ${isCredit ? 'text-emerald-400' : 'text-white'}`}
      />
    </motion.div>
  )
}