/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      /* Font audit 2026-04-02: replaced Montserrat (OFL — kept for reference) with Barlow Condensed (OFL — SpiceKrewe brand display). */
      fontFamily: {
        sans: ['Barlow Condensed', 'system-ui', 'sans-serif'],
        display: ['Barlow Condensed', 'system-ui', 'sans-serif'],
      },
      colors: {
        /** Spice Krewe brand palette — primary #4d2f91, secondary via --sk-blue (#3275bd confirmed) */
        sk: {
          navy: '#1a1a2e',
          purple: '#4d2f91',
          'purple-light': '#b99ee8',
          gold: '#e6a800',
          surface: 'var(--sk-surface)',
        },
        'spice-purple': 'var(--sk-purple)',
        'spice-blue': 'var(--sk-blue)',
        'sk-purple-dark': 'var(--sk-purple-dark)',
        'sk-purple-mid': 'var(--sk-purple-mid)',
        'sk-blue': 'var(--sk-blue)',
        'sk-blue-dark': 'var(--sk-blue-dark)',
        'sk-blue-light': 'var(--sk-blue-light)',
        'sk-gold-light': 'var(--sk-gold-light)',
        'sk-navy-mid': 'var(--sk-navy-mid)',
        'sk-muted-purple': 'var(--sk-muted-purple)',
        'sk-body-bg': 'var(--sk-body-bg)',
        'sk-card-border': 'var(--sk-card-border)',
        'sk-fg-on-dark': 'var(--sk-fg-on-dark)',
        'sk-fg-on-dark-muted': 'var(--sk-fg-on-dark-muted)',
        'sk-text-muted': 'var(--sk-text-muted)',
        'sk-text-subtle': 'var(--sk-text-subtle)',
        'sk-text-soft': 'var(--sk-text-soft)',
      },
      /** Default focus rings use SK lavender, not Tailwind blue */
      ringColor: {
        DEFAULT: '#b99ee8',
      },
      borderRadius: {
        'sk-sm': 'var(--sk-radius-sm)',
        'sk-md': 'var(--sk-radius-md)',
        'sk-lg': 'var(--sk-radius-lg)',
        'sk-pill': 'var(--sk-radius-pill)',
      },
      keyframes: {
        'sk-enter': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'sk-enter': 'sk-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};
