import { useEffect, useState }        from 'react'
import { useParams, useNavigate }     from 'react-router-dom'
import { motion }                     from 'framer-motion'
import { fleetService }               from '@/services/fleet.service'
import { investmentService }          from '@/services/investment.service'
import { FleetDetail }                from '@/components/fleet/FleetDetail'
import { Loader }                     from '@/components/common/Loader'
import { fadeSlideUp }                from '@/animations/variants/list.variants'

export function FleetDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [fleet,      setFleet]      = useState(null)
  const [investment, setInvestment] = useState(null)
  const [history,    setHistory]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [fleetRes, myFleets] = await Promise.all([
          fleetService.getFleetById(id),
          fleetService.getMyFleets()
        ])

        const fleetData = fleetRes.data.data
        const inv = myFleets.data.data.find(f => f.fleet_id === id)

        if (!inv) {
          setError('You do not have an investment in this fleet')
          setLoading(false)
          return
        }

        const histRes = await investmentService.getHistory(inv.investment_id)

        setFleet(fleetData)
        setInvestment(inv)
        setHistory(histRes.data.data)
      } catch {
        setError('Failed to load fleet details')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <Loader />

  return (
    <div className="flex flex-col gap-4">
      <motion.button
        variants={fadeSlideUp}
        initial="hidden"
        animate="visible"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500
                   hover:text-slate-300 transition-colors w-fit"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        <span className="text-sm">Back</span>
      </motion.button>

      {error ? (
        <motion.div variants={fadeSlideUp} initial="hidden" animate="visible"
          className="glass-card p-8 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </motion.div>
      ) : (
        <FleetDetail fleet={fleet} investment={investment} history={history} />
      )}
    </div>
  )
}