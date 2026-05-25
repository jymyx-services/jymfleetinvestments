import { motion }      from 'framer-motion'
import { Badge }       from '../common/Badge'
import { Button }      from '../common/Button'
import { fadeSlideUp } from '../../animations/variants/page.variants'

export function CodeList({ codes, onRevoke }) {
  if (!codes?.length) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-slate-500 text-sm">No invite codes yet</p>
      </div>
    )
  }

  return (
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
            <Button variant="danger" size="sm" onClick={() => onRevoke?.(code.id)}>
              Revoke
            </Button>
          )}
        </motion.div>
      ))}
    </div>
  )
}