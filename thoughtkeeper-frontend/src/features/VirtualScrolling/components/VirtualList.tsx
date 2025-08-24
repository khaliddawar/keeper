import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { useVirtualScroll } from '../hooks/useVirtualScroll';
import type { VirtualListProps, VirtualItemProps, ScrollToOptions } from '../types';

/**
 * Virtual List Component
 * High-performance virtualized list for large datasets
 */
export const VirtualList = forwardRef<any, VirtualListProps>(function VirtualList<T = any>(
  {
    items,
    itemHeight,
    height,
    width = '100%',
    overscanCount = 5,
    className = '',
    style = {},
    renderItem,
    onScroll,
    onItemsRendered,
    maintainScrollPosition = true,
    scrollToIndex,
    scrollToAlignment = 'auto',
    enableSmoothScrolling = true,
    ...restProps
  }: VirtualListProps<T>,
  ref: React.Ref<HTMLDivElement>
) {
  const measurementRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  
  const {
    containerProps,
    itemProps,
    visibleItems,
    isScrolling,
    scrollTo,
    scrollToTop,
    scrollToBottom,
    refresh,
    metrics
  } = useVirtualScroll(items, {
    itemHeight,
    overscanCount,
    enableSmoothScrolling,
    maintainScrollPosition
  });

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    containerProps.onScroll(event);
    onScroll?.(event.currentTarget.scrollTop, event.currentTarget.scrollLeft);
  }, [containerProps.onScroll, onScroll]);

  // Measure item height
  const measureItem = useCallback((index: number, height: number) => {
    // The measurement is handled internally by the virtual scroll hook
    // This is exposed for items that need dynamic height measurement
  }, []);

  // Create item props with measurement capability
  const createItemProps = useCallback((index: number, item: T): VirtualItemProps<T> => {
    const props = itemProps(index);
    
    return {
      index,
      item,
      style: props.style,
      isVisible: visibleItems.some(vItem => vItem.index === index),
      isScrolling,
      measure: (height: number) => measureItem(index, height)
    };
  }, [itemProps, visibleItems, isScrolling, measureItem]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    scrollTo: ((...args: any[]) => {
      // Support both signatures
      if (typeof args[0] === 'object') {
        scrollTo(args[0] as ScrollToOptions);
      } else {
        scrollTo(args[0] as number, args[1] as number);
      }
    }) as any,
    scrollToTop,
    scrollToBottom,
    scrollToIndex: (index: number, alignment = scrollToAlignment) => 
      scrollTo({ index, align: alignment }),
    refresh,
    getMetrics: () => metrics,
    getVisibleItemsCount: () => visibleItems.length,
    getTotalItemsCount: () => items.length
  }), [scrollTo, scrollToTop, scrollToBottom, scrollToAlignment, refresh, metrics, visibleItems.length, items.length]);

  // Handle scroll to index prop
  React.useEffect(() => {
    if (typeof scrollToIndex === 'number' && scrollToIndex >= 0 && scrollToIndex < items.length) {
      scrollTo({ index: scrollToIndex, align: scrollToAlignment });
    }
  }, [scrollToIndex, scrollToAlignment, scrollTo, items.length]);

  // Notify parent of rendered items
  React.useEffect(() => {
    if (onItemsRendered && visibleItems.length > 0) {
      const range = {
        startIndex: visibleItems[0]?.index || 0,
        endIndex: visibleItems[visibleItems.length - 1]?.index || 0,
        visibleStartIndex: visibleItems[0]?.index || 0,
        visibleEndIndex: visibleItems[visibleItems.length - 1]?.index || 0,
        overscanStartIndex: visibleItems[0]?.index || 0,
        overscanEndIndex: visibleItems[visibleItems.length - 1]?.index || 0
      };
      onItemsRendered(range);
    }
  }, [visibleItems, onItemsRendered]);

  // Container styles
  const containerStyle: React.CSSProperties = {
    ...containerProps.style,
    height: typeof height === 'string' ? height : `${height}px`,
    width: typeof width === 'string' ? width : `${width}px`,
    ...style
  };

  // Calculate total height for the inner container
  const totalHeight = visibleItems.length > 0 
    ? Math.max(...visibleItems.map(item => item.offsetTop + (item.height || 50))) 
    : items.length * (typeof itemHeight === 'number' ? itemHeight : 50);

  return (
    <div
      {...restProps}
      className={`virtual-list ${className}`}
      style={containerStyle}
      onScroll={handleScroll}
      ref={containerProps.ref}
      tabIndex={containerProps.tabIndex}
      role={containerProps.role}
      aria-label={containerProps['aria-label']}
      aria-rowcount={items.length}
    >
      {/* Inner container to maintain scroll height */}
      <div
        className="virtual-list-inner"
        style={{
          height: totalHeight,
          width: '100%',
          position: 'relative'
        }}
      >
        {/* Render visible items */}
        {visibleItems.map((virtualItem) => {
          const item = items[virtualItem.index];
          if (!item) return null;

          const props = createItemProps(virtualItem.index, item);
          
          return (
            <div
              key={`virtual-item-${virtualItem.index}`}
              style={props.style}
              data-index={virtualItem.index}
              role="row"
              aria-rowindex={virtualItem.index + 1}
              className={`virtual-list-item ${props.isVisible ? 'visible' : 'hidden'} ${props.isScrolling ? 'scrolling' : ''}`}
            >
              {renderItem(props)}
            </div>
          );
        })}
      </div>

      {/* Debug overlay (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <VirtualListDebugOverlay
          metrics={metrics}
          visibleCount={visibleItems.length}
          totalCount={items.length}
        />
      )}
    </div>
  );
});

/**
 * Debug Overlay Component (Development Only)
 */
interface VirtualListDebugOverlayProps {
  metrics: any;
  visibleCount: number;
  totalCount: number;
}

const VirtualListDebugOverlay: React.FC<VirtualListDebugOverlayProps> = ({
  metrics,
  visibleCount,
  totalCount
}) => {
  const [showDebug, setShowDebug] = React.useState(false);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed top-4 right-4 z-50 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded"
        style={{ fontSize: '10px' }}
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-black bg-opacity-80 text-white text-xs p-3 rounded max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold">Virtual List Debug</span>
        <button
          onClick={() => setShowDebug(false)}
          className="text-white hover:text-red-300"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-1">
        <div>Visible: {visibleCount} / {totalCount}</div>
        <div>Renders: {metrics.renderCount}</div>
        <div>Scroll Events: {metrics.scrollEventCount}</div>
        <div>Resize Events: {metrics.resizeEventCount}</div>
        <div>Avg Render: {metrics.averageRenderTime.toFixed(2)}ms</div>
        <div>Max Render: {metrics.maxRenderTime.toFixed(2)}ms</div>
        <div>Memory: {(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB</div>
      </div>
    </div>
  );
};

/**
 * Virtual Item Component
 * Wrapper component for individual virtual list items
 */
export const VirtualItem = React.memo<{
  children: React.ReactNode;
  style: React.CSSProperties;
  className?: string;
}>(function VirtualItem({ children, style, className = '' }) {
  const itemRef = useRef<HTMLDivElement>(null);
  
  return (
    <div
      ref={itemRef}
      className={`virtual-item ${className}`}
      style={style}
    >
      {children}
    </div>
  );
});

export default VirtualList;
