import React, { useMemo, useCallback } from 'react';
import { VirtualList } from './VirtualList';
import type { VirtualItemProps, VirtualizedSearchResults } from '../types';
import type { SearchResultItem } from '../../AdvancedSearch/types';

/**
 * Virtual Search Results Component
 * Virtualized search results with highlighting and metadata
 */
interface VirtualSearchResultsProps<T = any> extends VirtualizedSearchResults<T> {
  height?: number | string;
  className?: string;
  itemHeight?: number;
  showScore?: boolean;
  showHighlights?: boolean;
  showSnippets?: boolean;
  showMetadata?: boolean;
  emptyMessage?: string;
  enableInfiniteScroll?: boolean;
  onItemClick?: (item: SearchResultItem<T>, index: number) => void;
  onItemSelect?: (item: SearchResultItem<T>, selected: boolean) => void;
  selectedItems?: Set<string>;
}

export const VirtualSearchResults = <T = any,>({
  results,
  totalCount,
  renderItem,
  onLoadMore,
  loading = false,
  height = 400,
  className = '',
  itemHeight = 120,
  showScore = false,
  showHighlights = true,
  showSnippets = true,
  showMetadata = true,
  emptyMessage = 'No results found',
  enableInfiniteScroll = false,
  onItemClick,
  onItemSelect,
  selectedItems = new Set()
}: VirtualSearchResultsProps<T>) => {
  /**
   * Calculate dynamic item height based on search result content
   */
  const calculateItemHeight = useCallback((index: number, resultItem: SearchResultItem<T>): number => {
    let baseHeight = 60; // Base height for title and basic info
    
    // Add height for snippets
    if (showSnippets && resultItem.snippet) {
      const snippetLines = Math.ceil(resultItem.snippet.length / 80);
      baseHeight += Math.min(snippetLines * 16, 48); // Max 3 lines
    }
    
    // Add height for highlights
    if (showHighlights && resultItem.highlights && resultItem.highlights.length > 0) {
      baseHeight += resultItem.highlights.length * 20;
    }
    
    // Add height for metadata
    if (showMetadata) {
      baseHeight += 24;
    }
    
    // Add height for score display
    if (showScore) {
      baseHeight += 20;
    }
    
    return Math.max(baseHeight, 80); // Minimum height
  }, [showSnippets, showHighlights, showMetadata, showScore]);

  /**
   * Render individual search result item
   */
  const renderSearchResultItem = useCallback(({ 
    index, 
    item: resultItem, 
    style, 
    isVisible, 
    isScrolling 
  }: VirtualItemProps<SearchResultItem<T>>) => {
    const isSelected = selectedItems.has(resultItem.item.id || String(index));
    const isLastItem = index === results.length - 1;
    const shouldLoadMore = enableInfiniteScroll && isLastItem && onLoadMore && !loading;
    
    const handleItemClick = () => {
      onItemClick?.(resultItem, index);
    };
    
    const handleSelectClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onItemSelect?.(resultItem, !isSelected);
    };
    
    // Trigger load more for infinite scroll
    React.useEffect(() => {
      if (shouldLoadMore && isVisible) {
        onLoadMore();
      }
    }, [shouldLoadMore, isVisible]);
    
    return (
      <div
        style={style}
        className={`virtual-search-result-item ${className} ${isSelected ? 'selected' : ''} ${isScrolling ? 'scrolling' : ''}`}
      >
        <div
          className={`search-result-card p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md group ${
            'bg-white dark:bg-gray-700'
          } ${
            isSelected ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-200 dark:border-gray-600'
          } hover:border-gray-300 dark:hover:border-gray-500`}
          onClick={handleItemClick}
        >
          <div className="flex items-start space-x-3">
            {/* Selection checkbox */}
            {onItemSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={handleSelectClick}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            
            {/* Search result content */}
            <div className="flex-1 min-w-0">
              {/* Header with score and type */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {/* Result type indicator */}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    getTypeColor(resultItem.item?.type || 'unknown')
                  }`}>
                    {getTypeLabel(resultItem.item?.type || 'unknown')}
                  </span>
                  
                  {/* Matched fields */}
                  {resultItem.matchedFields.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {resultItem.matchedFields.slice(0, 3).map((field) => (
                        <span
                          key={field}
                          className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300 rounded"
                        >
                          {field}
                        </span>
                      ))}
                      {resultItem.matchedFields.length > 3 && (
                        <span className="text-xs text-gray-500">+{resultItem.matchedFields.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Relevance score */}
                {showScore && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">Relevance:</span>
                      <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(resultItem.score * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {(resultItem.score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Main content - delegate to renderItem prop */}
              <div className="mb-3">
                {renderItem(resultItem.item, index)}
              </div>
              
              {/* Snippet */}
              {showSnippets && resultItem.snippet && (
                <div className="mb-3">
                  <p 
                    className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: resultItem.snippet }}
                  />
                </div>
              )}
              
              {/* Highlights */}
              {showHighlights && resultItem.highlights && resultItem.highlights.length > 0 && (
                <div className="mb-3 space-y-1">
                  {resultItem.highlights.slice(0, 3).map((highlight, idx) => (
                    <div key={`highlight-${idx}`} className="text-sm">
                      <span className="font-medium text-gray-600 dark:text-gray-400 capitalize">
                        {highlight.field}:
                      </span>
                      <div className="text-gray-700 dark:text-gray-300 mt-1">
                        {highlight.fragments.slice(0, 2).map((fragment, fragIdx) => (
                          <span
                            key={`fragment-${fragIdx}`}
                            dangerouslySetInnerHTML={{ __html: fragment }}
                            className="block mb-1"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  {resultItem.highlights.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{resultItem.highlights.length - 3} more matches
                    </span>
                  )}
                </div>
              )}
              
              {/* Metadata */}
              {showMetadata && (
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-3">
                    {resultItem.item?.updatedAt && (
                      <span>
                        Updated: {new Date(resultItem.item.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                    
                    {resultItem.item?.createdAt && (
                      <span>
                        Created: {new Date(resultItem.item.createdAt).toLocaleDateString()}
                      </span>
                    )}
                    
                    {resultItem.item?.tags && resultItem.item.tags.length > 0 && (
                      <span>
                        {resultItem.item.tags.length} tag{resultItem.item.tags.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  
                  {/* Item-specific metadata */}
                  <div className="flex items-center space-x-2">
                    {resultItem.item?.status && (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        getStatusColor(resultItem.item.status)
                      }`}>
                        {resultItem.item.status}
                      </span>
                    )}
                    
                    {resultItem.item?.priority && resultItem.item.priority !== 'medium' && (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        getPriorityColor(resultItem.item.priority)
                      }`}>
                        {resultItem.item.priority}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Loading indicator for infinite scroll */}
        {isLastItem && loading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading more results...</span>
          </div>
        )}
      </div>
    );
  }, [
    results.length, selectedItems, enableInfiniteScroll, onLoadMore, loading,
    onItemClick, onItemSelect, showScore, showSnippets, showHighlights, 
    showMetadata, className, renderItem
  ]);

  // Empty state
  if (!loading && results.length === 0) {
    return (
      <div 
        className="flex items-center justify-center text-gray-500 dark:text-gray-400"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-lg font-medium">{emptyMessage}</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search terms or filters</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && results.length === 0) {
    return (
      <div 
        className="flex items-center justify-center text-gray-500 dark:text-gray-400"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Searching...</p>
        </div>
      </div>
    );
  }

  return (
    <VirtualList
      items={results}
      height={height}
      itemHeight={calculateItemHeight}
      renderItem={renderSearchResultItem}
      className={`virtual-search-results ${className}`}
      overscanCount={5}
      enableSmoothScrolling={true}
      maintainScrollPosition={true}
    />
  );
};

/**
 * Utility functions for styling
 */
function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    task: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    notebook: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    subtask: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    unknown: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  };
  return colors[type] || colors.unknown;
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    task: 'Task',
    notebook: 'Notebook',
    subtask: 'Subtask',
    unknown: 'Item'
  };
  return labels[type] || 'Item';
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };
  return colors[status] || colors.pending;
}

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };
  return colors[priority] || colors.medium;
}

/**
 * Search Result Item Wrapper Component
 * Helper component for consistent search result item styling
 */
interface SearchResultItemWrapperProps {
  children: React.ReactNode;
  score: number;
  matchedFields: string[];
  highlights?: any[];
  className?: string;
  showScore?: boolean;
  showMatches?: boolean;
}

export const SearchResultItemWrapper: React.FC<SearchResultItemWrapperProps> = ({
  children,
  score,
  matchedFields,
  highlights = [],
  className = '',
  showScore = false,
  showMatches = true
}) => {
  return (
    <div className={`search-result-item-wrapper ${className}`}>
      {/* Header with metadata */}
      {(showScore || showMatches) && (
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100 dark:border-gray-600">
          {showMatches && matchedFields.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-gray-500 mr-1">Matches:</span>
              {matchedFields.map((field) => (
                <span
                  key={field}
                  className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded"
                >
                  {field}
                </span>
              ))}
            </div>
          )}
          
          {showScore && (
            <div className="text-xs text-gray-500">
              Relevance: {(score * 100).toFixed(1)}%
            </div>
          )}
        </div>
      )}
      
      {/* Main content */}
      <div className="search-result-content">
        {children}
      </div>
      
      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
          <div className="space-y-2">
            {highlights.slice(0, 2).map((highlight, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium text-gray-600 dark:text-gray-400 capitalize">
                  {highlight.field}:
                </span>
                <div className="text-gray-700 dark:text-gray-300 mt-1">
                  {highlight.fragments.slice(0, 1).map((fragment: string, fragIndex: number) => (
                    <span
                      key={fragIndex}
                      dangerouslySetInnerHTML={{ __html: fragment }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualSearchResults;
