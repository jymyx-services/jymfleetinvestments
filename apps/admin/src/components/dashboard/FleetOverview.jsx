import { motion }                    from 'framer-motion'
import { useNavigate }               from 'react-router-dom'
import { Badge }                     from '../common/Badge'
import { listVariants, fadeSlideUp } from '../../animations/variants/page.variants'

export function FleetOverview({ fleets }) {
  const navigate = useNavigate()

  if (!fleets?.length) return null

  return (
    <motion.div variants={listVariants} initial="hidden" animate="visible"
      className="flex flex-col gap-2">
      {fleets.map(fleet => (
        <motion.div
          key={fleet.id}
          variants={fadeSlideUp}
          whileHover={{ y: -1 }}
          onClick={() => navigate('/admin/fleets')}
          className="glass-card px-4 py-3 flex items-center justify-between cursor-pointer
                     hover:border-white/15 transition-colors border border-white/5"
        >
          <div>
            <p className="text-sm font-medium text-white">{fleet.name}</p>
            <p className="text-xs text-slate-500">
              {fleet.investor_count || 0} investors ·
              UGX {Number(fleet.minimum_deposit).toLocaleString()} min
            </p>
          </div>
          <Badge status={fleet.status} />
        </motion.div>
      ))}
    </motion.div>
  )
}