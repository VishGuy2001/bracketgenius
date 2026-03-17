/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        genius: {
          black:   '#07080A',
          darkest: '#0D0F14',
          dark:    '#141720',
          card:    '#1A1E2B',
          border:  '#252A3A',
          muted:   '#3A4060',
          gold:    '#F0B429',
          'gold-light': '#FFD166',
          orange:  '#FF6B2B',
          blue:    '#3D7FFF',
          'blue-light': '#6FA3FF',
          teal:    '#00D4AA',
          purple:  '#8B5CF6',
          pink:    '#EC4899',
          white:   '#F0F2FF',
        }
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        heading: ['"DM Sans"', 'sans-serif'],
        body:    ['"Inter"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'court-grid': "linear-gradient(rgba(61,127,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(61,127,255,0.04) 1px, transparent 1px)",
        'genius-gradient': 'linear-gradient(135deg, #F0B429 0%, #FF6B2B 50%, #8B5CF6 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(26,30,43,0.9) 0%, rgba(13,15,20,0.95) 100%)',
      },
      backgroundSize: {
        'grid-40': '40px 40px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'glow-ring': 'glowRing 3s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'bracket-draw': 'bracketDraw 1.5s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' }
        },
        pulseGold: {
          '0%,100%': { boxShadow: '0 0 20px rgba(240,180,41,0.3)' },
          '50%': { boxShadow: '0 0 50px rgba(240,180,41,0.7)' }
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' }
        },
        glowRing: {
          '0%,100%': { opacity: '0.4' },
          '50%': { opacity: '1' }
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        bracketDraw: {
          from: { strokeDashoffset: '1000' },
          to:   { strokeDashoffset: '0' }
        }
      },
      boxShadow: {
        'gold': '0 0 30px rgba(240,180,41,0.4)',
        'blue': '0 0 30px rgba(61,127,255,0.4)',
        'card': '0 4px 40px rgba(0,0,0,0.4)',
        'inner-gold': 'inset 0 1px 0 rgba(240,180,41,0.2)',
      }
    }
  },
  plugins: []
}
