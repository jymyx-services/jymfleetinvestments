import { useEffect, useState }       from 'react'
import { motion }                    from 'framer-motion'
import { adminService }              from '../../services/admin.service'
import { Button }                    from '../../components/common/Button'
import { Loader }                    from '../../components/common/Loader'
import { listVariants, fadeSlideUp } from '../../animations/variants/page.variants'

function fmt(v) { return Number(v || 0).toLocaleString() }

export function UnitSalesPage() {
  const [sales,   setSales]   = useState([])
  const [loading, setLoading] = useState(true)
  const [acting,  setActing]  = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const r = await adminService.getPendingSales()
      setSales(r.data.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function handleApprove(id) {
    setActing(id + '-approve')
    try {
      await adminService.approveSale(id)
      await load()
    } catch (e) { console.error(e) }
    finally { setActing(null) }
  }

  async function handleReject(id) {
    setActing(id + '-reject')
    try {
      await adminService.rejectSale(id, '')
      await load()
    } catch (e) { console.error(e) }
    finally { setActing(null) }
  }

  if (loading) return <Loader />

  return (
    <motion.div variants={listVariants} initial="hidden" animate="visible"
      className="flex flex-col gap-5">

      <motion.div variants={fadeSlideUp} className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Unit sale queue</h1>
        {sales.length > 0 && (
          <span className="bg-red-500/15 border border-red-500/20 text-red-400
                           text-xs font-medium px-2.5 py-1 rounded-full">
            {sales.length} pending
          </span>
        )}
      </motion.div>

      {sales.length === 0 ? (
        <motion.div variants={fadeSlideUp} className="glass-card p-10 text-center">
          <p className="text-slate-500 text-sm">No pending sale requests</p>
        </motion.div>
      ) : (
        sales.map(sale => (
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

            {/* Financials */}
            <div className="bg-white/4 rounded-2xl p-4 flex flex-col gap-2.5 mb-4">
              {[
                { label: 'Fleet',           value: sale.fleet_name,            color: 'text-white' },
                { label: 'Units to sell',   value: sale.units_to_sell,         color: 'text-white' },
                { label: 'Gross value',     value: `UGX ${fmt(sale.gross_value)}`, color: 'text-white' },
                { label: 'Company fee (3%)', value: `− UGX ${fmt(sale.fee_amount)}`, color: 'text-red-400' },
                { label: 'Investor receives', value: `UGX ${fmt(sale.net_value)}`, color: 'text-emerald-400' }
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
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                loading={acting === sale.id + '-reject'}
                onClick={() => handleReject(sale.id)}
              >
                Reject
              </Button>
              <Button
                variant="success"
                size="sm"
                className="flex-1"
                loading={acting === sale.id + '-approve'}
                onClick={() => handleApprove(sale.id)}
              >
                Approve
              </Button>
            </div>
          </motion.div>
        ))
      )}
    </motion.div>
  )
}