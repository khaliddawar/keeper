/**
 * Advanced Search Types
 * Defines interfaces for the advanced search and filtering system
 */

// Search query types
export type SearchOperator = 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'regex' | 'fuzzy';
export type SortDirection = 'asc' | 'desc';
export type DateRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

// Search field definitions
export interface SearchField {
  key: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'multi-select' | 'number' | 'boolean';
  searchable: boolean;
  filterable: boolean;
  sortable: boolean;
  options?: SearchFieldOption[];
  placeholder?: string;
}

export interface SearchFieldOption {
  value: string | number | boolean;
  label: string;
  description?: string;
  color?: string;
  icon?: string;
}

// Search query structure
export interface SearchQuery {
  id: string;
  text?: string;
  filters: SearchFilter[];
  sort?: SearchSort;
  limit?: number;
  offset?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilter {
  field: string;
  operator: SearchOperator;
  value: any;
  enabled: boolean;
  negate?: boolean;
}

export interface SearchSort {
  field: string;
  direction: SortDirection;
}

// Search results
export interface SearchResults<T = any> {
  items: SearchResultItem<T>[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
  facets?: SearchFacet[];
  suggestions?: string[];
  took: number; // milliseconds
  query: SearchQuery;
}

export interface SearchResultItem<T = any> {
  item: T;
  score: number;
  highlights?: SearchHighlight[];
  snippet?: string;
  matchedFields: string[];
}

export interface SearchHighlight {
  field: string;
  fragments: string[];
}

export interface SearchFacet {
  field: string;
  label: string;
  values: SearchFacetValue[];
}

export interface SearchFacetValue {
  value: any;
  label: string;
  count: number;
  selected?: boolean;
}

// Saved searches and history
export interface SavedSearch extends SearchQuery {
  name: string;
  description?: string;
  isPinned: boolean;
  isShared: boolean;
  tags: string[];
  usageCount: number;
  lastUsed: Date;
  createdBy?: string;
}

export interface SearchHistory {
  searches: SearchHistoryItem[];
  maxItems: number;
}

export interface SearchHistoryItem {
  query: SearchQuery;
  resultsCount: number;
  executedAt: Date;
}

// Search providers and configuration
export interface SearchProvider {
  id: string;
  name: string;
  description: string;
  fields: SearchField[];
  supportsFullText: boolean;
  supportsFacets: boolean;
  supportsHighlighting: boolean;
  supportsFuzzySearch: boolean;
}

export interface SearchConfig {
  providers: SearchProvider[];
  defaultProvider: string;
  enableFullTextSearch: boolean;
  enableAutoComplete: boolean;
  enableSearchHistory: boolean;
  enableSavedSearches: boolean;
  enableRealTimeSearch: boolean;
  debounceMs: number;
  maxResults: number;
  highlightTags: {
    open: string;
    close: string;
  };
  fuzzySearchConfig: {
    threshold: number;
    distance: number;
  };
}

// Search UI state
export interface SearchUIState {
  isOpen: boolean;
  isLoading: boolean;
  activeProvider: string;
  currentQuery: SearchQuery | null;
  results: SearchResults | null;
  error: string | null;
  suggestions: string[];
  recentSearches: SearchHistoryItem[];
  savedSearches: SavedSearch[];
  selectedFacets: Record<string, any[]>;
  quickFilters: QuickFilter[];
}

export interface QuickFilter {
  id: string;
  label: string;
  filter: SearchFilter;
  icon?: string;
  color?: string;
  enabled: boolean;
}

// Search context and callbacks
export interface SearchContext {
  // State
  state: SearchUIState;
  
  // Configuration
  config: SearchConfig;
  
  // Actions
  search: (query: string | SearchQuery) => Promise<SearchResults>;
  clearSearch: () => void;
  updateQuery: (updates: Partial<SearchQuery>) => void;
  addFilter: (filter: SearchFilter) => void;
  removeFilter: (index: number) => void;
  toggleFilter: (index: number) => void;
  updateSort: (sort: SearchSort) => void;
  
  // Saved searches
  saveSearch: (name: string, description?: string) => Promise<void>;
  deleteSavedSearch: (id: string) => Promise<void>;
  loadSavedSearch: (id: string) => Promise<void>;
  
  // History
  clearHistory: () => void;
  removeFromHistory: (index: number) => void;
  
  // Auto-complete and suggestions
  getSuggestions: (text: string) => Promise<string[]>;
  
  // Facets and filters
  selectFacet: (field: string, value: any) => void;
  unselectFacet: (field: string, value: any) => void;
  clearFacets: (field?: string) => void;
  
  // Quick filters
  toggleQuickFilter: (id: string) => void;
  addQuickFilter: (filter: QuickFilter) => void;
  removeQuickFilter: (id: string) => void;
  
  // UI actions
  openSearch: () => void;
  closeSearch: () => void;
  setProvider: (providerId: string) => void;
}

// Advanced search features
export interface SearchFeatures {
  fullTextSearch: boolean;
  fuzzySearch: boolean;
  regexSearch: boolean;
  fieldSearch: boolean;
  facetedSearch: boolean;
  savedSearches: boolean;
  searchHistory: boolean;
  autoComplete: boolean;
  realTimeSearch: boolean;
  searchSuggestions: boolean;
  searchHighlighting: boolean;
  searchExport: boolean;
}

// Search performance metrics
export interface SearchMetrics {
  totalSearches: number;
  averageResponseTime: number;
  mostSearchedTerms: Array<{
    term: string;
    count: number;
  }>;
  popularFilters: Array<{
    filter: SearchFilter;
    usage: number;
  }>;
  searchAccuracy: number;
  userSatisfaction: number;
}

// Export search data types
export interface SearchExport {
  query: SearchQuery;
  results: SearchResults;
  exportedAt: Date;
  format: 'json' | 'csv' | 'excel';
}

// Search indexing (for full-text search simulation)
export interface SearchIndex {
  id: string;
  content: string;
  fields: Record<string, any>;
  boost: number;
  type: string;
  lastIndexed: Date;
}

export interface SearchIndexConfig {
  fields: Array<{
    name: string;
    boost: number;
    analyzer?: 'standard' | 'keyword' | 'text';
  }>;
  stopWords: string[];
  stemming: boolean;
  caseSensitive: boolean;
}

// Component props types
export interface SearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
  showFilters?: boolean;
  showAdvanced?: boolean;
  className?: string;
  onSearch?: (results: SearchResults) => void;
  onClear?: () => void;
}

export interface SearchFiltersProps {
  fields: SearchField[];
  filters: SearchFilter[];
  facets?: SearchFacet[];
  quickFilters?: QuickFilter[];
  onFiltersChange: (filters: SearchFilter[]) => void;
  onQuickFilterToggle?: (id: string) => void;
  className?: string;
}

export interface SearchResultsProps<T = any> {
  results: SearchResults<T> | null;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  renderItem: (item: SearchResultItem<T>, index: number) => React.ReactNode;
  onLoadMore?: () => void;
  className?: string;
}

export interface SavedSearchesProps {
  searches: SavedSearch[];
  onLoad: (search: SavedSearch) => void;
  onDelete: (id: string) => void;
  onSave: (name: string, description?: string) => void;
  className?: string;
}
