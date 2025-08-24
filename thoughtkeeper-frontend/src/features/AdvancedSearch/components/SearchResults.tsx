import React, { useCallback, useMemo } from 'react';
import { useAdvancedSearch } from '../AdvancedSearchProvider';
import type { SearchResultsProps, SearchResultItem } from '../types';

/**
 * Search Results Component
 * Displays search results with highlighting, pagination, and sorting
 */
export function SearchResults<T = any>({
  results,
  loading = false,
  error = null,
  emptyMessage = 'No results found',
  renderItem,
  onLoadMore,
  className = ''
}: SearchResultsProps<T>) {
  const { state, updateSort, selectFacet, unselectFacet } = useAdvancedSearch();

  /**
   * Handle sort change
   */
  const handleSortChange = useCallback((field: string, direction: 'asc' | 'desc') => {
    updateSort({ field, direction });
  }, [updateSort]);

  /**
   * Render search statistics
   */
  const renderStats = useMemo(() => {
    if (!results) return null;

    return (
      <div className="flex items-center justify-between mb-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <span>
            {results.totalCount.toLocaleString()} result{results.totalCount !== 1 ? 's' : ''}
            {results.took > 0 && (
              <span className="text-gray-500"> in {results.took}ms</span>
            )}
          </span>
          
          {results.totalPages > 1 && (
            <span>
              Page {results.currentPage} of {results.totalPages}
            </span>
          )}
        </div>

        {/* Sort Controls */}
        {state.currentQuery?.sort && (
          <div className="flex items-center space-x-2">
            <span>Sort by:</span>
            <button
              onClick={() => handleSortChange(
                state.currentQuery!.sort!.field, 
                state.currentQuery!.sort!.direction === 'asc' ? 'desc' : 'asc'
              )}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="capitalize">{state.currentQuery.sort.field}</span>
              <svg 
                className={`w-3 h-3 transform ${state.currentQuery.sort.direction === 'desc' ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }, [results, state.currentQuery?.sort, handleSortChange]);

  /**
   * Render facets if available
   */
  const renderFacets = useMemo(() => {
    if (!results?.facets || results.facets.length === 0) return null;

    return (
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
          Refine Results
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.facets.map(facet => (
            <div key={facet.field}>
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                {facet.label}
              </h4>
              <div className="space-y-1">
                {facet.values.slice(0, 5).map(value => (
                  <label key={`${value.value}`} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={value.selected || false}
                      onChange={() => {
                        if (value.selected) {
                          unselectFacet?.(facet.field, value.value);
                        } else {
                          selectFacet?.(facet.field, value.value);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300 flex-1">
                      {value.label}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {value.count}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }, [results?.facets, state]);

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Searching...</span>
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Search Error
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render empty state
   */
  if (!results || results.items.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {emptyMessage}
            </h3>
            {results?.query.text && (
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search terms or filters
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {renderStats}
      {renderFacets}
      
      {/* Results List */}
      <div className="space-y-4">
        {results.items.map((item, index) => (
          <div
            key={`${item.item.id || index}`}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
          >
            {renderItem(item, index)}
            
            {/* Search Score and Matches (Development mode) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Score: {item.score.toFixed(3)}</span>
                  {item.matchedFields.length > 0 && (
                    <span>Matched: {item.matchedFields.join(', ')}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More */}
      {onLoadMore && results.hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={onLoadMore}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Load More Results
          </button>
        </div>
      )}

      {/* Pagination Info */}
      {results.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <span>
            Showing {((results.currentPage - 1) * (results.query.limit || 20)) + 1} to{' '}
            {Math.min(results.currentPage * (results.query.limit || 20), results.totalCount)} of{' '}
            {results.totalCount} results
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Search Result Item Component
 * Helper component for rendering individual search result items
 */
interface SearchResultItemProps<T = any> {
  item: SearchResultItem<T>;
  className?: string;
  showScore?: boolean;
  showHighlights?: boolean;
  children: React.ReactNode;
}

export function SearchResultItemWrapper<T = any>({
  item,
  className = '',
  showScore = false,
  showHighlights = true,
  children
}: SearchResultItemProps<T>) {
  return (
    <div className={`search-result-item ${className}`}>
      {children}
      
      {/* Highlights */}
      {showHighlights && item.highlights && item.highlights.length > 0 && (
        <div className="mt-3 space-y-2">
          {item.highlights.map((highlight, index) => (
            <div key={`${highlight.field}-${index}`} className="text-sm">
              <span className="font-medium text-gray-600 dark:text-gray-400 capitalize">
                {highlight.field}:
              </span>
              <div className="text-gray-700 dark:text-gray-300">
                {highlight.fragments.map((fragment, fragIndex) => (
                  <span
                    key={fragIndex}
                    dangerouslySetInnerHTML={{ __html: fragment }}
                    className="ml-2"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Snippet */}
      {item.snippet && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <span dangerouslySetInnerHTML={{ __html: item.snippet }} />
        </div>
      )}

      {/* Score */}
      {showScore && (
        <div className="mt-2 text-xs text-gray-500">
          Relevance: {(item.score * 100).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

export default SearchResults;
