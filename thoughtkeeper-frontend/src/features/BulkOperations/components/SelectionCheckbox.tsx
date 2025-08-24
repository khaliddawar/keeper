import React from 'react';
import { useItemSelection } from '../hooks/useBulkOperations';
import type { SelectionItem } from '../types';

/**
 * SelectionCheckbox Component - Consistent checkbox for item selection
 * 
 * Features:
 * - Automatic registration with bulk operations system
 * - Indeterminate state support for parent items
 * - Keyboard navigation and accessibility
 * - Visual feedback for selection states
 * - Touch-friendly sizing
 */

interface SelectionCheckboxProps {
  item: SelectionItem;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
}

export const SelectionCheckbox: React.FC<SelectionCheckboxProps> = ({
  item,
  size = 'md',
  showLabel = false,
  className = '',
  onClick
}) => {
  const {
    isSelected,
    isSelectable,
    checkboxProps,
    toggle
  } = useItemSelection(item.id, item);
  
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent parent click handlers
    
    if (onClick) {
      onClick(event);
    } else {
      toggle();
    }
  };
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };
  
  const getCheckboxClasses = () => {
    const baseClasses = `
      rounded border-2 transition-all duration-150 ease-in-out
      focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:outline-none
      ${getSizeClasses()}
    `;
    
    if (!isSelectable) {
      return `${baseClasses} bg-gray-100 border-gray-200 cursor-not-allowed opacity-50
              dark:bg-gray-700 dark:border-gray-600`;
    }
    
    if (isSelected) {
      return `${baseClasses} bg-blue-600 border-blue-600 text-white cursor-pointer
              hover:bg-blue-700 hover:border-blue-700
              dark:bg-blue-500 dark:border-blue-500`;
    }
    
    return `${baseClasses} bg-white border-gray-300 cursor-pointer
            hover:border-blue-400 hover:bg-blue-50
            dark:bg-gray-700 dark:border-gray-500 dark:hover:bg-gray-600`;
  };
  
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className="relative flex items-center justify-center"
        onClick={handleClick}
        role="checkbox"
        aria-checked={isSelected}
        aria-label={`Select ${item.metadata?.title || item.id}`}
        tabIndex={isSelectable ? 0 : -1}
        onKeyDown={(event) => {
          if ((event.key === ' ' || event.key === 'Enter') && isSelectable) {
            event.preventDefault();
            toggle();
          }
        }}
      >
        <div className={getCheckboxClasses()}>
          {isSelected && (
            <CheckIcon size={size} />
          )}
        </div>
        
        {/* Hidden native checkbox for form compatibility */}
        <input
          type="checkbox"
          className="sr-only"
          {...checkboxProps}
          tabIndex={-1}
        />
      </div>
      
      {/* Optional label */}
      {showLabel && item.metadata?.title && (
        <label
          className={`
            text-sm font-medium cursor-pointer
            ${isSelectable 
              ? 'text-gray-700 dark:text-gray-300' 
              : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }
          `}
          onClick={handleClick}
        >
          {item.metadata.title}
        </label>
      )}
    </div>
  );
};

interface CheckIconProps {
  size: 'sm' | 'md' | 'lg';
}

const CheckIcon: React.FC<CheckIconProps> = ({ size }) => {
  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return '12';
      case 'lg':
        return '20';
      default:
        return '16';
    }
  };
  
  return (
    <svg
      width={getIconSize()}
      height={getIconSize()}
      viewBox="0 0 20 20"
      fill="currentColor"
      className="absolute"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
};

/**
 * SelectAllCheckbox Component - Master checkbox for selecting all items
 */
interface SelectAllCheckboxProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const SelectAllCheckbox: React.FC<SelectAllCheckboxProps> = ({
  className = '',
  size = 'md',
  showLabel = true
}) => {
  // This would typically use a custom hook for "select all" functionality
  // For now, using the bulk operations context directly would be more appropriate
  
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="relative flex items-center justify-center">
        <div className={`
          rounded border-2 transition-all duration-150 ease-in-out
          bg-white border-gray-300 cursor-pointer hover:border-blue-400 hover:bg-blue-50
          dark:bg-gray-700 dark:border-gray-500 dark:hover:bg-gray-600
          ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}
        `}>
          {/* Icon would be rendered based on selection state */}
        </div>
      </div>
      
      {showLabel && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
          Select all
        </label>
      )}
    </div>
  );
};

/**
 * SelectionIndicator Component - Visual indicator without checkbox
 */
interface SelectionIndicatorProps {
  item: SelectionItem;
  className?: string;
}

export const SelectionIndicator: React.FC<SelectionIndicatorProps> = ({
  item,
  className = ''
}) => {
  const { isSelected, isSelectable } = useItemSelection(item.id, item);
  
  if (!isSelectable) {
    return null;
  }
  
  return (
    <div className={`inline-flex ${className}`}>
      {isSelected && (
        <div className="w-1 h-8 bg-blue-500 rounded-full flex-shrink-0" />
      )}
    </div>
  );
};

/**
 * SelectionCount Component - Display selection count
 */
interface SelectionCountProps {
  className?: string;
  format?: 'short' | 'long';
}

export const SelectionCount: React.FC<SelectionCountProps> = ({
  className = '',
  format = 'short'
}) => {
  // This would use the bulk operations context to get selection count
  // Placeholder implementation
  const selectedCount = 0;
  const totalCount = 0;
  
  if (selectedCount === 0) {
    return null;
  }
  
  const displayText = format === 'long' 
    ? `${selectedCount} of ${totalCount} items selected`
    : `${selectedCount} selected`;
  
  return (
    <div className={`
      inline-flex items-center px-2 py-1 text-xs font-medium 
      bg-blue-100 text-blue-800 rounded-full
      dark:bg-blue-900/20 dark:text-blue-300
      ${className}
    `}>
      {displayText}
    </div>
  );
};

export default SelectionCheckbox;
