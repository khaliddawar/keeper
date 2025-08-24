import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAdvancedSearch } from '../AdvancedSearchProvider';
import type { SearchBarProps } from '../types';

/**
 * Advanced Search Bar Component
 * Main search interface with autocomplete and quick actions
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  autoFocus = false,
  showFilters = true,
  showAdvanced = true,
  className = '',
  onSearch,
  onClear
}) => {
  const {
    state,
    config,
    search,
    clearSearch,
    getSuggestions,
    openSearch,
    setProvider,
    toggleQuickFilter
  } = useAdvancedSearch();

  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Load current query text
  useEffect(() => {
    if (state.currentQuery?.text && state.currentQuery.text !== inputValue) {
      setInputValue(state.currentQuery.text);
    }
  }, [state.currentQuery?.text]);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  /**
   * Handle input change with debounced suggestions
   */
  const handleInputChange = useCallback(async (value: string) => {
    setInputValue(value);
    setSelectedSuggestionIndex(-1);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Get suggestions immediately for UX
    if (value.trim().length > 1) {
      await getSuggestions(value);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }

    // Debounce search if real-time search is enabled
    if (config.enableRealTimeSearch && value.trim().length > 2) {
      const timeout = setTimeout(async () => {
        try {
          const results = await search(value);
          onSearch?.(results);
        } catch (error) {
          console.error('Real-time search error:', error);
        }
      }, config.debounceMs);

      setSearchTimeout(timeout);
    }
  }, [searchTimeout, getSuggestions, config.enableRealTimeSearch, config.debounceMs, search, onSearch]);

  /**
   * Handle search submission
   */
  const handleSearch = useCallback(async (searchText?: string) => {
    const query = searchText || inputValue.trim();
    
    if (!query) {
      handleClear();
      return;
    }

    setShowSuggestions(false);

    try {
      const results = await search(query);
      onSearch?.(results);
    } catch (error) {
      console.error('Search error:', error);
    }
  }, [inputValue, search, onSearch]);

  /**
   * Handle clear search
   */
  const handleClear = useCallback(() => {
    setInputValue('');
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    clearSearch();
    onClear?.();
  }, [clearSearch, onClear]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && state.suggestions[selectedSuggestionIndex]) {
          handleSearch(state.suggestions[selectedSuggestionIndex]);
        } else {
          handleSearch();
        }
        break;
        
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        inputRef.current?.blur();
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < state.suggestions.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
        
      case 'Tab':
        if (selectedSuggestionIndex >= 0 && state.suggestions[selectedSuggestionIndex]) {
          e.preventDefault();
          setInputValue(state.suggestions[selectedSuggestionIndex]);
          setShowSuggestions(false);
        }
        break;
    }
  }, [selectedSuggestionIndex, state.suggestions, handleSearch]);

  /**
   * Handle suggestion click
   */
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  }, [handleSearch]);

  /**
   * Handle provider change
   */
  const handleProviderChange = useCallback((providerId: string) => {
    setProvider(providerId);
    if (inputValue.trim()) {
      handleSearch();
    }
  }, [setProvider, inputValue, handleSearch]);

  /**
   * Handle focus events
   */
  const handleFocus = useCallback(() => {
    if (inputValue.length > 1 && state.suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [inputValue, state.suggestions.length]);

  const handleBlur = useCallback(() => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 150);
  }, []);

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        {/* Provider Selector */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <select
            value={state.activeProvider}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="text-sm bg-transparent border-none outline-none text-gray-600 dark:text-gray-400 cursor-pointer"
          >
            {config.providers.map(provider => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full pl-20 pr-20 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />

        {/* Action Buttons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          {state.isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-500"></div>
          )}
          
          {inputValue && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {showAdvanced && (
            <button
              onClick={openSearch}
              className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
              title="Advanced search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </button>
          )}

          <button
            onClick={() => handleSearch()}
            disabled={state.isLoading}
            className="px-4 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && state.suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {state.suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion}-${index}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                index === selectedSuggestionIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
            >
              <span className="text-gray-900 dark:text-gray-100">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* Quick Filters */}
      {showFilters && state.quickFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {state.quickFilters.map(filter => (
            <button
              key={filter.id}
              onClick={() => toggleQuickFilter?.(filter.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter.enabled
                  ? `bg-${filter.color || 'blue'}-100 text-${filter.color || 'blue'}-700 dark:bg-${filter.color || 'blue'}-900 dark:text-${filter.color || 'blue'}-300`
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {filter.icon && <span className="mr-1">{filter.icon}</span>}
              {filter.label}
            </button>
          ))}
        </div>
      )}

      {/* Error Display */}
      {state.error && (
        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 dark:text-red-300 text-sm">{state.error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
