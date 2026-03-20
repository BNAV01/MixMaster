const semanticColor = (cssVariable) => `rgb(var(${cssVariable}) / <alpha-value>)`;

module.exports = {
  darkMode: ['class', '[data-mm-color-scheme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: semanticColor('--mm-color-background'),
        surface: semanticColor('--mm-color-surface'),
        'surface-2': semanticColor('--mm-color-surface-2'),
        'surface-3': semanticColor('--mm-color-surface-3'),
        border: semanticColor('--mm-color-border'),
        muted: semanticColor('--mm-color-text-muted'),
        accent: semanticColor('--mm-color-accent'),
        'accent-2': semanticColor('--mm-color-accent-2'),
        success: semanticColor('--mm-color-success'),
        warning: semanticColor('--mm-color-warning'),
        danger: semanticColor('--mm-color-danger'),
        info: semanticColor('--mm-color-info'),
        text: semanticColor('--mm-color-text')
      },
      fontFamily: {
        sans: ['var(--mm-font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--mm-font-display)', 'serif']
      },
      borderRadius: {
        sm: 'var(--mm-radius-sm)',
        md: 'var(--mm-radius-md)',
        lg: 'var(--mm-radius-lg)',
        xl: 'var(--mm-radius-xl)',
        pill: '999px'
      },
      boxShadow: {
        panel: 'var(--mm-shadow-panel)',
        focus: 'var(--mm-shadow-focus)'
      },
      transitionTimingFunction: {
        expressive: 'cubic-bezier(0.22, 1, 0.36, 1)'
      },
      transitionDuration: {
        240: '240ms',
        320: '320ms'
      },
      screens: {
        xs: '420px'
      },
      maxWidth: {
        shell: '82rem',
        prose: '42rem'
      }
    }
  }
};
