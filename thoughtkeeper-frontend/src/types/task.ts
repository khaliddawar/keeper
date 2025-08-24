/**
 * Task Types
 * 
 * Core type definitions for task entities in the ThoughtKeeper application.
 * Tasks represent actionable items that can be organized within notebooks.
 */

// Task status type - using string literal union for flexibility
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'blocked';

// Task priority levels
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// Task entity
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  labels: string[];
  assignee?: string;
  notebookId?: string;
  parentId?: string | null;
  dueDate?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  completedAt?: Date | string | null;
  estimatedTime?: number;
  timeSpent?: number;
  tags?: string[];
  checklist?: ChecklistItem[];
  attachments?: TaskAttachment[];
  recurrence?: RecurrencePattern;
}

// Checklist item
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

// Task attachment
export interface TaskAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

// Recurrence pattern
export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date | string;
  daysOfWeek?: number[];
  dayOfMonth?: number;
}

// Create task data
export interface CreateTaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  labels?: string[];
  assignee?: string;
  notebookId?: string;
  parentId?: string | null;
  dueDate?: Date | string | null;
  estimatedTime?: number;
  tags?: string[];
  recurrence?: RecurrencePattern;
}

// Update task data
export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  labels?: string[];
  assignee?: string;
  notebookId?: string;
  parentId?: string | null;
  dueDate?: Date | string | null;
  estimatedTime?: number;
  timeSpent?: number;
  tags?: string[];
  checklist?: ChecklistItem[];
  recurrence?: RecurrencePattern;
}

// Task statistics
export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  blocked: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
}

// Task query options
export interface TaskQueryOptions {
  search?: string;
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  assignee?: string;
  notebookId?: string;
  parentId?: string | null;
  labels?: string[];
  tags?: string[];
  dueBefore?: Date | string;
  dueAfter?: Date | string;
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'dueDate' | 'priority';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Task creation request
export interface CreateTaskRequest extends CreateTaskData {
  // Additional fields for API request if needed
}

// Task update request
export interface UpdateTaskRequest extends UpdateTaskData {
  // Additional fields for API request if needed
}

// Task response from API
export interface TaskResponse {
  task: Task;
  message?: string;
}

// Tasks list response
export interface TasksResponse {
  tasks: Task[];
  total: number;
  hasMore: boolean;
}

// Task activity
export interface TaskActivity {
  id: string;
  taskId: string;
  userId: string;
  action: 'created' | 'updated' | 'completed' | 'assigned' | 'commented';
  timestamp: Date | string;
  details?: string;
  oldValue?: any;
  newValue?: any;
}

// Task comment
export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  edited?: boolean;
}

// Task time entry
export interface TaskTimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startTime: Date | string;
  endTime?: Date | string;
  duration?: number;
  description?: string;
}

// Integration types for tasks
export type TaskIntegrationType = 'jira' | 'asana' | 'trello' | 'github' | 'gitlab';

// Re-export SortDirection from notebook types to avoid duplication
export type { SortDirection } from './notebook';