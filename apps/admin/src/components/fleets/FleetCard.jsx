import { motion }    from 'framer-motion'
import { Badge }     from '../common/Badge'
import { Button }    from '../common/Button'
import { fadeSlideUp } from '../../animations/variants/page.variants'

export function FleetCard({ fleet, onToggleStatus, onEnterEarnings }) {
  return (
    <motion.div variants={fadeSlideUp} className="glass-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-white mb-0.5">{fleet.name}</h3>
          <p className="text-xs text-slate-500">
            {fleet.equipment_type}{fleet.model ? ` · ${fleet.model}` : ''}
          </p>
        </div>
        <Badge status={fleet.status} />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Investors', value: fleet.investor_count || 0 },
          { label: 'Min deposit', value: `${(Number(fleet.minimum_deposit)/1000000).toFixed(1)}M` },
          { label: 'Cut', value: `${fleet.company_cut_percent}%` }
        ].map(s => (
          <div key={s.label} className="bg-white/4 rounded-xl p-2.5 text-center">
            <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-sm font-semibold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          variant={fleet.status === 'active' ? 'ghost' : 'success'}
          size="sm"
          className="flex-1"
          onClick={() => onToggleStatus?.(fleet)}
        >
          {fleet.status === 'active' ? 'Set idle' : 'Set active'}
        </Button>
        {fleet.status === 'active' && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEnterEarnings?.(fleet)}
          >
            Enter earnings
          </Button>
        )}
      </div>
    </motion.div>
  )
}