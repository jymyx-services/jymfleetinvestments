import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'

export function Modal({ open, onClose, title, children }) {
  const [fullscreen, setFullscreen] = useState(false)
  const controls  = useDragControls()
  const sheetRef  = useRef(null)

  // Reset fullscreen state when modal closes
  useEffect(() => {
    if (!open) setFullscreen(false)
  }, [open])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            drag={fullscreen ? false : 'y'}
            dragControls={controls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.1, bottom: 0.3 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) {
                onClose()
              } else if (info.offset.y < -60) {
                setFullscreen(true)
              }
            }}
            initial={{ y: '100%' }}
            animate={{ y: fullscreen ? '0%' : '0%' }}
            exit={{ y: '100%', transition: { duration: 0.25 } }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            style={{
              top: fullscreen ? 0 : 'auto',
              borderRadius: fullscreen ? 0 : undefined
            }}
            className="fixed bottom-0 left-0 right-0 z-50
                       bg-navy-800 border border-white/8
                       rounded-t-3xl flex flex-col"
          >
            {/* Drag handle */}
            <div
              className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing flex-shrink-0"
              onPointerDown={e => controls.start(e)}
            >
              <div className="w-10 h-1 rounded-full bg-white/20"/>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 flex-shrink-0
                            border-b border-white/6">
              <h2 className="text-base font-semibold text-white">{title}</h2>
              <div className="flex items-center gap-2">
                {/* Expand / collapse toggle */}
                <button
                  onClick={() => setFullscreen(f => !f)}
                  className="w-8 h-8 flex items-center justify-center rounded-full
                             bg-white/5 hover:bg-white/10 text-slate-400
                             transition-colors"
                >
                  {fullscreen ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="4 14 10 14 10 20"/>
                      <polyline points="20 10 14 10 14 4"/>
                      <line x1="10" y1="14" x2="3" y2="21"/>
                      <line x1="21" y1="3" x2="14" y2="10"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="15 3 21 3 21 9"/>
                      <polyline points="9 21 3 21 3 15"/>
                      <line x1="21" y1="3" x2="14" y2="10"/>
                      <line x1="3" y1="21" x2="10" y2="14"/>
                    </svg>
                  )}
                </button>
                {/* Close */}
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full
                             bg-white/5 hover:bg-white/10 text-slate-400
                             transition-colors text-lg leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div
              className="overflow-y-auto flex-1 px-5 py-5"
              style={{ maxHeight: fullscreen ? 'calc(100vh - 100px)' : '80vh' }}
            >
              {children}

              {/* Bottom padding so button is never hidden behind nav */}
              <div className="h-8"/>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}