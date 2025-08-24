/**
 * Keyboard Shortcuts System Types
 * Defines interfaces for comprehensive keyboard navigation and shortcuts
 */

// Basic shortcut definition
export interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  category: ShortcutCategory;
  key: string;
  modifiers: KeyModifier[];
  action: ShortcutAction;
  context?: ShortcutContext[];
  enabled: boolean;
  global: boolean;
  priority: number;
  preventDefault: boolean;
  stopPropagation: boolean;
  allowInInputs: boolean;
  customizable: boolean;
  sequence?: string[]; // For multi-key sequences like 'g' then 'h'
  conditions?: ShortcutCondition[];
}

// Key modifiers
export type KeyModifier = 'ctrl' | 'cmd' | 'alt' | 'shift' | 'meta';

// Shortcut categories for organization
export type ShortcutCategory = 
  | 'navigation'
  | 'editing' 
  | 'selection'
  | 'view'
  | 'search'
  | 'tasks'
  | 'notebooks'
  | 'global'
  | 'accessibility'
  | 'advanced';

// Context where shortcut is active
export type ShortcutContext =
  | 'global'
  | 'task-list'
  | 'notebook-list'
  | 'task-detail'
  | 'notebook-detail'
  | 'search-results'
  | 'modal'
  | 'form'
  | 'editor';

// Shortcut action types
export interface ShortcutAction {
  type: ActionType;
  payload?: any;
  handler?: (event: KeyboardEvent, payload?: any) => void | Promise<void>;
}

export type ActionType =
  | 'navigate'
  | 'create'
  | 'edit'
  | 'delete'
  | 'select'
  | 'toggle'
  | 'search'
  | 'focus'
  | 'copy'
  | 'export'
  | 'import'
  | 'custom';

// Conditions for shortcut activation
export interface ShortcutCondition {
  type: 'element' | 'route' | 'state' | 'permission';
  check: (context: ShortcutExecutionContext) => boolean;
  description: string;
}

// Execution context
export interface ShortcutExecutionContext {
  event: KeyboardEvent;
  element: Element | null;
  route: string;
  selection: {
    tasks: string[];
    notebooks: string[];
    count: number;
  };
  activeModal: string | null;
  searchActive: boolean;
  editMode: boolean;
}

// Shortcut configuration and customization
export interface ShortcutConfig {
  shortcuts: KeyboardShortcut[];
  categories: ShortcutCategoryConfig[];
  sequences: ShortcutSequenceConfig;
  accessibility: AccessibilityConfig;
  performance: PerformanceConfig;
}

export interface ShortcutCategoryConfig {
  category: ShortcutCategory;
  name: string;
  description: string;
  enabled: boolean;
  order: number;
  icon?: string;
  color?: string;
}

export interface ShortcutSequenceConfig {
  enabled: boolean;
  timeout: number; // ms to wait for next key in sequence
  indicator: boolean; // show visual indicator for sequences
  resetOnInvalid: boolean;
}

export interface AccessibilityConfig {
  announceShortcuts: boolean;
  showTooltips: boolean;
  highlightElements: boolean;
  reduceMotion: boolean;
  focusOutlines: boolean;
}

export interface PerformanceConfig {
  debounceDelay: number;
  maxListeners: number;
  enableLogging: boolean;
  cacheShortcuts: boolean;
}

// Shortcut registration and management
export interface ShortcutRegistration {
  shortcuts: KeyboardShortcut[];
  namespace: string;
  priority: number;
  enabled: boolean;
  cleanup?: () => void;
}

export interface ShortcutManager {
  // Registration
  register: (registration: ShortcutRegistration) => string;
  unregister: (id: string) => void;
  
  // Shortcuts management
  getShortcut: (id: string) => KeyboardShortcut | undefined;
  getShortcuts: (context?: ShortcutContext) => KeyboardShortcut[];
  getShortcutsByCategory: (category: ShortcutCategory) => KeyboardShortcut[];
  
  // Configuration
  updateShortcut: (id: string, updates: Partial<KeyboardShortcut>) => void;
  resetShortcut: (id: string) => void;
  enableShortcut: (id: string, enabled: boolean) => void;
  
  // Execution
  executeShortcut: (id: string, context: ShortcutExecutionContext) => Promise<void>;
  handleKeyboardEvent: (event: KeyboardEvent) => Promise<boolean>;
  
  // State
  isEnabled: () => boolean;
  setEnabled: (enabled: boolean) => void;
  getConfig: () => ShortcutConfig;
  updateConfig: (config: Partial<ShortcutConfig>) => void;
  
  // Utilities
  formatShortcut: (shortcut: KeyboardShortcut) => string;
  parseShortcut: (shortcutString: string) => Partial<KeyboardShortcut>;
  validateShortcut: (shortcut: KeyboardShortcut) => ValidationResult;
}

// Hook interfaces
export interface UseKeyboardShortcuts {
  // Basic operations
  shortcuts: KeyboardShortcut[];
  registerShortcuts: (shortcuts: KeyboardShortcut[]) => void;
  unregisterShortcuts: (ids: string[]) => void;
  
  // Execution
  executeShortcut: (id: string) => Promise<void>;
  
  // Configuration
  config: ShortcutConfig;
  updateConfig: (config: Partial<ShortcutConfig>) => void;
  
  // State
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  
  // Help and discovery
  getShortcutsForContext: (context: ShortcutContext) => KeyboardShortcut[];
  searchShortcuts: (query: string) => KeyboardShortcut[];
  getShortcutHelp: (context?: ShortcutContext) => ShortcutHelp;
}

// Help and documentation
export interface ShortcutHelp {
  categories: Array<{
    category: ShortcutCategory;
    name: string;
    shortcuts: Array<{
      shortcut: KeyboardShortcut;
      formatted: string;
      example?: string;
    }>;
  }>;
  totalShortcuts: number;
  contextShortcuts: number;
}

// UI component interfaces
export interface ShortcutTooltipProps {
  shortcut: KeyboardShortcut;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  showDelay?: number;
}

export interface ShortcutHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: ShortcutContext;
  searchable?: boolean;
  categorized?: boolean;
}

export interface ShortcutCustomizationProps {
  shortcut: KeyboardShortcut;
  onUpdate: (shortcut: KeyboardShortcut) => void;
  onCancel: () => void;
  conflicts?: KeyboardShortcut[];
}

export interface ShortcutRecorderProps {
  value: string;
  onChange: (shortcut: string) => void;
  onValidate: (shortcut: string) => ValidationResult;
  placeholder?: string;
  disabled?: boolean;
}

export interface ShortcutListProps {
  shortcuts: KeyboardShortcut[];
  category?: ShortcutCategory;
  context?: ShortcutContext;
  searchQuery?: string;
  onShortcutClick?: (shortcut: KeyboardShortcut) => void;
  onCustomize?: (shortcut: KeyboardShortcut) => void;
  showCategories?: boolean;
  showDescriptions?: boolean;
  editable?: boolean;
}

// Advanced features
export interface ShortcutSequence {
  id: string;
  keys: string[];
  timeout: number;
  resetOnInvalid: boolean;
  onComplete: (sequence: string[]) => void;
  onTimeout: () => void;
  onInvalid: (key: string) => void;
}

export interface ShortcutConflict {
  shortcut: KeyboardShortcut;
  conflictsWith: KeyboardShortcut[];
  severity: 'low' | 'medium' | 'high';
  resolution: ConflictResolution[];
}

export type ConflictResolution = 
  | 'disable-conflicting'
  | 'change-modifier' 
  | 'change-key'
  | 'change-context'
  | 'ignore';

export interface ShortcutAnalytics {
  usage: Record<string, number>;
  mostUsed: KeyboardShortcut[];
  leastUsed: KeyboardShortcut[];
  conflicts: ShortcutConflict[];
  userCustomizations: number;
  averageResponseTime: number;
}

// Platform-specific configurations
export interface PlatformShortcuts {
  windows: Partial<KeyboardShortcut>;
  mac: Partial<KeyboardShortcut>;
  linux: Partial<KeyboardShortcut>;
}

export interface ShortcutPlatformConfig {
  detectPlatform: boolean;
  platformOverrides: Record<string, PlatformShortcuts>;
  fallbackPlatform: 'windows' | 'mac' | 'linux';
}

// Import/Export
export interface ShortcutExportData {
  version: string;
  platform: string;
  shortcuts: KeyboardShortcut[];
  config: ShortcutConfig;
  customizations: Record<string, Partial<KeyboardShortcut>>;
  exportedAt: Date;
}

export interface ShortcutImportOptions {
  mergeStrategy: 'replace' | 'merge' | 'append';
  conflictResolution: 'skip' | 'overwrite' | 'prompt';
  validateShortcuts: boolean;
  preserveCustomizations: boolean;
}

// Validation
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Context provider interface
export interface KeyboardShortcutsContext {
  // Manager
  manager: ShortcutManager;
  
  // Basic state
  enabled: boolean;
  shortcuts: KeyboardShortcut[];
  config: ShortcutConfig;
  
  // Actions
  registerShortcuts: (shortcuts: KeyboardShortcut[], namespace?: string) => string;
  unregisterShortcuts: (registrationId: string) => void;
  updateShortcut: (id: string, updates: Partial<KeyboardShortcut>) => void;
  resetShortcut: (id: string) => void;
  
  // Configuration
  updateConfig: (config: Partial<ShortcutConfig>) => void;
  resetConfig: () => void;
  
  // Discovery and help
  getShortcutsForContext: (context: ShortcutContext) => KeyboardShortcut[];
  searchShortcuts: (query: string) => KeyboardShortcut[];
  getShortcutHelp: (context?: ShortcutContext) => ShortcutHelp;
  
  // Analytics
  getAnalytics: () => ShortcutAnalytics;
  
  // Import/Export
  exportShortcuts: () => ShortcutExportData;
  importShortcuts: (data: ShortcutExportData, options: ShortcutImportOptions) => Promise<ValidationResult>;
}

// Event types
export type ShortcutEvent = 
  | ShortcutExecutedEvent
  | ShortcutRegisteredEvent  
  | ShortcutUpdatedEvent
  | ShortcutConflictEvent;

export interface ShortcutExecutedEvent {
  type: 'shortcut-executed';
  shortcut: KeyboardShortcut;
  context: ShortcutExecutionContext;
  timestamp: Date;
  duration: number;
}

export interface ShortcutRegisteredEvent {
  type: 'shortcut-registered';
  shortcuts: KeyboardShortcut[];
  namespace: string;
  timestamp: Date;
}

export interface ShortcutUpdatedEvent {
  type: 'shortcut-updated';
  shortcutId: string;
  oldShortcut: KeyboardShortcut;
  newShortcut: KeyboardShortcut;
  timestamp: Date;
}

export interface ShortcutConflictEvent {
  type: 'shortcut-conflict';
  conflict: ShortcutConflict;
  timestamp: Date;
}

// Built-in shortcut definitions
export interface DefaultShortcuts {
  navigation: KeyboardShortcut[];
  editing: KeyboardShortcut[];
  selection: KeyboardShortcut[];
  view: KeyboardShortcut[];
  search: KeyboardShortcut[];
  tasks: KeyboardShortcut[];
  notebooks: KeyboardShortcut[];
  global: KeyboardShortcut[];
  accessibility: KeyboardShortcut[];
}

// Error types
export class ShortcutError extends Error {
  constructor(
    message: string,
    public code: string,
    public shortcutId?: string,
    public context?: any
  ) {
    super(message);
    this.name = 'ShortcutError';
  }
}

export class ShortcutConflictError extends ShortcutError {
  constructor(
    message: string,
    public conflicts: KeyboardShortcut[],
    public shortcut: KeyboardShortcut
  ) {
    super(message, 'SHORTCUT_CONFLICT', shortcut.id);
    this.name = 'ShortcutConflictError';
  }
}

export class ShortcutRegistrationError extends ShortcutError {
  constructor(
    message: string,
    public shortcut: KeyboardShortcut,
    public validationErrors: string[]
  ) {
    super(message, 'REGISTRATION_ERROR', shortcut.id);
    this.name = 'ShortcutRegistrationError';
  }
}

// Utility types
export type ShortcutHandler<T = any> = (
  event: KeyboardEvent,
  context: ShortcutExecutionContext,
  payload?: T
) => void | Promise<void>;

export interface ShortcutOptions {
  preventDefault?: boolean;
  stopPropagation?: boolean;
  allowInInputs?: boolean;
  global?: boolean;
  priority?: number;
}

export type ShortcutKeyCombo = {
  key: string;
  modifiers: KeyModifier[];
  formatted: string;
};

export interface ShortcutTemplate {
  id: string;
  name: string;
  description: string;
  shortcuts: Partial<KeyboardShortcut>[];
  category: ShortcutCategory;
  platform?: 'windows' | 'mac' | 'linux' | 'all';
}

// Advanced shortcut patterns
export interface ShortcutPattern {
  id: string;
  pattern: RegExp | string;
  handler: (matches: string[], event: KeyboardEvent) => void;
  context?: ShortcutContext[];
  priority: number;
}

export interface ShortcutMacro {
  id: string;
  name: string;
  description: string;
  shortcuts: string[]; // Sequence of shortcut IDs
  delay?: number; // ms between shortcuts
  context?: ShortcutContext[];
}
