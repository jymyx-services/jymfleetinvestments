import { useEffect, useRef, useState }     from 'react'
import { useNavigate }                      from 'react-router-dom'
import { motion, AnimatePresence }          from 'framer-motion'
import { fleetService }                     from '@/services/fleet.service'
import { investmentService }                from '@/services/investment.service'
import { Badge }                            from '@/components/common/Badge'
import { Button }                           from '@/components/common/Button'
import { Modal }                            from '@/components/common/Modal'
import { Loader }                           from '@/components/common/Loader'
import { EarningsCounter }                  from '@/components/dashboard/EarningsCounter'
import { TourGuide }                        from '@/components/common/TourGuide'
import { useTour }                          from '@/hooks/useTour'
import { listVariants, fadeSlideUp }        from '@/animations/variants/list.variants'

export function InvestmentsPage() {
  const navigate = useNavigate()

  const [fleets,      setFleets]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [saleModal,   setSaleModal]   = useState(null)
  const [units,       setUnits]       = useState(1)
  const [selling,     setSelling]     = useState(false)
  const [saleError,   setSaleError]   = useState('')
  const [saleSuccess, setSaleSuccess] = useState(false)

  // Tour refs
  const tourCardRef = useRef(null)
  const tourSellRef = useRef(null)

  const TOUR_STEPS = [
    {
      ref:   tourCardRef,
      title: 'Your investment cards',
      body:  'Each card shows one fleet investment — how much you put in, how many units you hold, and your total earnings so far on that fleet.'
    },
    {
      ref:   tourSellRef,
      title: 'Selling your units',
      body:  'You can request to sell your units at any time. The company takes a 3% fee and an admin approves the request, usually within one business day.'
    }
  ]

  const { active, step, next, skip, total } = useTour('investments', TOUR_STEPS)

  useEffect(() => {
    fleetService.getMyFleets()
      .then(r => setFleets(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function openSale(fleet) {
    setUnits(1)
    setSaleError('')
    setSaleSuccess(false)
    setSaleModal(fleet)
  }

  async function handleSale() {
    if (!saleModal) return
    setSaleError('')
    setSelling(true)
    try {
      await investmentService.requestSale(saleModal.investment_id, units)
      setSaleSuccess(true)
      const r = await fleetService.getMyFleets()
      setFleets(r.data.data)
    } catch (err) {
      setSaleError(err.response?.data?.error || 'Sale request failed')
    } finally {
      setSelling(false)
    }
  }

  const grossValue = saleModal
    ? (Number(saleModal.invested_amount) / saleModal.units) * units
    : 0
  const feeAmount  = grossValue * 0.03
  const netValue   = grossValue - feeAmount

  if (loading) return <Loader />

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">My investments</h1>
        <span className="text-xs text-slate-500">{fleets.length} active</span>
      </div>

      {fleets.length === 0 ? (
        <motion.div
          variants={fadeSlideUp}
          initial="hidden"
          animate="visible"
          className="glass-card p-10 text-center"
        >
          <p className="text-slate-500 text-sm">No investments yet</p>
        </motion.div>
      ) : (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-4"
        >
          {fleets.map((fleet, idx) => (
            <motion.div
              key={fleet.investment_id}
              ref={idx === 0
                ? el => { if (el) tourCardRef.current = el }
                : undefined}
              variants={fadeSlideUp}
              className="glass-card p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-0.5">
                    {fleet.fleet_name}
                  </h3>
                  <p className="text-xs text-slate-500">{fleet.equipment_type}</p>
                </div>
                <Badge status={fleet.fleet_status} />
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Invested', value: fleet.invested_amount, accent: false },
                  { label: 'Units',    value: null, raw: `${fleet.units} units`    },
                  { label: 'Earned',   value: fleet.total_earned,    accent: true  }
                ].map(s => (
                  <div key={s.label} className="bg-white/4 rounded-xl p-2.5">
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">
                      {s.label}
                    </p>
                    {s.raw
                      ? <p className="text-xs font-semibold text-white">{s.raw}</p>
                      : <EarningsCounter
                          value={Number(s.value || 0)}
                          prefix="UGX "
                          className={`text-xs font-semibold font-mono tabular-nums
                                      ${s.accent ? 'text-emerald-400' : 'text-white'}`}
                        />
                    }
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate(`/fleet/${fleet.fleet_id}`)}
                >
                  View detail
                </Button>

                {fleet.investment_status === 'active' && (
                  <Button
                    ref={idx === 0
                      ? el => { if (el) tourSellRef.current = el }
                      : undefined}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openSale(fleet)}
                  >
                    Sell units
                  </Button>
                )}

                {fleet.investment_status === 'pending_sale' && (
                  <span className="flex-1 text-center text-xs text-orange-400
                                   py-2 border border-orange-500/20 rounded-xl
                                   bg-orange-500/5">
                    Sale pending
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Unit sale modal */}
      <Modal
        open={!!saleModal}
        onClose={() => { if (!selling) setSaleModal(null) }}
        title="Sell units"
      >
        {saleSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-500/15
                            flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-400" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p className="text-white font-semibold mb-1">Request submitted</p>
            <p className="text-sm text-slate-500 mb-5">
              Your sale request is pending admin approval
            </p>
            <Button size="lg" onClick={() => setSaleModal(null)}>Done</Button>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">
                Units to sell (max {saleModal?.units})
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setUnits(u => Math.max(1, u - 1))}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10
                             text-white text-lg flex items-center justify-center
                             hover:bg-white/10 transition-colors"
                >−</button>
                <span className="flex-1 text-center text-xl font-semibold text-white">
                  {units}
                </span>
                <button
                  onClick={() => setUnits(u => Math.min(saleModal?.units || 1, u + 1))}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10
                             text-white text-lg flex items-center justify-center
                             hover:bg-white/10 transition-colors"
                >+</button>
              </div>
            </div>

            <div className="bg-white/4 rounded-2xl p-4 flex flex-col gap-2.5">
              {[
                { label: 'Gross value',     value: grossValue,  color: 'text-white'       },
                { label: 'Company fee (3%)', value: -feeAmount, color: 'text-red-400'     },
                { label: 'You receive',     value: netValue,    color: 'text-emerald-400' }
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">{row.label}</span>
                  <span className={`text-sm font-semibold font-mono ${row.color}`}>
                    {row.value < 0 ? '− ' : ''}
                    UGX {Math.abs(row.value).toLocaleString(
                      undefined, { maximumFractionDigits: 0 }
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20
                            rounded-xl px-4 py-3 text-xs text-amber-400">
              Sale requests require admin approval. Your units remain active until approved.
            </div>

            {saleError && (
              <p className="text-xs text-red-400 text-center">{saleError}</p>
            )}

            <Button size="lg" loading={selling} onClick={handleSale}>
              Submit sale request
            </Button>
          </div>
        )}
      </Modal>

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