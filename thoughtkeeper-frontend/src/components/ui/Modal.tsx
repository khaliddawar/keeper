import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { X } from 'lucide-react';
import Button from './Button';

/**
 * Modal - Comprehensive modal component with accessibility and animations
 * 
 * Features:
 * - Size variants (sm, md, lg, xl, fullscreen) with responsive behavior
 * - Backdrop click to close (configurable) with proper event handling
 * - Escape key handling with focus management
 * - Focus management and focus trap for accessibility
 * - Smooth enter/exit animations with backdrop blur
 * - Header with title and close button (customizable)
 * - Footer with action buttons and proper spacing
 * - Scrollable body content with overflow handling
 * - Portal rendering for proper z-index layering
 * - Nested modal support with proper stacking
 * - Keyboard navigation and screen reader support
 * - Mobile-responsive design with touch-friendly interactions
 */

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  preventScroll?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  children?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onAfterOpen?: () => void;
  onAfterClose?: () => void;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  preventScroll = true,
  className,
  overlayClassName,
  contentClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  children,
  header,
  footer,
  onAfterOpen,
  onAfterClose
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const modalPortal = useRef<HTMLElement | null>(null);
  
  // Create portal container
  useEffect(() => {
    if (!modalPortal.current) {
      const portalEl = document.createElement('div');
      portalEl.setAttribute('id', 'modal-portal');
      portalEl.setAttribute('role', 'dialog');
      portalEl.setAttribute('aria-modal', 'true');
      document.body.appendChild(portalEl);
      modalPortal.current = portalEl;
    }
    
    return () => {
      if (modalPortal.current && document.body.contains(modalPortal.current)) {
        document.body.removeChild(modalPortal.current);
        modalPortal.current = null;
      }
    };
  }, []);
  
  // Handle body scroll prevention
  useEffect(() => {
    if (isOpen && preventScroll) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen, preventScroll]);
  
  // Handle focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus the modal after animation completes
      const timer = setTimeout(() => {
        if (modalRef.current) {
          const focusableElement = 
            modalRef.current.querySelector('[autofocus]') ||
            modalRef.current.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          
          if (focusableElement) {
            (focusableElement as HTMLElement).focus();
          } else {
            modalRef.current.focus();
          }
        }
        onAfterOpen?.();
      }, 200);
      
      return () => clearTimeout(timer);
    } else {
      // Restore focus when modal closes
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
      onAfterClose?.();
    }
  }, [isOpen, onAfterOpen, onAfterClose]);
  
  // Handle escape key
  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (closeOnEscape && event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  }, [closeOnEscape, onClose]);
  
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleEscape]);
  
  // Handle backdrop click
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  }, [closeOnBackdropClick, onClose]);
  
  // Focus trap implementation
  const handleTabKey = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !modalRef.current) return;
    
    const focusableElements = modalRef.current.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }, []);
  
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleTabKey);
      return () => document.removeEventListener('keydown', handleTabKey);
    }
  }, [isOpen, handleTabKey]);
  
  // Size variants
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-4xl',
    fullscreen: 'max-w-full mx-4 my-4 h-[calc(100vh-2rem)]'
  };
  
  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.15, ease: 'easeIn' }
    }
  };
  
  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95, 
      y: -20 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        duration: 0.25, 
        ease: [0.4, 0, 0.2, 1],
        delay: 0.05
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20,
      transition: { 
        duration: 0.2, 
        ease: [0.4, 0, 0.6, 1]
      }
    }
  };
  
  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className={clsx(
            'fixed inset-0 z-50 flex items-center justify-center p-4',
            'bg-black/50 backdrop-blur-sm',
            overlayClassName
          )}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={modalRef}
            className={clsx(
              'relative w-full bg-bg-secondary rounded-component shadow-xl',
              'max-h-[90vh] flex flex-col',
              sizeClasses[size],
              size === 'fullscreen' && 'h-full',
              className
            )}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            {/* Header */}
            {(header || title || showCloseButton) && (
              <div className={clsx(
                'flex items-center justify-between p-6 pb-4',
                'border-b border-gray-100',
                headerClassName
              )}>
                <div className="flex-1">
                  {header || (title && (
                    <h2 
                      id="modal-title"
                      className="text-xl font-semibold text-text-primary"
                    >
                      {title}
                    </h2>
                  ))}
                </div>
                
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="ml-4 -mr-2"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
            )}
            
            {/* Body */}
            <div className={clsx(
              'flex-1 overflow-y-auto p-6',
              (header || title || showCloseButton) && 'pt-4',
              footer && 'pb-4',
              bodyClassName
            )}>
              {children}
            </div>
            
            {/* Footer */}
            {footer && (
              <div className={clsx(
                'flex items-center justify-end gap-3 p-6 pt-4',
                'border-t border-gray-100',
                footerClassName
              )}>
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
  // Render modal in portal
  return modalPortal.current ? createPortal(modalContent, modalPortal.current) : null;
};

export default Modal;
