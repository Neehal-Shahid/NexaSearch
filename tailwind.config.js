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
          secondary: '#FAFAFA', // Ultra-subtle off-white
        },
        'text-primary': '#0A0A0A', // Almost black
        'text-secondary': '#52525B', // Zinc 600
        'text-muted': '#A1A1AA', // Zinc 400
        border: {
          DEFAULT: '#E5E5E5', // Neutral 200
          subtle: '#F5F5F5', // Neutral 100
        },
        primary: {
          DEFAULT: '#0A0A0A',
          hover: '#262626', // Neutral 800
        },
        accent: {
          DEFAULT: '#0A0A0A', // Black accent for ultimate minimalism
          hover: '#404040', 
          light: '#F5F5F5',
        },
        signature: {
          dark: '#000000',
        },
        success: '#10B981',
        danger: '#EF4444',
      },
    },
  },
  plugins: [],
}
