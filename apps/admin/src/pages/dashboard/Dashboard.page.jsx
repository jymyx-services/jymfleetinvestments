import { useEffect, useState }       from 'react'
import { useNavigate }               from 'react-router-dom'
import { motion }                    from 'framer-motion'
import { adminService }              from '../../services/admin.service'
import { Badge }                     from '../../components/common/Badge'
import { Loader }                    from '../../components/common/Loader'
import { listVariants, fadeSlideUp } from '../../animations/variants/page.variants'

export function DashboardPage() {
  const navigate = useNavigate()
  const [fleets,       setFleets]       = useState([])
  const [pendingSales, setPendingSales] = useState([])
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    Promise.all([adminService.getAllFleets(), adminService.getPendingSales()])
      .then(([f, s]) => {
        setFleets(f.data.data)
        setPendingSales(s.data.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  const activeFleets  = fleets.filter(f => f.status === 'active').length
  const totalInvestors = fleets.reduce((s, f) => s + Number(f.investor_count || 0), 0)

  return (
    <motion.div variants={listVariants} initial="hidden" animate="visible"
      className="flex flex-col gap-5">

      {/* Stats row */}
      <motion.div variants={fadeSlideUp} className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total investors', value: totalInvestors, icon: '👥' },
          { label: 'Active fleets',   value: `${activeFleets} / ${fleets.length}`, icon: '🏗️' }
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <div className="text-xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-white mb-0.5">{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Pending actions */}
      {pendingSales.length > 0 && (
        <motion.div variants={fadeSlideUp}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Pending actions
            </h2>
            <span className="bg-red-500/15 border border-red-500/20 text-red-400
                             text-xs font-medium px-2.5 py-1 rounded-full">
              {pendingSales.length} urgent
            </span>
          </div>
          <motion.div
            whileHover={{ y: -2 }}
            onClick={() => navigate('/admin/unit-sales')}
            className="glass-card p-4 cursor-pointer border border-red-500/15
                       hover:border-red-500/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white mb-0.5">
                  Unit sale requests
                </p>
                <p className="text-xs text-slate-500">
                  {pendingSales.length} awaiting your approval
                </p>
              </div>
              <svg className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Quick actions */}
      <motion.div variants={fadeSlideUp}>
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Quick actions
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Enter earnings',  path: '/admin/earnings',     color: 'emerald' },
            { label: 'Generate code',   path: '/admin/invite-codes', color: 'blue'    },
            { label: 'Manage fleets',   path: '/admin/fleets',       color: 'amber'   },
            { label: 'View investors',  path: '/admin/investors',    color: 'purple'  }
          ].map(a => (
            <motion.button
              key={a.label}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(a.path)}
              className="glass-card p-4 text-left hover:border-white/15
                         transition-colors border border-white/5"
            >
              <p className="text-sm font-medium text-white">{a.label}</p>
              <svg className="w-4 h-4 text-slate-600 mt-2" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Fleet status list */}
      <motion.div variants={fadeSlideUp}>
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Fleet status
        </h2>
        <div className="flex flex-col gap-2">
          {fleets.map(fleet => (
            <div key={fleet.id} className="glass-card px-4 py-3
                                           flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{fleet.name}</p>
                <p className="text-xs text-slate-500">
                  {fleet.investor_count} investors ·
                  UGX {Number(fleet.minimum_deposit).toLocaleString()} min
                </p>
              </div>
              <Badge status={fleet.status} />
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}