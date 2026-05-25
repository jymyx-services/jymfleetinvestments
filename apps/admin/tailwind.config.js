/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#04081a',
          900: '#0a0f1e',
          800: '#0f1629',
          700: '#161f38',
          600: '#1e2d4f'
        },
        emerald: {
          300: '#FCD472',
          400: '#F5B800',
          500: '#E8A000',
          600: '#CC8C00'
        },
        gold: {
          300: '#FCD472',
          400: '#F5B800',
          500: '#E8A000',
          600: '#CC8C00'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    }
  },
  plugins: []
}