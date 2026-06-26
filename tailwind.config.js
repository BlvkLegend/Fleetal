/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Fleetal: warm gray + forest teal
        teal: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        warm: {
          50:  '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'slide-in-right': 'slideInRight 0.22s ease-out',
        'slide-in-up':    'slideInUp 0.2s ease-out',
        'fade-in':        'fadeIn 0.15s ease-out',
        'scale-in':       'scaleIn 0.15s ease-out',
        'pulse-dot':      'pulseDot 2s infinite',
        'shimmer':        'shimmer 1.5s infinite',
      },
      keyframes: {
        slideInRight: { from: { transform: 'translateX(-10px)', opacity: 0 }, to: { transform: 'translateX(0)', opacity: 1 } },
        slideInUp:    { from: { transform: 'translateY(8px)',   opacity: 0 }, to: { transform: 'translateY(0)',  opacity: 1 } },
        fadeIn:       { from: { opacity: 0 }, to: { opacity: 1 } },
        scaleIn:      { from: { transform: 'scale(0.96)', opacity: 0 }, to: { transform: 'scale(1)', opacity: 1 } },
        pulseDot:     { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.35 } },
        shimmer:      { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      screens: {
        xs: '480px',
      },
    },
  },
  plugins: [],
}
