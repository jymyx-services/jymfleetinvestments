import gsap from 'gsap'

export function animateDashboardEntrance(heroRef, statsRef, listRef) {
  const tl = gsap.timeline()

  tl.fromTo(heroRef.current,
    { opacity: 0, y: 30, scale: 0.96 },
    { opacity: 1, y: 0,  scale: 1, duration: 0.6, ease: 'power3.out' }
  )
  .fromTo(statsRef.current?.children || [],
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' },
    '-=0.3'
  )
  .fromTo(listRef.current?.children || [],
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out' },
    '-=0.2'
  )
}