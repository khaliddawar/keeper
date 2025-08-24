import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type {
  SearchContext,
  SearchUIState,
  SearchConfig,
  SearchQuery,
  SearchResults,
  SearchFilter,
  SearchSort,
  SavedSearch,
  SearchHistoryItem,
  QuickFilter
} from './types';
import { searchRegistry } from './providers';

/**
 * Advanced Search Context
 */
const AdvancedSearchContext = createContext<SearchContext | null>(null);

/**
 * Search UI State Actions
 */
type SearchAction =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_PROVIDER'; providerId: string }
  | { type: 'SET_QUERY'; query: SearchQuery | null }
  | { type: 'SET_RESULTS'; results: SearchResults | null }
  | { type: 'SET_SUGGESTIONS'; suggestions: string[] }
  | { type: 'SET_SAVED_SEARCHES'; savedSearches: SavedSearch[] }
  | { type: 'SET_RECENT_SEARCHES'; recentSearches: SearchHistoryItem[] }
  | { type: 'TOGGLE_SEARCH'; isOpen?: boolean }
  | { type: 'UPDATE_QUERY'; updates: Partial<SearchQuery> }
  | { type: 'ADD_FILTER'; filter: SearchFilter }
  | { type: 'REMOVE_FILTER'; index: number }
  | { type: 'TOGGLE_FILTER'; index: number }
  | { type: 'UPDATE_SORT'; sort: SearchSort }
  | { type: 'SELECT_FACET'; field: string; value: any }
  | { type: 'UNSELECT_FACET'; field: string; value: any }
  | { type: 'CLEAR_FACETS'; field?: string }
  | { type: 'TOGGLE_QUICK_FILTER'; filterId: string }
  | { type: 'ADD_QUICK_FILTER'; filter: QuickFilter }
  | { type: 'REMOVE_QUICK_FILTER'; filterId: string };

/**
 * Default search configuration
 */
const DEFAULT_CONFIG: SearchConfig = {
  providers: searchRegistry.getAllProviders(),
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

/**
 * Initial search UI state
 */
const INITIAL_STATE: SearchUIState = {
  isOpen: false,
  isLoading: false,
  activeProvider: 'tasks',
  currentQuery: null,
  results: null,
  error: null,
  suggestions: [],
  recentSearches: [],
  savedSearches: [],
  selectedFacets: {},
  quickFilters: []
};

/**
 * Search state reducer
 */
function searchReducer(state: SearchUIState, action: SearchAction): SearchUIState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading };
      
    case 'SET_ERROR':
      return { ...state, error: action.error, isLoading: false };
      
    case 'SET_PROVIDER':
      return { 
        ...state, 
        activeProvider: action.providerId,
        results: null,
        error: null
      };
      
    case 'SET_QUERY':
      return { ...state, currentQuery: action.query };
      
    case 'SET_RESULTS':
      return { 
        ...state, 
        results: action.results,
        isLoading: false,
        error: null
      };
      
    case 'SET_SUGGESTIONS':
      return { ...state, suggestions: action.suggestions };
      
    case 'SET_SAVED_SEARCHES':
      return { ...state, savedSearches: action.savedSearches };
      
    case 'SET_RECENT_SEARCHES':
      return { ...state, recentSearches: action.recentSearches };
      
    case 'TOGGLE_SEARCH':
      return { 
        ...state, 
        isOpen: action.isOpen !== undefined ? action.isOpen : !state.isOpen,
        error: action.isOpen === false ? null : state.error
      };
      
    case 'UPDATE_QUERY':
      if (!state.currentQuery) {
        const newQuery: SearchQuery = {
          id: `query-${Date.now()}`,
          text: '',
          filters: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          ...action.updates
        };
        return { ...state, currentQuery: newQuery };
      }
      
      return {
        ...state,
        currentQuery: {
          ...state.currentQuery,
          ...action.updates,
          updatedAt: new Date()
        }
      };
      
    case 'ADD_FILTER':
      if (!state.currentQuery) return state;
      
      return {
        ...state,
        currentQuery: {
          ...state.currentQuery,
          filters: [...state.currentQuery.filters, action.filter],
          updatedAt: new Date()
        }
      };
      
    case 'REMOVE_FILTER':
      if (!state.currentQuery) return state;
      
      const newFilters = state.currentQuery.filters.filter((_, i) => i !== action.index);
      return {
        ...state,
        currentQuery: {
          ...state.currentQuery,
          filters: newFilters,
          updatedAt: new Date()
        }
      };
      
    case 'TOGGLE_FILTER':
      if (!state.currentQuery) return state;
      
      const toggledFilters = state.currentQuery.filters.map((filter, i) =>
        i === action.index ? { ...filter, enabled: !filter.enabled } : filter
      );
      
      return {
        ...state,
        currentQuery: {
          ...state.currentQuery,
          filters: toggledFilters,
          updatedAt: new Date()
        }
      };
      
    case 'UPDATE_SORT':
      if (!state.currentQuery) return state;
      
      return {
        ...state,
        currentQuery: {
          ...state.currentQuery,
          sort: action.sort,
          updatedAt: new Date()
        }
      };
      
    case 'SELECT_FACET':
      const selectedFacets = { ...state.selectedFacets };
      if (!selectedFacets[action.field]) {
        selectedFacets[action.field] = [];
      }
      if (!selectedFacets[action.field].includes(action.value)) {
        selectedFacets[action.field].push(action.value);
      }
      
      return { ...state, selectedFacets };
      
    case 'UNSELECT_FACET':
      const unselectedFacets = { ...state.selectedFacets };
      if (unselectedFacets[action.field]) {
        unselectedFacets[action.field] = unselectedFacets[action.field].filter(
          value => value !== action.value
        );
        if (unselectedFacets[action.field].length === 0) {
          delete unselectedFacets[action.field];
        }
      }
      
      return { ...state, selectedFacets: unselectedFacets };
      
    case 'CLEAR_FACETS':
      if (action.field) {
        const clearedFacets = { ...state.selectedFacets };
        delete clearedFacets[action.field];
        return { ...state, selectedFacets: clearedFacets };
      } else {
        return { ...state, selectedFacets: {} };
      }
      
    case 'TOGGLE_QUICK_FILTER':
      const updatedQuickFilters = state.quickFilters.map(filter =>
        filter.id === action.filterId
          ? { ...filter, enabled: !filter.enabled }
          : filter
      );
      
      return { ...state, quickFilters: updatedQuickFilters };
      
    case 'ADD_QUICK_FILTER':
      return {
        ...state,
        quickFilters: [...state.quickFilters, action.filter]
      };
      
    case 'REMOVE_QUICK_FILTER':
      return {
        ...state,
        quickFilters: state.quickFilters.filter(filter => filter.id !== action.filterId)
      };
      
    default:
      return state;
  }
}

/**
 * Advanced Search Provider Props
 */
interface AdvancedSearchProviderProps {
  children: React.ReactNode;
  config?: Partial<SearchConfig>;
}

/**
 * Advanced Search Provider Component
 */
export const AdvancedSearchProvider: React.FC<AdvancedSearchProviderProps> = ({
  children,
  config: configOverrides = {}
}) => {
  const [state, dispatch] = useReducer(searchReducer, INITIAL_STATE);
  const config = { ...DEFAULT_CONFIG, ...configOverrides };

  // Load saved searches and history on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  /**
   * Load saved searches and search history from localStorage
   */
  const loadSavedData = useCallback(() => {
    try {
      // Load saved searches
      const savedSearchesData = localStorage.getItem('thoughtkeeper_saved_searches');
      if (savedSearchesData) {
        const savedSearches = JSON.parse(savedSearchesData);
        dispatch({ type: 'SET_SAVED_SEARCHES', savedSearches });
      }

      // Load search history
      const historyData = localStorage.getItem('thoughtkeeper_search_history');
      if (historyData) {
        const recentSearches = JSON.parse(historyData);
        dispatch({ type: 'SET_RECENT_SEARCHES', recentSearches });
      }
    } catch (error) {
      console.error('Failed to load saved search data:', error);
    }
  }, []);

  /**
   * Save data to localStorage
   */
  const saveToStorage = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  }, []);

  /**
   * Perform search
   */
  const search = useCallback(async (query: string | SearchQuery): Promise<SearchResults> => {
    dispatch({ type: 'SET_LOADING', loading: true });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      let searchQuery: SearchQuery;

      if (typeof query === 'string') {
        searchQuery = {
          id: `search-${Date.now()}`,
          text: query,
          filters: [],
          limit: config.maxResults,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      } else {
        searchQuery = query;
      }

      // Update current query
      dispatch({ type: 'SET_QUERY', query: searchQuery });

      // Perform search using the active provider
      const results = await searchRegistry.search(searchQuery, state.activeProvider);
      
      dispatch({ type: 'SET_RESULTS', results });

      // Add to search history
      if (config.enableSearchHistory && searchQuery.text) {
        const historyItem: SearchHistoryItem = {
          query: searchQuery,
          resultsCount: results.totalCount,
          executedAt: new Date()
        };

        const updatedHistory = [historyItem, ...state.recentSearches]
          .slice(0, 20); // Keep last 20 searches

        dispatch({ type: 'SET_RECENT_SEARCHES', recentSearches: updatedHistory });
        saveToStorage('thoughtkeeper_search_history', updatedHistory);
      }

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
      throw error;
    }
  }, [config.enableSearchHistory, config.maxResults, state.activeProvider, state.recentSearches, saveToStorage]);

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    dispatch({ type: 'SET_QUERY', query: null });
    dispatch({ type: 'SET_RESULTS', results: null });
    dispatch({ type: 'SET_ERROR', error: null });
  }, []);

  /**
   * Update query
   */
  const updateQuery = useCallback((updates: Partial<SearchQuery>) => {
    dispatch({ type: 'UPDATE_QUERY', updates });
  }, []);

  /**
   * Add filter
   */
  const addFilter = useCallback((filter: SearchFilter) => {
    dispatch({ type: 'ADD_FILTER', filter });
  }, []);

  /**
   * Remove filter
   */
  const removeFilter = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_FILTER', index });
  }, []);

  /**
   * Toggle filter enabled state
   */
  const toggleFilter = useCallback((index: number) => {
    dispatch({ type: 'TOGGLE_FILTER', index });
  }, []);

  /**
   * Update sort
   */
  const updateSort = useCallback((sort: SearchSort) => {
    dispatch({ type: 'UPDATE_SORT', sort });
  }, []);

  /**
   * Save current search
   */
  const saveSearch = useCallback(async (name: string, description?: string) => {
    if (!state.currentQuery) {
      throw new Error('No current query to save');
    }

    const savedSearch: SavedSearch = {
      ...state.currentQuery,
      name,
      description,
      isPinned: false,
      isShared: false,
      tags: [],
      usageCount: 0,
      lastUsed: new Date()
    };

    const updatedSaved = [...state.savedSearches, savedSearch];
    dispatch({ type: 'SET_SAVED_SEARCHES', savedSearches: updatedSaved });
    saveToStorage('thoughtkeeper_saved_searches', updatedSaved);
  }, [state.currentQuery, state.savedSearches, saveToStorage]);

  /**
   * Delete saved search
   */
  const deleteSavedSearch = useCallback(async (id: string) => {
    const updatedSaved = state.savedSearches.filter(search => search.id !== id);
    dispatch({ type: 'SET_SAVED_SEARCHES', savedSearches: updatedSaved });
    saveToStorage('thoughtkeeper_saved_searches', updatedSaved);
  }, [state.savedSearches, saveToStorage]);

  /**
   * Load saved search
   */
  const loadSavedSearch = useCallback(async (id: string) => {
    const savedSearch = state.savedSearches.find(search => search.id === id);
    if (!savedSearch) {
      throw new Error('Saved search not found');
    }

    // Update usage count
    const updatedSaved = state.savedSearches.map(search =>
      search.id === id
        ? { ...search, usageCount: search.usageCount + 1, lastUsed: new Date() }
        : search
    );

    dispatch({ type: 'SET_SAVED_SEARCHES', savedSearches: updatedSaved });
    saveToStorage('thoughtkeeper_saved_searches', updatedSaved);

    // Load the search query
    await search(savedSearch);
  }, [state.savedSearches, saveToStorage, search]);

  /**
   * Clear search history
   */
  const clearHistory = useCallback(() => {
    dispatch({ type: 'SET_RECENT_SEARCHES', recentSearches: [] });
    localStorage.removeItem('thoughtkeeper_search_history');
  }, []);

  /**
   * Remove from history
   */
  const removeFromHistory = useCallback((index: number) => {
    const updatedHistory = state.recentSearches.filter((_, i) => i !== index);
    dispatch({ type: 'SET_RECENT_SEARCHES', recentSearches: updatedHistory });
    saveToStorage('thoughtkeeper_search_history', updatedHistory);
  }, [state.recentSearches, saveToStorage]);

  /**
   * Get search suggestions
   */
  const getSuggestions = useCallback(async (text: string): Promise<string[]> => {
    if (!text.trim()) {
      dispatch({ type: 'SET_SUGGESTIONS', suggestions: [] });
      return [];
    }

    try {
      const suggestions = await searchRegistry.getSuggestions(text, state.activeProvider);
      dispatch({ type: 'SET_SUGGESTIONS', suggestions });
      return suggestions;
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      return [];
    }
  }, [state.activeProvider]);

  /**
   * Facet selection methods
   */
  const selectFacet = useCallback((field: string, value: any) => {
    dispatch({ type: 'SELECT_FACET', field, value });
  }, []);

  const unselectFacet = useCallback((field: string, value: any) => {
    dispatch({ type: 'UNSELECT_FACET', field, value });
  }, []);

  const clearFacets = useCallback((field?: string) => {
    dispatch({ type: 'CLEAR_FACETS', field });
  }, []);

  /**
   * Quick filter methods
   */
  const toggleQuickFilter = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_QUICK_FILTER', filterId: id });
  }, []);

  const addQuickFilter = useCallback((filter: QuickFilter) => {
    dispatch({ type: 'ADD_QUICK_FILTER', filter });
  }, []);

  const removeQuickFilter = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_QUICK_FILTER', filterId: id });
  }, []);

  /**
   * UI control methods
   */
  const openSearch = useCallback(() => {
    dispatch({ type: 'TOGGLE_SEARCH', isOpen: true });
  }, []);

  const closeSearch = useCallback(() => {
    dispatch({ type: 'TOGGLE_SEARCH', isOpen: false });
  }, []);

  const setProvider = useCallback((providerId: string) => {
    dispatch({ type: 'SET_PROVIDER', providerId });
  }, []);

  const contextValue: SearchContext = {
    state,
    config,
    search,
    clearSearch,
    updateQuery,
    addFilter,
    removeFilter,
    toggleFilter,
    updateSort,
    saveSearch,
    deleteSavedSearch,
    loadSavedSearch,
    clearHistory,
    removeFromHistory,
    getSuggestions,
    selectFacet,
    unselectFacet,
    clearFacets,
    toggleQuickFilter,
    addQuickFilter,
    removeQuickFilter,
    openSearch,
    closeSearch,
    setProvider
  };

  return (
    <AdvancedSearchContext.Provider value={contextValue}>
      {children}
    </AdvancedSearchContext.Provider>
  );
};

/**
 * Hook to use the Advanced Search context
 */
export const useAdvancedSearch = (): SearchContext => {
  const context = useContext(AdvancedSearchContext);
  if (!context) {
    throw new Error('useAdvancedSearch must be used within an AdvancedSearchProvider');
  }
  return context;
};
