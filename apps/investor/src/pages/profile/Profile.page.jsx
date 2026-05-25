import { useState, useEffect, useRef }   from 'react'
import { useNavigate }                    from 'react-router-dom'
import { motion }                         from 'framer-motion'
import { useAuthStore }                   from '@/store/auth.store'
import { authService }                    from '@/services/auth.service'
import { investmentService }              from '@/services/investment.service'
import { Button }                         from '@/components/common/Button'
import { TourGuide }                      from '@/components/common/TourGuide'
import { useTour }                        from '@/hooks/useTour'
import { listVariants, fadeSlideUp }      from '@/animations/variants/list.variants'

export function ProfilePage() {
  const navigate    = useNavigate()
  const authUser    = useAuthStore(s => s.user)
  const clearAuth   = useAuthStore(s => s.clearAuth)

  const [profile,    setProfile]    = useState(null)
  const [referrals,  setReferrals]  = useState([])
  const [loggingOut, setLoggingOut] = useState(false)
  const [copied,     setCopied]     = useState(false)

  // Tour refs
  const tourIdRef       = useRef(null)
  const tourReferralRef = useRef(null)

  const TOUR_STEPS = [
    {
      ref:   tourIdRef,
      title: 'Your investor ID',
      body:  'This is your unique JFI investor number. You will need this if you visit the office, contact support, or if someone needs to verify your account. Keep it safe.'
    },
    {
      ref:   tourReferralRef,
      title: 'Your referral code',
      body:  'Share this code with friends and family. When they register using your code and their fleet earns money each day, you automatically receive 10% of their daily credit — every single day, forever.'
    }
  ]

  const { active, step, next, skip, total } = useTour('profile', TOUR_STEPS)

  useEffect(() => {
    investmentService.getProfile()
      .then(r => setProfile(r.data.data))
      .catch(console.error)

    investmentService.getReferrals()
      .then(r => setReferrals(r.data.data))
      .catch(console.error)
  }, [])

  async function handleLogout() {
    setLoggingOut(true)
    try { await authService.logout() } catch { /* ignore */ }
    clearAuth()
    navigate('/login', { replace: true })
  }

  function copyReferral() {
    navigator.clipboard.writeText(
      profile?.investor_code || authUser?.investor_code || ''
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const user     = profile || authUser
  const initials = user?.full_name
    ?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'JFI'

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-5"
    >
      {/* Avatar card */}
      <motion.div variants={fadeSlideUp}
        className="glass-card p-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20
                        flex items-center justify-center mb-3">
          <span className="text-emerald-400 text-xl font-bold">{initials}</span>
        </div>
        <h2 className="text-lg font-semibold text-white mb-0.5">{user?.full_name}</h2>
        <p className="text-sm text-slate-500 mb-3">{user?.email}</p>
        <span className="bg-emerald-500/10 border border-emerald-500/20
                         text-emerald-400 text-xs font-mono px-3 py-1 rounded-full">
          {user?.investor_code}
        </span>
      </motion.div>

      {/* Details */}
      <motion.div variants={fadeSlideUp} className="glass-card overflow-hidden">
        {[
          { label: 'Full name',    value: user?.full_name,                      ref: null         },
          { label: 'Email',        value: user?.email,                           ref: null         },
          { label: 'Phone',        value: user?.phone,                           ref: null         },
          { label: 'Investor ID',  value: user?.investor_code,                   ref: tourIdRef    },
          { label: 'Referred by',  value: user?.referrer_name || '—',            ref: null         },
          { label: 'Member since', value: user?.created_at
              ? new Date(user.created_at).toLocaleDateString('en-UG', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })
              : '—',                                                              ref: null         }
        ].map((row, i, arr) => (
          <div
            key={row.label}
            ref={row.ref || null}
            className={`flex justify-between items-center px-5 py-3.5
                        ${i < arr.length - 1 ? 'border-b border-white/5' : ''}`}
          >
            <span className="text-xs text-slate-500 uppercase tracking-wider">
              {row.label}
            </span>
            <span className="text-sm text-white font-medium text-right max-w-[60%] truncate">
              {row.value || '—'}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Referral panel */}
      <motion.div
        ref={tourReferralRef}
        variants={fadeSlideUp}
        className="glass-card p-5"
      >
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-white mb-0.5">
            Your referral code
          </h3>
          <p className="text-xs text-slate-500">
            Share this code to earn 10% of every referee's daily credit
          </p>
        </div>

        <div className="flex gap-2 items-center mb-4">
          <div className="flex-1 bg-white/4 border border-white/8 rounded-xl
                          px-4 py-3 font-mono text-sm text-emerald-400 tracking-wider">
            {user?.investor_code || '—'}
          </div>
          <button
            onClick={copyReferral}
            className="px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/25
                       text-emerald-400 text-xs font-medium hover:bg-emerald-500/25
                       transition-colors whitespace-nowrap"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        {referrals.length > 0 && (
          <>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
              Your referrals ({referrals.length})
            </p>
            <div className="flex flex-col gap-2">
              {referrals.map(ref => (
                <div key={ref.id}
                  className="flex items-center justify-between bg-white/4
                             rounded-xl px-3 py-2.5">
                  <div>
                    <p className="text-xs font-medium text-white">{ref.full_name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {ref.investor_code}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-400 font-mono">
                      + UGX {Number(ref.total_earned || 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-600">earned for you</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* Logout */}
      <motion.div variants={fadeSlideUp}>
        <Button
          variant="danger"
          size="lg"
          loading={loggingOut}
          onClick={handleLogout}
        >
          Sign out
        </Button>
      </motion.div>

      <TourGuide
        steps={TOUR_STEPS}
        step={step}
        active={active}
        onNext={next}
        onSkip={skip}
        total={total}
      />
    </motion.div>
  )
}