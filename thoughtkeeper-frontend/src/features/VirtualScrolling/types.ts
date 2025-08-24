/**
 * Virtual Scrolling Types
 * Defines interfaces for high-performance virtual scrolling
 */

import type { SearchResultItem } from '../AdvancedSearch/types';

// Core virtualization types
export interface VirtualItem {
  id: string;
  index: number;
  data: any;
  height?: number;
  isVisible: boolean;
  offsetTop: number;
  estimatedHeight: number;
}

export interface VirtualRange {
  startIndex: number;
  endIndex: number;
  visibleStartIndex: number;
  visibleEndIndex: number;
  overscanStartIndex: number;
  overscanEndIndex: number;
}

export interface VirtualScrollState {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  isScrolling: boolean;
  scrollDirection: 'up' | 'down' | 'none';
  lastScrollTime: number;
  items: VirtualItem[];
  visibleRange: VirtualRange;
  totalHeight: number;
}

// Configuration options
export interface VirtualScrollConfig {
  itemHeight: number | ((index: number, data: any) => number);
  estimatedItemHeight: number;
  overscanCount: number;
  scrollingDelay: number;
  enableSmoothScrolling: boolean;
  maintainScrollPosition: boolean;
  buffer: {
    top: number;
    bottom: number;
  };
  threshold: {
    updateVisibleRange: number;
    triggerResize: number;
  };
}

// Virtual list context
export interface VirtualListContext {
  // State
  state: VirtualScrollState;
  config: VirtualScrollConfig;
  containerRef: React.RefObject<HTMLDivElement>;
  
  // Actions
  scrollTo: (index: number, align?: 'start' | 'center' | 'end' | 'auto') => void;
  scrollToTop: () => void;
  scrollToBottom: () => void;
  updateItemHeight: (index: number, height: number) => void;
  refreshItems: () => void;
  setScrollTop: (scrollTop: number) => void;
  
  // Utilities
  getItemOffset: (index: number) => number;
  getItemHeight: (index: number, data?: any) => number;
  isItemVisible: (index: number) => boolean;
  getVisibleItems: () => VirtualItem[];
  getTotalHeight: () => number;
}

// Item measurement system
export interface ItemMeasurement {
  index: number;
  height: number;
  offset: number;
  measured: boolean;
}

export interface MeasurementCache {
  measurements: Map<number, ItemMeasurement>;
  totalMeasuredHeight: number;
  averageHeight: number;
  measuredCount: number;
  defaultHeight: number;
}

// Scroll behavior
export type ScrollBehavior = 'auto' | 'smooth' | 'instant';
export type ScrollAlignment = 'start' | 'center' | 'end' | 'auto';

export interface ScrollToOptions {
  index: number;
  align?: ScrollAlignment;
  behavior?: ScrollBehavior;
  offset?: number;
}

// Virtual list component props
export interface VirtualListProps<T = any> {
  items: T[];
  itemHeight: number | ((index: number, item: T) => number);
  height: number | string;
  width?: number | string;
  overscanCount?: number;
  className?: string;
  style?: React.CSSProperties;
  renderItem: (props: VirtualItemProps<T>) => React.ReactNode;
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
  onItemsRendered?: (range: VirtualRange) => void;
  maintainScrollPosition?: boolean;
  scrollToIndex?: number;
  scrollToAlignment?: ScrollAlignment;
  enableSmoothScrolling?: boolean;
}

export interface VirtualItemProps<T = any> {
  index: number;
  item: T;
  style: React.CSSProperties;
  isVisible: boolean;
  isScrolling: boolean;
  measure: (height: number) => void;
}

// Performance monitoring
export interface VirtualScrollMetrics {
  renderCount: number;
  averageRenderTime: number;
  maxRenderTime: number;
  scrollEventCount: number;
  resizeEventCount: number;
  visibleItemCount: number;
  totalItemCount: number;
  memoryUsage: number;
  lastUpdateTime: number;
}

// Virtualization strategies
export type VirtualizationStrategy = 'fixed' | 'dynamic' | 'estimated';

export interface VirtualizationStrategyConfig {
  strategy: VirtualizationStrategy;
  fixedHeight?: number;
  estimatedHeight?: number;
  measurementThreshold?: number;
  remeasureOnResize?: boolean;
  cacheSize?: number;
}

// Base types for searchable items
export interface SearchableItem {
  id: string;
  title?: string;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
}

export interface TaskLike extends SearchableItem {
  status?: string;
  priority?: string;
  description?: string;
  dueDate?: Date;
  progress?: number;
  assignee?: string;
  labels?: string[];
  timeEstimate?: number;
  subtasks?: any[];
  completed?: boolean;
  completedAt?: Date;
}

export interface NotebookLike extends SearchableItem {
  description?: string;
  content?: string;
  status?: string;
  color?: string;
  icon?: string;
  taskCount?: number;
  shared?: boolean;
  pinned?: boolean;
}

// Integration with existing components
export interface VirtualizedSearchResults<T extends SearchableItem = SearchableItem> {
  results: SearchResultItem<T>[];
  totalCount: number;
  renderItem: (item: SearchResultItem<T>, index: number) => React.ReactNode;
  onLoadMore?: () => void;
  loading?: boolean;
}

export interface VirtualizedTaskList {
  tasks: any[];
  onTaskClick: (task: any) => void;
  onTaskComplete: (taskId: string) => void;
  selectedTaskIds?: Set<string>;
  onTaskSelect?: (taskId: string, selected: boolean) => void;
}

export interface VirtualizedNotebookList {
  notebooks: any[];
  onNotebookClick: (notebook: any) => void;
  onNotebookSelect?: (notebookId: string, selected: boolean) => void;
  selectedNotebookIds?: Set<string>;
}

// Accessibility support
export interface VirtualScrollAccessibility {
  ariaLabel?: string;
  ariaRowCount?: number;
  ariaColCount?: number;
  announceItems?: boolean;
  keyboardNavigation?: boolean;
  focusManagement?: 'auto' | 'manual';
}

// Advanced features
export interface VirtualScrollAdvanced {
  // Horizontal scrolling support
  horizontal?: boolean;
  
  // Grid layout support
  columnCount?: number;
  columnWidth?: number | ((index: number) => number);
  
  // Sticky elements
  stickyIndices?: number[];
  
  // Loading states
  loadingComponent?: React.ComponentType;
  emptyComponent?: React.ComponentType;
  errorComponent?: React.ComponentType<{ error: Error }>;
  
  // Infinite scrolling
  hasNextPage?: boolean;
  isNextPageLoading?: boolean;
  loadNextPage?: () => void;
  
  // Search integration
  searchQuery?: string;
  highlightMatches?: boolean;
  
  // Drag and drop
  enableDragDrop?: boolean;
  onItemDrop?: (fromIndex: number, toIndex: number) => void;
}

// Hook return types
export interface UseVirtualScrollReturn {
  containerProps: {
    ref: React.RefObject<HTMLDivElement>;
    style: React.CSSProperties;
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
    tabIndex: number;
    role: string;
    'aria-label': string;
  };
  
  itemProps: (index: number) => {
    key: string;
    style: React.CSSProperties;
    'data-index': number;
    role: string;
  };
  
  visibleItems: VirtualItem[];
  isScrolling: boolean;
  scrollTo: (options: ScrollToOptions) => void;
  scrollToTop: () => void;
  scrollToBottom: () => void;
  refresh: () => void;
  metrics: VirtualScrollMetrics;
}

// Event types
export interface VirtualScrollEvent {
  type: 'scroll' | 'resize' | 'itemMeasured' | 'rangeChanged';
  payload: any;
  timestamp: number;
}

// Debug information
export interface VirtualScrollDebug {
  enabled: boolean;
  showMetrics: boolean;
  showBoundaries: boolean;
  logEvents: boolean;
  highlightVisible: boolean;
  showScrollbar: boolean;
}
