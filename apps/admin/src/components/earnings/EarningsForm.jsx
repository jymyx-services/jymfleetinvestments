import { Button } from '../common/Button'

export function EarningsForm({
  fleets, fleetId, setFleetId,
  gross, setGross, date, setDate,
  onPreview, previewing
}) {
  return (
    <div className="glass-card p-5 flex flex-col gap-4">
      <div>
        <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">
          Fleet
        </label>
        <select
          value={fleetId}
          onChange={e => setFleetId(e.target.value)}
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
          onChange={e => setGross(e.target.value)}
          placeholder="e.g. 5000000"
          className="input-field font-mono"
        />
      </div>

      <Button
        size="lg"
        variant="outline"
        loading={previewing}
        disabled={!gross || Number(gross) < 1}
        onClick={onPreview}
      >
        Preview distribution
      </Button>
    </div>
  )
}