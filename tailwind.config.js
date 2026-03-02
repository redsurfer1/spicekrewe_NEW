/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        'spice-purple': '#4d2f91',
        'spice-blue': '#0078cd',
      },
    },
  },
  plugins: [],
};
