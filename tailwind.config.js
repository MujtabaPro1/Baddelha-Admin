/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e6eef7',
          100: '#ccdcef',
          200: '#99badf',
          300: '#6697ce',
          400: '#3375be',
          500: '#0055b3',
          600: '#003B7E',  // brand default
          700: '#002d61',
          800: '#001f44',
          900: '#001228',
          DEFAULT: '#003B7E',
        },
      },
    },
  },
  plugins: [],
};
