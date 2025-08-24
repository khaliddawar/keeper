import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Input - Comprehensive input component with validation and styling
 * 
 * Features:
 * - Multiple input types (text, email, password, number, search)
 * - Validation states (error, success, warning) with animations
 * - Icon support (left/right positioning with proper spacing)
 * - Label and help text integration with accessibility
 * - Controlled/uncontrolled modes with proper event handling
 * - Auto-focus and keyboard navigation support
 * - Password visibility toggle for password inputs
 * - Loading state with spinner
 * - Disabled and readonly states
 * - Full accessibility compliance (ARIA labels, descriptions)
 * - Smooth animations for focus and validation states
 */

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helpText?: string;
  error?: string;
  success?: string;
  warning?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'minimal';
  loading?: boolean;
  onIconClick?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  helpText,
  error,
  success,
  warning,
  leftIcon,
  rightIcon,
  size = 'md',
  variant = 'default',
  type = 'text',
  loading = false,
  disabled = false,
  readOnly = false,
  className,
  onIconClick,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Determine validation state
  const validationState = error ? 'error' : success ? 'success' : warning ? 'warning' : 'default';
  const validationMessage = error || success || warning;
  
  // Handle password visibility toggle
  const isPasswordInput = type === 'password';
  const actualType = isPasswordInput && showPassword ? 'text' : type;
  
  // Generate unique IDs for accessibility
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  
  // Base styles
  const baseClasses = [
    'w-full transition-all duration-200 ease-smooth',
    'border focus:outline-none focus:ring-2 focus:ring-offset-0',
    'placeholder:text-text-tertiary',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'readonly:bg-gray-50 readonly:cursor-default'
  ];
  
  // Size variants
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-3 py-2.5 text-base',
    lg: 'px-4 py-3 text-base'
  };
  
  // Variant styles
  const variantClasses = {
    default: [
      'bg-bg-secondary border-gray-200 rounded-lg',
      'focus:border-accent-1 focus:ring-accent-1/20'
    ],
    filled: [
      'bg-gray-50 border-transparent rounded-lg',
      'focus:bg-bg-secondary focus:border-accent-1 focus:ring-accent-1/20'
    ],
    minimal: [
      'bg-transparent border-0 border-b-2 border-gray-200 rounded-none',
      'focus:border-accent-1 focus:ring-0'
    ]
  };
  
  // Validation state styles
  const validationClasses = {
    default: '',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500/20',
    warning: 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500/20'
  };
  
  // Icon padding adjustments
  const iconPadding = {
    left: leftIcon ? (size === 'sm' ? 'pl-9' : size === 'lg' ? 'pl-12' : 'pl-10') : '',
    right: (rightIcon || isPasswordInput || loading) ? (size === 'sm' ? 'pr-9' : size === 'lg' ? 'pr-12' : 'pr-10') : ''
  };
  
  const inputClasses = clsx(
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    validationClasses[validationState],
    iconPadding.left,
    iconPadding.right,
    className
  );
  
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  const iconPositionLeft = size === 'sm' ? 'left-3' : 'left-3';
  const iconPositionRight = size === 'sm' ? 'right-3' : 'right-3';
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <motion.label
          htmlFor={inputId}
          className={clsx(
            'block text-sm font-medium mb-2 transition-colors duration-200',
            validationState === 'error' ? 'text-red-700' : 
            validationState === 'success' ? 'text-green-700' :
            validationState === 'warning' ? 'text-yellow-700' :
            'text-text-primary'
          )}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </motion.label>
      )}
      
      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className={clsx(
            'absolute top-1/2 transform -translate-y-1/2 text-text-secondary pointer-events-none',
            iconPositionLeft
          )}>
            <div className={iconSize}>
              {leftIcon}
            </div>
          </div>
        )}
        
        {/* Input Field */}
        <motion.input
          ref={ref}
          id={inputId}
          type={actualType}
          disabled={disabled}
          readOnly={readOnly}
          className={inputClasses}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-invalid={validationState === 'error'}
          aria-describedby={
            clsx(
              helpText && helpId,
              validationMessage && errorId
            ) || undefined
          }
          {...props}
          animate={{
            scale: isFocused ? 1.01 : 1,
          }}
          transition={{ duration: 0.15 }}
        />
        
        {/* Right Side Icons */}
        <div className={clsx(
          'absolute top-1/2 transform -translate-y-1/2 flex items-center gap-1',
          iconPositionRight
        )}>
          {/* Loading Spinner */}
          {loading && (
            <motion.div
              className={clsx(iconSize, 'text-text-secondary')}
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
          )}
          
          {/* Password Toggle */}
          {isPasswordInput && !loading && (
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={clsx(
                iconSize,
                'text-text-secondary hover:text-text-primary transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-accent-1 rounded'
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-full h-full" /> : <Eye className="w-full h-full" />}
            </motion.button>
          )}
          
          {/* Validation Icon */}
          {!loading && validationState !== 'default' && (
            <motion.div
              className={clsx(
                iconSize,
                validationState === 'error' ? 'text-red-500' :
                validationState === 'success' ? 'text-green-500' :
                'text-yellow-500'
              )}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              {validationState === 'error' && <AlertCircle className="w-full h-full" />}
              {validationState === 'success' && <CheckCircle className="w-full h-full" />}
              {validationState === 'warning' && <AlertCircle className="w-full h-full" />}
            </motion.div>
          )}
          
          {/* Custom Right Icon */}
          {rightIcon && !isPasswordInput && !loading && (
            <motion.div
              className={clsx(
                iconSize,
                'text-text-secondary',
                onIconClick && 'cursor-pointer hover:text-text-primary transition-colors duration-200'
              )}
              onClick={onIconClick}
              whileHover={onIconClick ? { scale: 1.1 } : {}}
              whileTap={onIconClick ? { scale: 0.9 } : {}}
            >
              {rightIcon}
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Help Text */}
      {helpText && !validationMessage && (
        <motion.p
          id={helpId}
          className="mt-2 text-sm text-text-secondary"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          {helpText}
        </motion.p>
      )}
      
      {/* Validation Message */}
      {validationMessage && (
        <motion.p
          id={errorId}
          className={clsx(
            'mt-2 text-sm font-medium',
            validationState === 'error' ? 'text-red-600' :
            validationState === 'success' ? 'text-green-600' :
            'text-yellow-600'
          )}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {validationMessage}
        </motion.p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
