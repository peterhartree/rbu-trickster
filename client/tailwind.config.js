/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Card suit colors - used dynamically
    'text-card-spade',
    'text-card-heart',
    'text-card-diamond',
    'text-card-club',
    // Table colors - used dynamically
    'bg-table-felt',
    'bg-table-dark',
    'bg-table-light',
    'from-table-dark',
    'from-table-light',
    'to-table-felt',
    'to-table-dark',
    // Turn indicator colors
    'bg-turn-active',
    'ring-turn-glow',
  ],
  theme: {
    extend: {
      colors: {
        table: {
          felt: '#0f5132',
          dark: '#0a3d24',
          light: '#198754',
        },
        card: {
          spade: '#1f2937',
          heart: '#dc2626',
          diamond: '#ea580c',
          club: '#059669',
        },
        turn: {
          active: '#f59e0b',
          glow: '#fbbf24',
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 1s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 200ms ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: 'inset 0 0 20px rgba(255,255,255,0.2), 0 0 30px rgba(251,191,36,0.3)',
          },
          '50%': {
            boxShadow: 'inset 0 0 40px rgba(255,255,255,0.4), 0 0 50px rgba(251,191,36,0.5)',
          },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'fade-in-up': {
          from: {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
}
