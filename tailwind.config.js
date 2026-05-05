/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Tennis+ brand colors
        tplus: {
          blue: '#1E5FAF',     // Hard court (default)
          clay: '#C75D3F',     // Terre battue
          grass: '#2D5016',    // Gazon
          yellow: '#D4E157',   // Tennis ball
          cream: '#F4F4F2',
          black: '#0A0A0A'
        }
      },
      fontFamily: {
        display: ['Archivo Black', 'sans-serif'],
        body: ['Manrope', 'sans-serif']
      }
    }
  },
  plugins: []
};
