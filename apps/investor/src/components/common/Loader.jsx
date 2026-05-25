import { motion } from 'framer-motion'

export function Loader({ fullscreen = false }) {
  const content = (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 border-2 border-white/10 border-t-emerald-500 rounded-full"
      />
      <span className="text-sm text-slate-500 tracking-widest uppercase">Loading</span>
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-navy-950 flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-16">
      {content}
    </div>
  )
}