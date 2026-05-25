import { motion }      from 'framer-motion'
import { Badge }       from '../common/Badge'
import { Button }      from '../common/Button'
import { fadeSlideUp } from '../../animations/variants/page.variants'

export function InvestorList({ users, acting, onToggleStatus }) {
  return (
    <div className="flex flex-col gap-2">
      {users.map(user => (
        <motion.div key={user.id} variants={fadeSlideUp} className="glass-card p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-white">{user.full_name}</p>
              <p className="text-xs text-slate-500 font-mono">{user.investor_code}</p>
            </div>
            <Badge status={user.status} />
          </div>

          <div className="grid grid-cols-2 gap-1 text-xs mb-3">
            <span className="text-slate-600">Email:</span>
            <span className="text-slate-400 truncate">{user.email}</span>
            <span className="text-slate-600">Investments:</span>
            <span className="text-slate-400">{user.investment_count}</span>
            <span className="text-slate-600">Total invested:</span>
            <span className="text-slate-400">
              UGX {Number(user.total_invested || 0).toLocaleString()}
            </span>
          </div>

          {user.role === 'investor' && (
            <Button
              variant={user.status === 'active' ? 'danger' : 'success'}
              size="sm"
              loading={acting === user.id}
              onClick={() => onToggleStatus?.(user)}
            >
              {user.status === 'active' ? 'Suspend' : 'Activate'}
            </Button>
          )}
        </motion.div>
      ))}
    </div>
  )
}