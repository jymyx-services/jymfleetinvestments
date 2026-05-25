export const pageVariants = {
  initial: { opacity: 0, y: 16 },
  enter:   { opacity: 1, y: 0,  transition: { duration: 0.35, ease: [0.25,0.46,0.45,0.94] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2,  ease: 'easeIn' } }
}

export const fadeSlideUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0,
    transition: { duration: 0.38, ease: [0.25,0.46,0.45,0.94] }
  }
}

export const listVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } }
}

export const staggerContainer = (stagger = 0.07, delay = 0) => ({
  hidden:  {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } }
})