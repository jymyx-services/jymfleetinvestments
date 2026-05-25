import { useRef, useEffect } from 'react'
import { motion }            from 'framer-motion'
import { useAuthStore }      from '@/store/auth.store'
import { useFleetStore }     from '@/store/fleet.store'
import { EarningsCounter }   from './EarningsCounter'
import gsap                  from 'gsap'

export function PortfolioCard({ balance }) {
  const user     = useAuthStore(s => s.user)
  const cardRef  = useRef(null)

  const totalBalance    = Number(balance?.total_balance    || 0)
  const fleetEarnings   = Number(balance?.fleet_earnings   || 0)
  const referralEarnings = Number(balance?.referral_earnings || 0)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  useEffect(() => {
    if (!cardRef.current) return
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 30, scale: 0.96 },
      { opacity: 1, y: 0,  scale: 1, duration: 0.65, ease: 'power3.out', delay: 0.1 }
    )
  }, [])

  return (
    <div ref={cardRef} className="relative rounded-3xl overflow-hidden mb-5">
      {/* Gradient background */}
      <div className="absolute inset-0"
       style={{ background: 'linear-gradient(135deg, #E8A000 0%, #CC7A00 50%, #7A3D00 100%)' }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
      <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-white/5" />

      <div className="relative p-5">
        {/* Greeting */}
        <div className="mb-4">
          <p className="text-emerald-200/70 text-xs mb-0.5">{greeting()}</p>
          <p className="text-white font-semibold text-base">
            {user?.full_name?.split(' ')[0]}
          </p>
        </div>

        {/* Total balance */}
        <div className="mb-5">
          <p className="text-emerald-200/60 text-xs uppercase tracking-wider mb-1">
            Total earned
          </p>
          <EarningsCounter
            value={totalBalance}
            prefix="UGX "
            className="text-2xl font-bold text-white font-mono tabular-nums"
          />
        </div>

        {/* Sub stats */}
        <div className="flex gap-3">
          <div className="flex-1 bg-white/10 rounded-2xl p-3">
            <p className="text-emerald-200/60 text-[10px] uppercase tracking-wider mb-1">
              Fleet earnings
            </p>
            <EarningsCounter
              value={fleetEarnings}
              prefix="UGX "
              className="text-sm font-semibold text-white font-mono tabular-nums"
            />
          </div>
          <div className="flex-1 bg-white/10 rounded-2xl p-3">
            <p className="text-emerald-200/60 text-[10px] uppercase tracking-wider mb-1">
              Referral bonus
            </p>
            <EarningsCounter
              value={referralEarnings}
              prefix="UGX "
              className="text-sm font-semibold text-white font-mono tabular-nums"
            />
          </div>
        </div>
      </div>
    </div>
  )
}