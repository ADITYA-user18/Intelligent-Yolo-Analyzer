/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // 🎨 Dynamic Theme Palette (Pointed to CSS Variables)
      colors: {
        'ui-black': 'var(--ui-bg)',
        'ui-surface': 'var(--ui-surface)',
        'ui-card': 'var(--ui-card)',
        'ui-card-hover': 'var(--ui-card-hover)',
        'ui-accent': 'var(--ui-accent)',
        'ui-purple': 'var(--ui-purple)',
        'ui-border': 'var(--ui-border)',
        'ui-text': 'var(--ui-text)',
        'ui-muted': 'var(--ui-text-muted)',
      },

      // 📱 Responsive Breakpoints
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },

      // ⚡ Animations
      animation: {
        'slow-drift': 'drift 20s infinite linear',
        'subtle-glow': 'glow 4s infinite ease-in-out',
        'scan': 'scan 6s linear infinite',
        'grid-pulse': 'gridPulse 8s ease-in-out infinite',
        'blob': 'blob 12s infinite ease-in-out',
      },

      // 🧠 Keyframes
      keyframes: {
        drift: {
          '0%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(10px, 10px)' },
          '100%': { transform: 'translate(0, 0)' },
        },
        glow: {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 0.8 },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        gridPulse: {
          '0%, 100%': { opacity: 0.15 },
          '50%': { opacity: 0.3 },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      }
    },
  },
  plugins: [],
}