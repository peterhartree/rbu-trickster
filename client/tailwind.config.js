/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Art Deco base colors - all variants
    { pattern: /bg-deco-(navy|midnight|gold|gold-light|cream|bronze|accent)/ },
    { pattern: /text-deco-(navy|midnight|gold|gold-light|cream|bronze|accent)/ },
    { pattern: /border-deco-(navy|midnight|gold|gold-light|cream|bronze|accent)/ },
    { pattern: /ring-deco-(navy|midnight|gold|gold-light|cream|bronze|accent)/ },
    { pattern: /ring-offset-deco-(navy|midnight|gold)/ },
    // Gradient classes
    { pattern: /from-deco-(navy|midnight|gold|gold-light|cream)/ },
    { pattern: /via-deco-(navy|midnight|gold|gold-light|cream)/ },
    { pattern: /to-deco-(navy|midnight|gold|gold-light|cream)/ },
    // Card suit colors
    { pattern: /text-deco-(spade|heart|diamond|club)/ },
    { pattern: /bg-deco-(spade|heart|diamond|club)/ },
    // Shadow classes
    'shadow-deco',
    'shadow-deco-lg',
    'shadow-gold',
    // Font
    'font-display',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        // Art Deco palette
        deco: {
          navy: '#0a1628',
          midnight: '#152238',
          gold: '#d4af37',
          'gold-light': '#f4e4bc',
          cream: '#faf8f5',
          bronze: '#8b7355',
          accent: '#1a3a5c',
        },
        // Card suit colours - classic with character
        'deco-spade': '#1a1a2e',
        'deco-heart': '#8b0000',
        'deco-diamond': '#b45309',
        'deco-club': '#1a4d3e',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 1s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 200ms ease-out',
        'gold-shimmer': 'gold-shimmer 3s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: 'inset 0 0 20px rgba(212,175,55,0.2), 0 0 30px rgba(212,175,55,0.3)',
          },
          '50%': {
            boxShadow: 'inset 0 0 40px rgba(212,175,55,0.4), 0 0 50px rgba(212,175,55,0.5)',
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
        'gold-shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      boxShadow: {
        'deco': '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(212, 175, 55, 0.1)',
        'deco-lg': '0 10px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(212, 175, 55, 0.15)',
        'gold': '0 0 20px rgba(212, 175, 55, 0.3)',
      },
    },
  },
  plugins: [],
}
