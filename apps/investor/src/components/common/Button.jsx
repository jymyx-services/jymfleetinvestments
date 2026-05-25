import { motion } from 'framer-motion'

export function Button({
  children, onClick, variant = 'primary',
  size = 'md', disabled = false, loading = false, className = '', type = 'button'
}) {
  const base = 'relative flex items-center justify-center gap-2 font-medium rounded-2xl transition-colors duration-200 select-none overflow-hidden'

  const variants = {
    primary:  'bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50',
    ghost:    'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200',
    danger:   'bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400',
    outline:  'border border-emerald-500/50 hover:border-emerald-500 text-emerald-400 hover:bg-emerald-500/10'
  }

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-3 text-sm',
    lg: 'px-6 py-4 text-base w-full'
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading
        ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        : children
      }
    </motion.button>
  )
}