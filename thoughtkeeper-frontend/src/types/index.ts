/**
 * Central export point for all TypeScript types in the ThoughtKeeper application.
 * This file consolidates type exports from various modules for easier importing.
 */

// Notebook types - explicitly export to avoid conflicts
export type {
  Notebook,
  NotebookStatus,
  CollaboratorRole,
  SortDirection,
  CreateNotebookData,
  UpdateNotebookData,
  NotebookStats,
  NotebookQueryOptions,
  CreateNotebookRequest,
  UpdateNotebookRequest,
  NotebookResponse,
  NotebooksResponse,
  NotebookActivity,
  NotebookIntegrationType,
  Attachment,
  Collaborator
} from './notebook';

// Task types - explicitly export to avoid conflicts
export type {
  Task,
  TaskStatus,
  TaskPriority,
  CreateTaskData,
  UpdateTaskData,
  TaskStats,
  TaskQueryOptions,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskResponse,
  TasksResponse,
  TaskActivity,
  TaskComment,
  TaskTimeEntry,
  TaskIntegrationType,
  ChecklistItem,
  TaskAttachment,
  RecurrencePattern
} from './task';

// User types - explicitly export to avoid conflicts
export type {
  User,
  UserRole,
  UserStatus,
  UserPreferences,
  NotificationSettings,
  IntegrationType,
  CreateUserRequest,
  UpdateUserRequest,
  LoginRequest,
  LoginResponse,
  UserResponse,
  UsersResponse
} from './user';

// Re-export commonly used types for convenience
export type {
  ID,
  Timestamp,
  ApiResponse,
  PaginationParams,
  SortParams,
  FilterParams,
  SearchParams
} from './common';

// Export composite types
export interface AppState {
  notebooks: Notebook[];
  tasks: Task[];
  user: User | null;
  selectedNotebookId?: string;
  selectedTaskId?: string;
  isLoading: boolean;
  error?: string;
}

export interface AppConfig {
  apiUrl: string;
  appName: string;
  version: string;
  features: {
    darkMode: boolean;
    offlineMode: boolean;
    collaboration: boolean;
    analytics: boolean;
  };
}

// Export utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
export type Nullable<T> = T | null;
export type Maybe<T> = T | undefined;

// Export common enums or constants
export const TASK_STATUS_COLORS = {
  pending: '#f59e0b',
  'in-progress': '#3b82f6',
  completed: '#10b981',
  cancelled: '#ef4444',
  blocked: '#6b7280'
} as const;

export const PRIORITY_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  urgent: '#ef4444'
} as const;