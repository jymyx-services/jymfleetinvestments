import { useState }     from 'react'
import { useNavigate }  from 'react-router-dom'
import { motion }       from 'framer-motion'
import { adminService } from '../../services/admin.service'
import { useAuthStore } from '../../store/auth.store'
import { Button }       from '../../components/common/Button'
import { fadeSlideUp, listVariants } from '../../animations/variants/page.variants'
import { useAdminPush }  from '../../hooks/useAdminPush'
import { api }           from '../../services/api'

export function LoginPage() {
  const navigate  = useNavigate()
  const setAuth   = useAuthStore(s => s.setAuth)
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const { subscribe } = useAdminPush()

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await adminService.login(form.email, form.password)
      const user = data.data.user
      if (user.role !== 'admin' && user.role !== 'superadmin') {
        throw { message: 'Access denied. Admin accounts only.' }
      }
      setAuth(user, data.data.accessToken)
      subscribe(api)  
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center
                    justify-center px-5 py-12 relative">
      {/* Ambient glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px]
                      bg-emerald-500/8 blur-[90px] rounded-full pointer-events-none"/>
      <div className="fixed bottom-0 right-0 w-[350px] h-[350px]
                      bg-amber-500/5 blur-[100px] rounded-full pointer-events-none"/>

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-sm flex flex-col gap-5"
      >
        {/* Logo */}
        <motion.div variants={fadeSlideUp} className="text-center mb-2">
          <div className="text-3xl font-black tracking-tight text-white mb-1">JFI</div>
          <div className="text-xs text-slate-500 tracking-[0.25em] uppercase">
            Admin Portal
          </div>
        </motion.div>

        {/* Card */}
        <motion.div variants={fadeSlideUp} className="glass-card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center
                            justify-center">
              <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Secure admin access</p>
              <p className="text-xs text-slate-500">Admin accounts only</p>
            </div>
          </div>

          {[
            { key: 'email',    label: 'Email',    type: 'email',    placeholder: 'email@domain.com' },
            { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' }
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">
                {f.label}
              </label>
              <input
                type={f.type}
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="input-field"
                onKeyDown={e => e.key === 'Enter' && handleLogin(e)}
              />
            </div>
          ))}

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl
                         px-4 py-3 text-xs text-red-400">
              {error}
            </motion.div>
          )}

          <Button onClick={handleLogin} loading={loading} size="lg">
            Sign in to admin
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}