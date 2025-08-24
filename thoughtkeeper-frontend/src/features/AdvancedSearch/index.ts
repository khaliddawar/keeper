/**
 * Advanced Search Feature
 * Comprehensive search and filtering system for ThoughtKeeper
 */

// Main provider and context
export { AdvancedSearchProvider, useAdvancedSearch } from './AdvancedSearchProvider';

// Components
export { default as SearchBar } from './components/SearchBar';
export { SearchResults, SearchResultItemWrapper } from './components/SearchResults';
export { default as SearchFilters } from './components/SearchFilters';
export { default as SavedSearches } from './components/SavedSearches';

// Search providers
export {
  searchRegistry,
  BaseSearchProvider,
  TasksSearchProvider,
  NotebooksSearchProvider,
  SearchProviderRegistry
} from './providers';

// Types
export type {
  // Core search types
  SearchOperator,
  SortDirection,
  DateRange,
  SearchField,
  SearchFieldOption,
  SearchQuery,
  SearchFilter,
  SearchSort,
  
  // Results and items
  SearchResults,
  SearchResultItem,
  SearchHighlight,
  SearchFacet,
  SearchFacetValue,
  
  // Saved searches and history
  SavedSearch,
  SearchHistory,
  SearchHistoryItem,
  
  // Provider and configuration
  SearchProvider,
  SearchConfig,
  SearchUIState,
  SearchContext,
  
  // Quick filters and features
  QuickFilter,
  SearchFeatures,
  SearchMetrics,
  SearchExport,
  
  // Indexing
  SearchIndex,
  SearchIndexConfig,
  
  // Component props
  SearchBarProps,
  SearchFiltersProps,
  SearchResultsProps,
  SavedSearchesProps
} from './types';

// Utility functions and presets
export const SearchUtils = {
  /**
   * Create a basic search query
   */
  createQuery: (text?: string, filters: SearchFilter[] = []): SearchQuery => ({
    id: `query-${Date.now()}`,
    text: text || '',
    filters,
    createdAt: new Date(),
    updatedAt: new Date()
  }),

  /**
   * Create a search filter
   */
  createFilter: (
    field: string,
    operator: SearchOperator = 'contains',
    value: any,
    enabled: boolean = true,
    negate: boolean = false
  ): SearchFilter => ({
    field,
    operator,
    value,
    enabled,
    negate
  }),

  /**
   * Create a quick filter
   */
  createQuickFilter: (
    id: string,
    label: string,
    filter: SearchFilter,
    icon?: string,
    color?: string
  ): QuickFilter => ({
    id,
    label,
    filter,
    icon,
    color,
    enabled: false
  }),

  /**
   * Escape special characters for regex search
   */
  escapeRegex: (text: string): string => {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },

  /**
   * Generate search suggestions from text
   */
  generateSuggestions: (text: string, existingSuggestions: string[] = []): string[] => {
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const suggestions = [...existingSuggestions];
    
    // Add word variations
    words.forEach(word => {
      if (!suggestions.includes(word)) {
        suggestions.push(word);
      }
      
      // Add partial matches
      if (word.length > 4) {
        const partial = word.substring(0, word.length - 1);
        if (!suggestions.includes(partial)) {
          suggestions.push(partial);
        }
      }
    });
    
    return suggestions.slice(0, 10);
  },

  /**
   * Format search results count
   */
  formatResultCount: (count: number): string => {
    if (count === 0) return 'No results';
    if (count === 1) return '1 result';
    if (count < 1000) return `${count} results`;
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k results`;
    return `${(count / 1000000).toFixed(1)}m results`;
  },

  /**
   * Calculate search relevance score
   */
  calculateRelevance: (item: any, searchTerms: string[]): number => {
    let score = 0;
    const text = JSON.stringify(item).toLowerCase();
    
    searchTerms.forEach(term => {
      const termCount = (text.match(new RegExp(term.toLowerCase(), 'g')) || []).length;
      score += termCount;
    });
    
    return score;
  },

  /**
   * Highlight search terms in text
   */
  highlightText: (text: string, terms: string[], highlightClass: string = 'search-highlight'): string => {
    if (!terms.length) return text;
    
    let highlightedText = text;
    terms.forEach(term => {
      const regex = new RegExp(`(${SearchUtils.escapeRegex(term)})`, 'gi');
      highlightedText = highlightedText.replace(regex, `<span class="${highlightClass}">$1</span>`);
    });
    
    return highlightedText;
  }
};

// Common quick filters
export const CommonQuickFilters = {
  // Task filters
  tasks: {
    pending: SearchUtils.createQuickFilter(
      'tasks-pending',
      'Pending',
      SearchUtils.createFilter('status', 'equals', 'pending'),
      '⏳',
      'yellow'
    ),
    inProgress: SearchUtils.createQuickFilter(
      'tasks-in-progress',
      'In Progress',
      SearchUtils.createFilter('status', 'equals', 'in_progress'),
      '🔄',
      'blue'
    ),
    completed: SearchUtils.createQuickFilter(
      'tasks-completed',
      'Completed',
      SearchUtils.createFilter('status', 'equals', 'completed'),
      '✅',
      'green'
    ),
    highPriority: SearchUtils.createQuickFilter(
      'tasks-high-priority',
      'High Priority',
      SearchUtils.createFilter('priority', 'equals', 'high'),
      '🔥',
      'red'
    ),
    dueToday: SearchUtils.createQuickFilter(
      'tasks-due-today',
      'Due Today',
      SearchUtils.createFilter('dueDate', 'equals', new Date().toISOString().split('T')[0]),
      '📅',
      'orange'
    )
  },
  
  // Notebook filters
  notebooks: {
    favorites: SearchUtils.createQuickFilter(
      'notebooks-favorites',
      'Favorites',
      SearchUtils.createFilter('isFavorite', 'equals', true),
      '⭐',
      'yellow'
    ),
    work: SearchUtils.createQuickFilter(
      'notebooks-work',
      'Work',
      SearchUtils.createFilter('category', 'equals', 'work'),
      '💼',
      'blue'
    ),
    personal: SearchUtils.createQuickFilter(
      'notebooks-personal',
      'Personal',
      SearchUtils.createFilter('category', 'equals', 'personal'),
      '👤',
      'green'
    ),
    shared: SearchUtils.createQuickFilter(
      'notebooks-shared',
      'Shared',
      SearchUtils.createFilter('collaborators', 'contains', ''),
      '👥',
      'purple'
    ),
    recentlyUpdated: SearchUtils.createQuickFilter(
      'notebooks-recent',
      'Recently Updated',
      SearchUtils.createFilter('updatedAt', 'contains', ''), // Would need custom logic
      '🕐',
      'gray'
    )
  }
};

// Default search configuration
export const DefaultSearchConfig = {
  providers: [],
  defaultProvider: 'tasks',
  enableFullTextSearch: true,
  enableAutoComplete: true,
  enableSearchHistory: true,
  enableSavedSearches: true,
  enableRealTimeSearch: true,
  debounceMs: 300,
  maxResults: 50,
  highlightTags: {
    open: '<mark>',
    close: '</mark>'
  },
  fuzzySearchConfig: {
    threshold: 0.6,
    distance: 100
  }
};

// Feature detection
export const SearchFeatureDetection = {
  /**
   * Check if the browser supports IndexedDB for offline search
   */
  supportsIndexedDB: (): boolean => {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  },

  /**
   * Check if the browser supports Web Workers for background search
   */
  supportsWebWorkers: (): boolean => {
    return typeof window !== 'undefined' && 'Worker' in window;
  },

  /**
   * Check if the browser supports Service Workers for offline capabilities
   */
  supportsServiceWorkers: (): boolean => {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator;
  },

  /**
   * Check if the browser supports the Intersection Observer API
   */
  supportsIntersectionObserver: (): boolean => {
    return typeof window !== 'undefined' && 'IntersectionObserver' in window;
  },

  /**
   * Get supported search features based on browser capabilities
   */
  getSupportedFeatures: (): SearchFeatures => ({
    fullTextSearch: true, // Always supported
    fuzzySearch: true, // Always supported
    regexSearch: true, // Always supported
    fieldSearch: true, // Always supported
    facetedSearch: true, // Always supported
    savedSearches: typeof window !== 'undefined' && 'localStorage' in window,
    searchHistory: typeof window !== 'undefined' && 'localStorage' in window,
    autoComplete: true, // Always supported
    realTimeSearch: true, // Always supported
    searchSuggestions: true, // Always supported
    searchHighlighting: true, // Always supported
    searchExport: typeof window !== 'undefined' && 'Blob' in window && 'URL' in window
  })
};

// Development utilities
if (process.env.NODE_ENV === 'development') {
  (window as any).ThoughtKeeperSearch = {
    searchRegistry,
    SearchUtils,
    CommonQuickFilters,
    SearchFeatureDetection
  };
  
  console.log('🔍 Advanced Search system loaded');
  console.log('  📊 Features:', SearchFeatureDetection.getSupportedFeatures());
  console.log('  🛠️  Utils available at window.ThoughtKeeperSearch');
}
