import { motion }                                   from 'framer-motion'
import { staggerContainer, fadeSlideUp }             from '@/animations/variants/list.variants'
import { EarningsTable }                             from '@/components/fleet/EarningsTable'
import { FleetStatusPulse }                          from '@/components/dashboard/FleetStatusPulse'
import { Badge }                                     from '@/components/common/Badge'

export function FleetDetail({
  fleet,
  investment,
  history = [],
  tourStatsRef,
  tourHistoryRef
}) {
  const fmt = (v) => Number(v || 0).toLocaleString()

  const stats = [
    { label: 'Units held',      value: investment?.units ?? 0 },
    { label: 'Invested',        value: `UGX ${fmt(investment?.invested_amount)}` },
    { label: 'Total earned',    value: `UGX ${fmt(investment?.total_earned)}` },
    { label: "Today's earning", value: `UGX ${fmt(investment?.today_earned)}` }
  ]

  return (
    <motion.div
      variants={staggerContainer(0.08)}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-4"
    >
      {/* Fleet header */}
      <motion.div variants={fadeSlideUp} className="glass-card p-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <FleetStatusPulse status={fleet?.fleet_status || fleet?.status} />
            <h2 className="text-lg font-semibold">
              {fleet?.fleet_name || fleet?.name}
            </h2>
          </div>
          <Badge status={fleet?.fleet_status || fleet?.status} />
        </div>
        {fleet?.description && (
          <p className="text-xs text-slate-500 mt-1">{fleet.description}</p>
        )}
      </motion.div>

      {/* Stats grid */}
      <motion.div
        ref={tourStatsRef}
        variants={fadeSlideUp}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-4">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">
              {s.label}
            </span>
            <span className="text-sm font-semibold font-mono text-emerald-400">
              {s.value}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Earnings history */}
      <motion.div ref={tourHistoryRef} variants={fadeSlideUp}>
        <h3 className="text-sm font-medium text-slate-400 mb-2">
          Earnings history
        </h3>
        <EarningsTable history={history} />
      </motion.div>
    </motion.div>
  )
}