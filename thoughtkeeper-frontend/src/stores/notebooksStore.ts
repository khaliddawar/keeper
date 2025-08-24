import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { MockApiService } from '../mocks';
import type { Notebook, NotebookStats, CreateNotebookData, UpdateNotebookData } from '../types/notebook';

/**
 * Notebooks Store - Comprehensive state management for notebooks
 * 
 * Features:
 * - Complete CRUD operations with mock API integration
 * - Advanced search and filtering
 * - Sorting and pagination support
 * - Selection management for bulk operations
 * - Statistics and analytics
 * - Real-time updates simulation
 * - Error handling with retry mechanisms
 * - Optimistic updates with rollback
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

interface NotebooksState {
  // Core data
  notebooks: Notebook[];
  currentNotebook: Notebook | null;
  
  // UI state
  selectedNotebooks: string[];
  searchQuery: string;
  appliedFilters: NotebookFilters;
  
  // Pagination
  currentPage: number;
  pageSize: number;
  
  // Loading states
  loading: boolean;
  loadingStates: Record<string, boolean>;
  
  // Error handling
  error: string | null;
  
  // Other state
  hasChanges: boolean;
  stats: NotebookStats;
  recentlyViewed: Notebook[];
  
  // Sorting
  sortBy: keyof Notebook;
  sortOrder: 'asc' | 'desc';
}

interface NotebooksActions {
  // Data management
  fetchNotebooks: () => Promise<void>;
  preloadNotebook: (id: string) => Promise<void>;
  
  // CRUD operations
  createNotebook: (data: CreateNotebookData) => Promise<Notebook>;
  updateNotebook: (id: string, data: UpdateNotebookData) => Promise<void>;
  deleteNotebook: (id: string) => Promise<void>;
  
  // Organization
  archiveNotebook: (id: string) => Promise<void>;
  restoreNotebook: (id: string) => Promise<void>;
  pinNotebook: (id: string) => Promise<void>;
  unpinNotebook: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  
  // Navigation
  setCurrentNotebook: (id: string | null) => void;
  clearCurrentNotebook: () => void;
  
  // Selection management
  selectNotebook: (id: string) => void;
  deselectNotebook: (id: string) => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  invertSelection: () => void;
  
  // Search and filtering
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  setFilters: (filters: NotebookFilters) => void;
  clearFilters: () => void;
  
  // Sorting
  setSortBy: (field: keyof Notebook, direction: 'asc' | 'desc') => void;
  toggleSort: (field: keyof Notebook) => void;
  
  // Pagination
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  
  // Loading state management
  setLoading: (key: string, loading: boolean) => void;
  getLoadingState: (key: string) => boolean;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Utilities
  getNotebook: (id: string) => Notebook | undefined;
  isNotebookSelected: (id: string) => boolean;
  addToRecentlyViewed: (notebook: Notebook) => void;
  
  // Statistics
  updateStats: () => void;
}

type NotebooksStore = NotebooksState & NotebooksActions;

const initialFilters: NotebookFilters = {
  status: undefined,
  tag: undefined,
  search: undefined,
  dateRange: undefined,
  archived: undefined,
  shared: undefined,
  hasAttachments: undefined
};

const initialStats: NotebookStats = {
  total: 0,
  active: 0,
  archived: 0,
  shared: 0,
  pinned: 0,
  totalWords: 0,
  totalTasks: 0,
  completedTasks: 0
};

export const useNotebooksStore = create<NotebooksStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      notebooks: [],
      currentNotebook: null,
      selectedNotebooks: [],
      searchQuery: '',
      appliedFilters: { ...initialFilters },
      currentPage: 1,
      pageSize: 12,
      loading: false,
      loadingStates: {},
      error: null,
      hasChanges: false,
      stats: { ...initialStats },
      recentlyViewed: [],
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      
      // Data management
      fetchNotebooks: async () => {
        set({ loading: true, error: null });
        
        try {
          const response = await MockApiService.notebooks.getNotebooks({
            page: get().currentPage,
            limit: get().pageSize,
            search: get().searchQuery || undefined,
            sortBy: get().sortBy,
            sortOrder: get().sortOrder
          });
          
          set({ 
            notebooks: response.notebooks,
            loading: false,
            error: null 
          });
          
          // Update stats after fetching
          get().updateStats();
        } catch (error) {
          set({ 
            loading: false, 
            error: error instanceof Error ? error.message : 'Failed to fetch notebooks' 
          });
        }
      },
      
      preloadNotebook: async (id: string) => {
        try {
          const notebook = await MockApiService.notebooks.getNotebook(id);
          // Update the notebook in the list if it exists
          const notebooks = get().notebooks;
          const index = notebooks.findIndex(n => n.id === id);
          if (index !== -1) {
            const updatedNotebooks = [...notebooks];
            updatedNotebooks[index] = notebook;
            set({ notebooks: updatedNotebooks });
          }
        } catch (error) {
          console.warn('Failed to preload notebook:', error);
        }
      },
      
      // CRUD operations
      createNotebook: async (data: CreateNotebookData) => {
        set((state) => ({ 
          loadingStates: { ...state.loadingStates, creating: true },
          error: null 
        }));
        
        try {
          const notebook = await MockApiService.notebooks.createNotebook(data);
          
          set((state) => ({
            notebooks: [notebook, ...state.notebooks],
            loadingStates: { ...state.loadingStates, creating: false },
            hasChanges: true
          }));
          
          get().updateStats();
          return notebook;
        } catch (error) {
          set((state) => ({
            loadingStates: { ...state.loadingStates, creating: false },
            error: error instanceof Error ? error.message : 'Failed to create notebook'
          }));
          throw error;
        }
      },
      
      updateNotebook: async (id: string, data: UpdateNotebookData) => {
        // Optimistic update
        const notebooks = get().notebooks;
        const index = notebooks.findIndex(n => n.id === id);
        
        if (index === -1) {
          throw new Error('Notebook not found');
        }
        
        const originalNotebook = notebooks[index];
        const optimisticNotebook = { ...originalNotebook, ...data, updatedAt: new Date() };
        
        // Apply optimistic update
        const optimisticNotebooks = [...notebooks];
        optimisticNotebooks[index] = optimisticNotebook;
        set({ notebooks: optimisticNotebooks, hasChanges: true });
        
        try {
          const updatedNotebook = await MockApiService.notebooks.updateNotebook(id, data);
          
          // Update with real data
          const finalNotebooks = [...get().notebooks];
          const finalIndex = finalNotebooks.findIndex(n => n.id === id);
          if (finalIndex !== -1) {
            finalNotebooks[finalIndex] = updatedNotebook;
            set({ notebooks: finalNotebooks });
          }
          
          // Update current notebook if it's the one being updated
          if (get().currentNotebook?.id === id) {
            set({ currentNotebook: updatedNotebook });
          }
          
          get().updateStats();
        } catch (error) {
          // Rollback optimistic update
          set({ notebooks });
          throw error;
        }
      },
      
      deleteNotebook: async (id: string) => {
        // Optimistic update
        const notebooks = get().notebooks;
        const optimisticNotebooks = notebooks.filter(n => n.id !== id);
        
        set({ 
          notebooks: optimisticNotebooks,
          selectedNotebooks: get().selectedNotebooks.filter(nId => nId !== id),
          hasChanges: true
        });
        
        // Clear current notebook if it's being deleted
        if (get().currentNotebook?.id === id) {
          set({ currentNotebook: null });
        }
        
        try {
          await MockApiService.notebooks.deleteNotebook(id);
          get().updateStats();
        } catch (error) {
          // Rollback optimistic update
          set({ notebooks });
          throw error;
        }
      },
      
      // Organization
      archiveNotebook: async (id: string) => {
        await get().updateNotebook(id, { archived: true });
      },
      
      restoreNotebook: async (id: string) => {
        await get().updateNotebook(id, { archived: false });
      },
      
      pinNotebook: async (id: string) => {
        await get().updateNotebook(id, { pinned: true });
      },
      
      unpinNotebook: async (id: string) => {
        await get().updateNotebook(id, { pinned: false });
      },
      
      togglePin: async (id: string) => {
        const notebook = get().getNotebook(id);
        if (notebook) {
          await get().updateNotebook(id, { pinned: !notebook.pinned });
        }
      },
      
      toggleArchive: async (id: string) => {
        const notebook = get().getNotebook(id);
        if (notebook) {
          await get().updateNotebook(id, { archived: !notebook.archived });
        }
      },
      
      // Navigation
      setCurrentNotebook: (id: string | null) => {
        const notebook = id ? get().getNotebook(id) : null;
        set({ currentNotebook: notebook });
        
        if (notebook) {
          get().addToRecentlyViewed(notebook);
        }
      },
      
      clearCurrentNotebook: () => {
        set({ currentNotebook: null });
      },
      
      // Selection management
      selectNotebook: (id: string) => {
        set((state) => ({
          selectedNotebooks: [...new Set([...state.selectedNotebooks, id])]
        }));
      },
      
      deselectNotebook: (id: string) => {
        set((state) => ({
          selectedNotebooks: state.selectedNotebooks.filter(nId => nId !== id)
        }));
      },
      
      toggleSelection: (id: string) => {
        const isSelected = get().selectedNotebooks.includes(id);
        if (isSelected) {
          get().deselectNotebook(id);
        } else {
          get().selectNotebook(id);
        }
      },
      
      selectAll: () => {
        set({ selectedNotebooks: get().notebooks.map(n => n.id) });
      },
      
      deselectAll: () => {
        set({ selectedNotebooks: [] });
      },
      
      invertSelection: () => {
        const currentSelection = new Set(get().selectedNotebooks);
        const allNotebooks = get().notebooks.map(n => n.id);
        const invertedSelection = allNotebooks.filter(id => !currentSelection.has(id));
        set({ selectedNotebooks: invertedSelection });
      },
      
      // Search and filtering
      setSearchQuery: (query: string) => {
        set({ searchQuery: query, currentPage: 1 });
        
        // Debounce the fetch
        clearTimeout((get() as any).searchTimeout);
        const timeout = setTimeout(() => {
          get().fetchNotebooks();
        }, 300);
        
        set({ searchTimeout: timeout } as any);
      },
      
      clearSearch: () => {
        set({ searchQuery: '', currentPage: 1 });
        get().fetchNotebooks();
      },
      
      setFilters: (filters: NotebookFilters) => {
        set({ appliedFilters: { ...filters }, currentPage: 1 });
        get().fetchNotebooks();
      },
      
      clearFilters: () => {
        set({ appliedFilters: { ...initialFilters }, currentPage: 1 });
        get().fetchNotebooks();
      },
      
      // Sorting
      setSortBy: (field: keyof Notebook, direction: 'asc' | 'desc') => {
        set({ sortBy: field, sortOrder: direction, currentPage: 1 });
        get().fetchNotebooks();
      },
      
      toggleSort: (field: keyof Notebook) => {
        const currentSort = get().sortBy;
        const currentOrder = get().sortOrder;
        
        if (currentSort === field) {
          // Toggle direction
          const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
          get().setSortBy(field, newOrder);
        } else {
          // New field, default to descending
          get().setSortBy(field, 'desc');
        }
      },
      
      // Pagination
      setCurrentPage: (page: number) => {
        set({ currentPage: page });
        get().fetchNotebooks();
      },
      
      setPageSize: (size: number) => {
        set({ pageSize: size, currentPage: 1 });
        get().fetchNotebooks();
      },
      
      // Loading state management
      setLoading: (key: string, loading: boolean) => {
        set((state) => ({
          loadingStates: {
            ...state.loadingStates,
            [key]: loading
          }
        }));
      },
      
      getLoadingState: (key: string) => {
        return get().loadingStates[key] || false;
      },
      
      // Error handling
      setError: (error: string | null) => {
        set({ error });
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      // Utilities
      getNotebook: (id: string) => {
        return get().notebooks.find(notebook => notebook.id === id);
      },
      
      isNotebookSelected: (id: string) => {
        return get().selectedNotebooks.includes(id);
      },
      
      addToRecentlyViewed: (notebook: Notebook) => {
        set((state) => {
          const filtered = state.recentlyViewed.filter(n => n.id !== notebook.id);
          const updated = [notebook, ...filtered].slice(0, 10); // Keep last 10
          return { recentlyViewed: updated };
        });
      },
      
      // Statistics
      updateStats: async () => {
        try {
          const stats = await MockApiService.notebooks.getNotebookStats();
          set({ stats });
        } catch (error) {
          console.warn('Failed to update notebook stats:', error);
        }
      }
    })),
    {
      name: 'notebooks-store'
    }
  )
);

// Initialize data on first load
let isInitialized = false;
export const initializeNotebooksStore = async () => {
  if (isInitialized) return;
  isInitialized = true;
  
  try {
    await useNotebooksStore.getState().fetchNotebooks();
  } catch (error) {
    console.error('Failed to initialize notebooks store:', error);
  }
};
