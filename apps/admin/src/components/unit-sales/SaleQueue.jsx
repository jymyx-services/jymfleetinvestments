import { motion }      from 'framer-motion'
import { Button }      from '../common/Button'
import { fadeSlideUp } from '../../animations/variants/page.variants'

function fmt(v) { return Number(v || 0).toLocaleString() }

export function SaleQueue({ sales, acting, onApprove, onReject }) {
  if (!sales?.length) {
    return (
      <div className="glass-card p-10 text-center">
        <p className="text-slate-500 text-sm">No pending sale requests</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {sales.map(sale => (
        <motion.div key={sale.id} variants={fadeSlideUp} className="glass-card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-white">{sale.full_name}</p>
              <p className="text-xs text-slate-500 font-mono">{sale.investor_code}</p>
            </div>
            <span className="text-xs text-slate-500">
              {new Date(sale.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="bg-white/4 rounded-2xl p-4 flex flex-col gap-2.5 mb-4">
            {[
              { label: 'Fleet',             value: sale.fleet_name,                    color: 'text-white'      },
              { label: 'Units to sell',     value: sale.units_to_sell,                 color: 'text-white'      },
              { label: 'Gross value',       value: `UGX ${fmt(sale.gross_value)}`,     color: 'text-white'      },
              { label: 'Company fee (3%)',  value: `− UGX ${fmt(sale.fee_amount)}`,    color: 'text-red-400'    },
              { label: 'Investor receives', value: `UGX ${fmt(sale.net_value)}`,       color: 'text-emerald-400'}
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center">
                <span className="text-xs text-slate-500">{row.label}</span>
                <span className={`text-sm font-semibold font-mono ${row.color}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="danger" size="sm" className="flex-1"
              loading={acting === sale.id + '-reject'}
              onClick={() => onReject?.(sale.id)}>
              Reject
            </Button>
            <Button variant="success" size="sm" className="flex-1"
              loading={acting === sale.id + '-approve'}
              onClick={() => onApprove?.(sale.id)}>
              Approve
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}