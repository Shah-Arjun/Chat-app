
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs: '475px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Chat bubble palette
        sender: {
          from: '#06b6d4',   // cyan-500
          to:   '#3b82f6',   // blue-500
        },
        receiver: {
          bg:     'rgba(30,41,59,0.9)',  // slate-800/90
          border: 'rgba(51,65,85,0.6)',  // slate-700/60
        },
        // Surface tokens
        surface: {
          sidebar:  'rgba(15,23,42,0.95)',   // slate-900/95
          chat:     'rgba(2,6,23,0.40)',     // slate-950/40
          input:    'rgba(30,41,59,0.80)',   // slate-800/80
          overlay:  'rgba(0,0,0,0.75)',
        },
      },
      borderRadius: {
        'bubble': '1.25rem',
        'bubble-tl': '0.25rem',
        'bubble-tr': '0.25rem',
        'bubble-bl': '0.25rem',
        'bubble-br': '0.25rem',
      },
      boxShadow: {
        'glow-cyan':  '0 0 12px rgba(6,182,212,0.45)',
        'glow-blue':  '0 0 12px rgba(59,130,246,0.35)',
        'glow-bar':   '0 0 8px rgba(6,182,212,0.8)',
        'sender-msg': '0 2px 12px rgba(6,182,212,0.20)',
        'panel':      '0 8px 32px rgba(0,0,0,0.5)',
      },
      animation: {
        'border':         'border 4s linear infinite',
        'shimmer':        'shimmer 1.6s linear infinite',
        'typing-bounce':  'typing-bounce 1.2s ease-in-out infinite',
        'slide-up':       'slide-up 0.22s cubic-bezier(0.16,1,0.3,1) forwards',
        'drawer-in':      'drawer-in 0.28s cubic-bezier(0.16,1,0.3,1) forwards',
        'drawer-out':     'drawer-out 0.22s cubic-bezier(0.4,0,1,1) forwards',
        'fade-scale-in':  'fade-scale-in 0.18s cubic-bezier(0.16,1,0.3,1) forwards',
        'pulse-dot':      'pulse-dot 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        'border': {
          to: { '--border-angle': '360deg' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'typing-bounce': {
          '0%, 60%, 100%': { transform: 'translateY(0)',    opacity: '0.4' },
          '30%':           { transform: 'translateY(-6px)', opacity: '1'   },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.97)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)'      },
        },
        'drawer-in': {
          from: { opacity: '0', transform: 'translateX(-100%)' },
          to:   { opacity: '1', transform: 'translateX(0)'     },
        },
        'drawer-out': {
          from: { opacity: '1', transform: 'translateX(0)'      },
          to:   { opacity: '0', transform: 'translateX(-100%)' },
        },
        'fade-scale-in': {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to:   { opacity: '1', transform: 'scale(1)'    },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1'   },
          '50%':      { opacity: '0.4' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}