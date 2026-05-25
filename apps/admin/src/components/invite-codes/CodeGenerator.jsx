import { useState }  from 'react'
import { Button }    from '../common/Button'

export function CodeGenerator({ fleets, onGenerate, loading, error }) {
  const [form, setForm] = useState({
    fleetId: fleets?.[0]?.id || '',
    investorName: '', amount: '',
    units: '1', expiryDays: '7'
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  function handleSubmit(e) {
    e.preventDefault()
    onGenerate?.({
      fleetId:      form.fleetId,
      investorName: form.investorName,
      amount:       Number(form.amount),
      units:        Number(form.units),
      expiryDays:   Number(form.expiryDays)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">
          Fleet
        </label>
        <select value={form.fleetId} onChange={e => set('fleetId', e.target.value)}
          className="input-field">
          {fleets?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      {[
        { key: 'investorName', label: 'Investor full name',    type: 'text',   placeholder: 'As on ID' },
        { key: 'amount',       label: 'Amount (UGX)',           type: 'number', placeholder: '2000000' },
        { key: 'units',        label: 'Units',                  type: 'number', placeholder: '1' },
        { key: 'expiryDays',   label: 'Expires in (days)',      type: 'number', placeholder: '7' }
      ].map(f => (
        <div key={f.key}>
          <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">
            {f.label}
          </label>
          <input type={f.type} value={form[f.key]}
            onChange={e => set(f.key, e.target.value)}
            placeholder={f.placeholder} className="input-field" />
        </div>
      ))}

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20
                      rounded-xl px-4 py-3">{error}</p>
      )}

      <Button size="lg" loading={loading} onClick={handleSubmit}>
        Generate code
      </Button>
    </div>
  )
}