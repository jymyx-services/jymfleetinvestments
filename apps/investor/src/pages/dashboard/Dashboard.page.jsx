import { useEffect, useRef, useState }  from 'react'
import { motion }                        from 'framer-motion'
import { useAuthStore }                  from '@/store/auth.store'
import { useFleetStore }                 from '@/store/fleet.store'
import { fleetService }                  from '@/services/fleet.service'
import { investmentService }             from '@/services/investment.service'
import { PortfolioCard }                 from '@/components/dashboard/PortfolioCard'
import { StatCard }                      from '@/components/dashboard/StatCard'
import { FleetCard }                     from '@/components/fleet/FleetCard'
import { Loader }                        from '@/components/common/Loader'
import { TourGuide }                     from '@/components/common/TourGuide'
import { useTour }                       from '@/hooks/useTour'
import { listVariants, fadeSlideUp }     from '@/animations/variants/list.variants'
import { animateDashboardEntrance }      from '@/animations/gsap/dashboard'

export function DashboardPage() {
  const user        = useAuthStore(s => s.user)
  const setBalance  = useFleetStore(s => s.setBalance)
  const balance     = useFleetStore(s => s.balance)

  const [fleets,     setFleets]     = useState([])
  const [referrals,  setReferrals]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [todayTotal, setTodayTotal] = useState(0)

  // GSAP animation refs
  const heroRef  = useRef(null)
  const statsRef = useRef(null)
  const listRef  = useRef(null)

  // Tour refs
  const tourPortfolioRef = useRef(null)
  const tourStatsRef     = useRef(null)
  const tourFleetsRef    = useRef(null)

  const TOUR_STEPS = [
    {
      ref:   tourPortfolioRef,
      title: 'Your portfolio',
      body:  'This card shows everything you have earned across all your fleet investments since you joined JFI.'
    },
    {
      ref:   tourStatsRef,
      title: "Today's credit",
      body:  'When a fleet you invested in works today, your share of the earnings appears here. It updates in real time.'
    },
    {
      ref:   tourFleetsRef,
      title: 'Your fleets',
      body:  'Each card here is one of your fleet investments. Tap any card to see its full daily earnings history and how your money is growing.'
    }
  ]

  const { active, step, next, skip, total } = useTour('dashboard', TOUR_STEPS)

  useEffect(() => {
    async function load() {
      try {
        const [fleetsRes, balanceRes, referralsRes] = await Promise.all([
          fleetService.getMyFleets(),
          investmentService.getBalance(),
          investmentService.getReferrals()
        ])

        const fleetsData  = fleetsRes.data.data
        const balanceData = balanceRes.data.data

        setFleets(fleetsData)
        setBalance(balanceData)
        setReferrals(referralsRes.data.data || [])

        const todaySum = fleetsData.reduce(
          (sum, f) => sum + Number(f.today_earned || 0), 0
        )
        setTodayTotal(todaySum)
      } catch (err) {
        console.error('Dashboard load failed', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!loading && heroRef.current) {
      animateDashboardEntrance(heroRef, statsRef, listRef)
    }
  }, [loading])

  useEffect(() => {
    function onDistribution(e) {
      const { myCredit } = e.detail
      if (myCredit) {
        setTodayTotal(prev => prev + myCredit)
        investmentService.getBalance()
          .then(r => setBalance(r.data.data))
          .catch(() => {})
      }
    }
    window.addEventListener('jfi:notification', onDistribution)
    return () => window.removeEventListener('jfi:notification', onDistribution)
  }, [])

  if (loading) return <Loader />

  return (
    <div className="flex flex-col gap-5">

      {/* Portfolio hero */}
      <div
        ref={el => { heroRef.current = el; tourPortfolioRef.current = el }}
        style={{ opacity: 0 }}
      >
        <PortfolioCard balance={balance} />
      </div>

      {/* Stat cards */}
      <div ref={el => { statsRef.current = el; tourStatsRef.current = el }}>
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="flex gap-3"
        >
          <StatCard label="Today's credit" value={todayTotal} isCredit />
          <StatCard
            label="Referral earned"
            value={Number(balance?.referral_earnings || 0)}
          />
        </motion.div>
      </div>

      {/* Referral summary */}
      {referrals.length > 0 && (
        <motion.div
          variants={fadeSlideUp}
          initial="hidden"
          animate="visible"
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              My referrals
            </h3>
            <span className="text-xs text-emerald-400 font-medium">
              {referrals.length} {referrals.length === 1 ? 'person' : 'people'}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {referrals.slice(0, 3).map(ref => (
              <div key={ref.id}
                className="flex items-center justify-between bg-white/4
                           rounded-xl px-3 py-2.5">
                <div>
                  <p className="text-xs font-medium text-white">{ref.full_name}</p>
                  <p className="text-[10px] text-slate-500">{ref.email}</p>
                </div>
                <p className="text-[10px] text-slate-600">
                  {new Date(ref.created_at).toLocaleDateString('en-UG', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </p>
              </div>
            ))}
            {referrals.length > 3 && (
              <p className="text-[10px] text-slate-600 text-center pt-1">
                +{referrals.length - 3} more — see all in Profile
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Fleet list */}
      <div ref={el => { listRef.current = el; tourFleetsRef.current = el }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            My fleets
          </h2>
          <span className="text-xs text-slate-600">
            {fleets.length} {fleets.length === 1 ? 'investment' : 'investments'}
          </span>
        </div>

        {fleets.length === 0 ? (
          <motion.div
            variants={fadeSlideUp}
            initial="hidden"
            animate="visible"
            className="glass-card p-8 text-center"
          >
            <p className="text-sm text-slate-500">No active investments yet</p>
          </motion.div>
        ) : (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-3"
          >
            {fleets.map(fleet => (
              <FleetCard key={fleet.investment_id} fleet={fleet} />
            ))}
          </motion.div>
        )}
      </div>

      <TourGuide
        steps={TOUR_STEPS}
        step={step}
        active={active}
        onNext={next}
        onSkip={skip}
        total={total}
      />
    </div>
  )
}