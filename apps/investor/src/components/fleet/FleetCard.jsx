import { motion }           from 'framer-motion'
import { useNavigate }      from 'react-router-dom'
import { itemVariants }     from '@/animations/variants/card.variants'
import { Badge }            from '@/components/common/Badge'
import { FleetStatusPulse } from '@/components/dashboard/FleetStatusPulse'

export function FleetCard({ fleet }) {
  const navigate   = useNavigate()
  const isFull     = fleet.is_full
  const hasCapacity = Number(fleet.max_units) > 0
  const remaining  = fleet.units_remaining

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.99 }}
      onClick={() => navigate(`/fleet/${fleet.fleet_id || fleet.id}`)}
      className="glass-card p-4 cursor-pointer border border-white/5
                 hover:border-emerald-500/20 transition-colors duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FleetStatusPulse status={fleet.fleet_status || fleet.status} />
            <span className="text-sm font-semibold">
              {fleet.fleet_name || fleet.name}
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {fleet.units} {fleet.units === 1 ? 'unit' : 'units'} ·
            UGX {Number(fleet.invested_amount || fleet.minimum_deposit).toLocaleString()}
          </span>
        </div>
        <div className="flex gap-1.5">
          {isFull && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full
                             bg-red-500/15 text-red-400 border border-red-500/20">
              Full
            </span>
          )}
          <Badge status={fleet.fleet_status || fleet.status} />
        </div>
      </div>

      {/* Capacity bar */}
      {hasCapacity && (
        <div className="mb-3">
          <div className="h-1 bg-white/8 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-emerald-500/60'}`}
              style={{
                width: `${Math.min(100,
                  ((Number(fleet.max_units) - Number(remaining || 0)) /
                    Number(fleet.max_units)) * 100
                )}%`
              }}
            />
          </div>
          <p className="text-[10px] text-slate-600 mt-1">
            {isFull
              ? 'Fleet is full'
              : `${remaining} units remaining`}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span className="text-xs text-slate-500">Total earned</span>
        <span className="text-sm font-semibold font-mono text-emerald-400">
          + UGX {Number(fleet.total_earned || 0).toLocaleString()}
        </span>
      </div>

      {Number(fleet.today_earned) > 0 && (
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-xs text-slate-500">Today</span>
          <span className="text-xs font-mono text-emerald-300">
            + UGX {Number(fleet.today_earned).toLocaleString()}
          </span>
        </div>
      )}
    </motion.div>
  )
}