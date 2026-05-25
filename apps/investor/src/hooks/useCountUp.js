import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function useCountUp(ref, target, duration = 1.4, prefix = '') {
  const prevTarget = useRef(0)

  useEffect(() => {
    if (!ref.current || target === undefined || target === null) return

    const counter = { val: prevTarget.current }

    gsap.to(counter, {
      val:      target,
      duration,
      ease:     'power3.out',
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent =
            prefix + Math.round(counter.val).toLocaleString()
        }
      }
    })

    prevTarget.current = target
  }, [target])
}