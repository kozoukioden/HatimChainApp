/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#01241e',
        surface: '#032b23',
        card: '#0a3d32',
        accent: '#70c5bb',
        gold: '#D4AF37',
        danger: '#ef4444',
        muted: '#a8c5bf',
      },
    },
  },
  plugins: [],
}
