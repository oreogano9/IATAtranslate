/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace']
      },
      boxShadow: {
        glow: '0 20px 60px -20px rgba(45, 212, 191, 0.6)'
      },
      backgroundImage: {
        grid: 'radial-gradient(rgba(15, 23, 42, 0.08) 1px, transparent 1px)'
      }
    }
  },
  plugins: []
};
