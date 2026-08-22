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
          secondary: '#F6F7F9',
        },
        'text-primary': '#171717',
        'text-secondary': '#6B7280',
        'text-muted': '#9CA3AF',
        border: {
          DEFAULT: '#E5E7EB',
          subtle: '#F3F4F6',
        },
        primary: {
          DEFAULT: '#111827',
          hover: '#000000',
        },
        accent: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#EFF6FF',
        },
        success: '#16A34A',
        danger: '#DC2626',
      },
    },
  },
  plugins: [],
}
