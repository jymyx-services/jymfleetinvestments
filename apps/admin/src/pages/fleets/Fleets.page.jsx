import { useEffect, useState }       from 'react'
import { motion }                    from 'framer-motion'
import { adminService }              from '../../services/admin.service'
import { Badge }                     from '../../components/common/Badge'
import { Button }                    from '../../components/common/Button'
import { Modal }                     from '../../components/common/Modal'
import { Loader }                    from '../../components/common/Loader'
import { listVariants, fadeSlideUp } from '../../animations/variants/page.variants'

const EMPTY_FLEET = {
  name: '', equipmentType: '', model: '', description: '',
  minimumDeposit: '', companyCutPercent: '20', maxUnits: '0'
}

export function FleetsPage() {
  const [fleets,  setFleets]  = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [form,    setForm]    = useState(EMPTY_FLEET)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const r = await adminService.getAllFleets()
      setFleets(r.data.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await adminService.createFleet({
        name:              form.name,
        equipmentType:     form.equipmentType,
        model:             form.model,
        description:       form.description,
        minimumDeposit:    Number(form.minimumDeposit),
        companyCutPercent: Number(form.companyCutPercent),
        maxUnits:          Number(form.maxUnits)
      })
      setModal(false)
      setForm(EMPTY_FLEET)
      await load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create fleet')
    } finally { setSaving(false) }
  }

  async function toggleStatus(fleet) {
    const newStatus = fleet.status === 'active' ? 'idle' : 'active'
    try {
      await adminService.updateFleet(fleet.id, { status: newStatus })
      await load()
    } catch (e) { console.error(e) }
  }

  if (loading) return <Loader />

  return (
    <motion.div variants={listVariants} initial="hidden" animate="visible"
      className="flex flex-col gap-5">

      <motion.div variants={fadeSlideUp}
        className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Fleets</h1>
        <Button size="sm" onClick={() => setModal(true)}>+ New fleet</Button>
      </motion.div>

      {fleets.map(fleet => {
        const isFull      = fleet.is_full
        const hasCapacity = Number(fleet.max_units) > 0
        const unitsSold   = Number(fleet.total_units_sold || 0)
        const maxUnits    = Number(fleet.max_units || 0)
        const remaining   = hasCapacity ? maxUnits - unitsSold : null

        return (
          <motion.div key={fleet.id} variants={fadeSlideUp} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white mb-0.5">{fleet.name}</h3>
                <p className="text-xs text-slate-500">
                  {fleet.equipment_type}{fleet.model ? ` · ${fleet.model}` : ''}
                </p>
              </div>
              <div className="flex gap-2">
                {isFull && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full
                                   bg-red-500/15 text-red-400 border border-red-500/20">
                    Full
                  </span>
                )}
                <Badge status={fleet.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: 'Investors', value: fleet.investor_count || 0 },
                { label: 'Min deposit', value: `${(Number(fleet.minimum_deposit)/1000000).toFixed(1)}M` },
                { label: 'Units sold', value: unitsSold },
                { label: hasCapacity ? 'Remaining' : 'Capacity',
                  value: hasCapacity ? `${remaining} / ${maxUnits}` : 'Unlimited',
                  accent: remaining === 0 }
              ].map(s => (
                <div key={s.label} className="bg-white/4 rounded-xl p-2.5 text-center">
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">
                    {s.label}
                  </p>
                  <p className={`text-sm font-semibold
                                 ${s.accent ? 'text-red-400' : 'text-white'}`}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Capacity bar */}
            {hasCapacity && (
              <div className="mb-3">
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all
                                ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, (unitsSold / maxUnits) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-600 mt-1 text-right">
                  {Math.round((unitsSold / maxUnits) * 100)}% full
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant={fleet.status === 'active' ? 'ghost' : 'success'}
                size="sm"
                className="flex-1"
                onClick={() => toggleStatus(fleet)}
              >
                {fleet.status === 'active' ? 'Set idle' : 'Set active'}
              </Button>
            </div>
          </motion.div>
        )
      })}

      <Modal open={modal} onClose={() => setModal(false)} title="Create new fleet">
        <div className="flex flex-col gap-4">
          {[
            { key: 'name',              label: 'Fleet name',             type: 'text',   placeholder: 'Crane A — Liebherr LTM' },
            { key: 'equipmentType',     label: 'Equipment type',         type: 'text',   placeholder: 'Crane / Excavator / Bulldozer' },
            { key: 'model',             label: 'Model (optional)',        type: 'text',   placeholder: 'Liebherr LTM 1200' },
            { key: 'minimumDeposit',    label: 'Minimum deposit (UGX)',  type: 'number', placeholder: '2000000' },
            { key: 'companyCutPercent', label: 'Company cut (%)',         type: 'number', placeholder: '20' },
            { key: 'maxUnits',          label: 'Max units (0 = unlimited)', type: 'number', placeholder: '700' },
            { key: 'description',       label: 'Description (optional)', type: 'text',   placeholder: 'Brief notes...' }
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
              {f.key === 'maxUnits' && (
                <p className="text-[10px] text-slate-600 mt-1">
                  Set to 0 for unlimited investors on this fleet
                </p>
              )}
            </div>
          ))}

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20
                          rounded-xl px-4 py-3">{error}</p>
          )}
          <Button size="lg" loading={saving} onClick={handleCreate}>
            Create fleet
          </Button>
        </div>
      </Modal>
    </motion.div>
  )
}