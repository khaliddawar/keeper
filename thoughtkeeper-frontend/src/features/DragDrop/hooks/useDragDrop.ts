import { useCallback, useRef, useEffect } from 'react';
import { useDragDropContext } from '../DragDropProvider';
import type { DragItem, DropZone, UseDragDropReturn } from '../types';

/**
 * useDragDrop Hook - Main interface for drag and drop functionality
 * 
 * Provides easy-to-use functions for making elements draggable and droppable
 * with full accessibility, touch, and keyboard support.
 * 
 * Features:
 * - Simple drag and drop registration
 * - Automatic event handling
 * - Accessibility attributes
 * - Touch and keyboard support
 * - Visual feedback coordination
 * - Performance optimization
 */

export const useDragDrop = (): UseDragDropReturn => {
  const context = useDragDropContext();
  const dragElementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const dropElementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPositionRef = useRef<{ x: number; y: number } | null>(null);
  
  // Register a draggable element
  const registerDragItem = useCallback((element: HTMLElement, item: DragItem) => {
    if (!context.config.enabled) return;
    
    // Store element reference
    dragElementsRef.current.set(item.id, element);
    
    // Register the item with the context
    context.registerDragItem(item);
    
    // Set up accessibility attributes
    element.setAttribute('draggable', 'true');
    element.setAttribute('role', 'button');
    element.setAttribute('aria-grabbed', 'false');
    element.setAttribute('tabindex', '0');
    
    if (item.preview?.title) {
      element.setAttribute('aria-label', `Draggable item: ${item.preview.title}`);
    }
    
    // Mouse event handlers
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return; // Only left mouse button
      
      // Prevent default drag behavior for better control
      event.preventDefault();
      
      // Store the mouse position for drag threshold
      touchStartPositionRef.current = { x: event.clientX, y: event.clientY };
      
      // Add temporary mouse move listener to detect drag start
      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!touchStartPositionRef.current) return;
        
        const deltaX = Math.abs(moveEvent.clientX - touchStartPositionRef.current.x);
        const deltaY = Math.abs(moveEvent.clientY - touchStartPositionRef.current.y);
        const threshold = context.config.touchSupport.moveThreshold;
        
        if (deltaX > threshold || deltaY > threshold) {
          context.startDrag(item, event);
          element.setAttribute('aria-grabbed', 'true');
          
          // Remove temporary listeners
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        }
      };
      
      const handleMouseUp = () => {
        touchStartPositionRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
    
    // Touch event handlers
    const handleTouchStart = (event: TouchEvent) => {
      if (!context.config.touchSupport.enabled) return;
      if (event.touches.length !== 1) return; // Only single touch
      
      const touch = event.touches[0];
      touchStartPositionRef.current = { x: touch.clientX, y: touch.clientY };
      
      // Long press detection
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
      
      touchTimeoutRef.current = setTimeout(() => {
        if (touchStartPositionRef.current) {
          context.startDrag(item, event);
          element.setAttribute('aria-grabbed', 'true');
          
          // Haptic feedback if supported
          if (context.config.touchSupport.hapticFeedback && 'vibrate' in navigator) {
            navigator.vibrate(50);
          }
        }
      }, context.config.touchSupport.longPressDelay);
    };
    
    const handleTouchMove = (event: TouchEvent) => {
      if (!touchStartPositionRef.current || event.touches.length !== 1) return;
      
      const touch = event.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartPositionRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartPositionRef.current.y);
      const threshold = context.config.touchSupport.moveThreshold;
      
      // Cancel long press if moved too much before timeout
      if ((deltaX > threshold || deltaY > threshold) && touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
        touchTimeoutRef.current = null;
      }
    };
    
    const handleTouchEnd = () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
        touchTimeoutRef.current = null;
      }
      touchStartPositionRef.current = null;
    };
    
    // Keyboard event handlers
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!context.config.keyboardSupport.enabled) return;
      
      if (context.config.keyboardSupport.keys.grab.includes(event.key)) {
        event.preventDefault();
        context.startKeyboardDrag(item);
        element.setAttribute('aria-grabbed', 'true');
      }
    };
    
    // HTML5 drag events (fallback)
    const handleDragStart = (event: DragEvent) => {
      if (context.isDragging) return; // Already handled by our system
      
      context.startDrag(item, event);
      element.setAttribute('aria-grabbed', 'true');
      
      // Set up data transfer
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', item.id);
        
        // Custom drag image if available
        if (item.preview?.thumbnail) {
          const img = new Image();
          img.src = item.preview.thumbnail;
          event.dataTransfer.setDragImage(img, 20, 20);
        }
      }
    };
    
    const handleDragEnd = () => {
      element.setAttribute('aria-grabbed', 'false');
    };
    
    // Add event listeners
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('keydown', handleKeyDown);
    element.addEventListener('dragstart', handleDragStart);
    element.addEventListener('dragend', handleDragEnd);
    
    // Cleanup function
    const cleanup = () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('keydown', handleKeyDown);
      element.removeEventListener('dragstart', handleDragStart);
      element.removeEventListener('dragend', handleDragEnd);
      
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
    
    // Store cleanup function on element for later use
    (element as any).__dragDropCleanup = cleanup;
    
  }, [context]);
  
  // Register a drop zone
  const registerDropZone = useCallback((element: HTMLElement, dropZone: DropZone) => {
    if (!context.config.enabled) return;
    
    // Store element reference
    dropElementsRef.current.set(dropZone.id, element);
    
    // Register the drop zone with the context
    context.registerDropZone(dropZone);
    
    // Set up drop zone attributes
    element.setAttribute('data-drop-zone-id', dropZone.id);
    element.setAttribute('role', 'region');
    element.setAttribute('aria-label', `Drop zone: ${dropZone.type}`);
    
    // HTML5 drag events
    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
      }
    };
    
    const handleDragEnter = (event: DragEvent) => {
      event.preventDefault();
      element.classList.add('drag-over');
    };
    
    const handleDragLeave = (event: DragEvent) => {
      // Only remove highlight if we're actually leaving the element
      if (!element.contains(event.relatedTarget as Node)) {
        element.classList.remove('drag-over');
      }
    };
    
    const handleDrop = async (event: DragEvent) => {
      event.preventDefault();
      element.classList.remove('drag-over');
      
      if (!context.dragItem) return;
      
      try {
        const result = await context.config.handlers.onDrop?.(context.dragItem, dropZone);
        if (result) {
          context.endDrag(result);
        }
      } catch (error) {
        context.config.handlers.onDropRejected?.(
          context.dragItem, 
          dropZone, 
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    };
    
    // Add event listeners
    element.addEventListener('dragover', handleDragOver);
    element.addEventListener('dragenter', handleDragEnter);
    element.addEventListener('dragleave', handleDragLeave);
    element.addEventListener('drop', handleDrop);
    
    // Cleanup function
    const cleanup = () => {
      element.removeEventListener('dragover', handleDragOver);
      element.removeEventListener('dragenter', handleDragEnter);
      element.removeEventListener('dragleave', handleDragLeave);
      element.removeEventListener('drop', handleDrop);
      element.classList.remove('drag-over');
    };
    
    // Store cleanup function on element
    (element as any).__dragDropCleanup = cleanup;
    
  }, [context]);
  
  // Unregister drag item
  const unregisterDragItem = useCallback((id: string) => {
    const element = dragElementsRef.current.get(id);
    if (element) {
      // Call cleanup function if it exists
      const cleanup = (element as any).__dragDropCleanup;
      if (cleanup) {
        cleanup();
      }
      
      // Remove accessibility attributes
      element.removeAttribute('draggable');
      element.removeAttribute('aria-grabbed');
      element.removeAttribute('role');
      element.removeAttribute('aria-label');
      element.removeAttribute('tabindex');
      
      dragElementsRef.current.delete(id);
    }
    
    context.unregisterDragItem(id);
  }, [context]);
  
  // Unregister drop zone
  const unregisterDropZone = useCallback((id: string) => {
    const element = dropElementsRef.current.get(id);
    if (element) {
      // Call cleanup function if it exists
      const cleanup = (element as any).__dragDropCleanup;
      if (cleanup) {
        cleanup();
      }
      
      // Remove drop zone attributes
      element.removeAttribute('data-drop-zone-id');
      element.removeAttribute('role');
      element.removeAttribute('aria-label');
      
      dropElementsRef.current.delete(id);
    }
    
    context.unregisterDropZone(id);
  }, [context]);
  
  // Get drag props for easier integration
  const getDragProps = useCallback((item: DragItem) => {
    return {
      'data-drag-item-id': item.id,
      'data-drag-type': item.type,
      'draggable': true,
      'role': 'button',
      'aria-grabbed': context.isDragging && context.dragItem?.id === item.id ? 'true' : 'false',
      'tabIndex': 0,
      'aria-label': item.preview?.title ? `Draggable item: ${item.preview.title}` : `Draggable ${item.type}`,
      onMouseDown: (event: React.MouseEvent<HTMLElement>) => {
        const element = event.currentTarget;
        registerDragItem(element, item);
      },
      onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
        if (context.config.keyboardSupport.enabled && 
            context.config.keyboardSupport.keys.grab.includes(event.key)) {
          event.preventDefault();
          context.startKeyboardDrag(item);
        }
      }
    };
  }, [context, registerDragItem]);
  
  // Get drop props for easier integration
  const getDropProps = useCallback((dropZone: DropZone) => {
    return {
      'data-drop-zone-id': dropZone.id,
      'data-drop-zone-type': dropZone.type,
      'role': 'region',
      'aria-label': `Drop zone: ${dropZone.type}`,
      onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
        const element = event.currentTarget;
        registerDropZone(element, dropZone);
      }
    };
  }, [registerDropZone]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup all registered items
      Array.from(dragElementsRef.current.keys()).forEach(unregisterDragItem);
      Array.from(dropElementsRef.current.keys()).forEach(unregisterDropZone);
    };
  }, [unregisterDragItem, unregisterDropZone]);
  
  return {
    // State
    isDragging: context.isDragging,
    dragItem: context.dragItem,
    activeDropZone: context.activeDropZone,
    
    // Registration methods
    registerDragItem,
    unregisterDragItem,
    registerDropZone,
    unregisterDropZone,
    
    // Prop getters
    getDragProps,
    getDropProps,
    
    // Utilities
    canDrop: context.canDrop,
    isDropZoneActive: (dropZoneId: string) => context.activeDropZone === dropZoneId
  };
};
