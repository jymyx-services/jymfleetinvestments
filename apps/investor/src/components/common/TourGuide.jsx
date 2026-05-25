import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence }      from 'framer-motion'

export function TourGuide({ steps, step, active, onNext, onSkip, total }) {
  const [box,     setBox]     = useState(null)
  const [winSize, setWinSize] = useState({ w: 0, h: 0 })
  const rafRef = useRef(null)

  const currentStep = steps[step]

  // Measure target element position
  useEffect(() => {
    if (!active || !currentStep?.ref?.current) return

    function measure() {
      const el   = currentStep.ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setBox({
        top:    rect.top,
        left:   rect.left,
        width:  rect.width,
        height: rect.height,
        bottom: rect.bottom
      })
      setWinSize({ w: window.innerWidth, h: window.innerHeight })
    }

    measure()

    // Scroll target into view
    currentStep.ref.current?.scrollIntoView({
      behavior: 'smooth',
      block:    'center'
    })

    const timer = setTimeout(measure, 400)
    return () => clearTimeout(timer)
  }, [active, step, currentStep])

  if (!active || !currentStep || !box) return null

  const PAD        = 10
  const HL_TOP     = box.top    - PAD
  const HL_LEFT    = box.left   - PAD
  const HL_WIDTH   = box.width  + PAD * 2
  const HL_HEIGHT  = box.height + PAD * 2

  // Position tooltip above or below the highlighted element
  const tooltipBelow = box.top < winSize.h * 0.5
  const tooltipTop   = tooltipBelow
    ? box.top + box.height + PAD + 16
    : box.top - PAD - 160

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 z-[999] pointer-events-none">
          {/* Dark overlay — four quadrants around the highlight */}
          {/* Top */}
          <div className="absolute bg-black/75 pointer-events-auto"
            style={{ top: 0, left: 0, right: 0, height: Math.max(0, HL_TOP) }}
            onClick={onSkip}
          />
          {/* Bottom */}
          <div className="absolute bg-black/75 pointer-events-auto"
            style={{
              top:    HL_TOP + HL_HEIGHT,
              left:   0,
              right:  0,
              bottom: 0
            }}
            onClick={onSkip}
          />
          {/* Left */}
          <div className="absolute bg-black/75 pointer-events-auto"
            style={{
              top:    HL_TOP,
              left:   0,
              width:  Math.max(0, HL_LEFT),
              height: HL_HEIGHT
            }}
            onClick={onSkip}
          />
          {/* Right */}
          <div className="absolute bg-black/75 pointer-events-auto"
            style={{
              top:    HL_TOP,
              left:   HL_LEFT + HL_WIDTH,
              right:  0,
              height: HL_HEIGHT
            }}
            onClick={onSkip}
          />

          {/* Highlight ring around target element */}
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="absolute rounded-2xl pointer-events-none"
            style={{
              top:    HL_TOP,
              left:   HL_LEFT,
              width:  HL_WIDTH,
              height: HL_HEIGHT,
              border: '2px solid #E8A000',
              boxShadow: '0 0 0 4px rgba(232,160,0,0.2), 0 0 24px rgba(232,160,0,0.3)'
            }}
          />

          {/* Arrow */}
          <motion.div
            key={`arrow-${step}`}
            initial={{ opacity: 0, y: tooltipBelow ? -6 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="absolute pointer-events-none"
            style={{
              left:   HL_LEFT + HL_WIDTH / 2 - 8,
              top:    tooltipBelow
                ? HL_TOP + HL_HEIGHT + PAD + 2
                : tooltipTop + 148,
              width:  0,
              height: 0,
              borderLeft:  '8px solid transparent',
              borderRight: '8px solid transparent',
              ...(tooltipBelow
                ? { borderBottom: '10px solid rgba(22,31,56,0.98)' }
                : { borderTop:    '10px solid rgba(22,31,56,0.98)' }
              )
            }}
          />

          {/* Tooltip card */}
          <motion.div
            key={`tip-${step}`}
            initial={{ opacity: 0, y: tooltipBelow ? -12 : 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="absolute pointer-events-auto mx-4"
            style={{
              top:       tooltipTop,
              left:      Math.max(16, Math.min(
                           HL_LEFT + HL_WIDTH / 2 - 160,
                           winSize.w - 336
                         )),
              width:     320
            }}
          >
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(22,31,56,0.98)', border: '1px solid rgba(232,160,0,0.3)' }}>

              {/* Step counter */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-1.5">
                  {Array.from({ length: total }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width:  i === step ? 20 : 6,
                        height: 6,
                        background: i === step
                          ? '#E8A000'
                          : i < step
                            ? 'rgba(232,160,0,0.4)'
                            : 'rgba(255,255,255,0.15)'
                      }}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-slate-500">
                  {step + 1} of {total}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-sm font-semibold text-white mb-1.5">
                {currentStep.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {currentStep.body}
              </p>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button
                  onClick={onSkip}
                  className="text-xs text-slate-500 hover:text-slate-300
                             transition-colors px-2 py-1"
                >
                  Skip tour
                </button>
                <button
                  onClick={onNext}
                  className="text-xs font-semibold px-4 py-2 rounded-xl
                             transition-colors"
                  style={{ background: '#E8A000', color: '#04081a' }}
                >
                  {step === total - 1 ? 'Got it ✓' : 'Next →'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}