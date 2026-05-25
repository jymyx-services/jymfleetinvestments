import React    from 'react'
import ReactDOM from 'react-dom/client'
import App      from './App'
import './styles/tokens.css'
import './styles/globals.css'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(reg => console.log('[SW] Admin registered:', reg.scope))
      .catch(err => console.warn('[SW] Failed:', err))
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)