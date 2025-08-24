// Main types export file
// Centralized export for all TypeScript definitions

// Notebook types
export * from './notebook';
export type {
  Notebook,
  CreateNotebookRequest,
  UpdateNotebookRequest,
  NotebookStats,
  NotebookFilters,
  NotebookSortOption
} from './notebook';

// Task types
export * from './task';
export type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  BulkUpdateTaskRequest,
  TaskFilters,
  TaskSort,
  TaskStats,
  KanbanColumn,
  TaskRecurrence,
  TaskComment,
  TaskActivity,
  TaskAttachment,
  TaskReminder,
  TaskIntegration
} from './task';

// User types
export * from './user';
export type {
  User,
  UserPreferences,
  NotificationPreferences,
  PrivacyPreferences,
  ProductivityPreferences,
  UserSubscription,
  UserIntegration,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  Session,
  TelegramIntegration,
  ApiResponse,
  ApiError
} from './user';

// Common utility types
export type SortDirection = 'asc' | 'desc';

export enum IntegrationType {
  TELEGRAM = 'telegram',
  CALENDAR = 'calendar',
  EMAIL = 'email',
  GOOGLE_CALENDAR = 'google_calendar',
  GMAIL = 'gmail',
  OUTLOOK = 'outlook',
  SLACK = 'slack',
  NOTION = 'notion',
  TRELLO = 'trello'
}

export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: string;
}

export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, record: T) => React.ReactNode;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface SortParams {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: any;
}

export interface QueryParams extends PaginationParams, SortParams, FilterParams {}

// Form-related types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date' | 'time';
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormState<T = Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// UI Component types
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export interface ButtonProps extends ComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
}

export interface InputProps extends ComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
}

export interface ModalProps extends ComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Animation and transition types
export interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
  repeat?: number;
}

export interface TransitionConfig {
  enter?: AnimationConfig;
  exit?: AnimationConfig;
  initial?: Record<string, any>;
  animate?: Record<string, any>;
}

// Error boundary types
export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  eventId?: string;
}

export interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  resetError: () => void;
}

// Theme and styling types
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  mode: ThemeMode;
  colors: Record<string, string>;
  spacing: Record<string, string>;
  typography: Record<string, any>;
  breakpoints: Record<string, string>;
}

// Performance and optimization types
export interface LazyLoadConfig {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

// Event handler types
export type EventHandler<T = Event> = (event: T) => void;
export type KeyboardEventHandler = EventHandler<React.KeyboardEvent>;
export type MouseEventHandler = EventHandler<React.MouseEvent>;
export type ChangeEventHandler<T = HTMLInputElement> = EventHandler<React.ChangeEvent<T>>;
export type FormEventHandler = EventHandler<React.FormEvent>;

// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// API and data fetching types
export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch?: Date;
}

export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxAge?: number;
  staleWhileRevalidate?: boolean;
}

// WebSocket and real-time types
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: Date;
  id?: string;
}

export interface RealtimeEvent<T = any> {
  event: string;
  data: T;
  timestamp: Date;
  source: 'websocket' | 'sse' | 'polling';
}

// Keyboard shortcut types
export interface KeyboardShortcut {
  key: string;
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  action: () => void;
  description?: string;
  disabled?: boolean;
}

export interface ShortcutGroup {
  name: string;
  shortcuts: KeyboardShortcut[];
}
