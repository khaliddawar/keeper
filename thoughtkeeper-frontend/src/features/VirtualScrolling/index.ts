/**
 * Virtual Scrolling Feature
 * High-performance virtualized scrolling for large datasets
 */

// Core Components
export { default as VirtualList } from './components/VirtualList';
export { VirtualItem } from './components/VirtualList';

// Specialized Components
export { VirtualTaskList } from './components/VirtualTaskList';
export { VirtualNotebookList } from './components/VirtualNotebookList';
export { VirtualSearchResults, SearchResultItemWrapper } from './components/VirtualSearchResults';

// Hooks
export { useVirtualScroll } from './hooks/useVirtualScroll';

// Types
export type {
  VirtualItem,
  VirtualRange,
  VirtualScrollState,
  VirtualScrollConfig,
  VirtualListContext,
  ItemMeasurement,
  MeasurementCache,
  ScrollBehavior,
  ScrollAlignment,
  ScrollToOptions,
  VirtualListProps,
  VirtualItemProps,
  VirtualScrollMetrics,
  VirtualizationStrategy,
  VirtualizationStrategyConfig,
  VirtualizedSearchResults,
  VirtualizedTaskList,
  VirtualizedNotebookList,
  VirtualScrollAccessibility,
  VirtualScrollAdvanced,
  UseVirtualScrollReturn,
  VirtualScrollEvent,
  VirtualScrollDebug
} from './types';

// Utility functions and presets
export const VirtualScrollUtils = {
  /**
   * Calculate estimated total height based on item count and average height
   */
  calculateEstimatedHeight: (itemCount: number, averageHeight: number): number => {
    return itemCount * averageHeight;
  },

  /**
   * Calculate visible range based on scroll position and container height
   */
  calculateVisibleRange: (
    scrollTop: number,
    containerHeight: number,
    itemHeight: number,
    itemCount: number,
    overscan = 5
  ) => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  },

  /**
   * Check if an item is within the visible viewport
   */
  isItemVisible: (
    itemIndex: number,
    scrollTop: number,
    containerHeight: number,
    itemHeight: number
  ): boolean => {
    const itemTop = itemIndex * itemHeight;
    const itemBottom = itemTop + itemHeight;
    
    return itemBottom >= scrollTop && itemTop <= scrollTop + containerHeight;
  },

  /**
   * Calculate scroll position to center an item
   */
  getScrollPositionForItem: (
    itemIndex: number,
    itemHeight: number,
    containerHeight: number,
    alignment: ScrollAlignment = 'center'
  ): number => {
    const itemTop = itemIndex * itemHeight;
    
    switch (alignment) {
      case 'start':
        return itemTop;
      case 'center':
        return itemTop - (containerHeight - itemHeight) / 2;
      case 'end':
        return itemTop - containerHeight + itemHeight;
      default:
        return itemTop;
    }
  },

  /**
   * Create a dynamic height function based on content
   */
  createDynamicHeightCalculator: (
    baseHeight: number,
    heightPerLine: number = 16,
    maxLines: number = 10
  ) => {
    return (item: any): number => {
      let height = baseHeight;
      
      // Add height for description/content
      if (item.description) {
        const lines = Math.ceil(item.description.length / 60);
        height += Math.min(lines * heightPerLine, maxLines * heightPerLine);
      }
      
      // Add height for tags
      if (item.tags && item.tags.length > 0) {
        height += 28; // Tag row height
      }
      
      // Add height for subtasks/collaborators
      if (item.subtasks && item.subtasks.length > 0) {
        height += Math.min(item.subtasks.length * 20, 60);
      }
      
      return Math.max(height, baseHeight);
    };
  },

  /**
   * Performance monitoring utilities
   */
  performance: {
    measureRenderTime: <T>(fn: () => T): { result: T; time: number } => {
      const start = performance.now();
      const result = fn();
      const time = performance.now() - start;
      return { result, time };
    },

    throttle: <T extends (...args: any[]) => any>(
      func: T,
      limit: number
    ): T => {
      let inThrottle: boolean;
      return ((...args: any[]) => {
        if (!inThrottle) {
          func.apply(null, args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      }) as T;
    },

    debounce: <T extends (...args: any[]) => any>(
      func: T,
      delay: number
    ): T => {
      let timeoutId: NodeJS.Timeout;
      return ((...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
      }) as T;
    }
  },

  /**
   * Accessibility helpers
   */
  accessibility: {
    getAriaProps: (totalItems: number, visibleRange: { startIndex: number; endIndex: number }) => ({
      'aria-rowcount': totalItems,
      'aria-rowindex': visibleRange.startIndex + 1,
      'aria-label': `Virtual list with ${totalItems} items, showing ${visibleRange.endIndex - visibleRange.startIndex + 1} items`
    }),

    announceItemChange: (itemIndex: number, totalItems: number) => {
      if ('speechSynthesis' in window) {
        const announcement = `Item ${itemIndex + 1} of ${totalItems}`;
        const utterance = new SpeechSynthesisUtterance(announcement);
        utterance.volume = 0; // Silent announcement for screen readers
        speechSynthesis.speak(utterance);
      }
    }
  }
};

// Pre-configured virtual list configurations
export const VirtualScrollPresets = {
  /**
   * Configuration for task lists
   */
  tasks: {
    itemHeight: 80,
    estimatedItemHeight: 80,
    overscanCount: 5,
    scrollingDelay: 150,
    enableSmoothScrolling: true,
    maintainScrollPosition: true,
    buffer: { top: 0, bottom: 0 },
    threshold: { updateVisibleRange: 1, triggerResize: 50 }
  },

  /**
   * Configuration for notebook lists
   */
  notebooks: {
    itemHeight: 120,
    estimatedItemHeight: 120,
    overscanCount: 3,
    scrollingDelay: 200,
    enableSmoothScrolling: true,
    maintainScrollPosition: true,
    buffer: { top: 0, bottom: 0 },
    threshold: { updateVisibleRange: 2, triggerResize: 100 }
  },

  /**
   * Configuration for search results
   */
  searchResults: {
    itemHeight: VirtualScrollUtils.createDynamicHeightCalculator(100, 16, 5),
    estimatedItemHeight: 120,
    overscanCount: 10,
    scrollingDelay: 100,
    enableSmoothScrolling: true,
    maintainScrollPosition: false,
    buffer: { top: 200, bottom: 200 },
    threshold: { updateVisibleRange: 1, triggerResize: 50 }
  },

  /**
   * Configuration for large datasets (10k+ items)
   */
  largeDataset: {
    itemHeight: 50,
    estimatedItemHeight: 50,
    overscanCount: 15,
    scrollingDelay: 50,
    enableSmoothScrolling: false, // Disable for performance
    maintainScrollPosition: true,
    buffer: { top: 500, bottom: 500 },
    threshold: { updateVisibleRange: 5, triggerResize: 200 }
  },

  /**
   * Configuration for mobile devices
   */
  mobile: {
    itemHeight: 70,
    estimatedItemHeight: 70,
    overscanCount: 8,
    scrollingDelay: 200,
    enableSmoothScrolling: true,
    maintainScrollPosition: true,
    buffer: { top: 100, bottom: 100 },
    threshold: { updateVisibleRange: 2, triggerResize: 100 }
  }
};

// Feature detection and capabilities
export const VirtualScrollCapabilities = {
  /**
   * Check if the browser supports smooth scrolling
   */
  supportsSmoothScrolling: (): boolean => {
    return 'scrollBehavior' in document.documentElement.style;
  },

  /**
   * Check if the browser supports Intersection Observer
   */
  supportsIntersectionObserver: (): boolean => {
    return 'IntersectionObserver' in window;
  },

  /**
   * Check if the browser supports ResizeObserver
   */
  supportsResizeObserver: (): boolean => {
    return 'ResizeObserver' in window;
  },

  /**
   * Get optimal configuration based on device and dataset size
   */
  getOptimalConfig: (itemCount: number, isMobile = false): VirtualScrollConfig => {
    if (isMobile) {
      return VirtualScrollPresets.mobile;
    }
    
    if (itemCount > 10000) {
      return VirtualScrollPresets.largeDataset;
    }
    
    if (itemCount > 1000) {
      return {
        ...VirtualScrollPresets.tasks,
        overscanCount: 10,
        scrollingDelay: 100
      };
    }
    
    return VirtualScrollPresets.tasks;
  },

  /**
   * Detect if device has limited resources
   */
  hasLimitedResources: (): boolean => {
    // Check for limited memory or processing power
    const connection = (navigator as any).connection;
    const memory = (performance as any).memory;
    
    return !!(
      connection?.effectiveType === 'slow-2g' ||
      connection?.effectiveType === '2g' ||
      memory?.usedJSHeapSize > memory?.jsHeapSizeLimit * 0.8
    );
  }
};

// Performance monitoring
export const VirtualScrollMonitoring = {
  /**
   * Create performance observer for virtual scroll metrics
   */
  createPerformanceObserver: (callback: (metrics: VirtualScrollMetrics) => void) => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        // Process performance entries and call callback with metrics
        console.log('Virtual scroll performance entries:', entries);
      });
      
      observer.observe({ entryTypes: ['measure', 'navigation'] });
      return observer;
    }
    
    return null;
  },

  /**
   * Measure virtual scroll performance
   */
  measureScrollPerformance: (
    scrollContainer: HTMLElement,
    callback: (fps: number, frameTime: number) => void
  ) => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;
    
    const measureFrame = (currentTime: number) => {
      frameCount++;
      
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount;
        const frameTime = 1000 / fps;
        
        callback(fps, frameTime);
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFrame);
    };
    
    animationId = requestAnimationFrame(measureFrame);
    
    return () => cancelAnimationFrame(animationId);
  }
};

// Development utilities
if (process.env.NODE_ENV === 'development') {
  (window as any).VirtualScrolling = {
    utils: VirtualScrollUtils,
    presets: VirtualScrollPresets,
    capabilities: VirtualScrollCapabilities,
    monitoring: VirtualScrollMonitoring
  };
  
  console.log('🚀 Virtual Scrolling system loaded');
  console.log('  📊 Capabilities:', {
    smoothScrolling: VirtualScrollCapabilities.supportsSmoothScrolling(),
    intersectionObserver: VirtualScrollCapabilities.supportsIntersectionObserver(),
    resizeObserver: VirtualScrollCapabilities.supportsResizeObserver(),
    limitedResources: VirtualScrollCapabilities.hasLimitedResources()
  });
  console.log('  🛠️  Utils available at window.VirtualScrolling');
}
