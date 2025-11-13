/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // DedSec custom color palette - Dark Purple Theme
        terminal: {
          bg: '#0a0a0f',         // Deep dark with purple tint
          card: '#13131a',       // Card/panel background with purple tint
          border: 'rgba(132, 0, 255, 0.2)',  // Subtle purple borders
          text: '#ffffff',       // Pure white text
          muted: 'rgba(255, 255, 255, 0.6)', // Muted white text
        },
        matrix: {
          green: '#8400FF',      // Primary purple (keeping name for compatibility)
          dark: '#6b00cc',       // Darker purple for hover
          dim: 'rgba(132, 0, 255, 0.2)',  // Dim purple for backgrounds
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(132, 0, 255, 0.5), 0 0 10px rgba(132, 0, 255, 0.3)' },
          '100%': { boxShadow: '0 0 10px rgba(132, 0, 255, 0.6), 0 0 20px rgba(132, 0, 255, 0.4), 0 0 30px rgba(132, 0, 255, 0.2)' },
        }
      }
    },
  },
  plugins: [],
}