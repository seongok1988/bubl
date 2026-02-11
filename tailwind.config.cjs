/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf8f3',
          100: '#f5f0e6',
          200: '#e8ddc4',
          300: '#d4bc8e',
          400: '#c6a66b',
          500: '#b8914d',
          600: '#a67c3d',
          700: '#8a6534',
          800: '#715230',
          900: '#5d4429',
        },
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        },
        accent: {
          light: '#D4AF37',
          DEFAULT: '#B8914D',
          dark: '#8A6534',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
        display: ['Unbounded', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
