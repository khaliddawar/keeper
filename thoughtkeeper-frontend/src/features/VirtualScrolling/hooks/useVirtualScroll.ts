import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type {
  VirtualScrollState,
  VirtualScrollConfig,
  VirtualItem,
  VirtualRange,
  ScrollToOptions,
  ItemMeasurement,
  MeasurementCache,
  VirtualScrollMetrics,
  UseVirtualScrollReturn
} from '../types';

/**
 * Default configuration for virtual scrolling
 */
const DEFAULT_CONFIG: VirtualScrollConfig = {
  itemHeight: 50,
  estimatedItemHeight: 50,
  overscanCount: 5,
  scrollingDelay: 150,
  enableSmoothScrolling: true,
  maintainScrollPosition: true,
  buffer: {
    top: 0,
    bottom: 0
  },
  threshold: {
    updateVisibleRange: 1,
    triggerResize: 50
  }
};

/**
 * Virtual Scroll Hook
 * Core virtualization logic for high-performance scrolling
 */
export function useVirtualScroll<T = any>(
  items: T[],
  config: Partial<VirtualScrollConfig> = {}
): UseVirtualScrollReturn {
  const mergedConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const measurementCacheRef = useRef<MeasurementCache>({
    measurements: new Map(),
    totalMeasuredHeight: 0,
    averageHeight: mergedConfig.estimatedItemHeight,
    measuredCount: 0,
    defaultHeight: mergedConfig.estimatedItemHeight
  });
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State
  const [state, setState] = useState<VirtualScrollState>({
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
    isScrolling: false,
    scrollDirection: 'none',
    lastScrollTime: 0,
    items: [],
    visibleRange: {
      startIndex: 0,
      endIndex: 0,
      visibleStartIndex: 0,
      visibleEndIndex: 0,
      overscanStartIndex: 0,
      overscanEndIndex: 0
    },
    totalHeight: 0
  });

  const [metrics, setMetrics] = useState<VirtualScrollMetrics>({
    renderCount: 0,
    averageRenderTime: 0,
    maxRenderTime: 0,
    scrollEventCount: 0,
    resizeEventCount: 0,
    visibleItemCount: 0,
    totalItemCount: items.length,
    memoryUsage: 0,
    lastUpdateTime: Date.now()
  });

  /**
   * Get height for a specific item
   */
  const getItemHeight = useCallback((index: number, data?: T): number => {
    const { itemHeight } = mergedConfig;
    
    if (typeof itemHeight === 'function') {
      return itemHeight(index, data || items[index]);
    }
    
    // Check measurement cache first
    const cached = measurementCacheRef.current.measurements.get(index);
    if (cached?.measured) {
      return cached.height;
    }
    
    return typeof itemHeight === 'number' ? itemHeight : mergedConfig.estimatedItemHeight;
  }, [mergedConfig, items]);

  /**
   * Get offset position for a specific item
   */
  const getItemOffset = useCallback((index: number): number => {
    let offset = 0;
    const cache = measurementCacheRef.current;
    
    for (let i = 0; i < index; i++) {
      const measurement = cache.measurements.get(i);
      if (measurement?.measured) {
        offset += measurement.height;
      } else {
        offset += getItemHeight(i);
      }
    }
    
    return offset;
  }, [getItemHeight]);

  /**
   * Calculate total height of all items
   */
  const getTotalHeight = useCallback((): number => {
    let totalHeight = 0;
    const cache = measurementCacheRef.current;
    
    for (let i = 0; i < items.length; i++) {
      const measurement = cache.measurements.get(i);
      if (measurement?.measured) {
        totalHeight += measurement.height;
      } else {
        totalHeight += getItemHeight(i);
      }
    }
    
    return totalHeight;
  }, [items.length, getItemHeight]);

  /**
   * Calculate visible range based on scroll position
   */
  const calculateVisibleRange = useCallback((
    scrollTop: number,
    clientHeight: number
  ): VirtualRange => {
    if (items.length === 0) {
      return {
        startIndex: 0,
        endIndex: 0,
        visibleStartIndex: 0,
        visibleEndIndex: 0,
        overscanStartIndex: 0,
        overscanEndIndex: 0
      };
    }

    const cache = measurementCacheRef.current;
    let startIndex = 0;
    let currentOffset = 0;

    // Binary search for start index
    let low = 0;
    let high = items.length - 1;
    
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const midOffset = getItemOffset(mid);
      
      if (midOffset < scrollTop) {
        low = mid + 1;
        startIndex = mid;
      } else {
        high = mid - 1;
      }
    }

    // Find end index
    let endIndex = startIndex;
    currentOffset = getItemOffset(startIndex);
    
    while (endIndex < items.length && currentOffset < scrollTop + clientHeight) {
      currentOffset += getItemHeight(endIndex);
      endIndex++;
    }

    // Apply overscan
    const overscanStartIndex = Math.max(0, startIndex - mergedConfig.overscanCount);
    const overscanEndIndex = Math.min(items.length - 1, endIndex + mergedConfig.overscanCount);

    return {
      startIndex: overscanStartIndex,
      endIndex: overscanEndIndex,
      visibleStartIndex: startIndex,
      visibleEndIndex: endIndex,
      overscanStartIndex,
      overscanEndIndex
    };
  }, [items.length, getItemOffset, getItemHeight, mergedConfig.overscanCount]);

  /**
   * Create virtual items for the current visible range
   */
  const createVirtualItems = useCallback((range: VirtualRange): VirtualItem[] => {
    const virtualItems: VirtualItem[] = [];
    
    for (let index = range.startIndex; index <= range.endIndex; index++) {
      if (index >= items.length) break;
      
      const offsetTop = getItemOffset(index);
      const height = getItemHeight(index);
      const isVisible = index >= range.visibleStartIndex && index <= range.visibleEndIndex;
      
      virtualItems.push({
        id: `virtual-item-${index}`,
        index,
        data: items[index],
        height,
        isVisible,
        offsetTop,
        estimatedHeight: mergedConfig.estimatedItemHeight
      });
    }
    
    return virtualItems;
  }, [items, getItemOffset, getItemHeight, mergedConfig.estimatedItemHeight]);

  /**
   * Update item height measurement
   */
  const updateItemHeight = useCallback((index: number, height: number): void => {
    const cache = measurementCacheRef.current;
    const existingMeasurement = cache.measurements.get(index);
    
    const measurement: ItemMeasurement = {
      index,
      height,
      offset: getItemOffset(index),
      measured: true
    };
    
    cache.measurements.set(index, measurement);
    
    // Update average height
    if (!existingMeasurement?.measured) {
      cache.measuredCount++;
      cache.totalMeasuredHeight += height;
    } else {
      cache.totalMeasuredHeight += (height - existingMeasurement.height);
    }
    
    cache.averageHeight = cache.totalMeasuredHeight / cache.measuredCount;
    
    // Update state if this affects visible range
    setState(prevState => {
      const newTotalHeight = getTotalHeight();
      const newVisibleRange = calculateVisibleRange(prevState.scrollTop, prevState.clientHeight);
      const newVirtualItems = createVirtualItems(newVisibleRange);
      
      return {
        ...prevState,
        totalHeight: newTotalHeight,
        visibleRange: newVisibleRange,
        items: newVirtualItems
      };
    });
  }, [getItemOffset, getTotalHeight, calculateVisibleRange, createVirtualItems]);

  /**
   * Handle scroll events
   */
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>): void => {
    const scrollElement = event.currentTarget;
    const scrollTop = scrollElement.scrollTop;
    const clientHeight = scrollElement.clientHeight;
    const scrollHeight = scrollElement.scrollHeight;
    
    const now = Date.now();
    const scrollDirection = scrollTop > state.scrollTop ? 'down' : scrollTop < state.scrollTop ? 'up' : 'none';
    
    // Clear previous scroll timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Calculate new visible range
    const newVisibleRange = calculateVisibleRange(scrollTop, clientHeight);
    const newVirtualItems = createVirtualItems(newVisibleRange);
    
    setState(prevState => ({
      ...prevState,
      scrollTop,
      clientHeight,
      scrollHeight,
      isScrolling: true,
      scrollDirection,
      lastScrollTime: now,
      visibleRange: newVisibleRange,
      items: newVirtualItems,
      totalHeight: getTotalHeight()
    }));
    
    // Update metrics
    setMetrics(prevMetrics => ({
      ...prevMetrics,
      scrollEventCount: prevMetrics.scrollEventCount + 1,
      visibleItemCount: newVirtualItems.length,
      lastUpdateTime: now
    }));
    
    // Set timeout to detect end of scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      setState(prevState => ({
        ...prevState,
        isScrolling: false
      }));
    }, mergedConfig.scrollingDelay);
  }, [state.scrollTop, calculateVisibleRange, createVirtualItems, getTotalHeight, mergedConfig.scrollingDelay]);

  /**
   * Scroll to specific index
   */
  const scrollTo = useCallback((options: ScrollToOptions): void => {
    const { index, align = 'auto', behavior = 'smooth', offset = 0 } = options;
    
    if (!containerRef.current || index < 0 || index >= items.length) {
      return;
    }
    
    const container = containerRef.current;
    const itemOffset = getItemOffset(index);
    const itemHeight = getItemHeight(index);
    const containerHeight = container.clientHeight;
    
    let scrollTop = itemOffset + offset;
    
    // Apply alignment
    switch (align) {
      case 'center':
        scrollTop = itemOffset - (containerHeight - itemHeight) / 2;
        break;
      case 'end':
        scrollTop = itemOffset - containerHeight + itemHeight;
        break;
      case 'auto':
        if (itemOffset < container.scrollTop) {
          scrollTop = itemOffset;
        } else if (itemOffset + itemHeight > container.scrollTop + containerHeight) {
          scrollTop = itemOffset - containerHeight + itemHeight;
        } else {
          return; // Already visible
        }
        break;
    }
    
    scrollTop = Math.max(0, Math.min(scrollTop, container.scrollHeight - containerHeight));
    
    if (behavior === 'smooth' && mergedConfig.enableSmoothScrolling) {
      container.scrollTo({ top: scrollTop, behavior: 'smooth' });
    } else {
      container.scrollTop = scrollTop;
    }
  }, [items.length, getItemOffset, getItemHeight, mergedConfig.enableSmoothScrolling]);

  /**
   * Scroll to top
   */
  const scrollToTop = useCallback((): void => {
    scrollTo({ index: 0, align: 'start' });
  }, [scrollTo]);

  /**
   * Scroll to bottom
   */
  const scrollToBottom = useCallback((): void => {
    scrollTo({ index: items.length - 1, align: 'end' });
  }, [scrollTo, items.length]);

  /**
   * Refresh virtual items
   */
  const refresh = useCallback((): void => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const newVisibleRange = calculateVisibleRange(container.scrollTop, container.clientHeight);
    const newVirtualItems = createVirtualItems(newVisibleRange);
    
    setState(prevState => ({
      ...prevState,
      visibleRange: newVisibleRange,
      items: newVirtualItems,
      totalHeight: getTotalHeight()
    }));
  }, [calculateVisibleRange, createVirtualItems, getTotalHeight]);

  /**
   * Check if item is visible
   */
  const isItemVisible = useCallback((index: number): boolean => {
    return index >= state.visibleRange.visibleStartIndex && 
           index <= state.visibleRange.visibleEndIndex;
  }, [state.visibleRange]);

  /**
   * Get visible items
   */
  const getVisibleItems = useCallback((): VirtualItem[] => {
    return state.items.filter(item => item.isVisible);
  }, [state.items]);

  // Initialize and handle resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleResize = (): void => {
      const clientHeight = container.clientHeight;
      const scrollTop = container.scrollTop;
      
      const newVisibleRange = calculateVisibleRange(scrollTop, clientHeight);
      const newVirtualItems = createVirtualItems(newVisibleRange);
      
      setState(prevState => ({
        ...prevState,
        clientHeight,
        visibleRange: newVisibleRange,
        items: newVirtualItems,
        totalHeight: getTotalHeight()
      }));
      
      setMetrics(prevMetrics => ({
        ...prevMetrics,
        resizeEventCount: prevMetrics.resizeEventCount + 1
      }));
    };
    
    // Initial calculation
    handleResize();
    
    // Set up resize observer
    resizeObserverRef.current = new ResizeObserver(handleResize);
    resizeObserverRef.current.observe(container);
    
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [calculateVisibleRange, createVirtualItems, getTotalHeight]);

  // Update items when data changes
  useEffect(() => {
    measurementCacheRef.current = {
      measurements: new Map(),
      totalMeasuredHeight: 0,
      averageHeight: mergedConfig.estimatedItemHeight,
      measuredCount: 0,
      defaultHeight: mergedConfig.estimatedItemHeight
    };
    
    setMetrics(prevMetrics => ({
      ...prevMetrics,
      totalItemCount: items.length,
      renderCount: prevMetrics.renderCount + 1
    }));
    
    refresh();
  }, [items, mergedConfig.estimatedItemHeight, refresh]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Container props
  const containerProps = useMemo(() => ({
    ref: containerRef,
    style: {
      height: '100%',
      width: '100%',
      overflow: 'auto',
      position: 'relative' as const
    },
    onScroll: handleScroll,
    tabIndex: 0,
    role: 'grid',
    'aria-label': `Virtual list with ${items.length} items`
  }), [handleScroll, items.length]);

  // Item props factory
  const itemProps = useCallback((index: number) => {
    const item = state.items.find(item => item.index === index);
    if (!item) {
      return {
        key: `virtual-item-${index}`,
        style: { display: 'none' },
        'data-index': index,
        role: 'row'
      };
    }
    
    return {
      key: item.id,
      style: {
        position: 'absolute' as const,
        top: item.offsetTop,
        left: 0,
        width: '100%',
        height: item.height
      },
      'data-index': index,
      role: 'row'
    };
  }, [state.items]);

  return {
    containerProps,
    itemProps,
    visibleItems: state.items,
    isScrolling: state.isScrolling,
    scrollTo,
    scrollToTop,
    scrollToBottom,
    refresh,
    metrics
  };
}
