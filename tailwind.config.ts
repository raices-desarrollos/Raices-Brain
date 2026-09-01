import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#1A1A18',
        lino: '#F0EDE6',
        blanco: '#F8F7F4',
        suelo: '#E8E3DA',
        tierra: '#856040',
        arena: '#C4A97D',
        liquen: '#7E8E5F',
        musgo: '#536245',
        ceibo: '#B85C42',
        niebla: '#8F9089',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Noto Serif JP"', 'Georgia', 'Cambria', 'serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        sm: '0.375rem',
        DEFAULT: '0.5rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      keyframes: {
        rise: {
          '0%, 100%': { transform: 'scaleY(0.38)', opacity: '0.35' },
          '50%': { transform: 'scaleY(1)', opacity: '1' },
        },
      },
      animation: {
        rise: 'rise 1.15s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
