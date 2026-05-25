import React          from 'react'
import ReactDOM       from 'react-dom/client'
import Lenis          from 'lenis'
import gsap           from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import App            from './App'
import '@/styles/tokens.css'
import '@/styles/globals.css'

gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis({
  duration: 1.2,
  easing:   t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth:   true
})

gsap.ticker.add(time => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(reg => {
        console.log('[SW] Registered:', reg.scope)

        // Check for updates every 60 seconds
        setInterval(() => reg.update(), 60000)
      })
      .catch(err => console.warn('[SW] Registration failed:', err))
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)