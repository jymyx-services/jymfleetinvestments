import { useState }       from 'react'
import { useNavigate }    from 'react-router-dom'
import { motion }         from 'framer-motion'
import { authService }    from '@/services/auth.service'
import { Button }         from '@/components/common/Button'
import { fadeSlideUp, staggerContainer } from '@/animations/variants/list.variants'

export function InviteCodePage() {
  const navigate = useNavigate()
  const [code, setCode]       = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  // Format input as JYX-XXXX-XXXX-XXXX automatically
  function handleCodeInput(e) {
    const raw = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 15)
    const parts = raw.match(/.{1,4}/g) || []
    setCode(parts.join('-'))
  }

  async function handleValidate(e) {
    e.preventDefault()
    setError('')
    if (code.replace(/-/g, '').length < 15) {
      setError('Please enter your full invite code')
      return
    }
    setLoading(true)
    try {
      const { data } = await authService.validateCode(code)
      // Pass validated data to register page
      navigate('/register', { state: { codeData: data.data, inviteCode: code } })
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid invite code')
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
      <motion.div variants={fadeSlideUp} className="text-center mb-2">
        <h1 className="text-xl font-semibold text-white mb-1">Enter invite code</h1>
        <p className="text-sm text-slate-500">
          Your code was provided when you made your investment at our office
        </p>
      </motion.div>

      <motion.div variants={fadeSlideUp} className="glass-card p-6 flex flex-col gap-4">
        <div>
          <label className="text-xs text-slate-400 mb-1.5 block uppercase tracking-wider">
            Invite code
          </label>
          <input
            type="text"
            value={code}
            onChange={handleCodeInput}
            placeholder="JYX-XXXX-XXXX-XXXX"
            className="input-field text-center font-mono tracking-[0.2em] text-base uppercase"
            autoComplete="off"
            spellCheck={false}
          />
          <p className="text-[10px] text-slate-600 mt-2 text-center">
            Format: JYX-XXXX-XXXX-XXXX
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

        <Button onClick={handleValidate} loading={loading} size="lg">
          Verify code
        </Button>
      </motion.div>

      <motion.p variants={fadeSlideUp}
        className="text-center text-sm text-slate-500">
        Already registered?{' '}
        <a onClick={() => navigate('/login')}
          className="text-emerald-400 hover:text-emerald-300
                     transition-colors font-medium cursor-pointer">
          Sign in
        </a>
      </motion.p>
    </motion.div>
  )
}