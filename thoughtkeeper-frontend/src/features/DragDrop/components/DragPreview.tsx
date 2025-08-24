import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDragDropContext } from '../DragDropProvider';
import type { DragItem } from '../types';

/**
 * DragPreview Component - Visual feedback during drag operations
 * 
 * Features:
 * - Custom drag preview that follows the cursor
 * - Smooth animations and transitions
 * - Configurable appearance and content
 * - Touch and desktop support
 * - Accessibility considerations
 */

interface DragPreviewProps {
  className?: string;
  renderPreview?: (item: DragItem) => React.ReactNode;
  offset?: { x: number; y: number };
}

export const DragPreview: React.FC<DragPreviewProps> = ({
  className = '',
  renderPreview,
  offset = { x: 10, y: 10 }
}) => {
  const { 
    isDragging, 
    dragItem, 
    dragCurrentPosition, 
    config 
  } = useDragDropContext();
  
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);
  
  // Create portal element on mount
  useEffect(() => {
    const element = document.createElement('div');
    element.id = 'drag-preview-portal';
    element.style.position = 'fixed';
    element.style.top = '0';
    element.style.left = '0';
    element.style.pointerEvents = 'none';
    element.style.zIndex = '9999';
    element.setAttribute('aria-hidden', 'true');
    
    document.body.appendChild(element);
    setPortalElement(element);
    
    return () => {
      if (document.body.contains(element)) {
        document.body.removeChild(element);
      }
    };
  }, []);
  
  // Don't render if not dragging or preview is disabled
  if (!isDragging || !dragItem || !dragCurrentPosition || !config.visualFeedback.showDragPreview) {
    return null;
  }
  
  // Don't render if no portal element
  if (!portalElement) {
    return null;
  }
  
  const previewStyle: React.CSSProperties = {
    position: 'absolute',
    left: dragCurrentPosition.x + offset.x,
    top: dragCurrentPosition.y + offset.y,
    pointerEvents: 'none',
    zIndex: 10000,
    transition: config.visualFeedback.animations.duration > 0 
      ? `all ${config.visualFeedback.animations.duration}ms ${config.visualFeedback.animations.easing}`
      : 'none',
    transform: config.visualFeedback.animations.enabledEffects.includes('scale') 
      ? 'scale(1.05)' 
      : 'none',
    opacity: config.visualFeedback.animations.enabledEffects.includes('opacity') 
      ? 0.9 
      : 1,
    filter: config.visualFeedback.animations.enabledEffects.includes('blur')
      ? 'blur(0.5px)'
      : 'none',
    rotate: config.visualFeedback.animations.enabledEffects.includes('rotation')
      ? '2deg'
      : '0deg'
  };
  
  // Render custom preview if provided
  if (renderPreview) {
    return createPortal(
      <div 
        className={`drag-preview ${className}`}
        style={previewStyle}
        data-testid="drag-preview"
      >
        {renderPreview(dragItem)}
      </div>,
      portalElement
    );
  }
  
  // Default preview rendering
  return createPortal(
    <DefaultDragPreview
      item={dragItem}
      style={previewStyle}
      className={className}
      config={config}
    />,
    portalElement
  );
};

interface DefaultDragPreviewProps {
  item: DragItem;
  style: React.CSSProperties;
  className: string;
  config: any;
}

const DefaultDragPreview: React.FC<DefaultDragPreviewProps> = ({
  item,
  style,
  className,
  config
}) => {
  const getPreviewIcon = () => {
    if (item.preview?.icon) {
      return item.preview.icon;
    }
    
    // Default icons based on type
    switch (item.type) {
      case 'task':
        return '✓';
      case 'subtask':
        return '→';
      case 'notebook':
        return '📓';
      default:
        return '📋';
    }
  };
  
  const getPreviewColor = () => {
    switch (item.type) {
      case 'task':
        return 'bg-blue-500';
      case 'subtask':
        return 'bg-green-500';
      case 'notebook':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <div 
      className={`drag-preview ${className}`}
      style={style}
      data-testid="drag-preview"
    >
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
        bg-white dark:bg-gray-800 border-2 border-dashed
        max-w-xs
      `}
        style={{ borderColor: config.visualFeedback.colors.dragPreviewBorder }}
      >
        {/* Preview thumbnail or icon */}
        {item.preview?.thumbnail ? (
          <img
            src={item.preview.thumbnail}
            alt=""
            className="w-8 h-8 rounded object-cover flex-shrink-0"
          />
        ) : (
          <div className={`
            w-8 h-8 rounded flex items-center justify-center
            text-white text-sm font-semibold flex-shrink-0
            ${getPreviewColor()}
          `}>
            {getPreviewIcon()}
          </div>
        )}
        
        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
            {item.preview?.title || item.id}
          </div>
          {item.preview?.subtitle && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {item.preview.subtitle}
            </div>
          )}
        </div>
        
        {/* Drag indicator */}
        <div className="text-gray-400 flex-shrink-0">
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 12 12" 
            fill="currentColor"
            className="opacity-60"
          >
            <circle cx="2" cy="2" r="1" />
            <circle cx="6" cy="2" r="1" />
            <circle cx="10" cy="2" r="1" />
            <circle cx="2" cy="6" r="1" />
            <circle cx="6" cy="6" r="1" />
            <circle cx="10" cy="6" r="1" />
            <circle cx="2" cy="10" r="1" />
            <circle cx="6" cy="10" r="1" />
            <circle cx="10" cy="10" r="1" />
          </svg>
        </div>
      </div>
    </div>
  );
};

/**
 * Touch-specific drag preview for mobile devices
 */
export const TouchDragPreview: React.FC<DragPreviewProps> = ({
  className = '',
  renderPreview,
  offset = { x: -30, y: -60 } // Different offset for touch to avoid finger occlusion
}) => {
  const { config } = useDragDropContext();
  
  // Enhanced touch preview with larger size and better visibility
  const enhancedRenderPreview = renderPreview || ((item: DragItem) => (
    <div className="transform scale-110">
      <DefaultDragPreview
        item={item}
        style={{}}
        className={className}
        config={config}
      />
    </div>
  ));
  
  return (
    <DragPreview
      className={`touch-drag-preview ${className}`}
      renderPreview={enhancedRenderPreview}
      offset={offset}
    />
  );
};

export default DragPreview;
