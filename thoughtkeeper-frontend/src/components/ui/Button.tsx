import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';

/**
 * Button - Reusable button component with multiple variants
 * 
 * Features:
 * - Multiple variants (primary, secondary, ghost, danger)
 * - Size options (sm, md, lg)
 * - Loading states with spinner
 * - Icon support with proper spacing
 * - Smooth animations and hover effects
 * - Full accessibility support
 * - TypeScript support with proper event types
 */

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  className,
  onClick,
  ...props
}) => {
  const baseClasses = [
    'inline-flex items-center justify-center',
    'font-medium rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'relative overflow-hidden'
  ];

  const variantClasses = {
    primary: [
      'bg-accent-1 text-white hover:bg-purple-700',
      'focus:ring-accent-1 shadow-sm hover:shadow-md'
    ],
    secondary: [
      'bg-bg-secondary text-text-primary border border-gray-200',
      'hover:bg-gray-50 hover:border-accent-1 focus:ring-accent-1'
    ],
    ghost: [
      'bg-transparent text-text-secondary hover:text-text-primary',
      'hover:bg-gray-100 focus:ring-gray-300'
    ],
    danger: [
      'bg-red-500 text-white hover:bg-red-600',
      'focus:ring-red-500 shadow-sm hover:shadow-md'
    ]
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  const isDisabled = disabled || loading;

  const buttonClasses = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) return;
    onClick?.(event);
  };

  const renderIcon = (position: 'left' | 'right') => {
    if (loading && position === 'left') {
      return (
        <motion.div
          className={iconSizes[size]}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </motion.div>
      );
    }

    if (icon && iconPosition === position && !loading) {
      return <span className={iconSizes[size]}>{icon}</span>;
    }

    return null;
  };

  return (
    <motion.button
      className={buttonClasses}
      disabled={isDisabled}
      onClick={handleClick}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.15 }}
      {...props}
    >
      {renderIcon('left')}
      
      {children && (
        <span className={loading ? 'opacity-0' : 'opacity-100'}>
          {children}
        </span>
      )}
      
      {renderIcon('right')}
      
      {/* Loading overlay */}
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className={`${iconSizes[size]} animate-spin`}>
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </motion.div>
      )}
    </motion.button>
  );
};

export default Button;
