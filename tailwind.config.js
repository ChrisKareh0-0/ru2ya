/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'custom': {
          'beige': '#F5E6D3',
          'green': '#7C805A',
          'dark-green': '#6A7150',
          'darker-green': '#5A6140',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        elegant: ['var(--font-playfair)', 'Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}
