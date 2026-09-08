/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cobble: {
          900: '#1a1f2e',
          800: '#232a3e',
          700: '#2d364f',
          600: '#3a4666',
          500: '#4a5982',
          400: '#6474a0',
          300: '#8695b8',
          200: '#abb6cf',
          100: '#d5dae6',
          50: '#eaedf3'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
