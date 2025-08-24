import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Check, Minus } from 'lucide-react';

/**
 * Checkbox - Custom styled checkbox component with animations
 * 
 * Features:
 * - Custom styled checkbox with smooth animations
 * - Indeterminate state support with dash icon
 * - Label integration with proper spacing and click handling
 * - Size variants (sm, md, lg) matching design system
 * - Color theming (primary, secondary, success, error)
 * - Smooth check animation with SVG morphing
 * - Disabled and readonly states with proper styling
 * - Form integration with proper value handling
 * - Accessibility compliance (ARIA attributes, keyboard support)
 * - Hover and focus states with visual feedback
 * - Support for controlled and uncontrolled usage
 */

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'success' | 'error';
  indeterminate?: boolean;
  error?: string;
  labelClassName?: string;
  containerClassName?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  description,
  size = 'md',
  variant = 'primary',
  indeterminate = false,
  error,
  disabled = false,
  readOnly = false,
  checked,
  defaultChecked,
  className,
  labelClassName,
  containerClassName,
  onChange,
  ...props
}, ref) => {
  // Generate unique ID for accessibility
  const checkboxId = props.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = `${checkboxId}-description`;
  const errorId = `${checkboxId}-error`;
  
  // Size variants
  const sizeClasses = {
    sm: {
      checkbox: 'w-4 h-4',
      icon: 'w-3 h-3',
      label: 'text-sm',
      description: 'text-xs'
    },
    md: {
      checkbox: 'w-5 h-5',
      icon: 'w-4 h-4', 
      label: 'text-base',
      description: 'text-sm'
    },
    lg: {
      checkbox: 'w-6 h-6',
      icon: 'w-5 h-5',
      label: 'text-lg',
      description: 'text-base'
    }
  };
  
  // Variant colors
  const variantClasses = {
    primary: {
      unchecked: 'border-gray-300 hover:border-accent-1',
      checked: 'bg-accent-1 border-accent-1',
      icon: 'text-white'
    },
    secondary: {
      unchecked: 'border-gray-300 hover:border-gray-400',
      checked: 'bg-gray-600 border-gray-600',
      icon: 'text-white'
    },
    success: {
      unchecked: 'border-gray-300 hover:border-green-500',
      checked: 'bg-green-500 border-green-500',
      icon: 'text-white'
    },
    error: {
      unchecked: 'border-red-300 hover:border-red-500',
      checked: 'bg-red-500 border-red-500',
      icon: 'text-white'
    }
  };
  
  const isChecked = checked || (indeterminate ? true : false);
  
  const checkboxClasses = clsx(
    'relative inline-flex items-center justify-center',
    'border-2 rounded transition-all duration-200 ease-smooth',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    sizeClasses[size].checkbox,
    isChecked 
      ? variantClasses[variant].checked
      : variantClasses[variant].unchecked,
    variant === 'primary' && 'focus:ring-accent-1/50',
    variant === 'secondary' && 'focus:ring-gray-500/50',
    variant === 'success' && 'focus:ring-green-500/50',
    variant === 'error' && 'focus:ring-red-500/50',
    disabled && 'opacity-50 cursor-not-allowed',
    !disabled && 'cursor-pointer hover:scale-105',
    className
  );
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || readOnly) return;
    onChange?.(event);
  };
  
  const handleContainerClick = () => {
    if (disabled || readOnly) return;
    // Trigger the hidden input's click
    const input = document.getElementById(checkboxId) as HTMLInputElement;
    if (input) {
      input.click();
    }
  };
  
  // Animation variants
  const checkVariants = {
    unchecked: { 
      scale: 0,
      opacity: 0,
      rotate: -45
    },
    checked: { 
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };
  
  const boxVariants = {
    unchecked: {
      backgroundColor: 'transparent',
      borderColor: 'currentColor',
      scale: 1
    },
    checked: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.3,
        times: [0, 0.6, 1],
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <div className={clsx('flex items-start gap-3', containerClassName)}>
      {/* Hidden Input */}
      <input
        ref={ref}
        type="checkbox"
        id={checkboxId}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        readOnly={readOnly}
        onChange={handleChange}
        className="sr-only"
        aria-describedby={
          clsx(
            description && descriptionId,
            error && errorId
          ) || undefined
        }
        aria-invalid={error ? true : undefined}
        {...props}
      />
      
      {/* Custom Checkbox */}
      <motion.div
        className={checkboxClasses}
        variants={boxVariants}
        initial="unchecked"
        animate={isChecked ? "checked" : "unchecked"}
        onClick={handleContainerClick}
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
      >
        {/* Check/Indeterminate Icon */}
        <motion.div
          className={clsx(
            'absolute inset-0 flex items-center justify-center',
            sizeClasses[size].icon,
            variantClasses[variant].icon
          )}
          variants={checkVariants}
          initial="unchecked"
          animate={isChecked ? "checked" : "unchecked"}
        >
          {indeterminate ? (
            <Minus className="w-full h-full" strokeWidth={3} />
          ) : (
            <Check className="w-full h-full" strokeWidth={3} />
          )}
        </motion.div>
        
        {/* Focus Ring */}
        <motion.div
          className="absolute inset-0 rounded border-2 border-transparent"
          whileFocus={{
            borderColor: variant === 'primary' ? 'rgba(124, 58, 237, 0.5)' :
                         variant === 'success' ? 'rgba(34, 197, 94, 0.5)' :
                         variant === 'error' ? 'rgba(239, 68, 68, 0.5)' :
                         'rgba(107, 114, 128, 0.5)',
            scale: 1.1
          }}
          transition={{ duration: 0.15 }}
        />
      </motion.div>
      
      {/* Label and Description */}
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <motion.label
              htmlFor={checkboxId}
              className={clsx(
                'block font-medium cursor-pointer select-none',
                sizeClasses[size].label,
                error ? 'text-red-700' : 'text-text-primary',
                disabled && 'opacity-50 cursor-not-allowed',
                labelClassName
              )}
              onClick={!disabled ? handleContainerClick : undefined}
              whileHover={!disabled ? { x: 2 } : {}}
              transition={{ duration: 0.15 }}
            >
              {label}
            </motion.label>
          )}
          
          {description && (
            <motion.p
              id={descriptionId}
              className={clsx(
                'mt-1 text-text-secondary',
                sizeClasses[size].description,
                disabled && 'opacity-50'
              )}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              {description}
            </motion.p>
          )}
          
          {error && (
            <motion.p
              id={errorId}
              className={clsx(
                'mt-1 font-medium text-red-600',
                sizeClasses[size].description
              )}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {error}
            </motion.p>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
