/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './*.html', './src/**/*.{js,html}'],
  theme: {
    extend: {
      colors: {
        rose: {
          50: '#fff5f8',
          100: '#ffe4ee',
          200: '#ffc2dc',
          300: '#ff96c2',
          400: '#fb6ba4',
          500: '#f0428a',
          600: '#d62870',
          700: '#b01c5b',
          800: '#8c1a49',
          900: '#731a3f',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Tahoma', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
