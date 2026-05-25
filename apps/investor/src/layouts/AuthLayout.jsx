import { motion }    from 'framer-motion'
import { Outlet }    from 'react-router-dom'
import { pageVariants } from '@/animations/variants/page.variants'
import { JFILogo } from '@/components/common/JFILogo'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-5 py-12">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]
                      bg-emerald-500/8 blur-[100px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px]
                      bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mb-10 text-center"
      >
        <div className="text-3xl font-bold tracking-tight text-white mb-1">JFI</div>
        <div className="text-xs text-slate-500 tracking-[0.2em] uppercase">
          Invest · Track · Earn
        </div>
      </motion.div>

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        className="w-full max-w-sm"
      >
        <Outlet />
      </motion.div>
    </div>
  )
}