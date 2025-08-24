import React from 'react';
import { useDragDropContext } from '../DragDropProvider';
import type { DropZone, DragItem } from '../types';

/**
 * DropZoneIndicator Component - Visual feedback for valid drop zones
 * 
 * Features:
 * - Highlights valid drop zones during drag
 * - Shows insertion indicators for ordered lists
 * - Animated feedback and transitions
 * - Accessibility support with ARIA attributes
 * - Customizable appearance and behavior
 */

interface DropZoneIndicatorProps {
  dropZone: DropZone;
  className?: string;
  children?: React.ReactNode;
  showInsertionIndicator?: boolean;
  insertionPosition?: number;
  customIndicator?: React.ComponentType<{ 
    isActive: boolean; 
    canDrop: boolean; 
    isDraggedOver: boolean;
  }>;
}

export const DropZoneIndicator: React.FC<DropZoneIndicatorProps> = ({
  dropZone,
  className = '',
  children,
  showInsertionIndicator = false,
  insertionPosition,
  customIndicator: CustomIndicator
}) => {
  const { 
    isDragging, 
    dragItem, 
    activeDropZone, 
    draggedOver,
    config,
    canDrop 
  } = useDragDropContext();
  
  // Calculate states
  const isActive = activeDropZone === dropZone.id;
  const isDraggedOver = draggedOver === dropZone.id;
  const canDropItem = dragItem ? canDrop(dragItem, dropZone) : false;
  const shouldShow = isDragging && dragItem && config.visualFeedback.showDropZones;
  
  // Don't render if not dragging or drop zones are disabled
  if (!shouldShow) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }
  
  // Custom indicator override
  if (CustomIndicator) {
    return (
      <div className={className}>
        <CustomIndicator 
          isActive={isActive}
          canDrop={canDropItem}
          isDraggedOver={isDraggedOver}
        />
        {children}
      </div>
    );
  }
  
  // Get visual styles based on state
  const getDropZoneStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      transition: config.visualFeedback.animations.duration > 0
        ? `all ${config.visualFeedback.animations.duration}ms ${config.visualFeedback.animations.easing}`
        : 'none',
      borderRadius: '8px',
      position: 'relative'
    };
    
    if (!canDropItem) {
      return {
        ...baseStyles,
        backgroundColor: config.visualFeedback.colors.dropZoneInvalid,
        borderColor: '#ef4444',
        borderWidth: '2px',
        borderStyle: 'dashed',
        opacity: 0.6
      };
    }
    
    if (isActive || isDraggedOver) {
      return {
        ...baseStyles,
        backgroundColor: config.visualFeedback.colors.dropZoneActive,
        borderColor: config.visualFeedback.colors.dropIndicator,
        borderWidth: '2px',
        borderStyle: dropZone.visual?.borderStyle || 'solid',
        boxShadow: `0 0 0 2px ${config.visualFeedback.colors.dropIndicator}20`,
        transform: config.visualFeedback.animations.enabledEffects.includes('scale') 
          ? 'scale(1.02)' 
          : 'none'
      };
    }
    
    return {
      ...baseStyles,
      backgroundColor: config.visualFeedback.colors.dropZoneHighlight,
      borderColor: config.visualFeedback.colors.dropIndicator,
      borderWidth: '1px',
      borderStyle: 'dashed',
      opacity: 0.7
    };
  };
  
  const getAriaLabel = (): string => {
    const baseLabel = `Drop zone for ${dropZone.type}`;
    
    if (!canDropItem) {
      return `${baseLabel} - Cannot drop ${dragItem?.type} here`;
    }
    
    if (isActive) {
      return `${baseLabel} - Active drop target`;
    }
    
    return `${baseLabel} - Valid drop target`;
  };
  
  return (
    <div 
      className={`drop-zone-indicator ${className} ${dropZone.visual?.customClassName || ''}`}
      style={getDropZoneStyles()}
      data-drop-zone-id={dropZone.id}
      data-drop-zone-active={isActive}
      data-can-drop={canDropItem}
      role="region"
      aria-label={getAriaLabel()}
      aria-dropeffect={canDropItem ? 'move' : 'none'}
    >
      {/* Drop zone content */}
      {children}
      
      {/* Insertion indicator for ordered lists */}
      {showInsertionIndicator && insertionPosition !== undefined && (
        <InsertionIndicator 
          position={insertionPosition}
          dropZone={dropZone}
          isActive={isActive}
        />
      )}
      
      {/* Drop zone label/message */}
      {(isActive || isDraggedOver) && (
        <DropZoneMessage 
          dropZone={dropZone}
          dragItem={dragItem}
          canDrop={canDropItem}
        />
      )}
    </div>
  );
};

interface InsertionIndicatorProps {
  position: number;
  dropZone: DropZone;
  isActive: boolean;
}

const InsertionIndicator: React.FC<InsertionIndicatorProps> = ({
  position,
  dropZone,
  isActive
}) => {
  const { config } = useDragDropContext();
  
  if (!config.visualFeedback.showDropIndicators) {
    return null;
  }
  
  const indicatorStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '2px',
    backgroundColor: config.visualFeedback.colors.dropIndicator,
    zIndex: 10,
    borderRadius: '1px',
    opacity: isActive ? 1 : 0.6,
    transition: `opacity ${config.visualFeedback.animations.duration}ms ${config.visualFeedback.animations.easing}`,
    top: position === 0 ? 0 : 'auto',
    bottom: position === 0 ? 'auto' : 0
  };
  
  return (
    <div
      className="insertion-indicator"
      style={indicatorStyle}
      data-testid="insertion-indicator"
      aria-hidden="true"
    >
      {/* Optional insertion arrow */}
      <div
        className="insertion-arrow"
        style={{
          position: 'absolute',
          left: '8px',
          top: '-4px',
          width: 0,
          height: 0,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderTop: `4px solid ${config.visualFeedback.colors.dropIndicator}`
        }}
      />
    </div>
  );
};

interface DropZoneMessageProps {
  dropZone: DropZone;
  dragItem: DragItem | null;
  canDrop: boolean;
}

const DropZoneMessage: React.FC<DropZoneMessageProps> = ({
  dropZone,
  dragItem,
  canDrop
}) => {
  const getMessage = (): string => {
    if (!dragItem) return '';
    
    if (!canDrop) {
      return `Cannot drop ${dragItem.type} here`;
    }
    
    switch (dropZone.type) {
      case 'notebook':
        return `Drop task into ${dropZone.data?.notebookTitle || 'notebook'}`;
      case 'task-list':
        return 'Drop to add to list';
      case 'subtask-container':
        return 'Drop to create subtask';
      case 'trash':
        return 'Drop to delete';
      default:
        return 'Drop here';
    }
  };
  
  const getMessageIcon = (): string => {
    if (!canDrop) return '🚫';
    
    switch (dropZone.type) {
      case 'notebook':
        return '📓';
      case 'task-list':
        return '📝';
      case 'subtask-container':
        return '→';
      case 'trash':
        return '🗑️';
      default:
        return '📋';
    }
  };
  
  return (
    <div 
      className={`
        absolute inset-0 flex items-center justify-center
        pointer-events-none z-20
      `}
      data-testid="drop-zone-message"
    >
      <div className={`
        px-4 py-2 rounded-lg shadow-lg
        ${canDrop 
          ? 'bg-blue-500 text-white' 
          : 'bg-red-500 text-white'
        }
        flex items-center gap-2 text-sm font-medium
        max-w-xs text-center
      `}>
        <span className="text-lg">{getMessageIcon()}</span>
        <span>{getMessage()}</span>
      </div>
    </div>
  );
};

/**
 * Simple drop zone highlight wrapper
 */
interface DropZoneHighlightProps {
  dropZoneId: string;
  className?: string;
  children: React.ReactNode;
}

export const DropZoneHighlight: React.FC<DropZoneHighlightProps> = ({
  dropZoneId,
  className = '',
  children
}) => {
  const { 
    isDragging, 
    activeDropZone, 
    draggedOver,
    config 
  } = useDragDropContext();
  
  const isActive = activeDropZone === dropZoneId;
  const isDraggedOver = draggedOver === dropZoneId;
  const shouldHighlight = isDragging && (isActive || isDraggedOver);
  
  if (!shouldHighlight || !config.visualFeedback.showDropZones) {
    return <div className={className}>{children}</div>;
  }
  
  return (
    <div 
      className={`
        ${className}
        transition-all duration-200 ease-out
        ${isActive 
          ? 'ring-2 ring-blue-500 ring-opacity-60 bg-blue-50 dark:bg-blue-900/20' 
          : 'ring-1 ring-blue-300 ring-opacity-40 bg-blue-25 dark:bg-blue-900/10'
        }
        rounded-lg
      `}
    >
      {children}
    </div>
  );
};

/**
 * Ordered list drop zone with insertion indicators
 */
interface OrderedDropZoneProps {
  dropZone: DropZone;
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
  getInsertionPosition?: (dragY: number, itemElements: HTMLElement[]) => number;
}

export const OrderedDropZone: React.FC<OrderedDropZoneProps> = ({
  dropZone,
  items,
  renderItem,
  className = '',
  getInsertionPosition
}) => {
  const { dragCurrentPosition } = useDragDropContext();
  const itemRefs = React.useRef<(HTMLElement | null)[]>([]);
  
  // Calculate insertion position based on drag position
  const insertionPosition = React.useMemo(() => {
    if (!dragCurrentPosition || !getInsertionPosition) {
      return undefined;
    }
    
    const validElements = itemRefs.current.filter(Boolean) as HTMLElement[];
    return getInsertionPosition(dragCurrentPosition.y, validElements);
  }, [dragCurrentPosition, getInsertionPosition]);
  
  return (
    <DropZoneIndicator
      dropZone={dropZone}
      className={className}
      showInsertionIndicator={true}
      insertionPosition={insertionPosition}
    >
      <div className="space-y-2">
        {items.map((item, index) => (
          <div 
            key={item.id || index}
            ref={(el) => itemRefs.current[index] = el}
          >
            {renderItem(item, index)}
          </div>
        ))}
        
        {/* Empty state drop zone */}
        {items.length === 0 && (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            Drop items here
          </div>
        )}
      </div>
    </DropZoneIndicator>
  );
};

export default DropZoneIndicator;
