import { useState }       from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion }         from 'framer-motion'
import { authService }    from '@/services/auth.service'
import { useAuthStore }   from '@/store/auth.store'
import { Button }         from '@/components/common/Button'
import { fadeSlideUp, staggerContainer } from '@/animations/variants/list.variants'
import { usePushNotif } from '@/hooks/usePushNotif'

export function LoginPage() {
  const navigate   = useNavigate()
  const setAuth    = useAuthStore(s => s.setAuth)
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const { subscribe } = usePushNotif()

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authService.login(form.email, form.password)
      setAuth(data.data.user, data.data.accessToken)
      subscribe() 
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      variants={staggerContainer(0.08)}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-5"
    >
      {/* Header */}
      <motion.div variants={fadeSlideUp} className="text-center mb-2">
        <h1 className="text-xl font-semibold text-white mb-1">Welcome back</h1>
        <p className="text-sm text-slate-500">Sign in to your investor account</p>
      </motion.div>

      {/* Form card */}
      <motion.div variants={fadeSlideUp} className="glass-card p-6 flex flex-col gap-4">
        {/* Email */}
        <div>
          <label className="text-xs text-slate-400 mb-1.5 block uppercase tracking-wider">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="your@email.com"
            className="input-field"
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-xs text-slate-400 mb-1.5 block uppercase tracking-wider">
            Password
          </label>
          <input
            type="password"
            value={form.password}
            onChange={e => set('password', e.target.value)}
            placeholder="••••••••"
            className="input-field"
            autoComplete="current-password"
          />
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl
                       px-4 py-3 text-xs text-red-400"
          >
            {error}
          </motion.div>
        )}

        <Button
          onClick={handleLogin}
          loading={loading}
          size="lg"
          className="mt-1"
        >
          Sign in
        </Button>
      </motion.div>

      {/* New investor */}
      <motion.p variants={fadeSlideUp}
        className="text-center text-sm text-slate-500">
        New investor?{' '}
        <Link to="/invite"
          className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
          Register with invite code
        </Link>
      </motion.p>
    </motion.div>
  )
}