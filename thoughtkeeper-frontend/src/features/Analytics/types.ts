/**
 * Advanced Analytics System Types
 * Defines interfaces for productivity insights and data analytics
 */

// Core analytics data types
export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  category: AnalyticsCategory;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  duration?: number;
  metadata?: Record<string, any>;
  context: AnalyticsContext;
}

export type AnalyticsEventType =
  | 'user_action'
  | 'performance'
  | 'error'
  | 'feature_usage'
  | 'productivity'
  | 'navigation'
  | 'search'
  | 'export_import'
  | 'collaboration'
  | 'system';

export type AnalyticsCategory =
  | 'tasks'
  | 'notebooks'
  | 'search'
  | 'ui_interaction'
  | 'performance'
  | 'errors'
  | 'productivity'
  | 'features'
  | 'system';

export interface AnalyticsContext {
  page: string;
  route: string;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  feature?: string;
  taskCount?: number;
  notebookCount?: number;
  selectedItems?: string[];
}

// Productivity metrics
export interface ProductivityMetrics {
  tasksCreated: number;
  tasksCompleted: number;
  tasksDeleted: number;
  notebooksCreated: number;
  notebooksViewed: number;
  searchQueries: number;
  timeSpent: number; // in minutes
  activeTime: number; // in minutes
  idleTime: number; // in minutes
  featuresUsed: string[];
  shortcutsUsed: number;
  dragDropOperations: number;
  bulkOperations: number;
  exportOperations: number;
  importOperations: number;
  period: TimePeriod;
  date: Date;
}

export interface TimePeriod {
  type: 'day' | 'week' | 'month' | 'year';
  start: Date;
  end: Date;
  label: string;
}

// Performance metrics
export interface PerformanceMetrics {
  pageLoadTime: number;
  renderTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  domNodes: number;
  virtualScrollPerformance: {
    itemsRendered: number;
    scrollFps: number;
    renderTime: number;
  };
  searchPerformance: {
    queryTime: number;
    resultsCount: number;
    indexSize: number;
  };
  timestamp: Date;
  page: string;
}

// Feature usage analytics
export interface FeatureUsageMetrics {
  feature: string;
  usageCount: number;
  totalTime: number;
  averageSessionTime: number;
  uniqueUsers: number;
  errorRate: number;
  completionRate: number;
  retentionRate: number;
  satisfactionScore?: number;
  lastUsed: Date;
  period: TimePeriod;
}

// User behavior patterns
export interface UserBehaviorPattern {
  id: string;
  pattern: BehaviorPatternType;
  confidence: number; // 0-1
  frequency: number;
  timeOfDay: number[]; // Hours when pattern occurs
  duration: number; // Average duration in minutes
  triggers: string[];
  outcomes: string[];
  insights: string[];
  recommendations: string[];
  firstSeen: Date;
  lastSeen: Date;
}

export type BehaviorPatternType =
  | 'high_productivity'
  | 'task_batching'
  | 'notebook_organizing'
  | 'search_heavy'
  | 'keyboard_power_user'
  | 'drag_drop_preferred'
  | 'bulk_operations'
  | 'morning_planner'
  | 'evening_reviewer'
  | 'weekend_organizer'
  | 'feature_explorer'
  | 'efficiency_focused';

// Analytics insights and recommendations
export interface AnalyticsInsight {
  id: string;
  type: InsightType;
  category: InsightCategory;
  title: string;
  description: string;
  impact: InsightImpact;
  confidence: number; // 0-1
  actionable: boolean;
  recommendations: InsightRecommendation[];
  dataPoints: InsightDataPoint[];
  visualizationType?: VisualizationType;
  trend: TrendDirection;
  createdAt: Date;
  relevantPeriod: TimePeriod;
  dismissed?: boolean;
  implemented?: boolean;
}

export type InsightType =
  | 'productivity'
  | 'efficiency'
  | 'usage_pattern'
  | 'feature_opportunity'
  | 'performance'
  | 'optimization'
  | 'trend'
  | 'goal_progress'
  | 'comparison';

export type InsightCategory =
  | 'task_management'
  | 'time_management'
  | 'feature_usage'
  | 'workflow_optimization'
  | 'goal_achievement'
  | 'habit_formation'
  | 'performance_improvement';

export type InsightImpact = 'high' | 'medium' | 'low';
export type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'volatile';

export interface InsightRecommendation {
  id: string;
  title: string;
  description: string;
  actionType: RecommendationActionType;
  priority: number;
  estimatedImpact: string;
  implementation: string;
  learnMoreUrl?: string;
}

export type RecommendationActionType =
  | 'enable_feature'
  | 'change_workflow'
  | 'set_goal'
  | 'use_shortcut'
  | 'organize_data'
  | 'optimize_performance'
  | 'explore_feature';

export interface InsightDataPoint {
  label: string;
  value: number;
  context?: string;
  timestamp?: Date;
}

// Dashboard configuration
export interface AnalyticsDashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  filters: DashboardFilters;
  autoRefresh: boolean;
  refreshInterval?: number; // in seconds
  isDefault: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  position: WidgetPosition;
  size: WidgetSize;
  config: WidgetConfig;
  dataSource: DataSourceConfig;
  visualization: VisualizationConfig;
  visible: boolean;
  refreshable: boolean;
  exportable: boolean;
}

export type WidgetType =
  | 'metric'
  | 'chart'
  | 'table'
  | 'insight'
  | 'progress'
  | 'heatmap'
  | 'timeline'
  | 'comparison'
  | 'goal_tracking'
  | 'leaderboard';

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WidgetSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface WidgetConfig {
  showTitle: boolean;
  showDescription: boolean;
  allowFullscreen: boolean;
  allowExport: boolean;
  allowRefresh: boolean;
  theme?: 'light' | 'dark' | 'auto';
  colors?: string[];
  animation?: boolean;
  interactivity?: boolean;
}

export interface DataSourceConfig {
  type: DataSourceType;
  timeRange: TimeRangeConfig;
  filters: Record<string, any>;
  aggregation?: AggregationType;
  groupBy?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

export type DataSourceType =
  | 'events'
  | 'metrics'
  | 'insights'
  | 'patterns'
  | 'performance'
  | 'goals'
  | 'features'
  | 'custom';

export interface TimeRangeConfig {
  type: 'relative' | 'absolute';
  relative?: {
    amount: number;
    unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
  };
  absolute?: {
    start: Date;
    end: Date;
  };
  timezone?: string;
}

export type AggregationType =
  | 'sum'
  | 'count'
  | 'average'
  | 'min'
  | 'max'
  | 'median'
  | 'percentile'
  | 'distinct'
  | 'first'
  | 'last';

export interface VisualizationConfig {
  type: VisualizationType;
  options: Record<string, any>;
  axes?: AxisConfig[];
  legend?: LegendConfig;
  tooltip?: TooltipConfig;
  animations?: AnimationConfig;
}

export type VisualizationType =
  | 'line_chart'
  | 'bar_chart'
  | 'pie_chart'
  | 'donut_chart'
  | 'area_chart'
  | 'scatter_plot'
  | 'heatmap'
  | 'treemap'
  | 'gauge'
  | 'progress_bar'
  | 'number_display'
  | 'table'
  | 'timeline'
  | 'calendar'
  | 'word_cloud';

export interface AxisConfig {
  type: 'x' | 'y' | 'z';
  label: string;
  scale: 'linear' | 'logarithmic' | 'time' | 'category';
  min?: number;
  max?: number;
  format?: string;
  gridLines?: boolean;
}

export interface LegendConfig {
  show: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
}

export interface TooltipConfig {
  show: boolean;
  format?: string;
  multiline?: boolean;
  backgroundColor?: string;
  borderColor?: string;
}

export interface AnimationConfig {
  enabled: boolean;
  duration: number;
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  delay?: number;
}

export interface DashboardLayout {
  type: 'grid' | 'flex' | 'custom';
  columns: number;
  rowHeight: number;
  gap: number;
  responsive: boolean;
  breakpoints?: Record<string, number>;
}

export interface DashboardFilters {
  timeRange: TimeRangeConfig;
  categories: AnalyticsCategory[];
  features: string[];
  customFilters: Record<string, any>;
}

// Goals and tracking
export interface ProductivityGoal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  metric: GoalMetric;
  target: number;
  current: number;
  progress: number; // 0-100
  unit: string;
  timeframe: TimePeriod;
  priority: GoalPriority;
  status: GoalStatus;
  milestones: GoalMilestone[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  archivedAt?: Date;
}

export type GoalCategory =
  | 'productivity'
  | 'efficiency'
  | 'learning'
  | 'organization'
  | 'collaboration'
  | 'personal'
  | 'team'
  | 'system';

export type GoalMetric =
  | 'tasks_completed'
  | 'tasks_created'
  | 'notebooks_organized'
  | 'time_saved'
  | 'shortcuts_used'
  | 'features_explored'
  | 'consistency_days'
  | 'efficiency_score'
  | 'custom';

export type GoalPriority = 'high' | 'medium' | 'low';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'failed' | 'archived';

export interface GoalMilestone {
  id: string;
  title: string;
  target: number;
  completed: boolean;
  completedAt?: Date;
}

// Analytics configuration and settings
export interface AnalyticsConfig {
  enabled: boolean;
  trackingLevel: TrackingLevel;
  dataRetention: DataRetentionConfig;
  privacy: PrivacyConfig;
  performance: PerformanceConfig;
  insights: InsightsConfig;
  goals: GoalsConfig;
  dashboard: DashboardConfig;
  export: ExportConfig;
}

export type TrackingLevel = 'minimal' | 'standard' | 'detailed' | 'comprehensive';

export interface DataRetentionConfig {
  events: number; // days
  metrics: number; // days
  insights: number; // days
  performance: number; // days
  autoCleanup: boolean;
  cleanupInterval: number; // days
}

export interface PrivacyConfig {
  anonymizeData: boolean;
  excludePII: boolean;
  consentRequired: boolean;
  allowExport: boolean;
  allowSharing: boolean;
  encryptData: boolean;
}

export interface PerformanceConfig {
  batchSize: number;
  flushInterval: number; // milliseconds
  maxQueueSize: number;
  enableCompression: boolean;
  enableCaching: boolean;
  cacheSize: number;
}

export interface InsightsConfig {
  enabled: boolean;
  autoGenerate: boolean;
  generationInterval: number; // hours
  minConfidence: number; // 0-1
  maxInsights: number;
  categories: InsightCategory[];
}

export interface GoalsConfig {
  enabled: boolean;
  defaultTimeframe: 'week' | 'month' | 'quarter' | 'year';
  autoTracking: boolean;
  notifications: boolean;
  maxActiveGoals: number;
}

export interface DashboardConfig {
  defaultLayout: 'grid' | 'flex';
  autoRefresh: boolean;
  refreshInterval: number; // seconds
  maxWidgets: number;
  allowCustomization: boolean;
  allowSharing: boolean;
}

export interface ExportConfig {
  formats: ExportFormat[];
  maxFileSize: number; // bytes
  includeCharts: boolean;
  includeInsights: boolean;
  includeRawData: boolean;
}

export type ExportFormat = 'json' | 'csv' | 'xlsx' | 'pdf' | 'png' | 'svg';

// Analytics service interfaces
export interface AnalyticsEngine {
  // Event tracking
  track: (event: Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'>) => void;
  trackPageView: (page: string, additionalData?: Record<string, any>) => void;
  trackUserAction: (action: string, category: AnalyticsCategory, label?: string, value?: number) => void;
  trackFeatureUsage: (feature: string, action: string, duration?: number) => void;
  trackPerformance: (metrics: Omit<PerformanceMetrics, 'timestamp'>) => void;
  trackError: (error: Error, context?: Record<string, any>) => void;

  // Data retrieval
  getEvents: (filters: EventFilters) => Promise<AnalyticsEvent[]>;
  getMetrics: (filters: MetricFilters) => Promise<ProductivityMetrics[]>;
  getInsights: (filters: InsightFilters) => Promise<AnalyticsInsight[]>;
  getPatterns: (filters: PatternFilters) => Promise<UserBehaviorPattern[]>;
  getGoals: (filters: GoalFilters) => Promise<ProductivityGoal[]>;

  // Analysis
  generateInsights: (timeRange: TimePeriod) => Promise<AnalyticsInsight[]>;
  detectPatterns: (events: AnalyticsEvent[]) => Promise<UserBehaviorPattern[]>;
  calculateMetrics: (events: AnalyticsEvent[], period: TimePeriod) => Promise<ProductivityMetrics>;
  predictTrends: (metrics: ProductivityMetrics[], horizon: number) => Promise<TrendPrediction[]>;

  // Configuration
  updateConfig: (config: Partial<AnalyticsConfig>) => void;
  getConfig: () => AnalyticsConfig;
  
  // Data management
  exportData: (format: ExportFormat, filters?: any) => Promise<Blob>;
  importData: (data: any) => Promise<void>;
  clearData: (olderThan?: Date) => Promise<void>;
  
  // Session management
  startSession: () => string;
  endSession: () => void;
  getSessionId: () => string;
}

export interface EventFilters {
  types?: AnalyticsEventType[];
  categories?: AnalyticsCategory[];
  timeRange: TimeRangeConfig;
  userId?: string;
  sessionId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface MetricFilters {
  periods: TimePeriod[];
  categories?: AnalyticsCategory[];
  features?: string[];
  aggregation?: AggregationType;
}

export interface InsightFilters {
  types?: InsightType[];
  categories?: InsightCategory[];
  minConfidence?: number;
  dismissed?: boolean;
  implemented?: boolean;
  timeRange?: TimeRangeConfig;
}

export interface PatternFilters {
  types?: BehaviorPatternType[];
  minConfidence?: number;
  minFrequency?: number;
  timeRange?: TimeRangeConfig;
}

export interface GoalFilters {
  status?: GoalStatus[];
  categories?: GoalCategory[];
  priorities?: GoalPriority[];
  timeRange?: TimeRangeConfig;
}

export interface TrendPrediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  trend: TrendDirection;
  factors: string[];
  horizon: number; // days
}

// Hook interfaces
export interface UseAnalytics {
  // Tracking
  track: AnalyticsEngine['track'];
  trackPageView: AnalyticsEngine['trackPageView'];
  trackUserAction: AnalyticsEngine['trackUserAction'];
  trackFeatureUsage: AnalyticsEngine['trackFeatureUsage'];
  trackPerformance: AnalyticsEngine['trackPerformance'];
  trackError: AnalyticsEngine['trackError'];

  // Data
  events: AnalyticsEvent[];
  metrics: ProductivityMetrics[];
  insights: AnalyticsInsight[];
  patterns: UserBehaviorPattern[];
  goals: ProductivityGoal[];

  // Loading states
  loading: {
    events: boolean;
    metrics: boolean;
    insights: boolean;
    patterns: boolean;
    goals: boolean;
  };

  // Actions
  refreshData: () => Promise<void>;
  generateInsights: () => Promise<void>;
  exportData: (format: ExportFormat) => Promise<Blob>;
  
  // Configuration
  config: AnalyticsConfig;
  updateConfig: (config: Partial<AnalyticsConfig>) => void;
}

// Component interfaces
export interface AnalyticsDashboardProps {
  dashboard?: AnalyticsDashboard;
  editable?: boolean;
  onDashboardChange?: (dashboard: AnalyticsDashboard) => void;
  fullscreen?: boolean;
}

export interface DashboardWidgetProps {
  widget: DashboardWidget;
  data?: any;
  loading?: boolean;
  error?: string;
  onWidgetChange?: (widget: DashboardWidget) => void;
  onRemove?: () => void;
  editable?: boolean;
}

export interface ChartComponentProps {
  type: VisualizationType;
  data: any;
  config: VisualizationConfig;
  width?: number;
  height?: number;
  responsive?: boolean;
  onDataPointClick?: (point: any) => void;
  onSelectionChange?: (selection: any) => void;
}

export interface InsightCardProps {
  insight: AnalyticsInsight;
  onDismiss?: () => void;
  onImplement?: () => void;
  onLearnMore?: () => void;
  compact?: boolean;
}

export interface GoalTrackerProps {
  goal: ProductivityGoal;
  onGoalUpdate?: (goal: ProductivityGoal) => void;
  showProgress?: boolean;
  showMilestones?: boolean;
}

export interface MetricDisplayProps {
  label: string;
  value: number | string;
  unit?: string;
  trend?: {
    direction: TrendDirection;
    percentage: number;
  };
  comparison?: {
    period: string;
    value: number;
  };
  format?: 'number' | 'percentage' | 'duration' | 'currency';
}

// Error types
export class AnalyticsError extends Error {
  constructor(
    message: string,
    public code: string,
    public category?: AnalyticsCategory,
    public context?: any
  ) {
    super(message);
    this.name = 'AnalyticsError';
  }
}

export class DataProcessingError extends AnalyticsError {
  constructor(message: string, public dataType: string, public details?: any) {
    super(message, 'DATA_PROCESSING_ERROR', 'system', details);
    this.name = 'DataProcessingError';
  }
}

export class InsightGenerationError extends AnalyticsError {
  constructor(message: string, public insightType: InsightType, public details?: any) {
    super(message, 'INSIGHT_GENERATION_ERROR', 'productivity', details);
    this.name = 'InsightGenerationError';
  }
}

// Utility types
export type AnalyticsEventHandler<T = any> = (event: AnalyticsEvent, data?: T) => void | Promise<void>;
export type MetricCalculator = (events: AnalyticsEvent[]) => number;
export type InsightGenerator = (data: any) => AnalyticsInsight | null;
export type PatternDetector = (events: AnalyticsEvent[]) => UserBehaviorPattern[];

export interface AnalyticsMiddleware {
  name: string;
  beforeTrack?: (event: AnalyticsEvent) => AnalyticsEvent | null;
  afterTrack?: (event: AnalyticsEvent) => void;
  beforeExport?: (data: any) => any;
  afterImport?: (data: any) => void;
}

export interface AnalyticsPlugin {
  name: string;
  version: string;
  initialize: (engine: AnalyticsEngine) => void;
  destroy?: () => void;
  middleware?: AnalyticsMiddleware[];
  insights?: InsightGenerator[];
  patterns?: PatternDetector[];
  widgets?: WidgetType[];
}

// Storage interfaces
export interface AnalyticsStorage {
  saveEvent: (event: AnalyticsEvent) => Promise<void>;
  saveEvents: (events: AnalyticsEvent[]) => Promise<void>;
  getEvents: (filters: EventFilters) => Promise<AnalyticsEvent[]>;
  deleteEvents: (filters: EventFilters) => Promise<number>;
  
  saveMetrics: (metrics: ProductivityMetrics) => Promise<void>;
  getMetrics: (filters: MetricFilters) => Promise<ProductivityMetrics[]>;
  
  saveInsight: (insight: AnalyticsInsight) => Promise<void>;
  getInsights: (filters: InsightFilters) => Promise<AnalyticsInsight[]>;
  updateInsight: (id: string, updates: Partial<AnalyticsInsight>) => Promise<void>;
  
  savePattern: (pattern: UserBehaviorPattern) => Promise<void>;
  getPatterns: (filters: PatternFilters) => Promise<UserBehaviorPattern[]>;
  
  saveGoal: (goal: ProductivityGoal) => Promise<void>;
  getGoals: (filters: GoalFilters) => Promise<ProductivityGoal[]>;
  updateGoal: (id: string, updates: Partial<ProductivityGoal>) => Promise<void>;
  
  getStorageInfo: () => Promise<{ used: number; available: number; }>;
  cleanup: (olderThan: Date) => Promise<number>;
}

// Context interface
export interface AnalyticsContext {
  engine: AnalyticsEngine;
  config: AnalyticsConfig;
  
  // Data
  events: AnalyticsEvent[];
  metrics: ProductivityMetrics[];
  insights: AnalyticsInsight[];
  patterns: UserBehaviorPattern[];
  goals: ProductivityGoal[];
  
  // Loading states
  loading: {
    events: boolean;
    metrics: boolean;
    insights: boolean;
    patterns: boolean;
    goals: boolean;
  };
  
  // Actions
  track: AnalyticsEngine['track'];
  refreshData: () => Promise<void>;
  generateInsights: () => Promise<void>;
  exportData: (format: ExportFormat) => Promise<Blob>;
  updateConfig: (config: Partial<AnalyticsConfig>) => void;
  
  // Goals
  createGoal: (goal: Omit<ProductivityGoal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<ProductivityGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  // Insights
  dismissInsight: (id: string) => Promise<void>;
  implementInsight: (id: string) => Promise<void>;
  
  // Dashboard
  dashboards: AnalyticsDashboard[];
  activeDashboard: AnalyticsDashboard | null;
  setActiveDashboard: (dashboard: AnalyticsDashboard) => void;
  createDashboard: (dashboard: Omit<AnalyticsDashboard, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDashboard: (id: string, updates: Partial<AnalyticsDashboard>) => Promise<void>;
  deleteDashboard: (id: string) => Promise<void>;
}
