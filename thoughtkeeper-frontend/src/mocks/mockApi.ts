import type { Notebook, CreateNotebookData, UpdateNotebookData, NotebookStats } from '../types/notebook';
import type { Task, TaskStatus, CreateTaskData, UpdateTaskData } from '../types/task';
import { MOCK_DATA, getMockNotebooks, getMockTasks } from './mockData';

/**
 * Mock API Service
 * 
 * Simulates real API operations with:
 * - Realistic delays
 * - Error handling and edge cases
 * - Proper HTTP status codes
 * - Optimistic updates
 * - Pagination support
 * - Search and filtering
 */

// Configuration
const API_DELAY_MIN = 200; // Minimum delay in ms
const API_DELAY_MAX = 1000; // Maximum delay in ms
const ERROR_RATE = 0.05; // 5% chance of random errors

// Error types that can occur
const API_ERRORS = [
  { status: 500, message: 'Internal server error' },
  { status: 503, message: 'Service temporarily unavailable' },
  { status: 429, message: 'Too many requests' },
  { status: 408, message: 'Request timeout' }
];

// Helper functions
const delay = (ms?: number): Promise<void> => {
  const delayTime = ms || Math.floor(Math.random() * (API_DELAY_MAX - API_DELAY_MIN)) + API_DELAY_MIN;
  return new Promise(resolve => setTimeout(resolve, delayTime));
};

const shouldSimulateError = (): boolean => {
  return Math.random() < ERROR_RATE;
};

const getRandomError = () => {
  return API_ERRORS[Math.floor(Math.random() * API_ERRORS.length)];
};

const simulateNetworkError = () => {
  if (shouldSimulateError()) {
    const error = getRandomError();
    throw new Error(`${error.status}: ${error.message}`);
  }
};

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Notebooks API Mock
 */
export class NotebooksApiMock {
  private static notebooks = [...getMockNotebooks()];
  
  static async getNotebooks(options?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    tags?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    notebooks: Notebook[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }> {
    await delay();
    simulateNetworkError();
    
    let filtered = [...this.notebooks];
    
    // Apply search filter
    if (options?.search) {
      const query = options.search.toLowerCase();
      filtered = filtered.filter(notebook =>
        notebook.title.toLowerCase().includes(query) ||
        notebook.description?.toLowerCase().includes(query) ||
        notebook.content?.toLowerCase().includes(query) ||
        notebook.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (options?.status) {
      filtered = filtered.filter(notebook => notebook.status === options.status);
    }
    
    // Apply tags filter
    if (options?.tags && options.tags.length > 0) {
      filtered = filtered.filter(notebook =>
        options.tags!.some(tag => notebook.tags.includes(tag))
      );
    }
    
    // Apply sorting
    if (options?.sortBy) {
      filtered.sort((a, b) => {
        const aValue = a[options.sortBy as keyof Notebook];
        const bValue = b[options.sortBy as keyof Notebook];
        
        if (aValue < bValue) return options.sortOrder === 'desc' ? 1 : -1;
        if (aValue > bValue) return options.sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }
    
    // Apply pagination
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;
    const paginatedNotebooks = filtered.slice(offset, offset + limit);
    
    return {
      notebooks: paginatedNotebooks,
      total: filtered.length,
      page,
      limit,
      hasMore: offset + limit < filtered.length
    };
  }
  
  static async getNotebook(id: string): Promise<Notebook> {
    await delay();
    simulateNetworkError();
    
    const notebook = this.notebooks.find(n => n.id === id);
    if (!notebook) {
      throw new Error('404: Notebook not found');
    }
    
    return { ...notebook };
  }
  
  static async createNotebook(data: CreateNotebookData): Promise<Notebook> {
    await delay(500); // Slightly longer for create operations
    simulateNetworkError();
    
    const now = new Date();
    const notebook: Notebook = {
      id: generateId(),
      title: data.title,
      description: data.description,
      content: data.content || '',
      status: data.status || 'draft',
      tags: data.tags || [],
      createdAt: now,
      updatedAt: now,
      ownerId: 'current-user', // Would be set by auth system
      shared: data.shared || false,
      pinned: false,
      archived: false,
      wordCount: (data.content || '').split(' ').length,
      characterCount: (data.content || '').length,
      readingTime: Math.ceil((data.content || '').split(' ').length / 200),
      attachments: data.attachments || []
    };
    
    this.notebooks.unshift(notebook);
    return { ...notebook };
  }
  
  static async updateNotebook(id: string, data: UpdateNotebookData): Promise<Notebook> {
    await delay(300);
    simulateNetworkError();
    
    const notebookIndex = this.notebooks.findIndex(n => n.id === id);
    if (notebookIndex === -1) {
      throw new Error('404: Notebook not found');
    }
    
    const notebook = this.notebooks[notebookIndex];
    const updatedNotebook: Notebook = {
      ...notebook,
      ...data,
      updatedAt: new Date()
    };
    
    // Update computed fields if content changed
    if (data.content !== undefined) {
      updatedNotebook.wordCount = data.content.split(' ').length;
      updatedNotebook.characterCount = data.content.length;
      updatedNotebook.readingTime = Math.ceil(data.content.split(' ').length / 200);
    }
    
    this.notebooks[notebookIndex] = updatedNotebook;
    return { ...updatedNotebook };
  }
  
  static async deleteNotebook(id: string): Promise<void> {
    await delay(300);
    simulateNetworkError();
    
    const notebookIndex = this.notebooks.findIndex(n => n.id === id);
    if (notebookIndex === -1) {
      throw new Error('404: Notebook not found');
    }
    
    this.notebooks.splice(notebookIndex, 1);
    
    // Also delete related tasks
    await TasksApiMock.deleteTasksByNotebook(id);
  }
  
  static async archiveNotebook(id: string): Promise<Notebook> {
    return this.updateNotebook(id, { archived: true, status: 'archived' });
  }
  
  static async restoreNotebook(id: string): Promise<Notebook> {
    return this.updateNotebook(id, { archived: false, status: 'active' });
  }
  
  static async pinNotebook(id: string): Promise<Notebook> {
    return this.updateNotebook(id, { pinned: true });
  }
  
  static async unpinNotebook(id: string): Promise<Notebook> {
    return this.updateNotebook(id, { pinned: false });
  }
  
  static async getNotebookStats(): Promise<NotebookStats> {
    await delay(100);
    simulateNetworkError();
    
    const notebooks = this.notebooks;
    const tasks = await TasksApiMock.getAllTasks();
    
    return {
      total: notebooks.length,
      active: notebooks.filter(n => n.status === 'active').length,
      archived: notebooks.filter(n => n.archived).length,
      shared: notebooks.filter(n => n.shared).length,
      pinned: notebooks.filter(n => n.pinned).length,
      totalWords: notebooks.reduce((sum, n) => sum + n.wordCount, 0),
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length
    };
  }
}

/**
 * Tasks API Mock
 */
export class TasksApiMock {
  private static tasks = [...getMockTasks()];
  
  static async getTasks(options?: {
    notebookId?: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: TaskStatus | TaskStatus[];
    priority?: string;
    assignee?: string;
    dueDate?: 'today' | 'week' | 'month' | 'overdue';
    parentId?: string | null;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    tasks: Task[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }> {
    await delay();
    simulateNetworkError();
    
    let filtered = [...this.tasks];
    
    // Filter by notebook
    if (options?.notebookId) {
      filtered = filtered.filter(task => task.notebookId === options.notebookId);
    }
    
    // Filter by parent ID (for subtasks)
    if (options?.parentId !== undefined) {
      if (options.parentId === null) {
        filtered = filtered.filter(task => !task.parentId);
      } else {
        filtered = filtered.filter(task => task.parentId === options.parentId);
      }
    }
    
    // Apply search filter
    if (options?.search) {
      const query = options.search.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.labels.some(label => label.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (options?.status) {
      const statuses = Array.isArray(options.status) ? options.status : [options.status];
      filtered = filtered.filter(task => statuses.includes(task.status));
    }
    
    // Apply priority filter
    if (options?.priority) {
      filtered = filtered.filter(task => task.priority === options.priority);
    }
    
    // Apply assignee filter
    if (options?.assignee) {
      filtered = filtered.filter(task => task.assignee === options.assignee);
    }
    
    // Apply due date filter
    if (options?.dueDate) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        
        switch (options.dueDate) {
          case 'today':
            return dueDate.toDateString() === today.toDateString();
          case 'week':
            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            return dueDate <= weekFromNow;
          case 'month':
            const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
            return dueDate <= monthFromNow;
          case 'overdue':
            return dueDate < today && task.status !== 'completed';
          default:
            return true;
        }
      });
    }
    
    // Apply sorting
    if (options?.sortBy) {
      filtered.sort((a, b) => {
        let aValue = a[options.sortBy as keyof Task];
        let bValue = b[options.sortBy as keyof Task];
        
        // Handle date sorting
        if (options.sortBy === 'dueDate' || options.sortBy === 'createdAt' || options.sortBy === 'updatedAt') {
          aValue = aValue ? new Date(aValue as string).getTime() : 0;
          bValue = bValue ? new Date(bValue as string).getTime() : 0;
        }
        
        if (aValue < bValue) return options.sortOrder === 'desc' ? 1 : -1;
        if (aValue > bValue) return options.sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }
    
    // Apply pagination
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;
    const paginatedTasks = filtered.slice(offset, offset + limit);
    
    return {
      tasks: paginatedTasks,
      total: filtered.length,
      page,
      limit,
      hasMore: offset + limit < filtered.length
    };
  }
  
  static async getTask(id: string): Promise<Task> {
    await delay();
    simulateNetworkError();
    
    const task = this.tasks.find(t => t.id === id);
    if (!task) {
      throw new Error('404: Task not found');
    }
    
    return { ...task };
  }
  
  static async createTask(data: CreateTaskData): Promise<Task> {
    await delay(400);
    simulateNetworkError();
    
    const now = new Date();
    const task: Task = {
      id: generateId(),
      title: data.title,
      description: data.description,
      status: 'pending',
      priority: data.priority || 'medium',
      labels: data.labels || [],
      assignee: data.assignee,
      dueDate: data.dueDate,
      createdAt: now,
      updatedAt: now,
      completedAt: undefined,
      notebookId: data.notebookId,
      parentId: data.parentId || null,
      estimate: data.estimate,
      timeSpent: 0
    };
    
    this.tasks.unshift(task);
    return { ...task };
  }
  
  static async updateTask(id: string, data: UpdateTaskData): Promise<Task> {
    await delay(250);
    simulateNetworkError();
    
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      throw new Error('404: Task not found');
    }
    
    const task = this.tasks[taskIndex];
    const updatedTask: Task = {
      ...task,
      ...data,
      updatedAt: new Date(),
      completedAt: data.status === 'completed' ? data.completedAt || new Date() : 
                    data.status !== 'completed' ? undefined : 
                    task.completedAt
    };
    
    this.tasks[taskIndex] = updatedTask;
    return { ...updatedTask };
  }
  
  static async deleteTask(id: string): Promise<void> {
    await delay(250);
    simulateNetworkError();
    
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      throw new Error('404: Task not found');
    }
    
    // Delete the task and any subtasks
    this.tasks = this.tasks.filter(t => t.id !== id && t.parentId !== id);
  }
  
  static async deleteTasksByNotebook(notebookId: string): Promise<void> {
    this.tasks = this.tasks.filter(t => t.notebookId !== notebookId);
  }
  
  static async bulkUpdateTasks(ids: string[], data: Partial<UpdateTaskData>): Promise<Task[]> {
    await delay(500);
    simulateNetworkError();
    
    const updatedTasks: Task[] = [];
    
    for (const id of ids) {
      const taskIndex = this.tasks.findIndex(t => t.id === id);
      if (taskIndex !== -1) {
        const task = this.tasks[taskIndex];
        const updatedTask: Task = {
          ...task,
          ...data,
          updatedAt: new Date()
        };
        
        this.tasks[taskIndex] = updatedTask;
        updatedTasks.push({ ...updatedTask });
      }
    }
    
    return updatedTasks;
  }
  
  // Helper method for internal use
  static async getAllTasks(): Promise<Task[]> {
    return [...this.tasks];
  }
  
  static async getTaskStats(notebookId?: string): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    overdue: number;
    dueToday: number;
    dueThisWeek: number;
    completionRate: number;
  }> {
    await delay(100);
    simulateNetworkError();
    
    let tasks = this.tasks;
    if (notebookId) {
      tasks = tasks.filter(t => t.notebookId === notebookId);
    }
    
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const overdue = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < today && t.status !== 'completed'
    ).length;
    
    const dueToday = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate).toDateString() === today.toDateString()
    ).length;
    
    const dueThisWeek = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) <= weekFromNow && t.status !== 'completed'
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
  }
}

/**
 * Combined API Mock Service
 */
export const MockApiService = {
  notebooks: NotebooksApiMock,
  tasks: TasksApiMock,
  
  // Utility methods
  async healthCheck(): Promise<{ status: 'ok' | 'error'; timestamp: Date }> {
    await delay(50);
    return {
      status: shouldSimulateError() ? 'error' : 'ok',
      timestamp: new Date()
    };
  },
  
  // Reset data to initial state (useful for testing)
  resetData(): void {
    NotebooksApiMock['notebooks'] = [...getMockNotebooks()];
    TasksApiMock['tasks'] = [...getMockTasks()];
  },
  
  // Get current data state (useful for debugging)
  getCurrentData() {
    return {
      notebooks: NotebooksApiMock['notebooks'],
      tasks: TasksApiMock['tasks']
    };
  }
};

export default MockApiService;
