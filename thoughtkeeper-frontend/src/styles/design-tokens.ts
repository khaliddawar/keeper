// Design System Tokens
// Centralized design system constants for programmatic access

export const colors = {
  // Primary background colors
  bgPrimary: '#F8F7FF',
  bgSecondary: '#FFFFFF',
  
  // Accent colors
  accent1: '#7C3AED',
  accent2: '#EC4899',
  
  // Text colors
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  
  // Notebook-specific colors
  notebooks: {
    work: '#3B82F6',
    personal: '#10B981',
    health: '#EF4444',
    hustles: '#F59E0B',
    ideas: '#8B5CF6'
  },
  
  // Status colors
  status: {
    pending: '#F59E0B',
    inProgress: '#3B82F6',
    completed: '#10B981',
    cancelled: '#6B7280'
  },
  
  // Priority colors
  priority: {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
    urgent: '#DC2626'
  },
  
  // UI state colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6'
} as const;

export const spacing = {
  // Canvas padding system
  canvas: {
    mobile: '8px',
    desktop: '16px',
    large: '32px'
  },
  
  // Sidebar dimensions
  sidebar: {
    collapsed: '64px',
    expanded: '240px'
  },
  
  // Component spacing
  components: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px'
  }
} as const;

export const borderRadius = {
  canvas: '24px',
  component: '16px',
  small: '8px',
  minimal: '4px'
} as const;

export const typography = {
  fontSizes: {
    xs: '0.625rem',    // 10px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem'      // 20px
  },
  
  lineHeights: {
    xs: '0.875rem',    // 14px
    sm: '1.25rem',     // 20px
    base: '1.5rem',    // 24px
    lg: '1.75rem',     // 28px
    xl: '1.875rem'     // 30px
  },
  
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  }
} as const;

export const shadows = {
  canvas: '0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.08)',
  card: '0 4px 12px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03)',
  cardHover: '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)',
  sidebar: '2px 0 8px rgba(0, 0, 0, 0.05)',
  tab: '0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
  tabActive: '0 3px 16px rgba(124, 58, 237, 0.2), inset 0 1px 0 rgba(255,255,255,1)'
} as const;

export const animations = {
  duration: {
    fast: '0.2s',
    normal: '0.3s',
    slow: '0.5s'
  },
  
  easing: {
    smooth: 'ease',
    bounceIn: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
} as const;

export const breakpoints = {
  mobile: '768px',
  tablet: '1024px',
  desktop: '1280px',
  large: '1400px'
} as const;

// Utility functions for working with design tokens
export const getNotebookColor = (notebookType: keyof typeof colors.notebooks): string => {
  return colors.notebooks[notebookType];
};

export const getPriorityColor = (priority: keyof typeof colors.priority): string => {
  return colors.priority[priority];
};

export const getStatusColor = (status: keyof typeof colors.status): string => {
  return colors.status[status];
};

// CSS-in-JS helpers
export const createGradient = (color1: string, color2: string, direction = '135deg'): string => {
  return `linear-gradient(${direction}, ${color1} 0%, ${color2} 100%)`;
};

export const createShadow = (shadowKey: keyof typeof shadows): string => {
  return shadows[shadowKey];
};

// Responsive helpers
export const mediaQueries = {
  mobile: `@media (max-width: ${breakpoints.mobile})`,
  tablet: `@media (min-width: ${breakpoints.mobile}) and (max-width: ${breakpoints.tablet})`,
  desktop: `@media (min-width: ${breakpoints.tablet})`,
  large: `@media (min-width: ${breakpoints.large})`
} as const;

// Export commonly used combinations
export const themes = {
  canvas: {
    background: colors.bgPrimary,
    borderRadius: borderRadius.canvas,
    shadow: shadows.canvas,
    padding: {
      mobile: spacing.canvas.mobile,
      desktop: spacing.canvas.desktop,
      large: spacing.canvas.large
    }
  },
  
  card: {
    background: colors.bgSecondary,
    borderRadius: borderRadius.component,
    shadow: shadows.card,
    hoverShadow: shadows.cardHover
  },
  
  button: {
    primary: {
      background: colors.accent1,
      hoverBackground: '#6D28D9',
      color: '#FFFFFF'
    },
    secondary: {
      background: colors.bgSecondary,
      hoverBackground: '#F9FAFB',
      color: colors.textPrimary,
      border: 'rgba(0, 0, 0, 0.1)'
    }
  }
} as const;
