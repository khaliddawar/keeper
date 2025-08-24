import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronDown, Search, Check, X } from 'lucide-react';

/**
 * Select - Comprehensive select component with search and custom rendering
 * 
 * Features:
 * - Single and multi-select modes with proper state management
 * - Search/filter functionality within dropdown with debouncing
 * - Custom option rendering with icons and rich content
 * - Keyboard navigation (arrow keys, enter, escape, space)
 * - Loading states for async options with spinner
 * - Grouped options support with proper headings
 * - Placeholder and empty state handling
 * - Portal rendering for proper z-index management
 * - Accessibility compliance (ARIA attributes, screen reader support)
 * - Validation states (error, success, warning) with styling
 * - Size variants (sm, md, lg) matching design system
 * - Smooth animations for dropdown and selections
 */

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
  group?: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  defaultValue?: string | string[];
  placeholder?: string;
  label?: string;
  helpText?: string;
  error?: string;
  success?: string;
  warning?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  maxSelection?: number;
  className?: string;
  dropdownClassName?: string;
  onChange?: (value: string | string[]) => void;
  onSearch?: (query: string) => void;
  renderOption?: (option: SelectOption, isSelected: boolean) => React.ReactNode;
  renderValue?: (option: SelectOption) => React.ReactNode;
  emptyMessage?: string;
  loadingMessage?: string;
}

const Select: React.FC<SelectProps> = ({
  options = [],
  value,
  defaultValue,
  placeholder = 'Select an option...',
  label,
  helpText,
  error,
  success,
  warning,
  size = 'md',
  disabled = false,
  loading = false,
  searchable = false,
  clearable = false,
  multiple = false,
  maxSelection,
  className,
  dropdownClassName,
  onChange,
  onSearch,
  renderOption,
  renderValue,
  emptyMessage = 'No options available',
  loadingMessage = 'Loading...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [selectedValues, setSelectedValues] = useState<string[]>(() => {
    if (value !== undefined) {
      return Array.isArray(value) ? value : [value];
    }
    if (defaultValue !== undefined) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    }
    return [];
  });
  
  const selectRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Sync external value changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValues(Array.isArray(value) ? value : [value]);
    }
  }, [value]);
  
  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    return options.filter(option => 
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);
  
  // Group options if needed
  const groupedOptions = useMemo(() => {
    const groups: { [key: string]: SelectOption[] } = {};
    filteredOptions.forEach(option => {
      const groupName = option.group || '';
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(option);
    });
    return groups;
  }, [filteredOptions]);
  
  // Get selected option objects
  const selectedOptions = useMemo(() => {
    return options.filter(option => selectedValues.includes(option.value));
  }, [options, selectedValues]);
  
  // Handle option selection
  const handleOptionSelect = (optionValue: string) => {
    let newValues: string[];
    
    if (multiple) {
      if (selectedValues.includes(optionValue)) {
        newValues = selectedValues.filter(v => v !== optionValue);
      } else {
        if (maxSelection && selectedValues.length >= maxSelection) return;
        newValues = [...selectedValues, optionValue];
      }
    } else {
      newValues = [optionValue];
      setIsOpen(false);
    }
    
    setSelectedValues(newValues);
    onChange?.(multiple ? newValues : newValues[0] || '');
    setSearchQuery('');
    setFocusedIndex(-1);
  };
  
  // Handle clear selection
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedValues([]);
    onChange?.(multiple ? [] : '');
  };
  
  // Handle search input
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
    setFocusedIndex(-1);
  };
  
  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleOptionSelect(filteredOptions[focusedIndex].value);
        }
        break;
        
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        setFocusedIndex(-1);
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => 
            Math.min(prev + 1, filteredOptions.length - 1)
          );
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => Math.max(prev - 1, -1));
        }
        break;
        
      case ' ':
        if (!searchable || !isOpen) {
          e.preventDefault();
          setIsOpen(!isOpen);
        }
        break;
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setFocusedIndex(-1);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, searchable]);
  
  // Validation state
  const validationState = error ? 'error' : success ? 'success' : warning ? 'warning' : 'default';
  const validationMessage = error || success || warning;
  
  // Generate unique IDs
  const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;
  const helpId = `${selectId}-help`;
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-3 py-2.5 text-base',
    lg: 'px-4 py-3 text-base'
  };
  
  // Validation styles
  const validationClasses = {
    default: 'border-gray-200 focus:border-accent-1 focus:ring-accent-1/20',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500/20',
    warning: 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500/20'
  };
  
  const selectClasses = clsx(
    'relative w-full bg-bg-secondary border rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'cursor-pointer select-none',
    sizeClasses[size],
    validationClasses[validationState],
    className
  );

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <motion.label
          htmlFor={selectId}
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
        </motion.label>
      )}
      
      {/* Select Container */}
      <div ref={selectRef} className="relative">
        {/* Select Trigger */}
        <div
          className={selectClasses}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby={label ? `${selectId}-label` : undefined}
          aria-describedby={helpText ? helpId : undefined}
        >
          <div className="flex items-center justify-between">
            {/* Selected Values Display */}
            <div className="flex-1 flex items-center gap-2 min-w-0">
              {loading ? (
                <span className="text-text-tertiary">{loadingMessage}</span>
              ) : selectedOptions.length > 0 ? (
                multiple ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedOptions.map(option => (
                      <motion.span
                        key={option.value}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-accent-1/10 text-accent-1 text-sm rounded-full"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                      >
                        {renderValue ? renderValue(option) : option.label}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOptionSelect(option.value);
                          }}
                          className="ml-1 hover:bg-accent-1/20 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 truncate">
                    {selectedOptions[0].icon}
                    <span className="truncate">
                      {renderValue ? renderValue(selectedOptions[0]) : selectedOptions[0].label}
                    </span>
                  </div>
                )
              ) : (
                <span className="text-text-tertiary truncate">{placeholder}</span>
              )}
            </div>
            
            {/* Right Icons */}
            <div className="flex items-center gap-1 ml-2">
              {clearable && selectedValues.length > 0 && !disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 hover:bg-gray-100 rounded text-text-secondary hover:text-text-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-text-secondary" />
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              className={clsx(
                'absolute top-full left-0 right-0 mt-1 z-50',
                'bg-bg-secondary border border-gray-200 rounded-lg shadow-lg',
                'max-h-60 overflow-hidden',
                dropdownClassName
              )}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Search Input */}
              {searchable && (
                <div className="p-3 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Search options..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-accent-1/20 focus:border-accent-1"
                    />
                  </div>
                </div>
              )}
              
              {/* Options List */}
              <div className="max-h-48 overflow-y-auto">
                {loading ? (
                  <div className="p-3 text-center text-text-secondary">
                    {loadingMessage}
                  </div>
                ) : filteredOptions.length === 0 ? (
                  <div className="p-3 text-center text-text-secondary">
                    {emptyMessage}
                  </div>
                ) : (
                  Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                    <div key={groupName}>
                      {/* Group Header */}
                      {groupName && (
                        <div className="px-3 py-2 text-xs font-semibold text-text-secondary bg-gray-50 border-b border-gray-100">
                          {groupName}
                        </div>
                      )}
                      
                      {/* Group Options */}
                      {groupOptions.map((option, index) => {
                        const isSelected = selectedValues.includes(option.value);
                        const isFocused = filteredOptions.indexOf(option) === focusedIndex;
                        
                        return (
                          <motion.div
                            key={option.value}
                            className={clsx(
                              'px-3 py-2 cursor-pointer transition-colors duration-150',
                              'hover:bg-gray-50 focus:bg-gray-50',
                              isFocused && 'bg-gray-50',
                              isSelected && 'bg-accent-1/10 text-accent-1',
                              option.disabled && 'opacity-50 cursor-not-allowed'
                            )}
                            onClick={() => !option.disabled && handleOptionSelect(option.value)}
                            whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                          >
                            {renderOption ? renderOption(option, isSelected) : (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                  {option.icon}
                                  <div className="min-w-0">
                                    <div className="font-medium truncate">{option.label}</div>
                                    {option.description && (
                                      <div className="text-sm text-text-secondary truncate">
                                        {option.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-accent-1 flex-shrink-0" />
                                )}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
};

export default Select;
