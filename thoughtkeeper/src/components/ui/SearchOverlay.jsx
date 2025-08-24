import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const SearchOverlay = ({ isOpen = false, onClose, initialQuery = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  // Mock search results
  const mockResults = [
    {
      id: 1,
      type: 'thought',
      title: 'Project brainstorming session notes',
      content: 'Key insights from the team meeting about the new product features...',
      tags: ['project', 'meeting', 'ideas'],
      date: '2025-08-17',
      folder: 'Work'
    },
    {
      id: 2,
      type: 'task',
      title: 'Review quarterly reports',
      content: 'Need to analyze Q3 performance metrics and prepare presentation...',
      tags: ['work', 'reports', 'urgent'],
      date: '2025-08-16',
      priority: 'high'
    },
    {
      id: 3,
      type: 'thought',
      title: 'Weekend hiking trip ideas',
      content: 'Research local trails and camping spots for the upcoming weekend...',
      tags: ['personal', 'outdoor', 'planning'],
      date: '2025-08-15',
      folder: 'Personal'
    }
  ];

  useEffect(() => {
    if (isOpen && searchInputRef?.current) {
      searchInputRef?.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery?.trim()) {
      setIsSearching(true);
      // Simulate API call
      const timer = setTimeout(() => {
        setSearchResults(mockResults?.filter(result => 
          result?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
          result?.content?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
          result?.tags?.some(tag => tag?.toLowerCase()?.includes(searchQuery?.toLowerCase()))
        ));
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleKeyDown = (e) => {
    if (e?.key === 'Escape') {
      onClose();
    } else if (e?.key === 'ArrowDown') {
      e?.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, searchResults?.length - 1));
    } else if (e?.key === 'ArrowUp') {
      e?.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e?.key === 'Enter' && selectedIndex >= 0) {
      e?.preventDefault();
      handleResultClick(searchResults?.[selectedIndex]);
    }
  };

  const handleResultClick = (result) => {
    if (result?.type === 'task') {
      navigate('/task-management');
    } else {
      navigate('/dashboard-thought-stream');
    }
    onClose();
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'task':
        return 'CheckSquare';
      case 'thought':
        return 'FileText';
      default:
        return 'File';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-error';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-success';
      default:
        return 'text-text-secondary';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] bg-black bg-opacity-50 animate-fade-in">
      <div className="flex items-start justify-center min-h-screen pt-16 px-4">
        <div className="w-full max-w-2xl bg-popover border border-border rounded-lg shadow-elevated animate-fade-in">
          {/* Search Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <Icon name="Search" size={20} className="text-text-secondary" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search thoughts, tasks, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none outline-none text-lg text-popover-foreground placeholder-text-secondary"
              />
              <Button variant="ghost" size="icon" onClick={onClose}>
                <Icon name="X" size={20} />
              </Button>
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {isSearching ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-text-secondary">Searching...</p>
              </div>
            ) : searchQuery?.trim() && searchResults?.length === 0 ? (
              <div className="p-8 text-center">
                <Icon name="Search" size={48} className="text-text-secondary mx-auto mb-4" />
                <p className="text-popover-foreground font-medium mb-2">No results found</p>
                <p className="text-text-secondary text-sm">Try adjusting your search terms or browse your content</p>
              </div>
            ) : searchResults?.length > 0 ? (
              <div className="py-2">
                {searchResults?.map((result, index) => (
                  <button
                    key={result?.id}
                    onClick={() => handleResultClick(result)}
                    className={`w-full p-4 text-left hover:bg-muted transition-micro ${
                      index === selectedIndex ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <Icon name={getResultIcon(result?.type)} size={16} className="text-text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-medium text-popover-foreground truncate">
                            {result?.title}
                          </h3>
                          {result?.priority && (
                            <span className={`text-xs font-medium ${getPriorityColor(result?.priority)}`}>
                              {result?.priority?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                          {result?.content}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-text-secondary">
                          <span>{result?.date}</span>
                          {result?.folder && <span>in {result?.folder}</span>}
                          <div className="flex items-center space-x-1">
                            {result?.tags?.slice(0, 3)?.map((tag) => (
                              <span key={tag} className="bg-muted px-2 py-1 rounded text-xs">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Icon name="Search" size={48} className="text-text-secondary mx-auto mb-4" />
                <p className="text-popover-foreground font-medium mb-2">Start typing to search</p>
                <p className="text-text-secondary text-sm">Find your thoughts, tasks, and ideas instantly</p>
              </div>
            )}
          </div>

          {/* Search Footer */}
          {searchQuery?.trim() && (
            <div className="p-4 border-t border-border bg-muted/50">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <div className="flex items-center space-x-4">
                  <span>↑↓ Navigate</span>
                  <span>↵ Select</span>
                  <span>Esc Close</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate(`/search-and-discovery?q=${encodeURIComponent(searchQuery)}`);
                    onClose();
                  }}
                >
                  View all results
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;