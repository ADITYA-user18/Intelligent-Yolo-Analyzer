/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // Custom "Cyber-Agent" Color Palette
      colors: {
        'ui-black': '#050505',      // Deepest Black for background
        'ui-card': '#0f0f0f',       // Slightly lighter for cards
        'ui-accent': '#00ff88',     // Cyber Green (The YOLO theme)
        'ui-purple': '#8b5cf6',     // Soft AI Purple
        'ui-border': 'rgba(255, 255, 255, 0.08)', // Subtle borders
        'ui-text': '#f3f4f6',       // Off-white for readability
      },
      // Responsive Breakpoints (Mobile First)
      screens: {
        'xs': '475px',    // Extra small phones
        'sm': '640px',    // Standard phones
        'md': '768px',    // Tablets
        'lg': '1024px',   // Laptops
        'xl': '1280px',   // Desktops
        '2xl': '1536px',  // Ultra-wide
      },
      // Animation Keyframes for a "Living" UI
      animation: {
        'slow-drift': 'drift 20s infinite linear',
        'subtle-glow': 'glow 4s infinite ease-in-out',
      },
      keyframes: {
        drift: {
          '0%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(10px, 10px)' },
          '100%': { transform: 'translate(0, 0)' },
        },
        glow: {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 0.8 },
        }
      }
    },
  },
  plugins: [],
}