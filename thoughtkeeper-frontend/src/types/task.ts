// Task type definitions
import { IntegrationType } from './index';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  notebookId: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  progress: number; // 0-100 percentage
  tags: string[];
  labels: string[]; // Alternative/additional to tags
  timeEstimate?: number; // in minutes
  actualTimeSpent?: number; // in minutes
  timeSpent: number; // Total time spent in minutes
  assignee?: string; // User ID
  parentTaskId?: string; // for subtasks
  parentId?: string; // Alternative field name for parent
  subtasks?: Task[];
  attachments?: TaskAttachment[];
  reminders?: TaskReminder[];
  integrations?: TaskIntegration[];
}

// Task status enum
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on-hold',
  BLOCKED = 'blocked'
}

// Task priority enum
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Task attachment interface
export interface TaskAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedAt: Date;
}

// Task reminder interface
export interface TaskReminder {
  id: string;
  type: ReminderType;
  scheduledFor: Date;
  message?: string;
  sent: boolean;
  sentAt?: Date;
}

export enum ReminderType {
  DUE_DATE = 'due_date',
  CUSTOM = 'custom',
  RECURRING = 'recurring'
}

// Task integration interface (for Telegram, Calendar, etc.)
export interface TaskIntegration {
  id: string;
  type: IntegrationType;
  externalId: string;
  data: Record<string, any>;
  createdAt: Date;
  lastSyncAt?: Date;
}




// Task creation request
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  notebookId: string;
  dueDate?: Date;
  tags?: string[];
  timeEstimate?: number;
  parentTaskId?: string;
}

// Task update request
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  notebookId?: string;
  dueDate?: Date;
  progress?: number;
  tags?: string[];
  timeEstimate?: number;
  actualTimeSpent?: number;
}

// Data interfaces used by stores and API
export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: TaskPriority;
  notebookId: string;
  dueDate?: Date;
  tags?: string[];
  labels?: string[];
  timeEstimate?: number;
  assignee?: string;
  parentTaskId?: string;
  parentId?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  notebookId?: string;
  dueDate?: Date;
  progress?: number;
  tags?: string[];
  labels?: string[];
  timeEstimate?: number;
  actualTimeSpent?: number;
  timeSpent?: number;
  assignee?: string;
  parentTaskId?: string;
  parentId?: string;
  completedAt?: Date;
}

// Bulk task update request
export interface BulkUpdateTaskRequest {
  taskIds: string[];
  updates: UpdateTaskRequest;
}

// Task filter options
export interface TaskFilters {
  searchQuery?: string;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  notebookIds?: string[];
  tags?: string[];
  dueDateRange?: {
    start?: Date;
    end?: Date;
  };
  hasOverdue?: boolean;
  hasReminders?: boolean;
  assignedToMe?: boolean;
  createdDateRange?: {
    start?: Date;
    end?: Date;
  };
}

// Task sort options
export interface TaskSort {
  sortBy: TaskSortOption;
  sortDirection: SortDirection;
}

export type TaskSortOption = 
  | 'title'
  | 'status'
  | 'priority'
  | 'dueDate'
  | 'createdAt'
  | 'updatedAt'
  | 'progress'
  | 'timeEstimate';

export type SortDirection = 'asc' | 'desc';

// Task statistics
export interface TaskStats {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  overdue: number;
  dueToday: number;
  dueTomorrow: number;
  dueThisWeek: number;
  completed: number;
  averageCompletionTime: number; // in hours
  productivityScore: number; // 0-100
}

// Task view modes
export enum TaskViewMode {
  LIST = 'list',
  KANBAN = 'kanban',
  CALENDAR = 'calendar',
  TIMELINE = 'timeline'
}

// Kanban column configuration
export interface KanbanColumn {
  id: string;
  title: string;
  status: TaskStatus;
  color: string;
  taskCount: number;
  maxTasks?: number;
  sortOrder: number;
}

// Default Kanban columns
export const DEFAULT_KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'pending',
    title: 'To Do',
    status: TaskStatus.PENDING,
    color: '#F59E0B',
    taskCount: 0,
    sortOrder: 1
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    status: TaskStatus.IN_PROGRESS,
    color: '#3B82F6',
    taskCount: 0,
    maxTasks: 5,
    sortOrder: 2
  },
  {
    id: 'blocked',
    title: 'Blocked',
    status: TaskStatus.BLOCKED,
    color: '#EF4444',
    taskCount: 0,
    sortOrder: 3
  },
  {
    id: 'completed',
    title: 'Done',
    status: TaskStatus.COMPLETED,
    color: '#10B981',
    taskCount: 0,
    sortOrder: 4
  }
];

// Task recurrence patterns (for recurring tasks)
export interface TaskRecurrence {
  id: string;
  type: RecurrenceType;
  interval: number;
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  dayOfMonth?: number;
  endDate?: Date;
  maxOccurrences?: number;
}

export enum RecurrenceType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

// Task comment/note system
export interface TaskComment {
  id: string;
  taskId: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  userId: string;
  isSystemGenerated: boolean;
}

// Task activity log
export interface TaskActivity {
  id: string;
  taskId: string;
  action: TaskAction;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  userId?: string;
}

export enum TaskAction {
  CREATED = 'created',
  UPDATED = 'updated',
  STATUS_CHANGED = 'status_changed',
  PRIORITY_CHANGED = 'priority_changed',
  DUE_DATE_CHANGED = 'due_date_changed',
  MOVED_TO_NOTEBOOK = 'moved_to_notebook',
  COMPLETED = 'completed',
  DELETED = 'deleted',
  COMMENT_ADDED = 'comment_added',
  ATTACHMENT_ADDED = 'attachment_added',
  REMINDER_ADDED = 'reminder_added'
}
