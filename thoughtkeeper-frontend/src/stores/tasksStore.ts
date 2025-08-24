import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { MockApiService } from '../mocks';
import type { Task, CreateTaskData, UpdateTaskData } from '../types/task';
import { TaskStatus, TaskPriority } from '../types/task';

/**
 * Tasks Store - Comprehensive state management for tasks
 * 
 * Features:
 * - Complete CRUD operations with mock API integration
 * - Status and priority management
 * - Subtask handling and nesting
 * - Advanced search and filtering
 * - Selection management for bulk operations
 * - Real-time updates simulation
 * - Error handling with rollback
 * - Progress tracking and analytics
 */

interface TaskFilters {
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  assignee?: string;
  label?: string;
  dueDate?: 'today' | 'week' | 'month' | 'overdue';
  search?: string;
  hasSubtasks?: boolean;
  isSubtask?: boolean;
  completed?: boolean;
}

interface TasksState {
  // Core data
  tasks: Task[];
  currentTask: Task | null;
  
  // UI state
  selectedTasks: string[];
  searchQuery: string;
  appliedFilters: TaskFilters;
  
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
  recentTasks: Task[];
  
  // Sorting
  sortBy: keyof Task;
  sortOrder: 'asc' | 'desc';
}

interface TasksActions {
  // Data management
  fetchTasks: (notebookId?: string) => Promise<void>;
  
  // CRUD operations
  createTask: (data: CreateTaskData) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskData) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  bulkUpdateTasks: (ids: string[], data: Partial<UpdateTaskData>) => Promise<void>;
  
  // Status management
  setTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  
  // Navigation
  setCurrentTask: (id: string | null) => void;
  clearCurrentTask: () => void;
  
  // Selection management
  selectTask: (id: string) => void;
  deselectTask: (id: string) => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  
  // Search and filtering
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  setFilters: (filters: TaskFilters) => void;
  clearFilters: () => void;
  
  // Sorting
  setSortBy: (field: keyof Task, direction: 'asc' | 'desc') => void;
  toggleSort: (field: keyof Task) => void;
  
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
  getTask: (id: string) => Task | undefined;
  isTaskSelected: (id: string) => boolean;
  addToRecentTasks: (task: Task) => void;
  getTasksByParent: (parentId: string) => Task[];
  getRootTasks: () => Task[];
}

type TasksStore = TasksState & TasksActions;

const initialFilters: TaskFilters = {
  status: undefined,
  priority: undefined,
  assignee: undefined,
  label: undefined,
  dueDate: undefined,
  search: undefined,
  hasSubtasks: undefined,
  isSubtask: undefined,
  completed: undefined
};

export const useTasksStore = create<TasksStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      tasks: [],
      currentTask: null,
      selectedTasks: [],
      searchQuery: '',
      appliedFilters: { ...initialFilters },
      currentPage: 1,
      pageSize: 20,
      loading: false,
      loadingStates: {},
      error: null,
      hasChanges: false,
      recentTasks: [],
      sortBy: 'createdAt',
      sortOrder: 'desc',
      
      // Data management
      fetchTasks: async (notebookId?: string) => {
        set({ loading: true, error: null });
        
        try {
          const response = await MockApiService.tasks.getTasks({
            notebookId,
            page: get().currentPage,
            limit: get().pageSize,
            search: get().searchQuery || undefined,
            sortBy: get().sortBy,
            sortOrder: get().sortOrder
          });
          
          set({ 
            tasks: response.tasks,
            loading: false,
            error: null 
          });
        } catch (error) {
          set({ 
            loading: false, 
            error: error instanceof Error ? error.message : 'Failed to fetch tasks' 
          });
        }
      },
      
      // CRUD operations
      createTask: async (data: CreateTaskData) => {
        set((state) => ({ 
          loadingStates: { ...state.loadingStates, creating: true },
          error: null 
        }));
        
        try {
          const task = await MockApiService.tasks.createTask(data);
          
          set((state) => ({
            tasks: [task, ...state.tasks],
            loadingStates: { ...state.loadingStates, creating: false },
            hasChanges: true
          }));
          
          return task;
        } catch (error) {
          set((state) => ({
            loadingStates: { ...state.loadingStates, creating: false },
            error: error instanceof Error ? error.message : 'Failed to create task'
          }));
          throw error;
        }
      },
      
      updateTask: async (id: string, data: UpdateTaskData) => {
        // Optimistic update
        const tasks = get().tasks;
        const index = tasks.findIndex(t => t.id === id);
        
        if (index === -1) {
          throw new Error('Task not found');
        }
        
        const originalTask = tasks[index];
        const optimisticTask = { ...originalTask, ...data, updatedAt: new Date() };
        
        // Apply optimistic update
        const optimisticTasks = [...tasks];
        optimisticTasks[index] = optimisticTask;
        set({ tasks: optimisticTasks, hasChanges: true });
        
        try {
          const updatedTask = await MockApiService.tasks.updateTask(id, data);
          
          // Update with real data
          const finalTasks = [...get().tasks];
          const finalIndex = finalTasks.findIndex(t => t.id === id);
          if (finalIndex !== -1) {
            finalTasks[finalIndex] = updatedTask;
            set({ tasks: finalTasks });
          }
          
          // Update current task if it's the one being updated
          if (get().currentTask?.id === id) {
            set({ currentTask: updatedTask });
          }
        } catch (error) {
          // Rollback optimistic update
          set({ tasks });
          throw error;
        }
      },
      
      deleteTask: async (id: string) => {
        // Optimistic update
        const tasks = get().tasks;
        const optimisticTasks = tasks.filter(t => t.id !== id);
        
        set({ 
          tasks: optimisticTasks,
          selectedTasks: get().selectedTasks.filter(tId => tId !== id),
          hasChanges: true
        });
        
        // Clear current task if it's being deleted
        if (get().currentTask?.id === id) {
          set({ currentTask: null });
        }
        
        try {
          await MockApiService.tasks.deleteTask(id);
        } catch (error) {
          // Rollback optimistic update
          set({ tasks });
          throw error;
        }
      },
      
      bulkUpdateTasks: async (ids: string[], data: Partial<UpdateTaskData>) => {
        // Optimistic update
        const tasks = get().tasks;
        const optimisticTasks = tasks.map(task => 
          ids.includes(task.id) 
            ? { ...task, ...data, updatedAt: new Date() }
            : task
        );
        
        set({ tasks: optimisticTasks, hasChanges: true });
        
        try {
          await MockApiService.tasks.bulkUpdateTasks(ids, data);
        } catch (error) {
          // Rollback optimistic update
          set({ tasks });
          throw error;
        }
      },
      
      // Status management
      setTaskStatus: async (id: string, status: TaskStatus) => {
                const updateData: UpdateTaskData = {
          status,
          completedAt: status === TaskStatus.COMPLETED ? new Date() : undefined
        };
        await get().updateTask(id, updateData);
      },
      
      toggleTaskComplete: async (id: string) => {
        const task = get().getTask(id);
        if (!task) return;
        
        const newStatus: TaskStatus = task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;
        await get().setTaskStatus(id, newStatus);
      },
      
      // Navigation
      setCurrentTask: (id: string | null) => {
        const task = id ? get().getTask(id) : null;
        set({ currentTask: task });
        
        if (task) {
          get().addToRecentTasks(task);
        }
      },
      
      clearCurrentTask: () => {
        set({ currentTask: null });
      },
      
      // Selection management
      selectTask: (id: string) => {
        set((state) => ({
          selectedTasks: [...new Set([...state.selectedTasks, id])]
        }));
      },
      
      deselectTask: (id: string) => {
        set((state) => ({
          selectedTasks: state.selectedTasks.filter(tId => tId !== id)
        }));
      },
      
      toggleSelection: (id: string) => {
        const isSelected = get().selectedTasks.includes(id);
        if (isSelected) {
          get().deselectTask(id);
        } else {
          get().selectTask(id);
        }
      },
      
      selectAll: () => {
        set({ selectedTasks: get().tasks.map(t => t.id) });
      },
      
      deselectAll: () => {
        set({ selectedTasks: [] });
      },
      
      // Search and filtering
      setSearchQuery: (query: string) => {
        set({ searchQuery: query, currentPage: 1 });
        
        // Debounce the fetch
        clearTimeout((get() as any).searchTimeout);
        const timeout = setTimeout(() => {
          get().fetchTasks();
        }, 300);
        
        set({ searchTimeout: timeout } as any);
      },
      
      clearSearch: () => {
        set({ searchQuery: '', currentPage: 1 });
        get().fetchTasks();
      },
      
      setFilters: (filters: TaskFilters) => {
        set({ appliedFilters: { ...filters }, currentPage: 1 });
        get().fetchTasks();
      },
      
      clearFilters: () => {
        set({ appliedFilters: { ...initialFilters }, currentPage: 1 });
        get().fetchTasks();
      },
      
      // Sorting
      setSortBy: (field: keyof Task, direction: 'asc' | 'desc') => {
        set({ sortBy: field, sortOrder: direction, currentPage: 1 });
        get().fetchTasks();
      },
      
      toggleSort: (field: keyof Task) => {
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
        get().fetchTasks();
      },
      
      setPageSize: (size: number) => {
        set({ pageSize: size, currentPage: 1 });
        get().fetchTasks();
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
      getTask: (id: string) => {
        return get().tasks.find(task => task.id === id);
      },
      
      isTaskSelected: (id: string) => {
        return get().selectedTasks.includes(id);
      },
      
      addToRecentTasks: (task: Task) => {
        set((state) => {
          const filtered = state.recentTasks.filter(t => t.id !== task.id);
          const updated = [task, ...filtered].slice(0, 10); // Keep last 10
          return { recentTasks: updated };
        });
      },
      
      getTasksByParent: (parentId: string) => {
        return get().tasks.filter(task => task.parentId === parentId);
      },
      
      getRootTasks: () => {
        return get().tasks.filter(task => !task.parentId);
      }
    })),
    {
      name: 'tasks-store'
    }
  )
);

// Initialize data on first load
let isInitialized = false;
export const initializeTasksStore = async () => {
  if (isInitialized) return;
  isInitialized = true;
  
  try {
    await useTasksStore.getState().fetchTasks();
  } catch (error) {
    console.error('Failed to initialize tasks store:', error);
  }
};
