export const cardVariants = {
  hidden:   { opacity: 0, y: 24, scale: 0.97 },
  visible:  { opacity: 1, y: 0,  scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

export const listVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
}

export const itemVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0,
    transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}