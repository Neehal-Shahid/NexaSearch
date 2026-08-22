/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: '#FFFFFF',
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F8FAFC', // Crisp very light slate
        },
        'text-primary': '#0F172A', // Slate 900
        'text-secondary': '#475569', // Slate 600
        'text-muted': '#94A3B8', // Slate 400
        border: {
          DEFAULT: '#E2E8F0', // Slate 200
          subtle: '#F1F5F9', // Slate 100
        },
        primary: {
          DEFAULT: '#020617', // Slate 950
          hover: '#1E293B', // Slate 800
        },
        accent: {
          DEFAULT: '#2563EB', // Vibrant Blue 600
          hover: '#1D4ED8', // Blue 700
          light: '#EFF6FF', // Blue 50
        },
        signature: {
          dark: '#020617',
        },
        success: '#10B981',
        danger: '#EF4444',
      },
    },
  },
  plugins: [],
}
