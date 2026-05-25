import { useState }                      from 'react'
import { useNavigate, useLocation }      from 'react-router-dom'
import { motion }                        from 'framer-motion'
import { authService }                   from '@/services/auth.service'
import { useAuthStore }                  from '@/store/auth.store'
import { usePushNotif }                  from '@/hooks/usePushNotif'
import { Button }                        from '@/components/common/Button'
import { fadeSlideUp, staggerContainer } from '@/animations/variants/list.variants'

export function RegisterPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const setAuth   = useAuthStore(s => s.setAuth)
  const { subscribe } = usePushNotif()

  const { codeData, inviteCode } = location.state || {}

  if (!codeData || !inviteCode) {
    navigate('/invite', { replace: true })
    return null
  }

  const [form, setForm] = useState({
    fullName:     codeData.investorName || '',
    email:        '',
    phone:        '',
    password:     '',
    confirm:      '',
    referralCode: ''
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function handleRegister(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      const payload = {
        inviteCode,
        fullName: form.fullName,
        email:    form.email,
        phone:    form.phone,
        password: form.password
      }
      if (form.referralCode.trim()) {
        payload.referralCode = form.referralCode.trim().toUpperCase()
      }

      const { data } = await authService.register(payload)
      setAuth(data.data.user, data.data.accessToken)
      subscribe()
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      variants={staggerContainer(0.07)}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-5"
    >
      <motion.div variants={fadeSlideUp} className="text-center mb-1">
        <h1 className="text-xl font-semibold text-white mb-1">Lets get your started </h1>
        <p className="text-sm text-slate-500">Set up ypour investor Profile to continue </p>
      </motion.div>

      {/* Investment summary */}
      <motion.div variants={fadeSlideUp}
        className="bg-emerald-500/10 border border-emerald-500/20
                   rounded-2xl px-4 py-3 flex justify-between items-center">
        <div>
          <p className="text-[10px] text-emerald-400/70 uppercase tracking-wider mb-0.5">
            Your investment
          </p>
          <p className="text-sm font-semibold text-emerald-300">
            UGX {Number(codeData.amount).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-emerald-400/70 uppercase tracking-wider mb-0.5">
            Units
          </p>
          <p className="text-sm font-semibold text-emerald-300">
            {codeData.units} {codeData.units === 1 ? 'unit' : 'units'}
          </p>
        </div>
      </motion.div>

      <motion.div variants={fadeSlideUp} className="glass-card p-6 flex flex-col gap-4">
        {[
          { key: 'fullName',  label: 'Full name',       type: 'text',     placeholder: 'As on your ID',     readonly: !!codeData.investorName },
          { key: 'email',     label: 'Email',            type: 'email',    placeholder: 'your@email.com'     },
          { key: 'phone',     label: 'Phone number',     type: 'tel',      placeholder: '+256 7XX XXX XXX'   },
          { key: 'password',  label: 'Password',         type: 'password', placeholder: '8+ characters'      },
          { key: 'confirm',   label: 'Confirm password', type: 'password', placeholder: 'Repeat password'    }
        ].map(field => (
          <div key={field.key}>
            <label className="text-xs text-slate-400 mb-1.5 block uppercase tracking-wider">
              {field.label}
            </label>
            <input
              type={field.type}
              value={form[field.key]}
              onChange={e => set(field.key, e.target.value)}
              placeholder={field.placeholder}
              readOnly={field.readonly}
              className={`input-field ${field.readonly ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
            {field.readonly && (
              <p className="text-[10px] text-slate-600 mt-1">
                Pre-filled from your office registration
              </p>
            )}
          </div>
        ))}

        {/* Referral code — optional */}
        <div>
          <label className="text-xs text-slate-400 mb-1.5 block uppercase tracking-wider">
            Referral code
            <span className="text-slate-600 normal-case tracking-normal ml-1">(optional)</span>
          </label>
          <input
            type="text"
            value={form.referralCode}
            onChange={e => set('referralCode', e.target.value.toUpperCase())}
            placeholder="e.g. JFI-00142"
            className="input-field font-mono tracking-wider"
            autoComplete="off"
            spellCheck={false}
          />
          <p className="text-[10px] text-slate-600 mt-1">
            If someone referred you, enter their investor ID here
          </p>
        </div>

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

        <Button onClick={handleRegister} loading={loading} size="lg" className="mt-1">
          Create account
        </Button>
      </motion.div>
    </motion.div>
  )
}