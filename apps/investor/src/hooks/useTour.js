import { useState, useEffect, useRef } from 'react'
import { useAuthStore }                 from '@/store/auth.store'
import { tourService }                  from '@/services/tour.service'

export function useTour(screenName, steps) {
  const user      = useAuthStore(s => s.user)
  const setAuth   = useAuthStore(s => s.setAuth)
  const accessToken = useAuthStore(s => s.accessToken)

  const [active,  setActive]  = useState(false)
  const [step,    setStep]    = useState(0)
  const [ready,   setReady]   = useState(false)
  const marked = useRef(false)

  useEffect(() => {
    if (!user) return

    // Check if this screen has already been toured
    const alreadySeen = user.toured_screens?.[screenName]
    if (alreadySeen) return

    // Wait for the screen to fully render before starting
    const timer = setTimeout(() => setReady(true), 700)
    return () => clearTimeout(timer)
  }, [user, screenName])

  useEffect(() => {
    if (ready) setActive(true)
  }, [ready])

  function next() {
    if (step < steps.length - 1) {
      setStep(s => s + 1)
    } else {
      finish()
    }
  }

  function skip() {
    finish()
  }

  function finish() {
    if (marked.current) return
    marked.current = true
    setActive(false)
    setStep(0)

    // Mark in DB — fire and forget
    tourService.markToured(screenName).then(() => {
      // Update local user toured_screens so tour
      // never re-triggers without a page reload
      if (user && setAuth) {
        setAuth(
          {
            ...user,
            toured_screens: {
              ...(user.toured_screens || {}),
              [screenName]: true
            }
          },
          accessToken
        )
      }
    }).catch(() => {})
  }

  return { active, step, next, skip, total: steps.length }
}