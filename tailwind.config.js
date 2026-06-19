/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pink: { neon: '#ff2d78' },
        yellow: { neon: '#ffe600' },
      },
      fontFamily: {
        heebo: ['Heebo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
