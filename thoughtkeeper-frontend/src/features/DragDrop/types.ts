/**
 * Drag & Drop System Types
 * 
 * Comprehensive type definitions for the drag and drop functionality
 * supporting tasks, notebooks, and custom drag operations with accessibility
 */

export type DragType = 'task' | 'notebook' | 'subtask' | 'custom';

export type DropEffect = 'none' | 'copy' | 'move' | 'link';

export type DropZoneType = 'notebook' | 'task-list' | 'subtask-container' | 'trash' | 'custom';

/**
 * Core drag item interface - represents any draggable item
 */
export interface DragItem {
  id: string;
  type: DragType;
  data: any; // The actual item data (Task, Notebook, etc.)
  preview?: {
    title: string;
    subtitle?: string;
    icon?: string;
    thumbnail?: string;
  };
  constraints?: {
    allowedDropZones?: DropZoneType[];
    forbiddenDropZones?: DropZoneType[];
    requiresConfirmation?: boolean;
  };
}

/**
 * Drop zone configuration
 */
export interface DropZone {
  id: string;
  type: DropZoneType;
  accepts: DragType[];
  data?: any; // Context data for the drop zone (notebook ID, etc.)
  constraints?: {
    maxItems?: number;
    allowDuplicates?: boolean;
    requiresPermission?: boolean;
  };
  visual?: {
    highlightColor?: string;
    borderStyle?: 'solid' | 'dashed' | 'dotted';
    showDropIndicator?: boolean;
    customClassName?: string;
  };
}

/**
 * Drag operation state
 */
export interface DragState {
  isDragging: boolean;
  dragItem: DragItem | null;
  dragStartPosition: { x: number; y: number } | null;
  dragCurrentPosition: { x: number; y: number } | null;
  activeDropZone: string | null;
  draggedOver: string | null;
  dropEffect: DropEffect;
}

/**
 * Drop operation result
 */
export interface DropResult {
  success: boolean;
  sourceId: string;
  targetId: string;
  dropZoneType: DropZoneType;
  effect: DropEffect;
  position?: number; // For ordered lists
  data?: any; // Additional result data
  error?: string;
}

/**
 * Drag & Drop event handlers
 */
export interface DragDropHandlers {
  onDragStart?: (item: DragItem, event: DragEvent | TouchEvent) => void | boolean;
  onDragEnd?: (item: DragItem, result: DropResult | null) => void;
  onDragEnter?: (item: DragItem, dropZone: DropZone) => void | boolean;
  onDragOver?: (item: DragItem, dropZone: DropZone, position?: number) => void | boolean;
  onDragLeave?: (item: DragItem, dropZone: DropZone) => void;
  onDrop?: (item: DragItem, dropZone: DropZone, position?: number) => Promise<DropResult> | DropResult;
  onDropRejected?: (item: DragItem, dropZone: DropZone, reason: string) => void;
}

/**
 * Keyboard drag & drop support
 */
export interface KeyboardDragSupport {
  enabled: boolean;
  keys: {
    grab: string[]; // Default: ['Space', 'Enter']
    move: string[]; // Default: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
    drop: string[]; // Default: ['Space', 'Enter']
    cancel: string[]; // Default: ['Escape']
  };
  announcements: {
    grabbed: (item: DragItem) => string;
    moved: (item: DragItem, direction: string) => string;
    dropped: (item: DragItem, target: string) => string;
    cancelled: (item: DragItem) => string;
  };
}

/**
 * Visual feedback configuration
 */
export interface DragVisualFeedback {
  showDragPreview: boolean;
  showDropZones: boolean;
  showDropIndicators: boolean;
  showGhostItem: boolean;
  animations: {
    duration: number;
    easing: string;
    enabledEffects: ('scale' | 'opacity' | 'blur' | 'rotation')[];
  };
  colors: {
    dropZoneHighlight: string;
    dropZoneActive: string;
    dropZoneInvalid: string;
    dragPreviewBorder: string;
    dropIndicator: string;
  };
}

/**
 * Touch support configuration
 */
export interface TouchDragSupport {
  enabled: boolean;
  longPressDelay: number; // Default: 500ms
  moveThreshold: number; // Default: 10px
  scrollBehavior: 'auto' | 'prevent' | 'allow';
  hapticFeedback: boolean;
  visualFeedback: {
    showTouchPreview: boolean;
    touchPreviewScale: number;
    touchIndicatorSize: number;
  };
}

/**
 * Main drag & drop configuration
 */
export interface DragDropConfig {
  enabled: boolean;
  keyboardSupport: KeyboardDragSupport;
  touchSupport: TouchDragSupport;
  visualFeedback: DragVisualFeedback;
  handlers: DragDropHandlers;
  accessibility: {
    announcements: boolean;
    liveRegion: boolean;
    focusManagement: boolean;
    roleAnnouncements: boolean;
  };
  performance: {
    throttleMs: number; // Default: 16ms (~60fps)
    useIntersectionObserver: boolean;
    virtualScrollingSupport: boolean;
  };
  debug: {
    enabled: boolean;
    logLevel: 'info' | 'warn' | 'error';
    visualDebugger: boolean;
  };
}

/**
 * Drag & Drop context state
 */
export interface DragDropContextState extends DragState {
  config: DragDropConfig;
  dropZones: Map<string, DropZone>;
  dragItems: Map<string, DragItem>;
  
  // Actions
  registerDropZone: (dropZone: DropZone) => void;
  unregisterDropZone: (id: string) => void;
  registerDragItem: (dragItem: DragItem) => void;
  unregisterDragItem: (id: string) => void;
  
  // Drag operations
  startDrag: (item: DragItem, event: DragEvent | TouchEvent | KeyboardEvent) => void;
  updateDrag: (position: { x: number; y: number }) => void;
  endDrag: (result?: DropResult) => void;
  cancelDrag: () => void;
  
  // Keyboard operations
  startKeyboardDrag: (item: DragItem) => void;
  moveKeyboardDrag: (direction: 'up' | 'down' | 'left' | 'right') => void;
  dropKeyboardDrag: () => void;
  cancelKeyboardDrag: () => void;
  
  // Utilities
  canDrop: (item: DragItem, dropZone: DropZone) => boolean;
  getDropZoneAt: (position: { x: number; y: number }) => DropZone | null;
  announceToScreenReader: (message: string) => void;
}

/**
 * Hook return types
 */
export interface UseDragDropReturn {
  // State
  isDragging: boolean;
  dragItem: DragItem | null;
  activeDropZone: string | null;
  
  // Drag item management
  registerDragItem: (element: HTMLElement, item: DragItem) => void;
  unregisterDragItem: (id: string) => void;
  
  // Drop zone management  
  registerDropZone: (element: HTMLElement, dropZone: DropZone) => void;
  unregisterDropZone: (id: string) => void;
  
  // Event handlers
  getDragProps: (item: DragItem) => any;
  getDropProps: (dropZone: DropZone) => any;
  
  // Utilities
  canDrop: (item: DragItem, dropZone: DropZone) => boolean;
  isDropZoneActive: (dropZoneId: string) => boolean;
}

/**
 * Built-in drag item creators for common use cases
 */
export interface TaskDragItem extends Omit<DragItem, 'type'> {
  type: 'task' | 'subtask';
  data: {
    id: string;
    title: string;
    notebookId: string;
    parentId?: string;
    status: string;
    priority: string;
  };
}

export interface NotebookDragItem extends Omit<DragItem, 'type'> {
  type: 'notebook';
  data: {
    id: string;
    title: string;
    taskCount: number;
    status: string;
  };
}

/**
 * Common drop zones
 */
export type NotebookDropZone = DropZone & {
  type: 'notebook';
  data: {
    notebookId: string;
    allowSubtasks: boolean;
    position?: number;
  };
};

export type TaskListDropZone = DropZone & {
  type: 'task-list';
  data: {
    notebookId?: string;
    parentTaskId?: string;
    insertPosition?: number;
  };
};

/**
 * Predefined configurations
 */
export const DEFAULT_DRAG_DROP_CONFIG: DragDropConfig = {
  enabled: true,
  keyboardSupport: {
    enabled: true,
    keys: {
      grab: ['Space', 'Enter'],
      move: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'],
      drop: ['Space', 'Enter'],
      cancel: ['Escape']
    },
    announcements: {
      grabbed: (item) => `Grabbed ${item.preview?.title || item.id}. Use arrow keys to move, space to drop.`,
      moved: (item, direction) => `Moved ${item.preview?.title || item.id} ${direction}.`,
      dropped: (item, target) => `Dropped ${item.preview?.title || item.id} into ${target}.`,
      cancelled: (item) => `Cancelled dragging ${item.preview?.title || item.id}.`
    }
  },
  touchSupport: {
    enabled: true,
    longPressDelay: 500,
    moveThreshold: 10,
    scrollBehavior: 'auto',
    hapticFeedback: true,
    visualFeedback: {
      showTouchPreview: true,
      touchPreviewScale: 1.1,
      touchIndicatorSize: 44
    }
  },
  visualFeedback: {
    showDragPreview: true,
    showDropZones: true,
    showDropIndicators: true,
    showGhostItem: true,
    animations: {
      duration: 200,
      easing: 'ease-out',
      enabledEffects: ['scale', 'opacity']
    },
    colors: {
      dropZoneHighlight: 'rgba(59, 130, 246, 0.1)',
      dropZoneActive: 'rgba(59, 130, 246, 0.2)',
      dropZoneInvalid: 'rgba(239, 68, 68, 0.1)',
      dragPreviewBorder: '#3b82f6',
      dropIndicator: '#3b82f6'
    }
  },
  handlers: {},
  accessibility: {
    announcements: true,
    liveRegion: true,
    focusManagement: true,
    roleAnnouncements: true
  },
  performance: {
    throttleMs: 16,
    useIntersectionObserver: true,
    virtualScrollingSupport: false
  },
  debug: {
    enabled: process.env.NODE_ENV === 'development',
    logLevel: 'warn',
    visualDebugger: false
  }
};
