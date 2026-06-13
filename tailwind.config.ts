import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#F0EEFF',
          100: '#E0DAFF',
          200: '#C4B8FF',
          300: '#A78BFA',
          400: '#8B6FE8',
          500: '#7C6FCD',  // primary
          600: '#6D5FC4',  // glow
          700: '#5B4FB8',
          800: '#3D3480',
          900: '#221D4A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      screens: {
        xs: '360px',
        sm: '390px',
        md: '430px',
      },
      // Safe area insets untuk notch/gesture bar Android
      spacing: {
        'safe-top':    'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left':   'env(safe-area-inset-left)',
        'safe-right':  'env(safe-area-inset-right)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-up':    'fadeUp .25s ease-out',
        'fade-in':    'fadeIn .2s ease-out',
        'scale-in':   'scaleIn .2s cubic-bezier(.34,1.56,.64,1)',
        'confetti':   'confetti .6s ease-out forwards',
        'ring-fill':  'ringFill .6s cubic-bezier(.4,0,.2,1)',
        'slide-up':   'slideUp .3s cubic-bezier(.4,0,.2,1)',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:    { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(.92)' }, to: { opacity: '1', transform: 'scale(1)' } },
        confetti:  { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.3) rotate(10deg)' }, '100%': { transform: 'scale(1)' } },
        ringFill:  { from: { strokeDashoffset: '251' }, to: { strokeDashoffset: '0' } },
        slideUp:   { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        pulseGlow: { '0%,100%': { opacity: '1' }, '50%': { opacity: '.5' } },
      },
    },
  },
  plugins: [],
} satisfies Config
