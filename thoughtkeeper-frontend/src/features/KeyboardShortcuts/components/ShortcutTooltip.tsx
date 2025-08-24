import React, { useState, useRef, useEffect } from 'react';
import type { ShortcutTooltipProps } from '../types';
import { useKeyboardShortcuts } from '../KeyboardShortcutsProvider';

/**
 * Shortcut Tooltip Component
 * Shows keyboard shortcut on hover with customizable placement
 */
export const ShortcutTooltip: React.FC<ShortcutTooltipProps> = ({
  shortcut,
  children,
  placement = 'top',
  showDelay = 500
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { manager, config } = useKeyboardShortcuts();

  const formattedShortcut = manager.formatShortcut(shortcut);

  const showTooltip = () => {
    if (!config.accessibility.showTooltips) return;

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, showDelay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const tooltipWidth = 200; // Estimated tooltip width
    const tooltipHeight = 40; // Estimated tooltip height
    const padding = 8;

    let x = 0;
    let y = 0;

    switch (placement) {
      case 'top':
        x = containerRect.left + containerRect.width / 2 - tooltipWidth / 2;
        y = containerRect.top - tooltipHeight - padding;
        break;
      case 'bottom':
        x = containerRect.left + containerRect.width / 2 - tooltipWidth / 2;
        y = containerRect.bottom + padding;
        break;
      case 'left':
        x = containerRect.left - tooltipWidth - padding;
        y = containerRect.top + containerRect.height / 2 - tooltipHeight / 2;
        break;
      case 'right':
        x = containerRect.right + padding;
        y = containerRect.top + containerRect.height / 2 - tooltipHeight / 2;
        break;
    }

    // Keep tooltip within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    x = Math.max(padding, Math.min(viewportWidth - tooltipWidth - padding, x));
    y = Math.max(padding, Math.min(viewportHeight - tooltipHeight - padding, y));

    setPosition({ x, y });
  };

  useEffect(() => {
    const handleResize = () => {
      if (isVisible) {
        updatePosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="shortcut-tooltip-container"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      
      {isVisible && (
        <div
          className={`shortcut-tooltip shortcut-tooltip--${placement}`}
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div className="shortcut-tooltip__content">
            <div className="shortcut-tooltip__keys">
              {formattedShortcut}
            </div>
            <div className="shortcut-tooltip__description">
              {shortcut.name}
            </div>
          </div>

          {/* Arrow/pointer */}
          <div
            className="shortcut-tooltip__arrow"
            style={{
              position: 'absolute',
              width: 0,
              height: 0,
              borderStyle: 'solid',
              ...getArrowStyles(placement)
            }}
          />
        </div>
      )}

      <style jsx>{`
        .shortcut-tooltip-container {
          position: relative;
          display: inline-block;
        }

        .shortcut-tooltip__content {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .shortcut-tooltip__keys {
          font-weight: 600;
          padding: 2px 6px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          min-width: 20px;
          text-align: center;
        }

        .shortcut-tooltip__description {
          font-weight: 400;
          opacity: 0.9;
        }

        .shortcut-tooltip--top .shortcut-tooltip__arrow {
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
        }

        .shortcut-tooltip--bottom .shortcut-tooltip__arrow {
          top: -6px;
          left: 50%;
          transform: translateX(-50%);
        }

        .shortcut-tooltip--left .shortcut-tooltip__arrow {
          right: -6px;
          top: 50%;
          transform: translateY(-50%);
        }

        .shortcut-tooltip--right .shortcut-tooltip__arrow {
          left: -6px;
          top: 50%;
          transform: translateY(-50%);
        }

        @media (prefers-reduced-motion: reduce) {
          .shortcut-tooltip {
            transition: none !important;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .shortcut-tooltip {
            backgroundColor: black !important;
            border: 1px solid white;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Get arrow styles based on placement
 */
function getArrowStyles(placement: string) {
  const arrowSize = 6;
  
  switch (placement) {
    case 'top':
      return {
        borderLeftWidth: arrowSize,
        borderRightWidth: arrowSize,
        borderTopWidth: arrowSize,
        borderBottomWidth: 0,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: 'rgba(0, 0, 0, 0.9)',
        borderBottomColor: 'transparent'
      };
    case 'bottom':
      return {
        borderLeftWidth: arrowSize,
        borderRightWidth: arrowSize,
        borderTopWidth: 0,
        borderBottomWidth: arrowSize,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: 'transparent',
        borderBottomColor: 'rgba(0, 0, 0, 0.9)'
      };
    case 'left':
      return {
        borderTopWidth: arrowSize,
        borderBottomWidth: arrowSize,
        borderLeftWidth: arrowSize,
        borderRightWidth: 0,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: 'rgba(0, 0, 0, 0.9)',
        borderRightColor: 'transparent'
      };
    case 'right':
      return {
        borderTopWidth: arrowSize,
        borderBottomWidth: arrowSize,
        borderLeftWidth: 0,
        borderRightWidth: arrowSize,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
        borderRightColor: 'rgba(0, 0, 0, 0.9)'
      };
    default:
      return {};
  }
}

/**
 * Shortcut Key Display Component
 * Displays individual shortcut keys with proper styling
 */
export const ShortcutKeys: React.FC<{ shortcut: string }> = ({ shortcut }) => {
  const keys = shortcut.split(/[\+\s]/);
  
  return (
    <span className="shortcut-keys">
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="shortcut-keys__separator">+</span>}
          <kbd className="shortcut-keys__key">{key}</kbd>
        </React.Fragment>
      ))}
      
      <style jsx>{`
        .shortcut-keys {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          font-family: monospace;
          font-size: 0.85em;
        }

        .shortcut-keys__key {
          display: inline-block;
          padding: 2px 6px;
          margin: 0;
          font-size: inherit;
          font-family: inherit;
          background: rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          min-width: 16px;
          text-align: center;
          font-weight: 500;
        }

        .shortcut-keys__separator {
          margin: 0 2px;
          color: rgba(0, 0, 0, 0.5);
          font-size: 0.9em;
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          .shortcut-keys__key {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.2);
          }
          
          .shortcut-keys__separator {
            color: rgba(255, 255, 255, 0.5);
          }
        }
      `}</style>
    </span>
  );
};
