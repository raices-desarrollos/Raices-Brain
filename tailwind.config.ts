import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Misma paleta que la carpeta de venta, para que la app y el material
      // comercial se vean del mismo proyecto.
      colors: {
        ink: '#21201E',
        lino: '#F0EDE6',
        blanco: '#F8F7F4',
        suelo: '#E2DCD1',
        tierra: '#5F4632',
        arena: '#B3945F',
        liquen: '#6F7F4F',
        musgo: '#4A5A3C',
        ceibo: '#A84C33',
        niebla: '#6E6F68',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'Cambria', 'serif'],
      },
      // Escala un punto más grande que la de Tailwind: los textos chicos de la
      // app quedaban por debajo de lo cómodo para leer.
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        xs: ['0.8125rem', { lineHeight: '1.15rem' }],
        sm: ['0.9375rem', { lineHeight: '1.45rem' }],
        base: ['1.0625rem', { lineHeight: '1.6rem' }],
        lg: ['1.1875rem', { lineHeight: '1.7rem' }],
        xl: ['1.375rem', { lineHeight: '1.85rem' }],
        '2xl': ['1.75rem', { lineHeight: '2.1rem' }],
        '3xl': ['2.125rem', { lineHeight: '2.4rem' }],
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
