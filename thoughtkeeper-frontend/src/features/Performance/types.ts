/**
 * Performance Optimization & Monitoring Types
 * 
 * Comprehensive type system for performance monitoring, memory optimization,
 * lazy loading, bundle analysis, and runtime profiling.
 */

// Core Performance Types
export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  category: MetricCategory;
  threshold?: PerformanceThreshold;
  trend?: MetricTrend;
}

export type MetricCategory = 
  | 'core-vitals'
  | 'runtime'
  | 'memory'
  | 'network' 
  | 'user-interaction'
  | 'bundle-size'
  | 'custom';

export interface MetricTrend {
  direction: 'improving' | 'degrading' | 'stable';
  percentage: number;
  period: string;
}

export interface PerformanceThreshold {
  good: number;
  needsImprovement: number;
  poor: number;
}

// Core Web Vitals
export interface CoreWebVitals {
  // Largest Contentful Paint
  lcp: PerformanceMetric;
  // First Input Delay  
  fid: PerformanceMetric;
  // Cumulative Layout Shift
  cls: PerformanceMetric;
  // First Contentful Paint
  fcp: PerformanceMetric;
  // Time to Interactive
  tti: PerformanceMetric;
  // Total Blocking Time
  tbt: PerformanceMetric;
}

// Memory Monitoring
export interface MemoryMetrics {
  // JavaScript heap usage
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  
  // Memory usage percentage
  memoryUsagePercentage: number;
  
  // Memory pressure indicator
  memoryPressure: 'low' | 'medium' | 'high' | 'critical';
  
  // DOM node count
  domNodeCount: number;
  
  // Event listener count
  eventListenerCount: number;
  
  // Component mount count
  componentMountCount: number;
  
  // Memory timeline
  timeline: MemoryTimelinePoint[];
}

export interface MemoryTimelinePoint {
  timestamp: number;
  usedHeapSize: number;
  totalHeapSize: number;
  domNodes: number;
}

// Runtime Performance
export interface RuntimeMetrics {
  // Frame rate monitoring
  fps: number;
  frameDrops: number;
  frameTime: number;
  
  // Task scheduling
  longTasks: LongTask[];
  taskQueue: number;
  
  // React performance
  renderTime: number;
  componentRenders: number;
  unnecessaryRenders: number;
  
  // User interactions
  inputLatency: number;
  scrollPerformance: ScrollPerformance;
  
  // Resource usage
  cpuUsage?: number;
  networkLatency: number;
}

export interface LongTask {
  startTime: number;
  duration: number;
  entryType: string;
  source?: string;
}

export interface ScrollPerformance {
  averageFrameTime: number;
  droppedFrames: number;
  scrollLatency: number;
  isSmooth: boolean;
}

// Lazy Loading System
export interface LazyLoadingConfig {
  enabled: boolean;
  threshold: number; // Intersection threshold
  rootMargin: string;
  preloadDistance: number;
  chunkSize: number;
  maxConcurrent: number;
  timeout: number;
}

export interface LazyLoadableComponent {
  id: string;
  name: string;
  chunkName?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  preload?: boolean;
  dependencies?: string[];
  sizeEstimate?: number; // bytes
}

export interface LazyLoadingStats {
  componentsLoaded: number;
  totalComponents: number;
  loadingTime: number;
  cacheHitRate: number;
  failedLoads: number;
  bundleSize: number;
}

// Bundle Analysis
export interface BundleAnalysis {
  // Bundle sizes
  totalSize: number;
  gzippedSize: number;
  mainChunkSize: number;
  vendorChunkSize: number;
  
  // Chunk breakdown
  chunks: BundleChunk[];
  
  // Tree shaking effectiveness
  treeShakingStats: TreeShakingStats;
  
  // Import analysis
  unusedImports: UnusedImport[];
  duplicateModules: DuplicateModule[];
  
  // Recommendations
  recommendations: BundleRecommendation[];
}

export interface BundleChunk {
  name: string;
  size: number;
  gzippedSize: number;
  modules: string[];
  isAsync: boolean;
  isEntry: boolean;
}

export interface TreeShakingStats {
  eliminatedCode: number;
  totalCode: number;
  effectiveness: number; // percentage
  sideEffects: string[];
}

export interface UnusedImport {
  module: string;
  imports: string[];
  estimatedSavings: number;
}

export interface DuplicateModule {
  module: string;
  occurrences: number;
  totalSize: number;
  locations: string[];
}

export interface BundleRecommendation {
  type: 'remove-unused' | 'lazy-load' | 'code-split' | 'optimize-images' | 'update-dependencies';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  estimatedSavings: number;
  implementation: string;
}

// Performance Profiling
export interface PerformanceProfile {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  
  // Profiling data
  callStack: ProfileFrame[];
  memorySnapshots: MemorySnapshot[];
  networkActivity: NetworkEvent[];
  userInteractions: UserInteractionEvent[];
  
  // Analysis results
  bottlenecks: PerformanceBottleneck[];
  recommendations: PerformanceRecommendation[];
  
  // Metadata
  environment: ProfileEnvironment;
  userAgent: string;
  timestamp: number;
}

export interface ProfileFrame {
  functionName: string;
  fileName: string;
  lineNumber: number;
  columnNumber: number;
  duration: number;
  selfTime: number;
  children: ProfileFrame[];
}

export interface MemorySnapshot {
  timestamp: number;
  heapSize: number;
  domNodes: number;
  eventListeners: number;
  retainedObjects: RetainedObject[];
}

export interface RetainedObject {
  type: string;
  size: number;
  count: number;
  retainer?: string;
}

export interface NetworkEvent {
  url: string;
  method: string;
  startTime: number;
  endTime: number;
  duration: number;
  size: number;
  cached: boolean;
  priority: string;
}

export interface UserInteractionEvent {
  type: 'click' | 'scroll' | 'input' | 'navigation';
  target: string;
  timestamp: number;
  duration: number;
  blocked: boolean;
}

export interface PerformanceBottleneck {
  type: 'memory-leak' | 'long-task' | 'layout-thrash' | 'network-delay' | 'render-blocking';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  impact: number; // 0-100
  occurrences: number;
}

export interface PerformanceRecommendation {
  type: 'code' | 'configuration' | 'architecture' | 'infrastructure';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  implementation: string;
  estimatedImprovement: number;
  effort: 'low' | 'medium' | 'high';
}

export interface ProfileEnvironment {
  device: 'mobile' | 'tablet' | 'desktop';
  connection: 'slow-3g' | 'fast-3g' | '4g' | 'wifi';
  cpu: 'low-end' | 'mid-range' | 'high-end';
  memory: number; // GB
}

// Optimization Configuration
export interface PerformanceOptimizationConfig {
  monitoring: {
    enabled: boolean;
    sampleRate: number;
    bufferSize: number;
    reportInterval: number;
  };
  
  lazyLoading: LazyLoadingConfig;
  
  memoryOptimization: {
    enabled: boolean;
    gcThreshold: number;
    componentCacheSize: number;
    eventListenerCleanup: boolean;
    imageOptimization: boolean;
  };
  
  bundleOptimization: {
    enabled: boolean;
    treeShaking: boolean;
    codeSplitting: boolean;
    compression: boolean;
    minification: boolean;
  };
  
  runtimeOptimization: {
    enabled: boolean;
    deferNonCritical: boolean;
    virtualizeScrolling: boolean;
    memoizeComponents: boolean;
    optimizeReRenders: boolean;
  };
}

// Performance Dashboard
export interface PerformanceDashboardData {
  // Current metrics
  coreVitals: CoreWebVitals;
  memoryMetrics: MemoryMetrics;
  runtimeMetrics: RuntimeMetrics;
  
  // Historical data
  timeline: PerformanceTimelinePoint[];
  
  // Analysis
  bottlenecks: PerformanceBottleneck[];
  recommendations: PerformanceRecommendation[];
  
  // Optimization status
  optimizationStatus: OptimizationStatus;
  
  // Bundle information
  bundleAnalysis: BundleAnalysis;
  lazyLoadingStats: LazyLoadingStats;
}

export interface PerformanceTimelinePoint {
  timestamp: number;
  coreVitals: Partial<CoreWebVitals>;
  memory: Partial<MemoryMetrics>;
  runtime: Partial<RuntimeMetrics>;
}

export interface OptimizationStatus {
  memoryOptimized: boolean;
  bundleOptimized: boolean;
  lazyLoadingActive: boolean;
  imageOptimized: boolean;
  cacheOptimized: boolean;
  overallScore: number; // 0-100
}

// Hook Return Types
export interface UsePerformanceMonitoringReturn {
  // Current metrics
  coreVitals: CoreWebVitals;
  memoryMetrics: MemoryMetrics;
  runtimeMetrics: RuntimeMetrics;
  
  // Controls
  startProfiling: (name?: string) => void;
  stopProfiling: () => PerformanceProfile | null;
  clearMetrics: () => void;
  
  // Status
  isMonitoring: boolean;
  isProfiling: boolean;
}

export interface UseMemoryOptimizationReturn {
  // Memory info
  memoryMetrics: MemoryMetrics;
  memoryPressure: 'low' | 'medium' | 'high' | 'critical';
  
  // Optimization actions
  optimizeMemory: () => void;
  forceGarbageCollection: () => void;
  cleanupEventListeners: () => void;
  
  // Configuration
  setMemoryThreshold: (threshold: number) => void;
  enableAutoOptimization: (enabled: boolean) => void;
}

export interface UseLazyLoadingReturn {
  // Loading state
  loadedComponents: Set<string>;
  loadingComponents: Set<string>;
  failedComponents: Set<string>;
  
  // Statistics
  stats: LazyLoadingStats;
  
  // Controls
  preloadComponent: (componentId: string) => Promise<void>;
  preloadComponents: (componentIds: string[]) => Promise<void>;
  clearCache: () => void;
}

export interface UseBundleAnalysisReturn {
  // Analysis data
  bundleAnalysis: BundleAnalysis | null;
  isAnalyzing: boolean;
  
  // Actions
  analyzeBundles: () => Promise<void>;
  getRecommendations: () => BundleRecommendation[];
  
  // Utilities
  estimateSavings: (recommendation: BundleRecommendation) => number;
}

// Context Types
export interface PerformanceContextValue {
  // Monitoring
  isMonitoring: boolean;
  coreVitals: CoreWebVitals;
  memoryMetrics: MemoryMetrics;
  runtimeMetrics: RuntimeMetrics;
  
  // Dashboard data
  dashboardData: PerformanceDashboardData;
  
  // Controls
  startMonitoring: () => void;
  stopMonitoring: () => void;
  startProfiling: (name?: string) => void;
  stopProfiling: () => PerformanceProfile | null;
  
  // Optimization
  optimizeMemory: () => void;
  optimizeBundles: () => Promise<void>;
  applyRecommendations: (recommendations: PerformanceRecommendation[]) => Promise<void>;
  
  // Configuration
  updateConfig: (config: Partial<PerformanceOptimizationConfig>) => void;
  getConfig: () => PerformanceOptimizationConfig;
}

// Event Types
export interface PerformanceEvent {
  id: string;
  type: PerformanceEventType;
  timestamp: number;
  data: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export type PerformanceEventType =
  | 'metric-updated'
  | 'threshold-exceeded'
  | 'memory-pressure-high'
  | 'long-task-detected' 
  | 'layout-shift-occurred'
  | 'bundle-analyzed'
  | 'optimization-applied'
  | 'profiling-started'
  | 'profiling-completed'
  | 'bottleneck-detected'
  | 'recommendation-generated';

// Utility Types
export interface PerformanceBudget {
  name: string;
  resourceType: 'js' | 'css' | 'images' | 'fonts' | 'other';
  maxSize: number; // bytes
  maxCount?: number;
  warning: number; // percentage of maxSize
  error: number; // percentage of maxSize
}

export interface PerformanceReport {
  id: string;
  title: string;
  timestamp: number;
  duration: number;
  
  // Summary
  overallScore: number;
  coreVitalsScore: number;
  memoryScore: number;
  bundleScore: number;
  
  // Detailed metrics
  metrics: PerformanceMetric[];
  bottlenecks: PerformanceBottleneck[];
  recommendations: PerformanceRecommendation[];
  
  // Comparison
  baseline?: PerformanceReport;
  improvement?: number;
  
  // Metadata
  environment: ProfileEnvironment;
  configuration: PerformanceOptimizationConfig;
}

export interface PerformanceAlert {
  id: string;
  type: 'threshold-exceeded' | 'memory-leak' | 'performance-regression' | 'bundle-bloat';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric?: PerformanceMetric;
  recommendation?: string;
  timestamp: number;
  acknowledged: boolean;
}

// Component Props Types
export interface PerformanceDashboardProps {
  layout?: 'compact' | 'full' | 'monitoring';
  showRecommendations?: boolean;
  showTimeline?: boolean;
  refreshInterval?: number;
  showMemoryProfiler?: boolean;
  showBundleAnalyzer?: boolean;
  showOptimizations?: boolean;
}

export interface MemoryMonitorProps {
  showChart?: boolean;
  showBreakdown?: boolean;
  alertThreshold?: number;
}

export interface BundleAnalyzerProps {
  showTreemap?: boolean;
  showRecommendations?: boolean;
  autoAnalyze?: boolean;
}

export interface PerformanceProfilerProps {
  enabled?: boolean;
  sampleRate?: number;
  showControls?: boolean;
}

export interface MetricDisplayProps {
  name: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}

export interface LazyLoadProps {
  threshold?: number;
  rootMargin?: string;
  children?: React.ReactNode;
}

export interface OptimizationProps {
  recommendations?: PerformanceRecommendation[];
  onApply?: (recommendation: PerformanceRecommendation) => void;
}

// Storage and Persistence
export interface PerformanceStorage {
  // Store metrics
  storeMetric: (metric: PerformanceMetric) => Promise<void>;
  storeProfile: (profile: PerformanceProfile) => Promise<void>;
  storeReport: (report: PerformanceReport) => Promise<void>;
  
  // Retrieve data
  getMetrics: (timeRange?: TimeRange) => Promise<PerformanceMetric[]>;
  getProfiles: (limit?: number) => Promise<PerformanceProfile[]>;
  getReports: (limit?: number) => Promise<PerformanceReport[]>;
  
  // Cleanup
  cleanupOldData: (maxAge: number) => Promise<void>;
  clearAll: () => Promise<void>;
}

export interface TimeRange {
  start: number;
  end: number;
}

// Performance configuration
export interface PerformanceConfig {
  enableMetrics: boolean;
  enableMemoryMonitoring: boolean;
  enableBundleAnalysis: boolean;
  enableLazyLoading: boolean;
  enableOptimizationRecommendations: boolean;
  autoOptimize: boolean;
  memoryThreshold: number;
  performanceThreshold: number;
  trackingInterval: number;
  maxDataPoints: number;
  enableProfiling: boolean;
  enableTracing: boolean;
  enableReporting: boolean;
  reportingInterval: number;
}
