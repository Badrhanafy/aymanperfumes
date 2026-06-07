/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'perfume-gold': '#111111',
        'perfume-cream': '#FAFAFA',
        'perfume-dark': '#050505',
      },
      fontFamily: {
        serif: ['Ascender', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
        ascender: ['Ascender', 'Georgia', 'serif'], // explicit utility: font-ascender
      },
    },
  },
  plugins: [],
}