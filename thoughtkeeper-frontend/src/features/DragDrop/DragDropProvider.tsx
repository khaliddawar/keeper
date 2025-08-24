import React, { createContext, useContext, useReducer, useRef, useCallback, useEffect } from 'react';
import type {
  DragDropContextState,
  DragDropConfig,
  DragState,
  DragItem,
  DropZone,
  DropResult,
  DEFAULT_DRAG_DROP_CONFIG
} from './types';

/**
 * Drag & Drop Provider - Central state management for drag and drop operations
 * 
 * Features:
 * - Global drag state management
 * - Drop zone registration and management
 * - Event delegation for performance
 * - Accessibility support with ARIA announcements
 * - Touch and keyboard support
 * - Visual feedback coordination
 */

// Action types for the reducer
type DragDropAction =
  | { type: 'START_DRAG'; payload: { item: DragItem; position: { x: number; y: number } } }
  | { type: 'UPDATE_DRAG'; payload: { position: { x: number; y: number } } }
  | { type: 'END_DRAG'; payload: { result?: DropResult } }
  | { type: 'CANCEL_DRAG' }
  | { type: 'SET_ACTIVE_DROP_ZONE'; payload: { dropZoneId: string | null } }
  | { type: 'SET_DRAGGED_OVER'; payload: { dropZoneId: string | null } }
  | { type: 'REGISTER_DROP_ZONE'; payload: { dropZone: DropZone } }
  | { type: 'UNREGISTER_DROP_ZONE'; payload: { id: string } }
  | { type: 'REGISTER_DRAG_ITEM'; payload: { dragItem: DragItem } }
  | { type: 'UNREGISTER_DRAG_ITEM'; payload: { id: string } };

// Initial drag state
const initialDragState: DragState = {
  isDragging: false,
  dragItem: null,
  dragStartPosition: null,
  dragCurrentPosition: null,
  activeDropZone: null,
  draggedOver: null,
  dropEffect: 'none'
};

// Drag & Drop reducer
const dragDropReducer = (state: DragState, action: DragDropAction): DragState => {
  switch (action.type) {
    case 'START_DRAG':
      return {
        ...state,
        isDragging: true,
        dragItem: action.payload.item,
        dragStartPosition: action.payload.position,
        dragCurrentPosition: action.payload.position,
        dropEffect: 'move'
      };
      
    case 'UPDATE_DRAG':
      return {
        ...state,
        dragCurrentPosition: action.payload.position
      };
      
    case 'END_DRAG':
      return {
        ...initialDragState
      };
      
    case 'CANCEL_DRAG':
      return {
        ...initialDragState
      };
      
    case 'SET_ACTIVE_DROP_ZONE':
      return {
        ...state,
        activeDropZone: action.payload.dropZoneId
      };
      
    case 'SET_DRAGGED_OVER':
      return {
        ...state,
        draggedOver: action.payload.dropZoneId
      };
      
    default:
      return state;
  }
};

// Context creation
const DragDropContext = createContext<DragDropContextState | null>(null);

// Provider props interface
interface DragDropProviderProps {
  children: React.ReactNode;
  config?: Partial<DragDropConfig>;
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({
  children,
  config: userConfig = {}
}) => {
  // Merge user config with defaults
  const config: DragDropConfig = {
    ...DEFAULT_DRAG_DROP_CONFIG,
    ...userConfig,
    keyboardSupport: {
      ...DEFAULT_DRAG_DROP_CONFIG.keyboardSupport,
      ...userConfig.keyboardSupport
    },
    touchSupport: {
      ...DEFAULT_DRAG_DROP_CONFIG.touchSupport,
      ...userConfig.touchSupport
    },
    visualFeedback: {
      ...DEFAULT_DRAG_DROP_CONFIG.visualFeedback,
      ...userConfig.visualFeedback
    },
    accessibility: {
      ...DEFAULT_DRAG_DROP_CONFIG.accessibility,
      ...userConfig.accessibility
    },
    performance: {
      ...DEFAULT_DRAG_DROP_CONFIG.performance,
      ...userConfig.performance
    }
  };
  
  // State management
  const [dragState, dispatch] = useReducer(dragDropReducer, initialDragState);
  const dropZonesRef = useRef<Map<string, DropZone>>(new Map());
  const dragItemsRef = useRef<Map<string, DragItem>>(new Map());
  const elementsRef = useRef<Map<string, HTMLElement>>(new Map());
  
  // ARIA live region for announcements
  const liveRegionRef = useRef<HTMLDivElement | null>(null);
  
  // Performance throttling
  const lastUpdateTime = useRef<number>(0);
  
  // Debug logging
  const debugLog = useCallback((level: 'info' | 'warn' | 'error', message: string, data?: any) => {
    if (config.debug.enabled) {
      const logFn = level === 'info' ? console.log : level === 'warn' ? console.warn : console.error;
      logFn(`[DragDrop] ${message}`, data);
    }
  }, [config.debug.enabled]);
  
  // Screen reader announcements
  const announceToScreenReader = useCallback((message: string) => {
    if (!config.accessibility.announcements || !liveRegionRef.current) return;
    
    liveRegionRef.current.textContent = message;
    
    // Clear the message after a delay to allow re-announcing
    setTimeout(() => {
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = '';
      }
    }, 1000);
    
    debugLog('info', 'Screen reader announcement:', message);
  }, [config.accessibility.announcements, debugLog]);
  
  // Drop zone management
  const registerDropZone = useCallback((dropZone: DropZone) => {
    dropZonesRef.current.set(dropZone.id, dropZone);
    dispatch({ type: 'REGISTER_DROP_ZONE', payload: { dropZone } });
    debugLog('info', 'Drop zone registered:', dropZone);
  }, [debugLog]);
  
  const unregisterDropZone = useCallback((id: string) => {
    dropZonesRef.current.delete(id);
    elementsRef.current.delete(id);
    dispatch({ type: 'UNREGISTER_DROP_ZONE', payload: { id } });
    debugLog('info', 'Drop zone unregistered:', id);
  }, [debugLog]);
  
  // Drag item management
  const registerDragItem = useCallback((dragItem: DragItem) => {
    dragItemsRef.current.set(dragItem.id, dragItem);
    dispatch({ type: 'REGISTER_DRAG_ITEM', payload: { dragItem } });
    debugLog('info', 'Drag item registered:', dragItem);
  }, [debugLog]);
  
  const unregisterDragItem = useCallback((id: string) => {
    dragItemsRef.current.delete(id);
    elementsRef.current.delete(id);
    dispatch({ type: 'UNREGISTER_DRAG_ITEM', payload: { id } });
    debugLog('info', 'Drag item unregistered:', id);
  }, [debugLog]);
  
  // Utility functions
  const canDrop = useCallback((item: DragItem, dropZone: DropZone): boolean => {
    // Check if drop zone accepts this item type
    if (!dropZone.accepts.includes(item.type)) {
      return false;
    }
    
    // Check item constraints
    if (item.constraints?.allowedDropZones && 
        !item.constraints.allowedDropZones.includes(dropZone.type)) {
      return false;
    }
    
    if (item.constraints?.forbiddenDropZones && 
        item.constraints.forbiddenDropZones.includes(dropZone.type)) {
      return false;
    }
    
    // Check drop zone constraints
    if (dropZone.constraints?.maxItems) {
      // This would require additional context about current items in the drop zone
      // Implementation would depend on the specific use case
    }
    
    return true;
  }, []);
  
  const getDropZoneAt = useCallback((position: { x: number; y: number }): DropZone | null => {
    const element = document.elementFromPoint(position.x, position.y);
    if (!element) return null;
    
    // Find the closest drop zone element
    const dropZoneElement = element.closest('[data-drop-zone-id]');
    if (!dropZoneElement) return null;
    
    const dropZoneId = dropZoneElement.getAttribute('data-drop-zone-id');
    if (!dropZoneId) return null;
    
    return dropZonesRef.current.get(dropZoneId) || null;
  }, []);
  
  // Drag operations
  const startDrag = useCallback((item: DragItem, event: DragEvent | TouchEvent | KeyboardEvent) => {
    if (!config.enabled) return;
    
    let position = { x: 0, y: 0 };
    
    if ('clientX' in event && 'clientY' in event) {
      position = { x: event.clientX, y: event.clientY };
    } else if ('touches' in event && event.touches.length > 0) {
      position = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
    
    dispatch({ 
      type: 'START_DRAG', 
      payload: { item, position } 
    });
    
    // Execute custom handler
    const shouldContinue = config.handlers.onDragStart?.(item, event);
    if (shouldContinue === false) {
      dispatch({ type: 'CANCEL_DRAG' });
      return;
    }
    
    // Announce to screen reader
    if (config.keyboardSupport.enabled && 'key' in event) {
      const message = config.keyboardSupport.announcements.grabbed(item);
      announceToScreenReader(message);
    }
    
    debugLog('info', 'Drag started:', { item, position });
  }, [config, announceToScreenReader, debugLog]);
  
  const updateDrag = useCallback((position: { x: number; y: number }) => {
    if (!dragState.isDragging) return;
    
    // Throttle updates for performance
    const now = Date.now();
    if (now - lastUpdateTime.current < config.performance.throttleMs) {
      return;
    }
    lastUpdateTime.current = now;
    
    dispatch({ type: 'UPDATE_DRAG', payload: { position } });
    
    // Check for drop zone changes
    const dropZone = getDropZoneAt(position);
    const newDropZoneId = dropZone?.id || null;
    
    if (newDropZoneId !== dragState.draggedOver) {
      // Handle drag enter/leave events
      if (dragState.draggedOver) {
        const oldDropZone = dropZonesRef.current.get(dragState.draggedOver);
        if (oldDropZone && dragState.dragItem) {
          config.handlers.onDragLeave?.(dragState.dragItem, oldDropZone);
        }
      }
      
      if (dropZone && dragState.dragItem) {
        const shouldEnter = config.handlers.onDragEnter?.(dragState.dragItem, dropZone);
        if (shouldEnter !== false) {
          dispatch({ type: 'SET_DRAGGED_OVER', payload: { dropZoneId: newDropZoneId } });
          
          if (canDrop(dragState.dragItem, dropZone)) {
            dispatch({ type: 'SET_ACTIVE_DROP_ZONE', payload: { dropZoneId: newDropZoneId } });
          }
        }
      } else {
        dispatch({ type: 'SET_DRAGGED_OVER', payload: { dropZoneId: null } });
        dispatch({ type: 'SET_ACTIVE_DROP_ZONE', payload: { dropZoneId: null } });
      }
    }
    
    // Handle drag over
    if (dropZone && dragState.dragItem) {
      config.handlers.onDragOver?.(dragState.dragItem, dropZone);
    }
    
    debugLog('info', 'Drag updated:', { position, dropZone: dropZone?.id });
  }, [dragState, config, getDropZoneAt, canDrop, debugLog]);
  
  const endDrag = useCallback(async (result?: DropResult) => {
    if (!dragState.isDragging || !dragState.dragItem) return;
    
    let finalResult = result;
    
    // If no result provided, attempt to create one from current state
    if (!finalResult && dragState.activeDropZone) {
      const dropZone = dropZonesRef.current.get(dragState.activeDropZone);
      if (dropZone) {
        try {
          const dropResult = await config.handlers.onDrop?.(dragState.dragItem, dropZone);
          if (dropResult) {
            finalResult = dropResult;
          }
        } catch (error) {
          finalResult = {
            success: false,
            sourceId: dragState.dragItem.id,
            targetId: dropZone.id,
            dropZoneType: dropZone.type,
            effect: 'none',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    }
    
    dispatch({ type: 'END_DRAG', payload: { result: finalResult } });
    
    // Execute end handler
    config.handlers.onDragEnd?.(dragState.dragItem, finalResult || null);
    
    debugLog('info', 'Drag ended:', { item: dragState.dragItem, result: finalResult });
  }, [dragState, config, debugLog]);
  
  const cancelDrag = useCallback(() => {
    if (!dragState.isDragging || !dragState.dragItem) return;
    
    dispatch({ type: 'CANCEL_DRAG' });
    
    // Announce cancellation
    const message = config.keyboardSupport.announcements.cancelled(dragState.dragItem);
    announceToScreenReader(message);
    
    debugLog('info', 'Drag cancelled:', dragState.dragItem);
  }, [dragState, config, announceToScreenReader, debugLog]);
  
  // Keyboard drag operations
  const startKeyboardDrag = useCallback((item: DragItem) => {
    startDrag(item, new KeyboardEvent('keydown', { key: 'Space' }));
  }, [startDrag]);
  
  const moveKeyboardDrag = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!dragState.isDragging || !dragState.dragItem) return;
    
    // This would implement keyboard navigation logic
    // For now, just announce the movement
    const message = config.keyboardSupport.announcements.moved(dragState.dragItem, direction);
    announceToScreenReader(message);
    
    debugLog('info', 'Keyboard drag moved:', { item: dragState.dragItem, direction });
  }, [dragState, config, announceToScreenReader, debugLog]);
  
  const dropKeyboardDrag = useCallback(() => {
    if (!dragState.isDragging) return;
    endDrag();
  }, [dragState, endDrag]);
  
  const cancelKeyboardDrag = useCallback(() => {
    cancelDrag();
  }, [cancelDrag]);
  
  // Context value
  const contextValue: DragDropContextState = {
    ...dragState,
    config,
    dropZones: dropZonesRef.current,
    dragItems: dragItemsRef.current,
    
    // Actions
    registerDropZone,
    unregisterDropZone,
    registerDragItem,
    unregisterDragItem,
    
    // Drag operations
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
    
    // Keyboard operations
    startKeyboardDrag,
    moveKeyboardDrag,
    dropKeyboardDrag,
    cancelKeyboardDrag,
    
    // Utilities
    canDrop,
    getDropZoneAt,
    announceToScreenReader
  };
  
  // Global event listeners for drag operations
  useEffect(() => {
    if (!config.enabled) return;
    
    const handleMouseMove = (event: MouseEvent) => {
      if (dragState.isDragging) {
        updateDrag({ x: event.clientX, y: event.clientY });
      }
    };
    
    const handleMouseUp = () => {
      if (dragState.isDragging) {
        endDrag();
      }
    };
    
    const handleTouchMove = (event: TouchEvent) => {
      if (dragState.isDragging && event.touches.length > 0) {
        event.preventDefault(); // Prevent scrolling
        updateDrag({ x: event.touches[0].clientX, y: event.touches[0].clientY });
      }
    };
    
    const handleTouchEnd = () => {
      if (dragState.isDragging) {
        endDrag();
      }
    };
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!dragState.isDragging || !config.keyboardSupport.enabled) return;
      
      if (config.keyboardSupport.keys.cancel.includes(event.key)) {
        event.preventDefault();
        cancelKeyboardDrag();
      } else if (config.keyboardSupport.keys.drop.includes(event.key)) {
        event.preventDefault();
        dropKeyboardDrag();
      } else if (config.keyboardSupport.keys.move.includes(event.key)) {
        event.preventDefault();
        const direction = event.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right';
        moveKeyboardDrag(direction);
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [config.enabled, config.keyboardSupport, dragState.isDragging, updateDrag, endDrag, cancelKeyboardDrag, dropKeyboardDrag, moveKeyboardDrag]);
  
  return (
    <DragDropContext.Provider value={contextValue}>
      {children}
      {/* ARIA live region for screen reader announcements */}
      {config.accessibility.liveRegion && (
        <div
          ref={liveRegionRef}
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          data-testid="drag-drop-live-region"
        />
      )}
    </DragDropContext.Provider>
  );
};

// Hook to use drag drop context
export const useDragDropContext = (): DragDropContextState => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDropContext must be used within a DragDropProvider');
  }
  return context;
};
