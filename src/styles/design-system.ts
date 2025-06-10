// Design System Constants
export const DESIGN_TOKENS = {
  // Layout dimensions (ready for Electron titlebar)
  layout: {
    titlebar: {
      height: 64, // 4rem - will accommodate both web header and Electron titlebar
      heightElectron: 32, // Typical Electron titlebar height
      dragAreaHeight: 32, // Area that will be draggable in Electron
    },
    sidebar: {
      width: 400, // 20rem - increased for better space
      collapsedWidth: 64, // 4rem
      minWidth: 200,
      maxWidth: 400,
    },
    content: {
      minWidth: 320, // Minimum content area width
      padding: 16, // 1rem
    },
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1280,
      wide: 1920,
    },
  },

  // Spacing system (8px base)
  spacing: {
    xs: 4,   // 0.25rem
    sm: 8,   // 0.5rem
    md: 16,  // 1rem
    lg: 24,  // 1.5rem
    xl: 32,  // 2rem
    xxl: 48, // 3rem
    xxxl: 64, // 4rem
  },

  // Colors (Electron-friendly - works well in both light/dark)
  colors: {
    background: {
      primary: '#151718',
      secondary: '#1A1A1A',
      tertiary: '#1E1F20',
      surface: '#2D2D2D',
      login: '#3A3A3A',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
      tertiary: '#808080',
      disabled: '#4A4A4A',
    },
    accent: {
      primary: '#FF9422', // Orange
      secondary: '#42A5F5', // Blue
      success: '#4CAF50',
      warning: '#FFB74D',
      error: '#FF6E6E',
    },
    border: {
      subtle: '#2A2A2A',
      default: '#404040',
      strong: '#606060',
    },
  },

  // Z-index layers
  zIndex: {
    titlebar: 1000,
    sidebar: 900,
    modal: 800,
    dropdown: 700,
    tooltip: 600,
    overlay: 500,
  },

  // Animation/transition values
  animation: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },
  },
} as const;

// CSS Custom Properties Generator
export const generateCSSVariables = (isElectron = false) => `
  :root {
    /* Layout */
    --titlebar-height: ${isElectron ? DESIGN_TOKENS.layout.titlebar.heightElectron : DESIGN_TOKENS.layout.titlebar.height}px;
    --titlebar-drag-height: ${DESIGN_TOKENS.layout.titlebar.dragAreaHeight}px;
    --sidebar-width: ${DESIGN_TOKENS.layout.sidebar.width}px;
    --sidebar-collapsed-width: ${DESIGN_TOKENS.layout.sidebar.collapsedWidth}px;
    --content-padding: ${DESIGN_TOKENS.layout.content.padding}px;

    /* Spacing */
    --spacing-xs: ${DESIGN_TOKENS.spacing.xs}px;
    --spacing-sm: ${DESIGN_TOKENS.spacing.sm}px;
    --spacing-md: ${DESIGN_TOKENS.spacing.md}px;
    --spacing-lg: ${DESIGN_TOKENS.spacing.lg}px;
    --spacing-xl: ${DESIGN_TOKENS.spacing.xl}px;
    --spacing-xxl: ${DESIGN_TOKENS.spacing.xxl}px;
    --spacing-xxxl: ${DESIGN_TOKENS.spacing.xxxl}px;

    /* Colors */
    --color-bg-primary: ${DESIGN_TOKENS.colors.background.primary};
    --color-bg-secondary: ${DESIGN_TOKENS.colors.background.secondary};
    --color-bg-tertiary: ${DESIGN_TOKENS.colors.background.tertiary};
    --color-bg-surface: ${DESIGN_TOKENS.colors.background.surface};
    --color-bg-login: ${DESIGN_TOKENS.colors.background.login};

    --color-text-primary: ${DESIGN_TOKENS.colors.text.primary};
    --color-text-secondary: ${DESIGN_TOKENS.colors.text.secondary};
    --color-text-tertiary: ${DESIGN_TOKENS.colors.text.tertiary};

    --color-accent-primary: ${DESIGN_TOKENS.colors.accent.primary};
    --color-accent-secondary: ${DESIGN_TOKENS.colors.accent.secondary};
    --color-accent-success: ${DESIGN_TOKENS.colors.accent.success};
    --color-accent-warning: ${DESIGN_TOKENS.colors.accent.warning};
    --color-accent-error: ${DESIGN_TOKENS.colors.accent.error};

    --color-border-subtle: ${DESIGN_TOKENS.colors.border.subtle};
    --color-border-default: ${DESIGN_TOKENS.colors.border.default};
    --color-border-strong: ${DESIGN_TOKENS.colors.border.strong};

    /* Z-index */
    --z-titlebar: ${DESIGN_TOKENS.zIndex.titlebar};
    --z-sidebar: ${DESIGN_TOKENS.zIndex.sidebar};
    --z-modal: ${DESIGN_TOKENS.zIndex.modal};

    /* Animation */
    --transition-fast: ${DESIGN_TOKENS.animation.fast} ${DESIGN_TOKENS.animation.easing.default};
    --transition-normal: ${DESIGN_TOKENS.animation.normal} ${DESIGN_TOKENS.animation.easing.default};
    --transition-slow: ${DESIGN_TOKENS.animation.slow} ${DESIGN_TOKENS.animation.easing.default};
  }
`;

// Utility functions
export const px = (value: number) => `${value}px`;
export const rem = (value: number) => `${value / 16}rem`;

// Breakpoint utilities
export const mediaQuery = {
  mobile: `@media (max-width: ${DESIGN_TOKENS.layout.breakpoints.mobile - 1}px)`,
  tablet: `@media (min-width: ${DESIGN_TOKENS.layout.breakpoints.mobile}px) and (max-width: ${DESIGN_TOKENS.layout.breakpoints.tablet - 1}px)`,
  desktop: `@media (min-width: ${DESIGN_TOKENS.layout.breakpoints.tablet}px)`,
  wide: `@media (min-width: ${DESIGN_TOKENS.layout.breakpoints.wide}px)`,
};

// Component size presets
export const componentSizes = {
  titlebar: {
    web: {
      height: DESIGN_TOKENS.layout.titlebar.height,
      padding: DESIGN_TOKENS.spacing.md,
    },
    electron: {
      height: DESIGN_TOKENS.layout.titlebar.heightElectron,
      padding: DESIGN_TOKENS.spacing.sm,
      dragArea: DESIGN_TOKENS.layout.titlebar.dragAreaHeight,
    },
  },
} as const; 