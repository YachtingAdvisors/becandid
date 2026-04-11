import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        headline: ['var(--font-headline)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        label: ['var(--font-label)', 'system-ui', 'sans-serif'],
        // Legacy aliases
        display: ['var(--font-headline)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── MD3 Primary ──────────────────────────────────
        primary: {
          DEFAULT: 'var(--color-primary)',
          dim: 'var(--color-primary-dim)',
          container: 'var(--color-primary-container)',
        },
        'on-primary': {
          DEFAULT: 'var(--color-on-primary)',
          container: 'var(--color-on-primary-container)',
        },

        // ── MD3 Secondary ────────────────────────────────
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          container: 'var(--color-secondary-container)',
        },
        'on-secondary-container': 'var(--color-on-secondary-container)',

        // ── MD3 Tertiary ─────────────────────────────────
        tertiary: {
          DEFAULT: 'var(--color-tertiary)',
          container: 'var(--color-tertiary-container)',
        },
        'on-tertiary-container': 'var(--color-on-tertiary-container)',

        // ── MD3 Background & Surface ─────────────────────
        background: 'var(--color-background)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          dim: 'var(--color-surface-dim)',
          tint: 'var(--color-surface-tint)',
          container: {
            DEFAULT: 'var(--color-surface-container)',
            low: 'var(--color-surface-container-low)',
            lowest: 'var(--color-surface-container-lowest)',
            high: 'var(--color-surface-container-high)',
            highest: 'var(--color-surface-container-highest)',
          },
        },
        'inverse-surface': 'var(--color-inverse-surface)',
        'on-surface': {
          DEFAULT: 'var(--color-on-surface)',
          variant: 'var(--color-on-surface-variant)',
        },

        // ── MD3 Outline ──────────────────────────────────
        outline: {
          DEFAULT: 'var(--color-outline)',
          variant: 'var(--color-outline-variant)',
        },

        // ── MD3 Error ────────────────────────────────────
        error: {
          DEFAULT: 'var(--color-error)',
          container: 'var(--color-error-container)',
        },

        // ── Legacy aliases (backward compat) ─────────────
        brand: {
          DEFAULT: 'var(--color-primary)',
          50: '#f0fbff',
          100: '#a4e4f8',
          200: '#a4e4f8',
          300: '#a4e4f8',
          500: 'var(--color-primary)',
          600: 'var(--color-primary)',
          700: 'var(--color-primary-dim)',
          800: '#005465',
          900: '#005465',
        },
        ink: {
          DEFAULT: 'var(--color-on-surface)',
          muted: 'var(--color-on-surface-variant)',
        },
        'surface-border': 'var(--color-outline-variant)',
        'surface-muted': 'var(--color-surface-container-low)',
        'surface-soft': 'var(--color-surface-container)',

        // ── Dark page backgrounds (constant) ────────────────
        'dark-sanctuary': 'var(--color-dark-sanctuary)',
        'dark-auth': 'var(--color-dark-auth)',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      animation: {
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'fade-up': 'fade-up 0.3s ease-out both',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
