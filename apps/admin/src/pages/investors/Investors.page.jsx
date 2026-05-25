import { useEffect, useState }       from 'react'
import { motion }                    from 'framer-motion'
import { adminService }              from '../../services/admin.service'
import { Badge }                     from '../../components/common/Badge'
import { Button }                    from '../../components/common/Button'
import { Loader }                    from '../../components/common/Loader'
import { listVariants, fadeSlideUp } from '../../animations/variants/page.variants'

export function InvestorsPage() {
  const [users,    setUsers]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [acting,   setActing]   = useState(null)

  useEffect(() => { load() }, [])

  async function load(q = '') {
    setLoading(true)
    try {
      const r = await adminService.getAllUsers(q)
      setUsers(r.data.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  function handleSearch(e) {
    setSearch(e.target.value)
    const q = e.target.value
    const timer = setTimeout(() => load(q), 400)
    return () => clearTimeout(timer)
  }

  async function toggleStatus(user) {
    setActing(user.id)
    try {
      if (user.status === 'active') await adminService.suspendUser(user.id)
      else await adminService.activateUser(user.id)
      await load(search)
    } catch (e) { console.error(e) }
    finally { setActing(null) }
  }

  return (
    <motion.div variants={listVariants} initial="hidden" animate="visible"
      className="flex flex-col gap-4">

      <motion.div variants={fadeSlideUp}
        className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Investors</h1>
        <span className="text-xs text-slate-500">{users.length} results</span>
      </motion.div>

      <motion.div variants={fadeSlideUp}>
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search by name, ID, email, phone..."
          className="input-field"
        />
      </motion.div>

      {loading ? <Loader /> : (
        <div className="flex flex-col gap-2">
          {users.map(user => (
            <motion.div key={user.id} variants={fadeSlideUp}
              className="glass-card p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-white">{user.full_name}</p>
                  <p className="text-xs text-slate-500 font-mono">{user.investor_code}</p>
                </div>
                <Badge status={user.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div>
                  <span className="text-slate-600">Email: </span>
                  <span className="text-slate-400">{user.email}</span>
                </div>
                <div>
                  <span className="text-slate-600">Investments: </span>
                  <span className="text-slate-400">{user.investment_count}</span>
                </div>
                <div>
                  <span className="text-slate-600">Total invested: </span>
                  <span className="text-slate-400">
                    UGX {Number(user.total_invested || 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Since: </span>
                  <span className="text-slate-400">
                    {new Date(user.created_at).toLocaleDateString('en-UG', {
                      month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {user.role === 'investor' && (
                <Button
                  variant={user.status === 'active' ? 'danger' : 'success'}
                  size="sm"
                  loading={acting === user.id}
                  onClick={() => toggleStatus(user)}
                >
                  {user.status === 'active' ? 'Suspend' : 'Activate'}
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}