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
          DEFAULT: '#226779',
          dim: '#0e5b6c',
          container: '#a4e4f8',
        },
        'on-primary': {
          DEFAULT: '#f0fbff',
          container: '#005465',
        },

        // ── MD3 Secondary ────────────────────────────────
        secondary: {
          DEFAULT: '#47636d',
          container: '#c9e8f3',
        },
        'on-secondary-container': '#39565f',

        // ── MD3 Tertiary ─────────────────────────────────
        tertiary: {
          DEFAULT: '#845500',
          container: '#fdbe66',
        },
        'on-tertiary-container': '#5d3b00',

        // ── MD3 Background & Surface ─────────────────────
        background: '#fbf9f8',
        surface: {
          DEFAULT: '#fbf9f8',
          container: {
            DEFAULT: '#eeeeed',
            low: '#f5f3f3',
            lowest: '#ffffff',
            high: '#e8e8e8',
            highest: '#e2e2e2',
          },
        },
        'on-surface': {
          DEFAULT: '#313333',
          variant: '#5e5f5f',
        },

        // ── MD3 Outline ──────────────────────────────────
        outline: {
          DEFAULT: '#7a7b7b',
          variant: '#b1b2b2',
        },

        // ── MD3 Error ────────────────────────────────────
        error: {
          DEFAULT: '#a83836',
          container: '#fa746f',
        },

        // ── Legacy aliases (backward compat) ─────────────
        brand: {
          DEFAULT: '#226779',
          50: '#f0fbff',
          100: '#a4e4f8',
          200: '#a4e4f8',
          300: '#a4e4f8',
          500: '#226779',
          600: '#226779',
          700: '#0e5b6c',
          800: '#005465',
          900: '#005465',
        },
        ink: {
          DEFAULT: '#313333',
          muted: '#5e5f5f',
        },
        'surface-border': '#b1b2b2',
        'surface-muted': '#f5f3f3',
        'surface-soft': '#eeeeed',
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
