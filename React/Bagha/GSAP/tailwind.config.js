/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'bitcount': ['Bitcount Prop Single', 'sans-serif'],
        'anton' : ['Anton', 'sans-serif'],
      },
    },
  },
  plugins: [],
}