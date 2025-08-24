import { useMemo, useCallback } from 'react';
import { useNotebooksStore } from '../stores';
import { useUI } from './useUI';
import type { Notebook, NotebookStats, CreateNotebookData, UpdateNotebookData } from '../types/notebook';

/**
 * useNotebooks - Custom hook for notebook management
 * 
 * Features:
 * - CRUD operations with optimistic updates
 * - Advanced filtering and searching
 * - Sorting and grouping
 * - Selection management for bulk operations
 * - Pinning and favoriting
 * - Statistics and analytics
 * - Pagination support
 * - Real-time updates simulation
 * - Error handling with toast notifications
 */

interface NotebookFilters {
  status?: string;
  tag?: string;
  search?: string;
  dateRange?: [Date, Date];
  archived?: boolean;
  shared?: boolean;
  hasAttachments?: boolean;
}

interface UseNotebooksOptions {
  autoFetch?: boolean;
  realTimeUpdates?: boolean;
  cacheTimeout?: number;
}

interface UseNotebooksReturn {
  // Data
  notebooks: Notebook[];
  currentNotebook: Notebook | null;
  selectedNotebooks: string[];
  
  // Filtering & Search
  searchQuery: string;
  appliedFilters: NotebookFilters;
  filteredNotebooks: Notebook[];
  searchResults: Notebook[];
  
  // Pagination
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  
  // State
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
  hasChanges: boolean;
  
  // Statistics
  stats: NotebookStats;
  recentlyViewed: Notebook[];
  pinnedNotebooks: Notebook[];
  archivedNotebooks: Notebook[];
  
  // Actions - CRUD
  createNotebook: (data: CreateNotebookData) => Promise<Notebook>;
  updateNotebook: (id: string, data: UpdateNotebookData) => Promise<void>;
  deleteNotebook: (id: string) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  duplicateNotebook: (id: string) => Promise<Notebook>;
  
  // Actions - Navigation
  openNotebook: (id: string) => void;
  closeNotebook: () => void;
  switchToNotebook: (id: string) => void;
  goToNextNotebook: () => void;
  goToPrevNotebook: () => void;
  
  // Actions - Organization
  pinNotebook: (id: string) => Promise<void>;
  unpinNotebook: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  archiveNotebook: (id: string) => Promise<void>;
  restoreNotebook: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  
  // Actions - Selection
  selectNotebook: (id: string) => void;
  deselectNotebook: (id: string) => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  selectPage: () => void;
  invertSelection: () => void;
  
  // Actions - Search & Filtering
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  setFilters: (filters: NotebookFilters) => void;
  clearFilters: () => void;
  applyQuickFilter: (key: keyof NotebookFilters, value: any) => void;
  
  // Actions - Sorting
  setSortBy: (field: keyof Notebook, direction: 'asc' | 'desc') => void;
  toggleSort: (field: keyof Notebook) => void;
  
  // Actions - Pagination
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
  
  // Actions - Bulk Operations
  bulkArchive: (ids?: string[]) => Promise<void>;
  bulkRestore: (ids?: string[]) => Promise<void>;
  bulkPin: (ids?: string[]) => Promise<void>;
  bulkUnpin: (ids?: string[]) => Promise<void>;
  bulkAddTags: (tags: string[], ids?: string[]) => Promise<void>;
  bulkRemoveTags: (tags: string[], ids?: string[]) => Promise<void>;
  
  // Actions - Data Management
  refresh: () => Promise<void>;
  resetError: () => void;
  preloadNotebook: (id: string) => Promise<void>;
  exportNotebooks: (ids?: string[], format?: 'json' | 'markdown' | 'pdf') => Promise<void>;
  
  // Utilities
  getNotebook: (id: string) => Notebook | undefined;
  isNotebookSelected: (id: string) => boolean;
  hasSelectedNotebooks: boolean;
  canBulkOperation: (operation: string) => boolean;
}

export const useNotebooks = (options: UseNotebooksOptions = {}): UseNotebooksReturn => {
  const {
    autoFetch = true,
    realTimeUpdates = false,
    cacheTimeout = 5 * 60 * 1000 // 5 minutes
  } = options;
  
  const store = useNotebooksStore();
  const { showSuccess, showError, showWarning } = useUI();
  
  // Memoized computed values
  const filteredNotebooks = useMemo(() => {
    let result = [...store.notebooks];
    
    // Apply search
    if (store.searchQuery.trim()) {
      const query = store.searchQuery.toLowerCase();
      result = result.filter(notebook => 
        notebook.title.toLowerCase().includes(query) ||
        notebook.description?.toLowerCase().includes(query) ||
        notebook.content?.toLowerCase().includes(query) ||
        notebook.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply filters
    if (store.appliedFilters.status) {
      result = result.filter(notebook => notebook.status === store.appliedFilters.status);
    }
    
    if (store.appliedFilters.tag) {
      result = result.filter(notebook => notebook.tags.includes(store.appliedFilters.tag!));
    }
    
    if (typeof store.appliedFilters.archived === 'boolean') {
      result = result.filter(notebook => notebook.archived === store.appliedFilters.archived);
    }
    
    if (typeof store.appliedFilters.shared === 'boolean') {
      result = result.filter(notebook => notebook.shared === store.appliedFilters.shared);
    }
    
    if (typeof store.appliedFilters.hasAttachments === 'boolean') {
      result = result.filter(notebook => 
        store.appliedFilters.hasAttachments 
          ? notebook.attachments && notebook.attachments.length > 0
          : !notebook.attachments || notebook.attachments.length === 0
      );
    }
    
    // Apply date range filter
    if (store.appliedFilters.dateRange) {
      const [start, end] = store.appliedFilters.dateRange;
      result = result.filter(notebook => {
        const createdAt = new Date(notebook.createdAt);
        return createdAt >= start && createdAt <= end;
      });
    }
    
    return result;
  }, [store.notebooks, store.searchQuery, store.appliedFilters]);
  
  const searchResults = useMemo(() => {
    return store.searchQuery.trim() ? filteredNotebooks : [];
  }, [filteredNotebooks, store.searchQuery]);
  
  const totalPages = useMemo(() => 
    Math.ceil(filteredNotebooks.length / store.pageSize), 
    [filteredNotebooks.length, store.pageSize]
  );
  
  const hasNextPage = useMemo(() => 
    store.currentPage < totalPages, 
    [store.currentPage, totalPages]
  );
  
  const hasPrevPage = useMemo(() => 
    store.currentPage > 1, 
    [store.currentPage]
  );
  
  const pinnedNotebooks = useMemo(() => 
    store.notebooks.filter(notebook => notebook.pinned),
    [store.notebooks]
  );
  
  const archivedNotebooks = useMemo(() => 
    store.notebooks.filter(notebook => notebook.archived),
    [store.notebooks]
  );
  
  const hasSelectedNotebooks = useMemo(() => 
    store.selectedNotebooks.length > 0,
    [store.selectedNotebooks.length]
  );
  
  // Enhanced CRUD operations with error handling
  const createNotebook = useCallback(async (data: CreateNotebookData) => {
    try {
      store.setLoading('creating', true);
      const notebook = await store.createNotebook(data);
      showSuccess('Notebook created successfully');
      return notebook;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create notebook';
      showError(message);
      throw error;
    } finally {
      store.setLoading('creating', false);
    }
  }, [store, showSuccess, showError]);
  
  const updateNotebook = useCallback(async (id: string, data: UpdateNotebookData) => {
    try {
      store.setLoading('saving', true);
      await store.updateNotebook(id, data);
      showSuccess('Notebook updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update notebook';
      showError(message);
      throw error;
    } finally {
      store.setLoading('saving', false);
    }
  }, [store, showSuccess, showError]);
  
  const deleteNotebook = useCallback(async (id: string) => {
    try {
      store.setLoading('deleting', true);
      await store.deleteNotebook(id);
      showSuccess('Notebook deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete notebook';
      showError(message);
      throw error;
    } finally {
      store.setLoading('deleting', false);
    }
  }, [store, showSuccess, showError]);
  
  const duplicateNotebook = useCallback(async (id: string) => {
    try {
      const original = store.getNotebook(id);
      if (!original) {
        throw new Error('Notebook not found');
      }
      
      const duplicateData: CreateNotebookData = {
        title: `${original.title} (Copy)`,
        description: original.description,
        content: original.content,
        tags: [...original.tags],
        status: original.status
      };
      
      const duplicate = await createNotebook(duplicateData);
      showSuccess('Notebook duplicated successfully');
      return duplicate;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to duplicate notebook';
      showError(message);
      throw error;
    }
  }, [store, createNotebook, showSuccess, showError]);
  
  // Bulk operations
  const bulkDelete = useCallback(async (ids: string[]) => {
    try {
      store.setLoading('deleting', true);
      await Promise.all(ids.map(id => store.deleteNotebook(id)));
      showSuccess(`${ids.length} notebooks deleted successfully`);
    } catch (error) {
      showError('Failed to delete some notebooks');
      throw error;
    } finally {
      store.setLoading('deleting', false);
    }
  }, [store, showSuccess, showError]);
  
  const bulkArchive = useCallback(async (ids = store.selectedNotebooks) => {
    try {
      await Promise.all(ids.map(id => store.archiveNotebook(id)));
      showSuccess(`${ids.length} notebooks archived`);
      store.deselectAll();
    } catch (error) {
      showError('Failed to archive some notebooks');
    }
  }, [store, showSuccess, showError]);
  
  const bulkRestore = useCallback(async (ids = store.selectedNotebooks) => {
    try {
      await Promise.all(ids.map(id => store.restoreNotebook(id)));
      showSuccess(`${ids.length} notebooks restored`);
      store.deselectAll();
    } catch (error) {
      showError('Failed to restore some notebooks');
    }
  }, [store, showSuccess, showError]);
  
  // Navigation helpers
  const goToNextNotebook = useCallback(() => {
    if (!store.currentNotebook) return;
    
    const currentIndex = filteredNotebooks.findIndex(n => n.id === store.currentNotebook!.id);
    const nextIndex = (currentIndex + 1) % filteredNotebooks.length;
    const nextNotebook = filteredNotebooks[nextIndex];
    
    if (nextNotebook) {
      store.setCurrentNotebook(nextNotebook.id);
    }
  }, [store, filteredNotebooks]);
  
  const goToPrevNotebook = useCallback(() => {
    if (!store.currentNotebook) return;
    
    const currentIndex = filteredNotebooks.findIndex(n => n.id === store.currentNotebook!.id);
    const prevIndex = currentIndex === 0 ? filteredNotebooks.length - 1 : currentIndex - 1;
    const prevNotebook = filteredNotebooks[prevIndex];
    
    if (prevNotebook) {
      store.setCurrentNotebook(prevNotebook.id);
    }
  }, [store, filteredNotebooks]);
  
  // Utility functions
  const canBulkOperation = useCallback((operation: string) => {
    if (!hasSelectedNotebooks) return false;
    
    const selectedNotebooks = store.selectedNotebooks
      .map(id => store.getNotebook(id))
      .filter(Boolean) as Notebook[];
    
    switch (operation) {
      case 'archive':
        return selectedNotebooks.some(n => !n.archived);
      case 'restore':
        return selectedNotebooks.some(n => n.archived);
      case 'pin':
        return selectedNotebooks.some(n => !n.pinned);
      case 'unpin':
        return selectedNotebooks.some(n => n.pinned);
      default:
        return true;
    }
  }, [hasSelectedNotebooks, store]);
  
  return {
    // Data
    notebooks: store.notebooks,
    currentNotebook: store.currentNotebook,
    selectedNotebooks: store.selectedNotebooks,
    
    // Filtering & Search
    searchQuery: store.searchQuery,
    appliedFilters: store.appliedFilters,
    filteredNotebooks,
    searchResults,
    
    // Pagination
    currentPage: store.currentPage,
    pageSize: store.pageSize,
    totalPages,
    totalCount: filteredNotebooks.length,
    hasNextPage,
    hasPrevPage,
    
    // State
    loading: store.loading,
    saving: store.getLoadingState('saving'),
    deleting: store.getLoadingState('deleting'),
    error: store.error,
    hasChanges: store.hasChanges,
    
    // Statistics
    stats: store.stats,
    recentlyViewed: store.recentlyViewed,
    pinnedNotebooks,
    archivedNotebooks,
    
    // Actions - CRUD
    createNotebook,
    updateNotebook,
    deleteNotebook,
    bulkDelete,
    duplicateNotebook,
    
    // Actions - Navigation
    openNotebook: store.setCurrentNotebook,
    closeNotebook: store.clearCurrentNotebook,
    switchToNotebook: store.setCurrentNotebook,
    goToNextNotebook,
    goToPrevNotebook,
    
    // Actions - Organization
    pinNotebook: store.pinNotebook,
    unpinNotebook: store.unpinNotebook,
    togglePin: store.togglePin,
    archiveNotebook: store.archiveNotebook,
    restoreNotebook: store.restoreNotebook,
    toggleArchive: store.toggleArchive,
    
    // Actions - Selection
    selectNotebook: store.selectNotebook,
    deselectNotebook: store.deselectNotebook,
    toggleSelection: store.toggleSelection,
    selectAll: store.selectAll,
    deselectAll: store.deselectAll,
    selectPage: () => {
      const pageStart = (store.currentPage - 1) * store.pageSize;
      const pageEnd = pageStart + store.pageSize;
      const pageNotebooks = filteredNotebooks.slice(pageStart, pageEnd);
      pageNotebooks.forEach(notebook => store.selectNotebook(notebook.id));
    },
    invertSelection: store.invertSelection,
    
    // Actions - Search & Filtering
    setSearchQuery: store.setSearchQuery,
    clearSearch: store.clearSearch,
    setFilters: store.setFilters,
    clearFilters: store.clearFilters,
    applyQuickFilter: (key, value) => {
      store.setFilters({ ...store.appliedFilters, [key]: value });
    },
    
    // Actions - Sorting
    setSortBy: store.setSortBy,
    toggleSort: store.toggleSort,
    
    // Actions - Pagination
    goToPage: store.setCurrentPage,
    nextPage: () => hasNextPage && store.setCurrentPage(store.currentPage + 1),
    prevPage: () => hasPrevPage && store.setCurrentPage(store.currentPage - 1),
    setPageSize: store.setPageSize,
    
    // Actions - Bulk Operations
    bulkArchive,
    bulkRestore,
    bulkPin: async (ids = store.selectedNotebooks) => {
      await Promise.all(ids.map(id => store.pinNotebook(id)));
      store.deselectAll();
    },
    bulkUnpin: async (ids = store.selectedNotebooks) => {
      await Promise.all(ids.map(id => store.unpinNotebook(id)));
      store.deselectAll();
    },
    bulkAddTags: async (tags: string[], ids = store.selectedNotebooks) => {
      await Promise.all(ids.map(id => {
        const notebook = store.getNotebook(id);
        if (notebook) {
          const newTags = [...new Set([...notebook.tags, ...tags])];
          return store.updateNotebook(id, { tags: newTags });
        }
      }));
      store.deselectAll();
    },
    bulkRemoveTags: async (tags: string[], ids = store.selectedNotebooks) => {
      await Promise.all(ids.map(id => {
        const notebook = store.getNotebook(id);
        if (notebook) {
          const newTags = notebook.tags.filter(tag => !tags.includes(tag));
          return store.updateNotebook(id, { tags: newTags });
        }
      }));
      store.deselectAll();
    },
    
    // Actions - Data Management
    refresh: store.fetchNotebooks,
    resetError: store.clearError,
    preloadNotebook: store.preloadNotebook,
    exportNotebooks: async (ids = store.selectedNotebooks, format = 'json') => {
      // This would typically integrate with an export service
      showWarning('Export functionality coming soon');
    },
    
    // Utilities
    getNotebook: store.getNotebook,
    isNotebookSelected: store.isNotebookSelected,
    hasSelectedNotebooks,
    canBulkOperation
  };
};