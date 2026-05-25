import { motion } from 'framer-motion'

export function FleetStatusPulse({ status }) {
  if (status !== 'active') {
    return <span className="w-2 h-2 rounded-full bg-amber-500/60 inline-block" />
  }

  return (
    <span className="relative inline-flex w-2.5 h-2.5">
      <motion.span
        animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        className="absolute inline-flex w-full h-full rounded-full bg-emerald-400"
      />
      <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-emerald-500" />
    </span>
  )
}