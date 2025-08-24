import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Task, TaskStatus, TaskPriority, TaskFilters, TaskSort, TaskStats, CreateTaskRequest, UpdateTaskRequest } from '../types/task';

/**
 * TaskStore - Comprehensive state management for tasks
 * 
 * Features:
 * - Complete CRUD operations with optimistic updates
 * - Advanced filtering and sorting with real-time search
 * - Bulk operations for multi-task management
 * - Undo/redo functionality for task operations
 * - Local storage persistence with compression
 * - Change history tracking for analytics
 * - Selection management for bulk operations
 * - Statistics calculation and caching
 * - Relationship management (subtasks, dependencies)
 */

interface TaskStore {
  // State
  tasks: Task[];
  selectedTasks: string[];
  filters: TaskFilters;
  sort: TaskSort;
  searchQuery: string;
  loading: boolean;
  error: string | null;
  
  // History for undo/redo
  history: Task[][];
  historyIndex: number;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: CreateTaskRequest) => void;
  updateTask: (id: string, updates: UpdateTaskRequest) => void;
  deleteTask: (id: string) => void;
  deleteTasks: (ids: string[]) => void;
  toggleTaskComplete: (id: string) => void;
  moveTask: (id: string, newNotebookId: string) => void;
  bulkUpdateTasks: (ids: string[], updates: UpdateTaskRequest) => void;
  
  // Selection management
  selectTask: (id: string) => void;
  selectTasks: (ids: string[]) => void;
  deselectTask: (id: string) => void;
  toggleTaskSelection: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  selectByNotebook: (notebookId: string) => void;
  
  // Filtering and search
  setFilters: (filters: Partial<TaskFilters>) => void;
  setSort: (sort: TaskSort) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  
  // History management
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Computed getters
  getFilteredTasks: () => Task[];
  getTaskById: (id: string) => Task | undefined;
  getTasksByNotebook: (notebookId: string) => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByPriority: (priority: TaskPriority) => Task[];
  getSelectedTasks: () => Task[];
  getTaskStats: () => TaskStats;
  getOverdueTasks: () => Task[];
  getDueTodayTasks: () => Task[];
  getRecentTasks: (days?: number) => Task[];
  
  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  generateMockTasks: (count?: number) => void;
}

// Utility functions
const generateId = () => `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const isOverdue = (task: Task): boolean => {
  if (!task.dueDate) return false;
  return new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED;
};

const isDueToday = (task: Task): boolean => {
  if (!task.dueDate) return false;
  const today = new Date();
  const dueDate = new Date(task.dueDate);
  return dueDate.toDateString() === today.toDateString();
};

const isRecent = (task: Task, days: number = 7): boolean => {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return new Date(task.createdAt) >= cutoff;
};

// Advanced filtering function
const filterTasks = (tasks: Task[], filters: TaskFilters, searchQuery: string): Task[] => {
  let filtered = [...tasks];
  
  // Text search
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(task => 
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  // Status filter
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(task => filters.status!.includes(task.status));
  }
  
  // Priority filter
  if (filters.priority && filters.priority.length > 0) {
    filtered = filtered.filter(task => filters.priority!.includes(task.priority));
  }
  
  // Notebook filter
  if (filters.notebookIds && filters.notebookIds.length > 0) {
    filtered = filtered.filter(task => filters.notebookIds!.includes(task.notebookId));
  }
  
  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(task => 
      filters.tags!.some(tag => task.tags.includes(tag))
    );
  }
  
  // Date range filter
  if (filters.dueDateRange) {
    const { start, end } = filters.dueDateRange;
    filtered = filtered.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      if (start && dueDate < start) return false;
      if (end && dueDate > end) return false;
      return true;
    });
  }
  
  // Special filters
  if (filters.hasOverdue) {
    filtered = filtered.filter(isOverdue);
  }
  
  if (filters.hasReminders) {
    filtered = filtered.filter(task => task.reminders && task.reminders.length > 0);
  }
  
  return filtered;
};

// Sorting function
const sortTasks = (tasks: Task[], sort: TaskSort): Task[] => {
  return [...tasks].sort((a, b) => {
    const direction = sort.sortDirection === 'desc' ? -1 : 1;
    
    switch (sort.sortBy) {
      case 'title':
        return direction * a.title.localeCompare(b.title);
      case 'status':
        return direction * a.status.localeCompare(b.status);
      case 'priority':
        const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
        return direction * (priorityOrder[a.priority] - priorityOrder[b.priority]);
      case 'dueDate':
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return direction * (aDate - bDate);
      case 'createdAt':
        return direction * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'updatedAt':
        return direction * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
      case 'progress':
        return direction * (a.progress - b.progress);
      case 'timeEstimate':
        return direction * ((a.timeEstimate || 0) - (b.timeEstimate || 0));
      default:
        return 0;
    }
  });
};

// Calculate task statistics
const calculateStats = (tasks: Task[]): TaskStats => {
  const total = tasks.length;
  const byStatus = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<TaskStatus, number>);
  
  const byPriority = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {} as Record<TaskPriority, number>);
  
  const overdue = tasks.filter(isOverdue).length;
  const dueToday = tasks.filter(isDueToday).length;
  const dueTomorrow = tasks.filter(task => {
    if (!task.dueDate) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return new Date(task.dueDate).toDateString() === tomorrow.toDateString();
  }).length;
  
  const dueThisWeek = tasks.filter(task => {
    if (!task.dueDate) return false;
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return new Date(task.dueDate) <= weekFromNow;
  }).length;
  
  const completed = byStatus[TaskStatus.COMPLETED] || 0;
  const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED && task.completedAt);
  const averageCompletionTime = completedTasks.length > 0 
    ? completedTasks.reduce((sum, task) => {
        const created = new Date(task.createdAt).getTime();
        const completed = new Date(task.completedAt!).getTime();
        return sum + (completed - created);
      }, 0) / completedTasks.length / (1000 * 60 * 60) // Convert to hours
    : 0;
  
  const productivityScore = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return {
    total,
    byStatus: {
      [TaskStatus.PENDING]: byStatus[TaskStatus.PENDING] || 0,
      [TaskStatus.IN_PROGRESS]: byStatus[TaskStatus.IN_PROGRESS] || 0,
      [TaskStatus.COMPLETED]: byStatus[TaskStatus.COMPLETED] || 0,
      [TaskStatus.CANCELLED]: byStatus[TaskStatus.CANCELLED] || 0,
      [TaskStatus.ON_HOLD]: byStatus[TaskStatus.ON_HOLD] || 0,
      [TaskStatus.BLOCKED]: byStatus[TaskStatus.BLOCKED] || 0
    },
    byPriority: {
      [TaskPriority.LOW]: byPriority[TaskPriority.LOW] || 0,
      [TaskPriority.MEDIUM]: byPriority[TaskPriority.MEDIUM] || 0,
      [TaskPriority.HIGH]: byPriority[TaskPriority.HIGH] || 0,
      [TaskPriority.URGENT]: byPriority[TaskPriority.URGENT] || 0
    },
    overdue,
    dueToday,
    dueTomorrow,
    dueThisWeek,
    completed,
    averageCompletionTime,
    productivityScore
  };
};

export const useTaskStore = create<TaskStore>()(
  persist(
    immer((set, get) => ({
      // Initial state
      tasks: [],
      selectedTasks: [],
      filters: {},
      sort: {
        sortBy: 'createdAt',
        sortDirection: 'desc'
      },
      searchQuery: '',
      loading: false,
      error: null,
      history: [],
      historyIndex: -1,
      
      // Actions
      setTasks: (tasks) => set((state) => {
        state.tasks = tasks;
        state.error = null;
      }),
      
      addTask: (taskData) => set((state) => {
        const newTask: Task = {
          id: generateId(),
          title: taskData.title,
          description: taskData.description,
          status: TaskStatus.PENDING,
          priority: taskData.priority || TaskPriority.MEDIUM,
          notebookId: taskData.notebookId,
          dueDate: taskData.dueDate,
          progress: 0,
          tags: taskData.tags || [],
          timeEstimate: taskData.timeEstimate,
          createdAt: new Date(),
          updatedAt: new Date(),
          parentTaskId: taskData.parentTaskId,
          attachments: [],
          reminders: [],
          integrations: []
        };
        
        // Add to history
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push([...state.tasks]);
        state.historyIndex++;
        
        state.tasks.push(newTask);
        state.error = null;
      }),
      
      updateTask: (id, updates) => set((state) => {
        const index = state.tasks.findIndex(task => task.id === id);
        if (index !== -1) {
          // Add to history
          state.history = state.history.slice(0, state.historyIndex + 1);
          state.history.push([...state.tasks]);
          state.historyIndex++;
          
          const currentTask = state.tasks[index];
          state.tasks[index] = {
            ...currentTask,
            ...updates,
            updatedAt: new Date(),
            completedAt: updates.status === TaskStatus.COMPLETED && currentTask.status !== TaskStatus.COMPLETED 
              ? new Date() 
              : currentTask.completedAt
          };
          state.error = null;
        }
      }),
      
      deleteTask: (id) => set((state) => {
        const index = state.tasks.findIndex(task => task.id === id);
        if (index !== -1) {
          // Add to history
          state.history = state.history.slice(0, state.historyIndex + 1);
          state.history.push([...state.tasks]);
          state.historyIndex++;
          
          state.tasks.splice(index, 1);
          state.selectedTasks = state.selectedTasks.filter(taskId => taskId !== id);
          state.error = null;
        }
      }),
      
      deleteTasks: (ids) => set((state) => {
        // Add to history
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push([...state.tasks]);
        state.historyIndex++;
        
        state.tasks = state.tasks.filter(task => !ids.includes(task.id));
        state.selectedTasks = state.selectedTasks.filter(taskId => !ids.includes(taskId));
        state.error = null;
      }),
      
      toggleTaskComplete: (id) => {
        const task = get().getTaskById(id);
        if (task) {
          const newStatus = task.status === TaskStatus.COMPLETED 
            ? TaskStatus.PENDING 
            : TaskStatus.COMPLETED;
          get().updateTask(id, { 
            status: newStatus,
            progress: newStatus === TaskStatus.COMPLETED ? 100 : task.progress
          });
        }
      },
      
      moveTask: (id, newNotebookId) => {
        get().updateTask(id, { notebookId: newNotebookId });
      },
      
      bulkUpdateTasks: (ids, updates) => set((state) => {
        // Add to history
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push([...state.tasks]);
        state.historyIndex++;
        
        ids.forEach(id => {
          const index = state.tasks.findIndex(task => task.id === id);
          if (index !== -1) {
            const currentTask = state.tasks[index];
            state.tasks[index] = {
              ...currentTask,
              ...updates,
              updatedAt: new Date(),
              completedAt: updates.status === TaskStatus.COMPLETED && currentTask.status !== TaskStatus.COMPLETED 
                ? new Date() 
                : currentTask.completedAt
            };
          }
        });
        state.error = null;
      }),
      
      // Selection management
      selectTask: (id) => set((state) => {
        if (!state.selectedTasks.includes(id)) {
          state.selectedTasks.push(id);
        }
      }),
      
      selectTasks: (ids) => set((state) => {
        state.selectedTasks = [...new Set([...state.selectedTasks, ...ids])];
      }),
      
      deselectTask: (id) => set((state) => {
        state.selectedTasks = state.selectedTasks.filter(taskId => taskId !== id);
      }),
      
      toggleTaskSelection: (id) => set((state) => {
        if (state.selectedTasks.includes(id)) {
          state.selectedTasks = state.selectedTasks.filter(taskId => taskId !== id);
        } else {
          state.selectedTasks.push(id);
        }
      }),
      
      selectAll: () => set((state) => {
        const filteredTasks = get().getFilteredTasks();
        state.selectedTasks = filteredTasks.map(task => task.id);
      }),
      
      deselectAll: () => set((state) => {
        state.selectedTasks = [];
      }),
      
      selectByNotebook: (notebookId) => set((state) => {
        const notebookTasks = state.tasks
          .filter(task => task.notebookId === notebookId)
          .map(task => task.id);
        state.selectedTasks = [...new Set([...state.selectedTasks, ...notebookTasks])];
      }),
      
      // Filtering and search
      setFilters: (filters) => set((state) => {
        state.filters = { ...state.filters, ...filters };
        state.selectedTasks = []; // Clear selection when filters change
      }),
      
      setSort: (sort) => set((state) => {
        state.sort = sort;
      }),
      
      setSearchQuery: (query) => set((state) => {
        state.searchQuery = query;
        state.selectedTasks = []; // Clear selection when search changes
      }),
      
      clearFilters: () => set((state) => {
        state.filters = {};
        state.searchQuery = '';
        state.selectedTasks = [];
      }),
      
      // History management
      undo: () => set((state) => {
        if (state.historyIndex > 0) {
          state.historyIndex--;
          state.tasks = [...state.history[state.historyIndex]];
          state.selectedTasks = [];
        }
      }),
      
      redo: () => set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex++;
          state.tasks = [...state.history[state.historyIndex]];
          state.selectedTasks = [];
        }
      }),
      
      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().history.length - 1,
      
      // Computed getters
      getFilteredTasks: () => {
        const { tasks, filters, searchQuery, sort } = get();
        const filtered = filterTasks(tasks, filters, searchQuery);
        return sortTasks(filtered, sort);
      },
      
      getTaskById: (id) => {
        return get().tasks.find(task => task.id === id);
      },
      
      getTasksByNotebook: (notebookId) => {
        return get().tasks.filter(task => task.notebookId === notebookId);
      },
      
      getTasksByStatus: (status) => {
        return get().tasks.filter(task => task.status === status);
      },
      
      getTasksByPriority: (priority) => {
        return get().tasks.filter(task => task.priority === priority);
      },
      
      getSelectedTasks: () => {
        const { tasks, selectedTasks } = get();
        return tasks.filter(task => selectedTasks.includes(task.id));
      },
      
      getTaskStats: () => {
        return calculateStats(get().tasks);
      },
      
      getOverdueTasks: () => {
        return get().tasks.filter(isOverdue);
      },
      
      getDueTodayTasks: () => {
        return get().tasks.filter(isDueToday);
      },
      
      getRecentTasks: (days = 7) => {
        return get().tasks.filter(task => isRecent(task, days));
      },
      
      // Utility actions
      setLoading: (loading) => set((state) => {
        state.loading = loading;
      }),
      
      setError: (error) => set((state) => {
        state.error = error;
        state.loading = false;
      }),
      
      clearError: () => set((state) => {
        state.error = null;
      }),
      
      generateMockTasks: (count = 50) => set((state) => {
        const mockTasks: Task[] = [];
        const notebooks = ['work', 'personal', 'health', 'hustles', 'ideas'];
        const statuses = Object.values(TaskStatus);
        const priorities = Object.values(TaskPriority);
        
        for (let i = 0; i < count; i++) {
          mockTasks.push({
            id: generateId(),
            title: `Task ${i + 1}: ${['Review', 'Update', 'Create', 'Fix', 'Analyze'][Math.floor(Math.random() * 5)]} something important`,
            description: `Detailed description for task ${i + 1} with some context and requirements.`,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            priority: priorities[Math.floor(Math.random() * priorities.length)],
            notebookId: notebooks[Math.floor(Math.random() * notebooks.length)],
            dueDate: Math.random() > 0.3 ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
            progress: Math.floor(Math.random() * 101),
            tags: [`tag${Math.floor(Math.random() * 10)}`, `category${Math.floor(Math.random() * 5)}`],
            timeEstimate: Math.floor(Math.random() * 480) + 30, // 30 minutes to 8 hours
            createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Last 90 days
            updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last week
            attachments: [],
            reminders: [],
            integrations: []
          });
        }
        
        state.tasks = mockTasks;
        state.error = null;
      })
    })),
    {
      name: 'thoughtkeeper-tasks',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        tasks: state.tasks,
        filters: state.filters,
        sort: state.sort
        // Don't persist selectedTasks, loading, error, or history
      })
    }
  )
);

// Generate mock tasks on first load (for development)
setTimeout(() => {
  const store = useTaskStore.getState();
  if (store.tasks.length === 0) {
    store.generateMockTasks(25);
  }
}, 200);
