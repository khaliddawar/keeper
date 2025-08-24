/**
 * Bulk Operations System Types
 * 
 * Comprehensive type definitions for bulk operations functionality
 * supporting multi-selection, batch actions, and keyboard shortcuts
 */

export type SelectionMode = 'single' | 'multiple' | 'range' | 'all';

export type BulkActionType = 
  | 'delete' 
  | 'archive' 
  | 'restore' 
  | 'complete' 
  | 'incomplete'
  | 'priority-change'
  | 'status-change' 
  | 'move' 
  | 'copy' 
  | 'tag'
  | 'assign'
  | 'export'
  | 'custom';

/**
 * Selection state for an individual item
 */
export interface SelectionItem {
  id: string;
  type: string; // 'task', 'notebook', etc.
  data: any;
  selected: boolean;
  selectable: boolean;
  metadata?: {
    title: string;
    subtitle?: string;
    icon?: string;
    lastModified?: Date;
  };
}

/**
 * Bulk action definition
 */
export interface BulkAction {
  id: string;
  type: BulkActionType;
  label: string;
  icon: string;
  description: string;
  
  // Execution
  handler: (selectedItems: SelectionItem[]) => Promise<BulkActionResult>;
  
  // Conditions
  isEnabled: (selectedItems: SelectionItem[]) => boolean;
  isVisible: (selectedItems: SelectionItem[]) => boolean;
  requiresConfirmation: boolean;
  
  // UI
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  shortcut?: string[];
  groupId?: string;
  priority?: number;
  
  // Constraints
  minItems?: number;
  maxItems?: number;
  allowedTypes?: string[];
  forbiddenTypes?: string[];
}

/**
 * Result of a bulk action execution
 */
export interface BulkActionResult {
  success: boolean;
  processedItems: number;
  failedItems: number;
  results: {
    itemId: string;
    success: boolean;
    error?: string;
  }[];
  message: string;
  undoable?: boolean;
  undoHandler?: () => Promise<void>;
}

/**
 * Selection state management
 */
export interface SelectionState {
  items: Map<string, SelectionItem>;
  selectedIds: Set<string>;
  selectionMode: SelectionMode;
  lastSelectedId: string | null;
  rangeStartId: string | null;
  totalCount: number;
  selectedCount: number;
  selectableCount: number;
}

/**
 * Selection actions
 */
export interface SelectionActions {
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  toggleItem: (id: string) => void;
  selectRange: (startId: string, endId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  invertSelection: () => void;
  selectByType: (type: string) => void;
  selectByPredicate: (predicate: (item: SelectionItem) => boolean) => void;
}

/**
 * Bulk operations configuration
 */
export interface BulkOperationsConfig {
  enabled: boolean;
  maxSelection: number;
  
  // Selection behavior
  selection: {
    mode: SelectionMode;
    allowCrossPaging: boolean;
    preserveOnNavigation: boolean;
    showSelectionCount: boolean;
    enableKeyboardNavigation: boolean;
  };
  
  // UI preferences
  ui: {
    showToolbarWhenEmpty: boolean;
    stickyToolbar: boolean;
    compactMode: boolean;
    animationDuration: number;
    confirmDestructive: boolean;
  };
  
  // Keyboard shortcuts
  shortcuts: {
    enabled: boolean;
    keys: {
      selectAll: string[];
      deselectAll: string[];
      invertSelection: string[];
      delete: string[];
      escape: string[];
    };
  };
  
  // Performance
  performance: {
    virtualSelection: boolean;
    batchUpdates: boolean;
    debounceMs: number;
  };
}

/**
 * Bulk action group definition
 */
export interface BulkActionGroup {
  id: string;
  label: string;
  icon?: string;
  color?: string;
  actions: BulkAction[];
  collapsible?: boolean;
  collapsed?: boolean;
  priority?: number;
}

/**
 * Selection context state
 */
export interface BulkOperationsContextState extends SelectionState {
  config: BulkOperationsConfig;
  actions: Map<string, BulkAction>;
  groups: Map<string, BulkActionGroup>;
  
  // State
  isProcessing: boolean;
  lastAction: BulkAction | null;
  lastResult: BulkActionResult | null;
  
  // Actions
  registerItem: (item: SelectionItem) => void;
  unregisterItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<SelectionItem>) => void;
  
  // Selection methods
  setSelectionMode: (mode: SelectionMode) => void;
  
  // Bulk action management
  registerAction: (action: BulkAction) => void;
  unregisterAction: (id: string) => void;
  registerGroup: (group: BulkActionGroup) => void;
  
  // Execution
  executeAction: (actionId: string) => Promise<BulkActionResult>;
  canExecuteAction: (actionId: string) => boolean;
  
  // Utilities
  getSelectedItems: () => SelectionItem[];
  getAvailableActions: () => BulkAction[];
  getActionsByGroup: () => Map<string, BulkAction[]>;
}

/**
 * Hook return types
 */
export interface UseBulkOperationsReturn {
  // State
  selectedItems: SelectionItem[];
  selectedCount: number;
  totalCount: number;
  isProcessing: boolean;
  
  // Selection methods
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  toggleItem: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  invertSelection: () => void;
  
  // Actions
  availableActions: BulkAction[];
  executeAction: (actionId: string) => Promise<BulkActionResult>;
  canExecuteAction: (actionId: string) => boolean;
  
  // UI helpers
  getSelectionProps: (itemId: string) => any;
  isSelected: (itemId: string) => boolean;
  isSelectable: (itemId: string) => boolean;
}

export interface UseSelectionReturn {
  // Selection state
  selectedIds: Set<string>;
  selectedCount: number;
  totalCount: number;
  selectionMode: SelectionMode;
  
  // Selection actions
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  toggleItem: (id: string) => void;
  selectRange: (startId: string, endId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  invertSelection: () => void;
  
  // Utilities
  isSelected: (id: string) => boolean;
  isSelectable: (id: string) => boolean;
  getSelectionProps: (itemId: string) => any;
}

/**
 * Built-in bulk actions for common operations
 */
export interface CommonBulkActions {
  delete: BulkAction;
  archive: BulkAction;
  restore: BulkAction;
  complete: BulkAction;
  incomplete: BulkAction;
  export: BulkAction;
  copy: BulkAction;
  move: BulkAction;
}

/**
 * Predefined action groups
 */
export type ActionGroupId = 'primary' | 'status' | 'organization' | 'data' | 'advanced';

/**
 * Selection event types
 */
export type SelectionEvent = 
  | { type: 'item-selected'; payload: { itemId: string } }
  | { type: 'item-deselected'; payload: { itemId: string } }
  | { type: 'range-selected'; payload: { startId: string; endId: string; items: string[] } }
  | { type: 'all-selected'; payload: { items: string[] } }
  | { type: 'all-deselected'; payload: {} }
  | { type: 'selection-inverted'; payload: { previousSelection: string[]; newSelection: string[] } };

/**
 * Bulk action event types
 */
export type BulkActionEvent =
  | { type: 'action-started'; payload: { actionId: string; itemCount: number } }
  | { type: 'action-completed'; payload: { actionId: string; result: BulkActionResult } }
  | { type: 'action-failed'; payload: { actionId: string; error: string } }
  | { type: 'action-cancelled'; payload: { actionId: string } };

/**
 * Default configuration
 */
export const DEFAULT_BULK_OPERATIONS_CONFIG: BulkOperationsConfig = {
  enabled: true,
  maxSelection: 1000,
  
  selection: {
    mode: 'multiple',
    allowCrossPaging: true,
    preserveOnNavigation: true,
    showSelectionCount: true,
    enableKeyboardNavigation: true
  },
  
  ui: {
    showToolbarWhenEmpty: false,
    stickyToolbar: true,
    compactMode: false,
    animationDuration: 200,
    confirmDestructive: true
  },
  
  shortcuts: {
    enabled: true,
    keys: {
      selectAll: ['ctrl+a', 'cmd+a'],
      deselectAll: ['escape'],
      invertSelection: ['ctrl+shift+a', 'cmd+shift+a'],
      delete: ['delete', 'backspace'],
      escape: ['escape']
    }
  },
  
  performance: {
    virtualSelection: false,
    batchUpdates: true,
    debounceMs: 100
  }
};
