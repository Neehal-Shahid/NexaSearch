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
        background: '#F8F8F6',
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F3F3F0',
        },
        'text-primary': '#111111',
        'text-secondary': '#6B6B6B',
        'text-muted': '#9CA3AF',
        border: {
          DEFAULT: '#E5E5E0',
          subtle: '#EBEBE6',
        },
        primary: {
          DEFAULT: '#0B1020',
          hover: '#151D36',
        },
        accent: {
          DEFAULT: '#1E3A8A',
          hover: '#172554',
          light: '#EFF6FF',
        },
        signature: {
          dark: '#0B1020',
        },
        success: '#16A34A',
        danger: '#DC2626',
      },
    },
  },
  plugins: [],
}
