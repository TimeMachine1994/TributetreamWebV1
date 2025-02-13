/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        'great-vibes': ['"Great Vibes"', 'cursive'],
        'fanwood': ['"Fanwood Text"', 'serif']
      },
      colors: {
        gold: '#D5BA7F'
      }
    }
  },
  plugins: []
}
