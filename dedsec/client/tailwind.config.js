/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // DedSec custom color palette
        terminal: {
          bg: '#0a0a0a',        // Deep black background
          card: '#151515',       // Card/panel background
          border: '#1a1a1a',     // Subtle borders
          text: '#e0e0e0',       // Main text
          muted: '#808080',      // Muted text
        },
        matrix: {
          green: '#00ff41',      // Bright matrix green
          dark: '#00aa2e',       // Darker green for hover
          dim: '#004d1a',        // Very dim green for backgrounds
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
          '0%': { boxShadow: '0 0 5px #00ff41, 0 0 10px #00ff41' },
          '100%': { boxShadow: '0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41' },
        }
      }
    },
  },
  plugins: [],
}