import { useMemo, useCallback } from 'react';
import { useTasksStore } from '../stores';
import { useUI } from './useUI';
import type { Task, CreateTaskData, UpdateTaskData } from '../types/task';
import { TaskStatus, TaskPriority } from '../types/task';

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

interface UseTasksOptions {
  notebookId?: string;
  autoFetch?: boolean;
  realTimeUpdates?: boolean;
}

interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  completionRate: number;
}

interface UseTasksReturn {
  tasks: Task[];
  selectedTasks: string[];
  currentTask: Task | null;
  searchQuery: string;
  appliedFilters: TaskFilters;
  filteredTasks: Task[];
  searchResults: Task[];
  tasksByStatus: Record<TaskStatus, Task[]>;
  tasksByPriority: Record<TaskPriority, Task[]>;
  parentTasks: Task[];
  subtasks: Task[];
  rootTasks: Task[];
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
  hasChanges: boolean;
  stats: TaskStats;
  recentTasks: Task[];
  dueTasks: Task[];
  overdueTasks: Task[];
  
  createTask: (data: CreateTaskData) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskData) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  duplicateTask: (id: string) => Promise<Task>;
  bulkDelete: (ids: string[]) => Promise<void>;
  
  markComplete: (id: string) => Promise<void>;
  markIncomplete: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  setStatus: (id: string, status: TaskStatus) => Promise<void>;
  bulkSetStatus: (ids: string[], status: TaskStatus) => Promise<void>;
  
  setPriority: (id: string, priority: TaskPriority) => Promise<void>;
  bulkSetPriority: (ids: string[], priority: TaskPriority) => Promise<void>;
  
  addSubtask: (parentId: string, data: CreateTaskData) => Promise<Task>;
  removeSubtask: (subtaskId: string) => Promise<void>;
  promoteSubtask: (subtaskId: string) => Promise<void>;
  convertToSubtask: (taskId: string, parentId: string) => Promise<void>;
  
  selectTask: (id: string) => void;
  deselectTask: (id: string) => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  setFilters: (filters: TaskFilters) => void;
  clearFilters: () => void;
  
  getTask: (id: string) => Task | undefined;
  getSubtasks: (parentId: string) => Task[];
  getTaskProgress: (id: string) => number;
  isTaskSelected: (id: string) => boolean;
  canComplete: (id: string) => boolean;
  isOverdue: (task: Task) => boolean;
  hasSelectedTasks: boolean;
}

export const useTasks = (options: UseTasksOptions = {}): UseTasksReturn => {
  const { notebookId } = options;
  const store = useTasksStore();
  const { showSuccess, showError, showWarning } = useUI();
  
  const filteredTasks = useMemo(() => {
    let result = notebookId 
      ? store.tasks.filter(task => task.notebookId === notebookId)
      : [...store.tasks];
    
    if (store.searchQuery.trim()) {
      const query = store.searchQuery.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [store.tasks, store.searchQuery, notebookId]);
  
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      [TaskStatus.PENDING]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.COMPLETED]: [],
      [TaskStatus.CANCELLED]: [],
      [TaskStatus.ON_HOLD]: [],
      [TaskStatus.BLOCKED]: []
    };
    
    filteredTasks.forEach(task => {
      grouped[task.status].push(task);
    });
    
    return grouped;
  }, [filteredTasks]);
  
  const stats = useMemo((): TaskStats => {
    const total = filteredTasks.length;
    const completed = tasksByStatus.completed.length;
    const inProgress = tasksByStatus['in-progress'].length;
    const pending = tasksByStatus.pending.length;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const overdue = filteredTasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < today && task.status !== 'completed'
    ).length;
    
    const dueToday = filteredTasks.filter(task => 
      task.dueDate && new Date(task.dueDate).toDateString() === today.toDateString()
    ).length;
    
    const dueThisWeek = filteredTasks.filter(task => 
      task.dueDate && new Date(task.dueDate) <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    ).length;
    
    return {
      total,
      completed,
      inProgress,
      pending,
      overdue,
      dueToday,
      dueThisWeek,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    };
  }, [filteredTasks, tasksByStatus]);
  
  const createTask = useCallback(async (data: CreateTaskData) => {
    try {
      store.setLoading('creating', true);
      const task = await store.createTask(data);
      showSuccess('Task created successfully');
      return task;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create task';
      showError(message);
      throw error;
    } finally {
      store.setLoading('creating', false);
    }
  }, [store, showSuccess, showError]);
  
  const updateTask = useCallback(async (id: string, data: UpdateTaskData) => {
    try {
      store.setLoading('saving', true);
      await store.updateTask(id, data);
      showSuccess('Task updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update task';
      showError(message);
      throw error;
    } finally {
      store.setLoading('saving', false);
    }
  }, [store, showSuccess, showError]);
  
  const deleteTask = useCallback(async (id: string) => {
    try {
      store.setLoading('deleting', true);
      await store.deleteTask(id);
      showSuccess('Task deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete task';
      showError(message);
      throw error;
    } finally {
      store.setLoading('deleting', false);
    }
  }, [store, showSuccess, showError]);
  
  const markComplete = useCallback(async (id: string) => {
    await updateTask(id, { status: TaskStatus.COMPLETED, completedAt: new Date() });
  }, [updateTask]);
  
  const toggleComplete = useCallback(async (id: string) => {
    const task = store.getTask(id);
    if (!task) return;
    
    if (task.status === TaskStatus.COMPLETED) {
      await updateTask(id, { status: TaskStatus.PENDING, completedAt: undefined });
    } else {
      await markComplete(id);
    }
  }, [store, markComplete, updateTask]);
  
  const getSubtasks = useCallback((parentId: string) => {
    return store.tasks.filter(task => task.parentId === parentId);
  }, [store.tasks]);
  
  return {
    tasks: filteredTasks,
    selectedTasks: store.selectedTasks,
    currentTask: store.currentTask,
    searchQuery: store.searchQuery,
    appliedFilters: store.appliedFilters,
    filteredTasks,
    searchResults: store.searchQuery.trim() ? filteredTasks : [],
    tasksByStatus,
    tasksByPriority: {} as Record<TaskPriority, Task[]>,
    parentTasks: filteredTasks.filter(task => !task.parentId),
    subtasks: filteredTasks.filter(task => !!task.parentId),
    rootTasks: filteredTasks.filter(task => !task.parentId),
    loading: store.loading,
    saving: store.getLoadingState('saving'),
    deleting: store.getLoadingState('deleting'),
    error: store.error,
    hasChanges: store.hasChanges,
    stats,
    recentTasks: store.recentTasks,
    dueTasks: [],
    overdueTasks: [],
    
    createTask,
    updateTask,
    deleteTask,
    duplicateTask: async (id: string) => {
      const original = store.getTask(id);
      if (!original) throw new Error('Task not found');
      
      const duplicateData: CreateTaskData = {
        title: `${original.title} (Copy)`,
        description: original.description,
        priority: original.priority,
        labels: [...original.labels],
        dueDate: original.dueDate,
        notebookId: original.notebookId
      };
      
      return await createTask(duplicateData);
    },
    bulkDelete: async (ids: string[]) => {
      try {
        await Promise.all(ids.map(id => store.deleteTask(id)));
        showSuccess(`${ids.length} tasks deleted`);
      } catch (error) {
        showError('Failed to delete some tasks');
      }
    },
    
    markComplete,
    markIncomplete: async (id: string) => {
      await updateTask(id, { status: TaskStatus.PENDING, completedAt: undefined });
    },
    toggleComplete,
    setStatus: async (id: string, status: TaskStatus) => {
      await updateTask(id, { status });
    },
    bulkSetStatus: async (ids: string[], status: TaskStatus) => {
      await Promise.all(ids.map(id => updateTask(id, { status })));
    },
    
    setPriority: async (id: string, priority: TaskPriority) => {
      await updateTask(id, { priority });
    },
    bulkSetPriority: async (ids: string[], priority: TaskPriority) => {
      await Promise.all(ids.map(id => updateTask(id, { priority })));
    },
    
    addSubtask: async (parentId: string, data: CreateTaskData) => {
      if (!notebookId) throw new Error('Notebook ID is required');
      const subtaskData = { ...data, parentId, notebookId };
      return await createTask(subtaskData);
    },
    removeSubtask: deleteTask,
    promoteSubtask: async (subtaskId: string) => {
      await updateTask(subtaskId, { parentId: undefined });
    },
    convertToSubtask: async (taskId: string, parentId: string) => {
      await updateTask(taskId, { parentId });
    },
    
    selectTask: store.selectTask,
    deselectTask: store.deselectTask,
    toggleSelection: store.toggleSelection,
    selectAll: store.selectAll,
    deselectAll: store.deselectAll,
    
    setSearchQuery: store.setSearchQuery,
    clearSearch: store.clearSearch,
    setFilters: store.setFilters,
    clearFilters: store.clearFilters,
    
    getTask: store.getTask,
    getSubtasks,
    getTaskProgress: (id: string) => {
      const subtasks = getSubtasks(id);
      if (subtasks.length === 0) return 0;
      const completed = subtasks.filter(task => task.status === 'completed').length;
      return (completed / subtasks.length) * 100;
    },
    isTaskSelected: store.isTaskSelected,
    canComplete: (id: string) => {
      const subtasks = getSubtasks(id);
      return subtasks.every(subtask => subtask.status === 'completed');
    },
    isOverdue: (task: Task) => {
      if (!task.dueDate || task.status === 'completed') return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(task.dueDate) < today;
    },
    hasSelectedTasks: store.selectedTasks.length > 0
  };
};