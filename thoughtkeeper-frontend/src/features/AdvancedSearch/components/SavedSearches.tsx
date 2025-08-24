import React, { useState, useCallback } from 'react';
import { useAdvancedSearch } from '../AdvancedSearchProvider';
import type { SavedSearchesProps, SavedSearch } from '../types';

/**
 * Saved Searches Component
 * Interface for managing saved search queries
 */
export const SavedSearches: React.FC<SavedSearchesProps> = ({
  searches,
  onLoad,
  onDelete,
  onSave,
  className = ''
}) => {
  const { state } = useAdvancedSearch();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'lastUsed' | 'usageCount'>('lastUsed');
  const [filterBy, setFilterBy] = useState<'all' | 'pinned' | 'recent'>('all');

  /**
   * Handle save current search
   */
  const handleSave = useCallback(async () => {
    if (!saveName.trim()) return;

    try {
      await onSave(saveName.trim(), saveDescription.trim() || undefined);
      setSaveName('');
      setSaveDescription('');
      setShowSaveDialog(false);
    } catch (error) {
      console.error('Failed to save search:', error);
    }
  }, [saveName, saveDescription, onSave]);

  /**
   * Filter and sort searches
   */
  const filteredSearches = React.useMemo(() => {
    let filtered = searches;

    // Apply filters
    switch (filterBy) {
      case 'pinned':
        filtered = searches.filter(search => search.isPinned);
        break;
      case 'recent':
        const recentThreshold = new Date();
        recentThreshold.setDate(recentThreshold.getDate() - 7);
        filtered = searches.filter(search => new Date(search.lastUsed) > recentThreshold);
        break;
      default:
        break;
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'lastUsed':
          return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
        case 'usageCount':
          return b.usageCount - a.usageCount;
        default:
          return 0;
      }
    });
  }, [searches, filterBy, sortBy]);

  /**
   * Format date for display
   */
  const formatDate = useCallback((date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  }, []);

  /**
   * Generate search summary
   */
  const getSearchSummary = useCallback((search: SavedSearch | SearchQuery): string => {
    const parts: string[] = [];

    if (search.text) {
      parts.push(`"${search.text}"`);
    }

    const activeFilters = search.filters?.filter(f => f.enabled) || [];
    if (activeFilters.length > 0) {
      parts.push(`${activeFilters.length} filter${activeFilters.length !== 1 ? 's' : ''}`);
    }

    if (search.sort) {
      parts.push(`sorted by ${search.sort.field}`);
    }

    return parts.length > 0 ? parts.join(' • ') : 'Empty search';
  }, []);

  return (
    <div className={`saved-searches ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Saved Searches
        </h3>
        
        {/* Save Current Search */}
        {state.currentQuery && (
          <button
            onClick={() => setShowSaveDialog(true)}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
          >
            Save Current
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        {/* Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Show:</label>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as typeof filterBy)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
          >
            <option value="all">All Searches</option>
            <option value="pinned">Pinned Only</option>
            <option value="recent">Recent (7 days)</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
          >
            <option value="lastUsed">Last Used</option>
            <option value="name">Name</option>
            <option value="usageCount">Most Used</option>
          </select>
        </div>
      </div>

      {/* Searches List */}
      {filteredSearches.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Saved Searches
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            {filterBy === 'all' 
              ? 'Save your frequently used searches for quick access'
              : `No searches found for "${filterBy}"`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSearches.map(search => (
            <div
              key={search.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Search Name and Tags */}
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {search.name}
                    </h4>
                    
                    {search.isPinned && (
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    )}
                    
                    {search.isShared && (
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    )}

                    {search.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {search.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {search.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{search.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {search.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {search.description}
                    </p>
                  )}

                  {/* Search Summary */}
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                    {getSearchSummary(search)}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Used {search.usageCount} time{search.usageCount !== 1 ? 's' : ''}</span>
                    <span>Last used {formatDate(new Date(search.lastUsed))}</span>
                    <span>Created {formatDate(new Date(search.createdAt))}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onLoad(search)}
                    className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="Load search"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => onDelete(search.id)}
                    className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Delete search"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Save Current Search
            </h3>
            
            <div className="space-y-4">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Enter search name..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Current Search Preview */}
              {state.currentQuery && (
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Preview:
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getSearchSummary(state.currentQuery)}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveName('');
                  setSaveDescription('');
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!saveName.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded transition-colors"
              >
                Save Search
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedSearches;
