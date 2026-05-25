import { useEffect, useState }       from 'react'
import { motion, AnimatePresence }   from 'framer-motion'
import { adminService }              from '../../services/admin.service'
import { Button }                    from '../../components/common/Button'
import { Loader }                    from '../../components/common/Loader'
import { listVariants, fadeSlideUp } from '../../animations/variants/page.variants'

function round(v) { return Math.round((v + Number.EPSILON) * 100) / 100 }
function fmt(v)   { return Number(v || 0).toLocaleString() }

export function EarningsPage() {
  const [fleets,   setFleets]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [fleetId,  setFleetId]  = useState('')
  const [gross,    setGross]    = useState('')
  const [date,     setDate]     = useState(new Date().toISOString().split('T')[0])
  const [preview,  setPreview]  = useState(null)
  const [previewing, setPreviewing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState('')

  useEffect(() => {
    adminService.getAllFleets()
      .then(r => {
        const active = r.data.data.filter(f => f.status === 'active')
        setFleets(active)
        if (active.length > 0) setFleetId(active[0].id)
      })
      .finally(() => setLoading(false))
  }, [])

  async function handlePreview() {
    setError('')
    setPreview(null)
    setPreviewing(true)
    try {
      const r = await adminService.previewEarnings({
        fleetId, grossAmount: Number(gross)
      })
      setPreview(r.data.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Preview failed')
    } finally { setPreviewing(false) }
  }

  async function handleConfirm() {
    setError('')
    setConfirming(true)
    try {
      await adminService.enterEarnings({
        fleetId, grossAmount: Number(gross), earningDate: date
      })
      setSuccess(true)
      setPreview(null)
      setGross('')
    } catch (err) {
      setError(err.response?.data?.error || 'Distribution failed')
    } finally { setConfirming(false) }
  }

  if (loading) return <Loader />

  return (
    <motion.div variants={listVariants} initial="hidden" animate="visible"
      className="flex flex-col gap-5">

      <motion.div variants={fadeSlideUp}
        className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Enter earnings</h1>
      </motion.div>

      {fleets.length === 0 ? (
        <motion.div variants={fadeSlideUp} className="glass-card p-8 text-center">
          <p className="text-slate-500 text-sm">No active fleets. Activate a fleet first.</p>
        </motion.div>
      ) : (
        <>
          <motion.div variants={fadeSlideUp} className="glass-card p-5 flex flex-col gap-4">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">
                Fleet
              </label>
              <select
                value={fleetId}
                onChange={e => { setFleetId(e.target.value); setPreview(null) }}
                className="input-field"
              >
                {fleets.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">
                Earning date
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">
                Gross amount earned (UGX)
              </label>
              <input
                type="number"
                value={gross}
                onChange={e => { setGross(e.target.value); setPreview(null) }}
                placeholder="e.g. 5000000"
                className="input-field font-mono"
              />
            </div>

            <Button
              size="lg"
              variant="outline"
              loading={previewing}
              disabled={!gross || Number(gross) < 1}
              onClick={handlePreview}
            >
              Preview distribution
            </Button>
          </motion.div>

          {/* Distribution preview */}
          <AnimatePresence>
            {preview && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass-card p-5 flex flex-col gap-3"
              >
                <h3 className="text-sm font-semibold text-white mb-1">
                  Distribution preview
                </h3>

                {[
                  { label: 'Gross earned',    value: `UGX ${fmt(preview.grossAmount)}`,   color: 'text-white' },
                  { label: `Company cut (${preview.companyCutPercent}%)`, value: `− UGX ${fmt(preview.companyCut)}`, color: 'text-red-400' },
                  { label: 'Distributable',   value: `UGX ${fmt(preview.distributable)}`, color: 'text-emerald-400' },
                  { label: 'Per unit value',  value: `UGX ${fmt(preview.perUnitValue)}`,  color: 'text-white' },
                  { label: 'Total investors', value: preview.totalInvestors,               color: 'text-white' }
                ].map(row => (
                  <div key={row.label}
                    className="flex justify-between items-center py-2
                               border-b border-white/5 last:border-0">
                    <span className="text-xs text-slate-500">{row.label}</span>
                    <span className={`text-sm font-semibold font-mono ${row.color}`}>
                      {row.value}
                    </span>
                  </div>
                ))}

                <div className="bg-amber-500/10 border border-amber-500/20
                                rounded-xl px-4 py-3 text-xs text-amber-400 mt-1">
                  This will instantly credit {preview.totalInvestors} investor
                  {preview.totalInvestors !== 1 ? 's' : ''} and send push notifications.
                  This action cannot be undone.
                </div>

                {error && (
                  <p className="text-xs text-red-400 text-center">{error}</p>
                )}

                <Button size="lg" loading={confirming} onClick={handleConfirm}>
                  Confirm and distribute
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success state */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card p-6 flex flex-col items-center text-center gap-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15
                                flex items-center justify-center">
                  <svg className="w-7 h-7 text-emerald-400" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <p className="text-white font-semibold">Distribution complete</p>
                <p className="text-xs text-slate-500">
                  All investors have been credited and notified
                </p>
                <Button size="md" variant="ghost" onClick={() => setSuccess(false)}>
                  Enter another
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  )
}