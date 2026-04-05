/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#0E1117',
        surface: '#1A1F2E',
        gas:     '#F5A623',
        ev:      '#4FC3F7',
        win:     '#66BB6A',
        loss:    '#EF5350',
        accent:  '#3949AB',
      },
    },
  },
  plugins: [],
}
