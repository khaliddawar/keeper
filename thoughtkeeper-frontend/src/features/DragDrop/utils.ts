import type { DragItem, DropZone, TaskDragItem, NotebookDragItem, NotebookDropZone, TaskListDropZone } from './types';
import type { Task } from '../../types/task';
import type { Notebook } from '../../types/notebook';

/**
 * Utility functions for drag and drop operations
 */

/**
 * Calculate the insertion position in an ordered list based on mouse/touch position
 */
export const calculateInsertionPosition = (
  dragY: number,
  itemElements: HTMLElement[]
): number => {
  if (itemElements.length === 0) {
    return 0;
  }
  
  for (let i = 0; i < itemElements.length; i++) {
    const element = itemElements[i];
    const rect = element.getBoundingClientRect();
    const elementCenter = rect.top + rect.height / 2;
    
    if (dragY < elementCenter) {
      return i;
    }
  }
  
  return itemElements.length;
};

/**
 * Check if a drag item can be dropped into a specific drop zone
 */
export const canDropItem = (dragItem: DragItem, dropZone: DropZone): boolean => {
  // Check basic type compatibility
  if (!dropZone.accepts.includes(dragItem.type)) {
    return false;
  }
  
  // Check item constraints
  if (dragItem.constraints) {
    if (dragItem.constraints.allowedDropZones && 
        !dragItem.constraints.allowedDropZones.includes(dropZone.type)) {
      return false;
    }
    
    if (dragItem.constraints.forbiddenDropZones && 
        dragItem.constraints.forbiddenDropZones.includes(dropZone.type)) {
      return false;
    }
  }
  
  // Check drop zone constraints
  if (dropZone.constraints) {
    // Add specific constraint checks here based on your needs
    // For example: maxItems, allowDuplicates, etc.
  }
  
  return true;
};

/**
 * Generate a unique drag operation ID
 */
export const generateDragId = (): string => {
  return `drag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get the drop effect based on modifier keys
 */
export const getDropEffectFromEvent = (event: DragEvent | KeyboardEvent): 'move' | 'copy' | 'link' => {
  if ('ctrlKey' in event && event.ctrlKey) {
    return 'copy';
  }
  
  if ('altKey' in event && event.altKey) {
    return 'link';
  }
  
  return 'move';
};

/**
 * Calculate the distance between two points
 */
export const calculateDistance = (
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): number => {
  const deltaX = point2.x - point1.x;
  const deltaY = point2.y - point1.y;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};

/**
 * Check if the drag distance exceeds the threshold
 */
export const exceedsDragThreshold = (
  startPosition: { x: number; y: number },
  currentPosition: { x: number; y: number },
  threshold: number = 10
): boolean => {
  return calculateDistance(startPosition, currentPosition) > threshold;
};

/**
 * Get the element under a specific point, excluding the dragged element
 */
export const getElementUnderPoint = (
  x: number, 
  y: number, 
  excludeElement?: HTMLElement
): Element | null => {
  // Temporarily hide the excluded element
  let originalDisplay: string | null = null;
  if (excludeElement) {
    originalDisplay = excludeElement.style.display;
    excludeElement.style.display = 'none';
  }
  
  const element = document.elementFromPoint(x, y);
  
  // Restore the excluded element
  if (excludeElement && originalDisplay !== null) {
    excludeElement.style.display = originalDisplay;
  }
  
  return element;
};

/**
 * Find the closest drop zone element from a given element
 */
export const findClosestDropZone = (element: Element | null): HTMLElement | null => {
  if (!element) return null;
  
  let current = element as HTMLElement;
  
  while (current && current !== document.body) {
    if (current.hasAttribute('data-drop-zone-id')) {
      return current;
    }
    
    current = current.parentElement!;
  }
  
  return null;
};

/**
 * Throttle function for performance optimization
 */
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): T => {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        func(...args);
      }, delay - (now - lastCall));
    }
  }) as T;
};

/**
 * Debounce function for delayed execution
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  }) as T;
};

/**
 * Create a deep clone of an object (for drag item data)
 */
export const cloneDragData = <T>(data: T): T => {
  if (data === null || typeof data !== 'object') {
    return data;
  }
  
  if (data instanceof Date) {
    return new Date(data.getTime()) as unknown as T;
  }
  
  if (Array.isArray(data)) {
    return data.map(cloneDragData) as unknown as T;
  }
  
  const cloned: any = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      cloned[key] = cloneDragData(data[key]);
    }
  }
  
  return cloned;
};

/**
 * Validate drag item structure
 */
export const validateDragItem = (item: any): item is DragItem => {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.id === 'string' &&
    typeof item.type === 'string' &&
    item.data !== undefined
  );
};

/**
 * Validate drop zone structure
 */
export const validateDropZone = (zone: any): zone is DropZone => {
  return (
    typeof zone === 'object' &&
    zone !== null &&
    typeof zone.id === 'string' &&
    typeof zone.type === 'string' &&
    Array.isArray(zone.accepts)
  );
};

/**
 * Get screen reader announcement for drag operation
 */
export const getDragAnnouncement = (
  operation: 'start' | 'move' | 'drop' | 'cancel',
  itemTitle: string,
  targetTitle?: string
): string => {
  switch (operation) {
    case 'start':
      return `Started dragging ${itemTitle}. Use arrow keys to move, space to drop, escape to cancel.`;
    case 'move':
      return `Moved ${itemTitle}`;
    case 'drop':
      return `Dropped ${itemTitle}${targetTitle ? ` into ${targetTitle}` : ''}`;
    case 'cancel':
      return `Cancelled dragging ${itemTitle}`;
    default:
      return '';
  }
};

/**
 * Check if the current device supports touch
 */
export const isTouchDevice = (): boolean => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - older IE support
    navigator.msMaxTouchPoints > 0
  );
};

/**
 * Check if the current device prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get the bounding rect of an element with fallback
 */
export const getSafeElementRect = (element: HTMLElement | null): DOMRect => {
  if (!element) {
    return new DOMRect(0, 0, 0, 0);
  }
  
  try {
    return element.getBoundingClientRect();
  } catch (error) {
    console.warn('Failed to get element bounds:', error);
    return new DOMRect(0, 0, 0, 0);
  }
};

/**
 * Performance timing utilities
 */
export const performanceTimer = {
  start: (label: string) => {
    if (process.env.NODE_ENV === 'development') {
      performance.mark(`${label}-start`);
    }
  },
  
  end: (label: string) => {
    if (process.env.NODE_ENV === 'development') {
      try {
        performance.mark(`${label}-end`);
        performance.measure(label, `${label}-start`, `${label}-end`);
        const measure = performance.getEntriesByName(label)[0];
        console.log(`[DragDrop] ${label}: ${measure.duration.toFixed(2)}ms`);
      } catch (error) {
        console.warn(`Failed to measure performance for ${label}:`, error);
      }
    }
  }
};
