/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Primary background colors
        'bg-primary': '#F8F7FF',
        'bg-secondary': '#FFFFFF',
        
        // Accent colors (Purple theme)
        'accent-1': '#7C3AED',
        'accent-2': '#EC4899',
        
        // Text colors
        'text-primary': '#1F2937',
        'text-secondary': '#6B7280',
        'text-tertiary': '#9CA3AF',
        
        // Notebook-specific colors
        'notebook-work': '#3B82F6',
        'notebook-personal': '#10B981',
        'notebook-health': '#EF4444',
        'notebook-hustles': '#F59E0B',
        'notebook-ideas': '#8B5CF6',
        
        // Status colors
        'status-pending': '#F59E0B',
        'status-progress': '#3B82F6',
        'status-completed': '#10B981',
        'status-cancelled': '#6B7280',
        
        // Priority colors
        'priority-low': '#10B981',
        'priority-medium': '#F59E0B',
        'priority-high': '#EF4444',
        'priority-urgent': '#DC2626',
        
        // UI state colors
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'info': '#3B82F6'
      },
      borderRadius: {
        'canvas': '24px',
        'component': '16px',
        'small': '8px'
      },
      spacing: {
        // Canvas padding system
        'canvas-mobile': '8px',
        'canvas-desktop': '16px',
        'canvas-large': '32px',
        
        // Sidebar dimensions
        'sidebar-collapsed': '64px',
        'sidebar-expanded': '240px'
      },
      boxShadow: {
        'canvas': '0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.08)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)',
        'sidebar': '2px 0 8px rgba(0, 0, 0, 0.05)',
        'tab': '0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
        'tab-active': '0 3px 16px rgba(124, 58, 237, 0.2), inset 0 1px 0 rgba(255,255,255,1)'
      },
      fontSize: {
        // Optimized typography scale
        'xs': ['0.625rem', { lineHeight: '0.875rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.875rem' }]
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms'
      },
      transitionTimingFunction: {
        'smooth': 'ease',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px'
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease',
        'slide-in': 'slideIn 0.3s ease',
        'scale-in': 'scaleIn 0.2s ease',
        'bounce-in': 'bounceIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ]
}
