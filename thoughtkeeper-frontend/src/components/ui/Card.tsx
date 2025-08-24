import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';

/**
 * Card - Flexible card component with multiple variants and interactions
 * 
 * Features:
 * - Shadow variations (none, sm, md, lg, xl) matching design system
 * - Border radius options following design tokens
 * - Padding variants (sm, md, lg) for different content types
 * - Header, body, footer sections with proper spacing
 * - Hover states and interactive variants with animations
 * - Loading skeleton state with shimmer effect
 * - Image support with proper aspect ratios
 * - Click handlers for interactive cards with feedback
 * - Accessibility support with proper ARIA attributes
 * - Responsive design with mobile-first approach
 */

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  loading?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  image?: {
    src: string;
    alt: string;
    aspectRatio?: 'square' | 'video' | 'wide' | 'tall';
    position?: 'top' | 'bottom';
  };
  children?: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(({
  variant = 'default',
  shadow = 'md',
  padding = 'md',
  radius = 'md',
  interactive = false,
  loading = false,
  header,
  footer,
  image,
  children,
  className,
  onClick,
  ...props
}, ref) => {
  // Base card styles
  const baseClasses = [
    'relative transition-all duration-200 ease-smooth overflow-hidden'
  ];
  
  // Variant styles
  const variantClasses = {
    default: 'bg-bg-secondary',
    outlined: 'bg-bg-secondary border border-gray-200',
    elevated: 'bg-bg-secondary',
    filled: 'bg-gray-50'
  };
  
  // Shadow variations
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-card',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };
  
  // Padding variations
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };
  
  // Radius variations
  const radiusClasses = {
    none: '',
    sm: 'rounded-small',
    md: 'rounded-component',
    lg: 'rounded-lg'
  };
  
  // Interactive styles
  const interactiveClasses = interactive ? [
    'cursor-pointer select-none',
    'hover:shadow-card-hover',
    'focus:outline-none focus:ring-2 focus:ring-accent-1 focus:ring-offset-2',
    'active:scale-[0.99]'
  ] : [];
  
  // Loading styles
  const loadingClasses = loading ? 'animate-pulse' : '';
  
  const cardClasses = clsx(
    baseClasses,
    variantClasses[variant],
    shadowClasses[shadow],
    radiusClasses[radius],
    padding !== 'none' && !image && paddingClasses[padding],
    interactiveClasses,
    loadingClasses,
    className
  );
  
  // Image aspect ratio classes
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[2/1]',
    tall: 'aspect-[3/4]'
  };
  
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || loading) return;
    onClick?.(event);
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!interactive || loading) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.(event as any);
    }
  };
  
  // Loading skeleton content
  if (loading) {
    return (
      <div className={cardClasses}>
        <div className="space-y-4">
          {image && (
            <div className={clsx(
              'bg-gray-200 rounded animate-pulse',
              aspectRatioClasses[image.aspectRatio || 'video']
            )} />
          )}
          {header && (
            <div className="space-y-2 px-4 pt-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
          )}
          <div className="space-y-3 px-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
          </div>
          {footer && (
            <div className="px-4 pb-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <motion.div
      ref={ref}
      className={cardClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      whileHover={interactive ? { 
        y: -2,
        scale: 1.02,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={interactive ? { 
        scale: 0.98,
        transition: { duration: 0.1 }
      } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      {...props}
    >
      {/* Image - Top Position */}
      {image && image.position !== 'bottom' && (
        <motion.div
          className={clsx(
            'w-full overflow-hidden',
            radius !== 'none' && 'rounded-t-component'
          )}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <img
            src={image.src}
            alt={image.alt}
            className={clsx(
              'w-full h-full object-cover transition-transform duration-300',
              aspectRatioClasses[image.aspectRatio || 'video'],
              interactive && 'hover:scale-105'
            )}
            loading="lazy"
          />
        </motion.div>
      )}
      
      {/* Header */}
      {header && (
        <motion.div
          className={clsx(
            'border-b border-gray-100',
            padding === 'none' ? 'p-4 pb-3' : 
            padding === 'sm' ? 'px-3 pt-3 pb-2' :
            padding === 'md' ? 'px-4 pt-4 pb-3' :
            'px-6 pt-6 pb-4'
          )}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {header}
        </motion.div>
      )}
      
      {/* Body */}
      {children && (
        <motion.div
          className={clsx(
            image || header || footer ? (
              padding === 'none' ? 'p-4' :
              padding === 'sm' ? 'p-3' :
              padding === 'md' ? 'p-4' :
              'p-6'
            ) : ''
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {children}
        </motion.div>
      )}
      
      {/* Footer */}
      {footer && (
        <motion.div
          className={clsx(
            'border-t border-gray-100',
            padding === 'none' ? 'p-4 pt-3' :
            padding === 'sm' ? 'px-3 pb-3 pt-2' :
            padding === 'md' ? 'px-4 pb-4 pt-3' :
            'px-6 pb-6 pt-4'
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          {footer}
        </motion.div>
      )}
      
      {/* Image - Bottom Position */}
      {image && image.position === 'bottom' && (
        <motion.div
          className={clsx(
            'w-full overflow-hidden',
            radius !== 'none' && 'rounded-b-component'
          )}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <img
            src={image.src}
            alt={image.alt}
            className={clsx(
              'w-full h-full object-cover transition-transform duration-300',
              aspectRatioClasses[image.aspectRatio || 'video'],
              interactive && 'hover:scale-105'
            )}
            loading="lazy"
          />
        </motion.div>
      )}
      
      {/* Interactive overlay for subtle feedback */}
      {interactive && (
        <div className="absolute inset-0 bg-gradient-to-r from-accent-1/0 via-accent-1/0 to-accent-1/0 hover:via-accent-1/[0.02] transition-all duration-300 pointer-events-none" />
      )}
    </motion.div>
  );
});

Card.displayName = 'Card';

export default Card;
