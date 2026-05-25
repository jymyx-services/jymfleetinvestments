import { useEffect, useState }       from 'react'
import { motion }                    from 'framer-motion'
import { adminService }              from '../../services/admin.service'
import { Badge }                     from '../../components/common/Badge'
import { Button }                    from '../../components/common/Button'
import { Modal }                     from '../../components/common/Modal'
import { Loader }                    from '../../components/common/Loader'
import { listVariants, fadeSlideUp } from '../../animations/variants/page.variants'

export function InviteCodesPage() {
  const [fleets,  setFleets]  = useState([])
  const [codes,   setCodes]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [generated, setGenerated] = useState(null)
  const [form,    setForm]    = useState({
    fleetId: '', investorName: '', amount: '',
    units: '1', expiryDays: '7'
  })
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const [f, c] = await Promise.all([
        adminService.getAllFleets(),
        adminService.listCodes()
      ])
      const active = f.data.data
      setFleets(active)
      setCodes(c.data.data)
      if (active.length > 0 && !form.fleetId) {
        setForm(p => ({ ...p, fleetId: active[0].id }))
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function handleGenerate(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const r = await adminService.generateCode({
        fleetId:      form.fleetId,
        investorName: form.investorName,
        amount:       Number(form.amount),
        units:        Number(form.units),
        expiryDays:   Number(form.expiryDays)
      })
      setGenerated(r.data.data)
      await load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate code')
    } finally { setSaving(false) }
  }

  async function handleRevoke(id) {
    try {
      await adminService.revokeCode(id)
      await load()
    } catch (e) { console.error(e) }
  }

  if (loading) return <Loader />

  return (
    <motion.div variants={listVariants} initial="hidden" animate="visible"
      className="flex flex-col gap-5">

      <motion.div variants={fadeSlideUp} className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Invite codes</h1>
        <Button size="sm" onClick={() => { setGenerated(null); setModal(true) }}>
          + Generate
        </Button>
      </motion.div>

      {/* Recent codes */}
      <div className="flex flex-col gap-2">
        {codes.map(code => (
          <motion.div key={code.id} variants={fadeSlideUp} className="glass-card p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-white">{code.investor_name}</p>
                <p className="text-xs text-slate-500">{code.fleet_name}</p>
              </div>
              <Badge status={code.status} />
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs mb-3">
              <span className="text-slate-600">Amount:</span>
              <span className="text-slate-400">UGX {Number(code.amount).toLocaleString()}</span>
              <span className="text-slate-600">Units:</span>
              <span className="text-slate-400">{code.units}</span>
              <span className="text-slate-600">Expires:</span>
              <span className="text-slate-400">
                {new Date(code.expires_at).toLocaleDateString()}
              </span>
            </div>
            {code.status === 'available' && (
              <Button variant="danger" size="sm" onClick={() => handleRevoke(code.id)}>
                Revoke
              </Button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Generate modal */}
      <Modal
        open={modal}
        onClose={() => { if (!saving) setModal(false) }}
        title="Generate invite code"
      >
        {generated ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-2"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15
                            flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-400" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-white">Code generated</p>
            <p className="text-xs text-slate-500 text-center">
              Share this with {generated.investorName}. It will only appear once.
            </p>

            <div className="w-full bg-navy-800 border border-white/10 rounded-2xl
                            p-4 text-center">
              <p className="font-mono text-lg font-bold text-emerald-400 tracking-[0.2em]">
                {generated.code}
              </p>
            </div>

            <Button size="lg" onClick={() => {
              navigator.clipboard.writeText(generated.code)
            }} variant="outline">
              Copy code
            </Button>

            <Button size="md" variant="ghost" onClick={() => {
              setGenerated(null)
              setForm(p => ({ ...p, investorName: '', amount: '', units: '1' }))
            }}>
              Generate another
            </Button>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4">
            {[
              { key: 'investorName', label: 'Investor full name',   type: 'text',   placeholder: 'As on ID' },
              { key: 'amount',       label: 'Investment amount (UGX)', type: 'number', placeholder: '2000000' },
              { key: 'units',        label: 'Units',                 type: 'number', placeholder: '1' },
              { key: 'expiryDays',   label: 'Expires in (days)',     type: 'number', placeholder: '7' }
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">
                  {f.label}
                </label>
                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="input-field"
                />
              </div>
            ))}

            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">
                Fleet
              </label>
              <select
                value={form.fleetId}
                onChange={e => set('fleetId', e.target.value)}
                className="input-field"
              >
                {fleets.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20
                            rounded-xl px-4 py-3">{error}</p>
            )}

            <Button size="lg" loading={saving} onClick={handleGenerate}>
              Generate code
            </Button>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}