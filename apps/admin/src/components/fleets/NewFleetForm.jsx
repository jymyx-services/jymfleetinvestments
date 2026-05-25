import { useState } from 'react'
import { Button }   from '../common/Button'

const EMPTY = {
  name: '', equipmentType: '', model: '',
  minimumDeposit: '', companyCutPercent: '20', description: ''
}

export function NewFleetForm({ onSubmit, loading, error }) {
  const [form, setForm] = useState(EMPTY)
  const set = (k, v)   => setForm(p => ({ ...p, [k]: v }))

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit?.({
      name:              form.name,
      equipmentType:     form.equipmentType,
      model:             form.model,
      description:       form.description,
      minimumDeposit:    Number(form.minimumDeposit),
      companyCutPercent: Number(form.companyCutPercent)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {[
        { key: 'name',              label: 'Fleet name',            type: 'text',   placeholder: 'Crane A — Liebherr LTM' },
        { key: 'equipmentType',     label: 'Equipment type',        type: 'text',   placeholder: 'Crane / Excavator / Bulldozer' },
        { key: 'model',             label: 'Model (optional)',       type: 'text',   placeholder: 'Liebherr LTM 1200' },
        { key: 'minimumDeposit',    label: 'Minimum deposit (UGX)', type: 'number', placeholder: '2000000' },
        { key: 'companyCutPercent', label: 'Company cut (%)',        type: 'number', placeholder: '20' },
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
        </div>
      ))}

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20
                      rounded-xl px-4 py-3">{error}</p>
      )}

      <Button size="lg" loading={loading} onClick={handleSubmit}>
        Create fleet
      </Button>
    </div>
  )
}