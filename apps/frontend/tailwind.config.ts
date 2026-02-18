import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        card: 'var(--card)',
        mutedSurface: 'var(--muted)',
        ink: '#0F1E3E',
        slateInk: '#4E6288',
        brand: {
          900: '#081C4D',
          700: '#12357C',
          500: '#2F94D6'
        },
        accent: '#C9994C',
        success: '#118766'
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        soft: 'var(--shadow-soft)',
        strong: 'var(--shadow-strong)'
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)'
      }
    }
  },
  plugins: []
};

export default config;
