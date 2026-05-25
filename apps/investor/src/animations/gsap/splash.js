import gsap from 'gsap'

export function runSplashAnimation(logoRef, textRef, onComplete) {
  const tl = gsap.timeline({ onComplete })

  tl.set(logoRef.current,  { opacity: 0, scale: 0.8 })
    .set(textRef.current,  { opacity: 0, y: 12 })

    .to(logoRef.current, {
      opacity:  1,
      scale:    1,
      duration: 0.7,
      ease:     'back.out(1.4)'
    })
    .to(textRef.current, {
      opacity:  1,
      y:        0,
      duration: 0.5,
      ease:     'power3.out'
    }, '-=0.3')
    .to([logoRef.current, textRef.current], {
      opacity:  0,
      y:        -20,
      duration: 0.4,
      ease:     'power2.in',
      delay:    0.8
    })
}