/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        paper: 'var(--paper)',
        'paper-2': 'var(--paper-2)',
        white: 'var(--white)',

        blue: 'var(--blue)',
        red: 'var(--red)',
        yellow: 'var(--yellow)',
        orange: 'var(--orange)',
        lime: 'var(--lime)',
        'blue-tint': 'var(--blue-tint)',
        'red-tint': 'var(--red-tint)',
        'yellow-tint': 'var(--yellow-tint)',
        'lime-tint': 'var(--lime-tint)',

        'surface-page': 'var(--surface-page)',
        'surface-card': 'var(--surface-card)',
        'surface-well': 'var(--surface-well)',
        'surface-inverse': 'var(--surface-inverse)',

        'text-body': 'var(--text-body)',
        'text-muted': 'var(--text-muted)',
        'text-inverse': 'var(--text-inverse)',

        'border-strong': 'var(--border-strong)',

        'accent-primary': 'var(--accent-primary)',
        'accent-highlight': 'var(--accent-highlight)',
        'accent-info': 'var(--accent-info)',
        'accent-danger': 'var(--accent-danger)',
        'accent-success': 'var(--accent-success)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
      borderWidth: {
        DEFAULT: 'var(--border-w)',
      },
      borderRadius: {
        0: 'var(--radius-0)',
        1: 'var(--radius-1)',
        2: 'var(--radius-2)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        none: 'var(--shadow-none)',
      },
      spacing: {
        'sp-1': 'var(--sp-1)',
        'sp-2': 'var(--sp-2)',
        'sp-3': 'var(--sp-3)',
        'sp-4': 'var(--sp-4)',
        'sp-5': 'var(--sp-5)',
        'sp-6': 'var(--sp-6)',
        'sp-7': 'var(--sp-7)',
        'sp-8': 'var(--sp-8)',
      },
      transitionTimingFunction: {
        move: 'cubic-bezier(0.2, 0, 0, 1)',
      },
    },
  },
  plugins: [],
};
