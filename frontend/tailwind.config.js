/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blackCus: '#1B1B1B',
        greyCus: '#bfbfbf',
      },
      fontFamily: {
        sfpro: ['"SF Pro Display"', 'sans-serif'],
      },
      fontSize: {
        '10xl': '10rem', // 160px
        '11xl': '12rem', // 192px
      },
    },
  },
  plugins: [],
}

