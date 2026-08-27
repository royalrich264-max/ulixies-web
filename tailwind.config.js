/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nike: {
          black: '#111111',
          grayBg: '#F5F5F5',
          border: '#E5E5E5',
          subtext: '#707072',
        }
      }
    },
  },
  plugins: [],
}
