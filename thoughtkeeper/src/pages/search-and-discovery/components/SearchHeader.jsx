import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SearchHeader = ({ onFiltersToggle, hasActiveFilters }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
  const [searchHistory, setSearchHistory] = useState([
    'project brainstorming',
    'meeting notes',
    'weekend plans',
    'quarterly reports',
    'hiking trails'
  ]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const query = searchParams?.get('q');
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  const handleSearch = (query = searchQuery) => {
    if (query?.trim()) {
      setSearchParams({ q: query });
      // Add to search history if not already present
      if (!searchHistory?.includes(query?.trim())) {
        setSearchHistory(prev => [query?.trim(), ...prev?.slice(0, 4)]);
      }
    }
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e?.key === 'Enter') {
      e?.preventDefault();
      handleSearch();
    } else if (e?.key === 'Escape') {
      setShowSuggestions(false);
      searchInputRef?.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
    searchInputRef?.current?.focus();
  };

  return (
    <div className="bg-background border-b border-border sticky top-16 z-40">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4">
        <div className="flex items-center space-x-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="relative">
              <Icon
                name="Search"
                size={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary"
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search thoughts, tasks, and ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-12 pr-12 py-3 bg-input border border-border rounded-lg text-foreground placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-micro"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-foreground transition-micro"
                >
                  <Icon name="X" size={16} />
                </button>
              )}
            </div>

            {/* Search Suggestions */}
            {showSuggestions && searchHistory?.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-elevated z-50">
                <div className="p-2">
                  <div className="text-xs font-medium text-text-secondary px-2 py-1 mb-1">
                    Recent Searches
                  </div>
                  {searchHistory?.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(item)}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-muted rounded-lg transition-micro"
                    >
                      <Icon name="Clock" size={14} className="text-text-secondary" />
                      <span className="text-sm text-popover-foreground">{item}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          <Button
            variant="default"
            onClick={() => handleSearch()}
            disabled={!searchQuery?.trim()}
            iconName="Search"
            iconPosition="left"
            className="hidden sm:flex"
          >
            Search
          </Button>

          {/* Filters Toggle */}
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            onClick={onFiltersToggle}
            iconName="Filter"
            iconPosition="left"
            className="relative"
          >
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
            )}
          </Button>
        </div>

        {/* Search Stats */}
        {searchQuery && (
          <div className="mt-3 flex items-center justify-between text-sm text-text-secondary">
            <span>Showing results for "{searchQuery}"</span>
            <span>Found 24 results in 0.12s</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchHeader;