import { useRef } from 'react'
import { useCountUp } from '@/hooks/useCountUp'

export function EarningsCounter({ value, prefix = 'UGX ', className = '' }) {
  const ref = useRef(null)
  useCountUp(ref, value, 1.4, prefix)

  return (
    <span ref={ref} className={className}>
      {prefix}0
    </span>
  )
}