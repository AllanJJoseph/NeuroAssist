/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 12px 32px rgba(15, 23, 42, 0.08)',
        card: '0 10px 24px rgba(15, 23, 42, 0.06)',
      },
      colors: {
        canvas: '#f8fafc',
        ink: '#0f172a',
        steel: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'Segoe UI', 'sans-serif'],
      },

    },
  },
  plugins: [],
}
