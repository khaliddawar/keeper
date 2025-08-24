import type {
  AnalyticsEngine as IAnalyticsEngine,
  AnalyticsEvent,
  AnalyticsConfig,
  AnalyticsEventType,
  AnalyticsCategory,
  ProductivityMetrics,
  TimePeriod,
  PerformanceMetrics,
  AnalyticsInsight,
  UserBehaviorPattern,
  ProductivityGoal,
  EventFilters,
  MetricFilters,
  InsightFilters,
  PatternFilters,
  GoalFilters,
  TrendPrediction,
  ExportFormat,
  AnalyticsStorage,
  AnalyticsMiddleware,
  BehaviorPatternType,
  InsightType,
  TrendDirection,
  TrackingLevel,
  InsightImpact
} from './types';

/**
 * Advanced Analytics Engine
 * Core engine for collecting, processing, and analyzing user behavior and productivity data
 */
export class AnalyticsEngine implements IAnalyticsEngine {
  private config: AnalyticsConfig;
  private storage: AnalyticsStorage;
  private sessionId: string;
  private eventQueue: AnalyticsEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private middleware: AnalyticsMiddleware[] = [];
  private isInitialized = false;
  
  private performanceObserver: PerformanceObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private activityTracker: ActivityTracker;

  constructor(storage: AnalyticsStorage, config?: Partial<AnalyticsConfig>) {
    this.storage = storage;
    this.config = this.createDefaultConfig(config);
    this.sessionId = this.generateSessionId();
    this.activityTracker = new ActivityTracker();
    this.initialize();
  }

  /**
   * Initialize the analytics engine
   */
  private async initialize(): Promise<void> {
    if (!this.config.enabled || this.isInitialized) return;

    try {
      // Initialize performance monitoring
      if (this.config.trackingLevel !== 'minimal') {
        this.initializePerformanceMonitoring();
      }

      // Initialize activity tracking
      this.activityTracker.start();

      // Setup flush timer
      this.setupFlushTimer();

      // Load existing data for pattern detection
      await this.loadInitialData();

      this.isInitialized = true;
      console.log('📊 Analytics Engine initialized');
    } catch (error) {
      console.error('Failed to initialize Analytics Engine:', error);
    }
  }

  /**
   * Track a generic analytics event
   */
  track(event: Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'>): void {
    if (!this.config.enabled) return;

    const fullEvent: AnalyticsEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      sessionId: this.sessionId,
      ...event
    };

    // Apply middleware
    let processedEvent = fullEvent;
    for (const middleware of this.middleware) {
      if (middleware.beforeTrack) {
        const result = middleware.beforeTrack(processedEvent);
        if (result === null) return; // Event filtered out
        processedEvent = result;
      }
    }

    // Add to queue
    this.eventQueue.push(processedEvent);

    // Auto-flush if queue is full
    if (this.eventQueue.length >= this.config.performance.maxQueueSize) {
      this.flush();
    }

    // Apply after-track middleware
    for (const middleware of this.middleware) {
      if (middleware.afterTrack) {
        middleware.afterTrack(processedEvent);
      }
    }
  }

  /**
   * Track page view
   */
  trackPageView(page: string, additionalData?: Record<string, any>): void {
    this.track({
      type: 'navigation',
      category: 'ui_interaction',
      action: 'page_view',
      label: page,
      context: {
        page,
        route: window.location.pathname,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        ...additionalData
      }
    });
  }

  /**
   * Track user action
   */
  trackUserAction(action: string, category: AnalyticsCategory, label?: string, value?: number): void {
    this.track({
      type: 'user_action',
      category,
      action,
      label,
      value,
      context: this.getCurrentContext()
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(feature: string, action: string, duration?: number): void {
    this.track({
      type: 'feature_usage',
      category: 'features',
      action,
      label: feature,
      duration,
      context: {
        ...this.getCurrentContext(),
        feature
      }
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metrics: Omit<PerformanceMetrics, 'timestamp'>): void {
    this.track({
      type: 'performance',
      category: 'performance',
      action: 'performance_measurement',
      metadata: {
        ...metrics,
        timestamp: new Date()
      },
      context: this.getCurrentContext()
    });
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, any>): void {
    this.track({
      type: 'error',
      category: 'errors',
      action: 'error_occurred',
      label: error.name,
      metadata: {
        message: error.message,
        stack: error.stack,
        ...context
      },
      context: this.getCurrentContext()
    });
  }

  /**
   * Get analytics events
   */
  async getEvents(filters: EventFilters): Promise<AnalyticsEvent[]> {
    try {
      return await this.storage.getEvents(filters);
    } catch (error) {
      console.error('Failed to get events:', error);
      return [];
    }
  }

  /**
   * Get productivity metrics
   */
  async getMetrics(filters: MetricFilters): Promise<ProductivityMetrics[]> {
    try {
      return await this.storage.getMetrics(filters);
    } catch (error) {
      console.error('Failed to get metrics:', error);
      return [];
    }
  }

  /**
   * Get insights
   */
  async getInsights(filters: InsightFilters): Promise<AnalyticsInsight[]> {
    try {
      return await this.storage.getInsights(filters);
    } catch (error) {
      console.error('Failed to get insights:', error);
      return [];
    }
  }

  /**
   * Get behavior patterns
   */
  async getPatterns(filters: PatternFilters): Promise<UserBehaviorPattern[]> {
    try {
      return await this.storage.getPatterns(filters);
    } catch (error) {
      console.error('Failed to get patterns:', error);
      return [];
    }
  }

  /**
   * Get goals
   */
  async getGoals(filters: GoalFilters): Promise<ProductivityGoal[]> {
    try {
      return await this.storage.getGoals(filters);
    } catch (error) {
      console.error('Failed to get goals:', error);
      return [];
    }
  }

  /**
   * Generate insights from data
   */
  async generateInsights(timeRange: TimePeriod): Promise<AnalyticsInsight[]> {
    try {
      const events = await this.getEvents({
        timeRange: {
          type: 'absolute',
          absolute: {
            start: timeRange.start,
            end: timeRange.end
          }
        }
      });

      const metrics = await this.calculateMetrics(events, timeRange);
      const insights: AnalyticsInsight[] = [];

      // Generate productivity insights
      insights.push(...this.generateProductivityInsights(events, metrics, timeRange));

      // Generate efficiency insights
      insights.push(...this.generateEfficiencyInsights(events, metrics, timeRange));

      // Generate feature usage insights
      insights.push(...this.generateFeatureUsageInsights(events, timeRange));

      // Generate trend insights
      insights.push(...await this.generateTrendInsights(metrics, timeRange));

      // Save insights to storage
      for (const insight of insights) {
        await this.storage.saveInsight(insight);
      }

      return insights.filter(insight => insight.confidence >= this.config.insights.minConfidence);
    } catch (error) {
      console.error('Failed to generate insights:', error);
      return [];
    }
  }

  /**
   * Detect user behavior patterns
   */
  async detectPatterns(events: AnalyticsEvent[]): Promise<UserBehaviorPattern[]> {
    const patterns: UserBehaviorPattern[] = [];

    try {
      // Detect high productivity patterns
      patterns.push(...this.detectHighProductivityPatterns(events));

      // Detect task batching patterns
      patterns.push(...this.detectTaskBatchingPatterns(events));

      // Detect time-based patterns
      patterns.push(...this.detectTimeBasedPatterns(events));

      // Detect feature usage patterns
      patterns.push(...this.detectFeatureUsagePatterns(events));

      // Detect keyboard shortcut patterns
      patterns.push(...this.detectKeyboardShortcutPatterns(events));

      // Save patterns to storage
      for (const pattern of patterns) {
        await this.storage.savePattern(pattern);
      }

      return patterns;
    } catch (error) {
      console.error('Failed to detect patterns:', error);
      return [];
    }
  }

  /**
   * Calculate productivity metrics from events
   */
  async calculateMetrics(events: AnalyticsEvent[], period: TimePeriod): Promise<ProductivityMetrics> {
    const taskEvents = events.filter(e => e.category === 'tasks');
    const notebookEvents = events.filter(e => e.category === 'notebooks');
    const searchEvents = events.filter(e => e.category === 'search');
    const featureEvents = events.filter(e => e.type === 'feature_usage');

    const metrics: ProductivityMetrics = {
      tasksCreated: taskEvents.filter(e => e.action === 'create').length,
      tasksCompleted: taskEvents.filter(e => e.action === 'complete').length,
      tasksDeleted: taskEvents.filter(e => e.action === 'delete').length,
      notebooksCreated: notebookEvents.filter(e => e.action === 'create').length,
      notebooksViewed: notebookEvents.filter(e => e.action === 'view').length,
      searchQueries: searchEvents.filter(e => e.action === 'search').length,
      timeSpent: this.calculateTimeSpent(events),
      activeTime: this.calculateActiveTime(events),
      idleTime: this.calculateIdleTime(events),
      featuresUsed: [...new Set(featureEvents.map(e => e.label).filter(Boolean))],
      shortcutsUsed: events.filter(e => e.action === 'shortcut_used').length,
      dragDropOperations: events.filter(e => e.action === 'drag_drop').length,
      bulkOperations: events.filter(e => e.action === 'bulk_operation').length,
      exportOperations: events.filter(e => e.action === 'export').length,
      importOperations: events.filter(e => e.action === 'import').length,
      period,
      date: new Date()
    };

    // Save metrics to storage
    await this.storage.saveMetrics(metrics);

    return metrics;
  }

  /**
   * Predict trends based on historical data
   */
  async predictTrends(metrics: ProductivityMetrics[], horizon: number): Promise<TrendPrediction[]> {
    const predictions: TrendPrediction[] = [];

    try {
      // Tasks completed trend
      const tasksCompletedTrend = this.calculateTrend(
        metrics.map(m => m.tasksCompleted),
        'tasks_completed'
      );
      predictions.push({
        metric: 'tasks_completed',
        currentValue: metrics[metrics.length - 1]?.tasksCompleted || 0,
        predictedValue: this.predictValue(metrics.map(m => m.tasksCompleted), horizon),
        confidence: tasksCompletedTrend.confidence,
        trend: tasksCompletedTrend.direction,
        factors: ['Historical completion rate', 'Time of year', 'Recent activity'],
        horizon
      });

      // Time spent trend
      const timeSpentTrend = this.calculateTrend(
        metrics.map(m => m.timeSpent),
        'time_spent'
      );
      predictions.push({
        metric: 'time_spent',
        currentValue: metrics[metrics.length - 1]?.timeSpent || 0,
        predictedValue: this.predictValue(metrics.map(m => m.timeSpent), horizon),
        confidence: timeSpentTrend.confidence,
        trend: timeSpentTrend.direction,
        factors: ['Usage patterns', 'Feature adoption', 'Productivity habits'],
        horizon
      });

      // Features used trend
      const featuresUsedTrend = this.calculateTrend(
        metrics.map(m => m.featuresUsed.length),
        'features_used'
      );
      predictions.push({
        metric: 'features_used',
        currentValue: metrics[metrics.length - 1]?.featuresUsed.length || 0,
        predictedValue: this.predictValue(metrics.map(m => m.featuresUsed.length), horizon),
        confidence: featuresUsedTrend.confidence,
        trend: featuresUsedTrend.direction,
        factors: ['Feature discovery', 'Learning curve', 'Workflow evolution'],
        horizon
      });

    } catch (error) {
      console.error('Failed to predict trends:', error);
    }

    return predictions;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Restart flush timer if interval changed
    if (config.performance?.flushInterval) {
      this.setupFlushTimer();
    }

    // Restart performance monitoring if tracking level changed
    if (config.trackingLevel) {
      this.initializePerformanceMonitoring();
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  /**
   * Export analytics data
   */
  async exportData(format: ExportFormat, filters?: any): Promise<Blob> {
    try {
      const events = await this.getEvents(filters || { timeRange: { type: 'relative', relative: { amount: 30, unit: 'days' } } });
      const metrics = await this.getMetrics({ periods: [this.getLastMonthPeriod()] });
      const insights = await this.getInsights({ timeRange: { type: 'relative', relative: { amount: 30, unit: 'days' } } });

      const exportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        events,
        metrics,
        insights,
        config: this.config
      };

      switch (format) {
        case 'json':
          return new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        case 'csv':
          return this.exportToCSV(exportData);
        case 'xlsx':
          return this.exportToExcel(exportData);
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  /**
   * Import analytics data
   */
  async importData(data: any): Promise<void> {
    try {
      if (data.events) {
        for (const event of data.events) {
          await this.storage.saveEvent(event);
        }
      }

      if (data.metrics) {
        for (const metrics of data.metrics) {
          await this.storage.saveMetrics(metrics);
        }
      }

      if (data.insights) {
        for (const insight of data.insights) {
          await this.storage.saveInsight(insight);
        }
      }

      console.log('Analytics data imported successfully');
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }

  /**
   * Clear old data
   */
  async clearData(olderThan?: Date): Promise<void> {
    try {
      const cutoffDate = olderThan || new Date(Date.now() - (this.config.dataRetention.events * 24 * 60 * 60 * 1000));
      await this.storage.cleanup(cutoffDate);
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw error;
    }
  }

  /**
   * Start new session
   */
  startSession(): string {
    this.sessionId = this.generateSessionId();
    this.trackUserAction('session_start', 'system');
    return this.sessionId;
  }

  /**
   * End current session
   */
  endSession(): void {
    this.trackUserAction('session_end', 'system');
    this.flush();
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Add middleware
   */
  addMiddleware(middleware: AnalyticsMiddleware): void {
    this.middleware.push(middleware);
  }

  /**
   * Remove middleware
   */
  removeMiddleware(name: string): void {
    this.middleware = this.middleware.filter(m => m.name !== name);
  }

  /**
   * Private helper methods
   */
  private createDefaultConfig(overrides?: Partial<AnalyticsConfig>): AnalyticsConfig {
    return {
      enabled: true,
      trackingLevel: 'standard',
      dataRetention: {
        events: 90,
        metrics: 365,
        insights: 180,
        performance: 30,
        autoCleanup: true,
        cleanupInterval: 7
      },
      privacy: {
        anonymizeData: false,
        excludePII: true,
        consentRequired: false,
        allowExport: true,
        allowSharing: false,
        encryptData: false
      },
      performance: {
        batchSize: 50,
        flushInterval: 5000,
        maxQueueSize: 100,
        enableCompression: false,
        enableCaching: true,
        cacheSize: 1000
      },
      insights: {
        enabled: true,
        autoGenerate: true,
        generationInterval: 24,
        minConfidence: 0.7,
        maxInsights: 10,
        categories: ['task_management', 'time_management', 'feature_usage', 'workflow_optimization']
      },
      goals: {
        enabled: true,
        defaultTimeframe: 'month',
        autoTracking: true,
        notifications: true,
        maxActiveGoals: 5
      },
      dashboard: {
        defaultLayout: 'grid',
        autoRefresh: true,
        refreshInterval: 60,
        maxWidgets: 12,
        allowCustomization: true,
        allowSharing: false
      },
      export: {
        formats: ['json', 'csv', 'xlsx'],
        maxFileSize: 10 * 1024 * 1024,
        includeCharts: true,
        includeInsights: true,
        includeRawData: false
      },
      ...overrides
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentContext() {
    return {
      page: document.title,
      route: window.location.pathname,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  }

  private setupFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.performance.flushInterval);
  }

  private async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    try {
      const events = [...this.eventQueue];
      this.eventQueue = [];

      await this.storage.saveEvents(events);
      
      if (this.config.performance.enableLogging) {
        console.log(`📊 Flushed ${events.length} analytics events`);
      }
    } catch (error) {
      console.error('Failed to flush events:', error);
      // Re-add events to queue on failure
      this.eventQueue.unshift(...this.eventQueue);
    }
  }

  private initializePerformanceMonitoring(): void {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.trackPerformance({
              pageLoadTime: entry.duration,
              renderTime: (entry as PerformanceNavigationTiming).domContentLoadedEventEnd - entry.startTime,
              apiResponseTime: 0,
              memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
              domNodes: document.querySelectorAll('*').length,
              virtualScrollPerformance: {
                itemsRendered: 0,
                scrollFps: 0,
                renderTime: 0
              },
              searchPerformance: {
                queryTime: 0,
                resultsCount: 0,
                indexSize: 0
              },
              page: window.location.pathname
            });
          }
        }
      });

      this.performanceObserver.observe({ entryTypes: ['navigation', 'measure', 'mark'] });
    } catch (error) {
      console.warn('Performance monitoring not available:', error);
    }
  }

  private async loadInitialData(): Promise<void> {
    // Load recent events for pattern detection
    const recentEvents = await this.getEvents({
      timeRange: {
        type: 'relative',
        relative: { amount: 7, unit: 'days' }
      },
      limit: 1000
    });

    if (recentEvents.length > 0) {
      // Detect patterns in background
      setTimeout(() => {
        this.detectPatterns(recentEvents);
      }, 1000);
    }
  }

  // Insight generation methods
  private generateProductivityInsights(events: AnalyticsEvent[], metrics: ProductivityMetrics, timeRange: TimePeriod): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];

    // Task completion rate insight
    const completionRate = metrics.tasksCompleted / Math.max(metrics.tasksCreated, 1);
    if (completionRate > 0.8) {
      insights.push({
        id: `productivity_${Date.now()}_completion`,
        type: 'productivity',
        category: 'task_management',
        title: 'High Task Completion Rate',
        description: `You've completed ${Math.round(completionRate * 100)}% of tasks created in ${timeRange.label}. Great job staying on top of your work!`,
        impact: 'high',
        confidence: 0.9,
        actionable: true,
        recommendations: [{
          id: 'maintain_momentum',
          title: 'Maintain Momentum',
          description: 'Keep up the excellent completion rate by continuing your current workflow',
          actionType: 'maintain_workflow',
          priority: 1,
          estimatedImpact: 'High productivity maintenance',
          implementation: 'Continue current task management practices'
        }],
        dataPoints: [
          { label: 'Completion Rate', value: completionRate * 100 },
          { label: 'Tasks Created', value: metrics.tasksCreated },
          { label: 'Tasks Completed', value: metrics.tasksCompleted }
        ],
        visualizationType: 'gauge',
        trend: completionRate > 0.9 ? 'increasing' : 'stable',
        createdAt: new Date(),
        relevantPeriod: timeRange
      });
    }

    return insights;
  }

  private generateEfficiencyInsights(events: AnalyticsEvent[], metrics: ProductivityMetrics, timeRange: TimePeriod): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];

    // Keyboard shortcuts usage
    if (metrics.shortcutsUsed > 10) {
      insights.push({
        id: `efficiency_${Date.now()}_shortcuts`,
        type: 'efficiency',
        category: 'workflow_optimization',
        title: 'Keyboard Shortcuts Power User',
        description: `You've used ${metrics.shortcutsUsed} keyboard shortcuts in ${timeRange.label}, showing excellent efficiency habits.`,
        impact: 'medium',
        confidence: 0.85,
        actionable: true,
        recommendations: [{
          id: 'explore_shortcuts',
          title: 'Explore More Shortcuts',
          description: 'Discover additional keyboard shortcuts to further boost your productivity',
          actionType: 'explore_feature',
          priority: 2,
          estimatedImpact: 'Further time savings',
          implementation: 'Open keyboard shortcuts help (Ctrl+Shift+K)'
        }],
        dataPoints: [
          { label: 'Shortcuts Used', value: metrics.shortcutsUsed }
        ],
        trend: 'increasing',
        createdAt: new Date(),
        relevantPeriod: timeRange
      });
    }

    return insights;
  }

  private generateFeatureUsageInsights(events: AnalyticsEvent[], timeRange: TimePeriod): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];
    
    const featureEvents = events.filter(e => e.type === 'feature_usage');
    const featureUsage = featureEvents.reduce((acc, event) => {
      const feature = event.label || 'unknown';
      acc[feature] = (acc[feature] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Underutilized features insight
    const availableFeatures = ['dragDrop', 'bulkOperations', 'advancedSearch', 'virtualScrolling', 'exportImport'];
    const unusedFeatures = availableFeatures.filter(feature => !featureUsage[feature]);

    if (unusedFeatures.length > 0) {
      insights.push({
        id: `feature_${Date.now()}_unused`,
        type: 'feature_opportunity',
        category: 'feature_usage',
        title: 'Discover Unused Features',
        description: `You have ${unusedFeatures.length} powerful features available that could boost your productivity.`,
        impact: 'medium',
        confidence: 0.8,
        actionable: true,
        recommendations: unusedFeatures.map((feature, index) => ({
          id: `try_${feature}`,
          title: `Try ${feature}`,
          description: `Explore the ${feature} feature to enhance your workflow`,
          actionType: 'explore_feature',
          priority: index + 1,
          estimatedImpact: 'Time savings and improved workflow',
          implementation: `Look for ${feature} in the interface or help documentation`
        })),
        dataPoints: [
          { label: 'Available Features', value: availableFeatures.length },
          { label: 'Used Features', value: availableFeatures.length - unusedFeatures.length },
          { label: 'Unused Features', value: unusedFeatures.length }
        ],
        trend: 'stable',
        createdAt: new Date(),
        relevantPeriod: timeRange
      });
    }

    return insights;
  }

  private async generateTrendInsights(metrics: ProductivityMetrics, timeRange: TimePeriod): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];

    // This would compare with historical data
    // For now, we'll create a placeholder insight
    insights.push({
      id: `trend_${Date.now()}_activity`,
      type: 'trend',
      category: 'productivity',
      title: 'Activity Trend Analysis',
      description: `Your activity levels show interesting patterns over ${timeRange.label}.`,
      impact: 'low',
      confidence: 0.6,
      actionable: false,
      recommendations: [],
      dataPoints: [
        { label: 'Time Spent', value: metrics.timeSpent },
        { label: 'Active Time', value: metrics.activeTime }
      ],
      trend: 'stable',
      createdAt: new Date(),
      relevantPeriod: timeRange
    });

    return insights;
  }

  // Pattern detection methods
  private detectHighProductivityPatterns(events: AnalyticsEvent[]): UserBehaviorPattern[] {
    const patterns: UserBehaviorPattern[] = [];
    
    const completionEvents = events.filter(e => e.action === 'complete');
    if (completionEvents.length > 5) {
      const hourlyActivity = this.groupEventsByHour(completionEvents);
      const peakHours = this.findPeakHours(hourlyActivity);

      patterns.push({
        id: `pattern_${Date.now()}_productivity`,
        pattern: 'high_productivity',
        confidence: 0.8,
        frequency: completionEvents.length,
        timeOfDay: peakHours,
        duration: 60, // Average duration
        triggers: ['Task completion', 'Focus time'],
        outcomes: ['High completion rate', 'Efficient workflow'],
        insights: [`Peak productivity occurs around ${peakHours.join(', ')} hours`],
        recommendations: ['Schedule important tasks during peak hours', 'Protect focus time'],
        firstSeen: new Date(Math.min(...completionEvents.map(e => e.timestamp.getTime()))),
        lastSeen: new Date(Math.max(...completionEvents.map(e => e.timestamp.getTime())))
      });
    }

    return patterns;
  }

  private detectTaskBatchingPatterns(events: AnalyticsEvent[]): UserBehaviorPattern[] {
    const patterns: UserBehaviorPattern[] = [];
    
    const taskEvents = events.filter(e => e.category === 'tasks');
    const sessions = this.groupEventsBySessions(taskEvents);
    
    const batchingSessions = sessions.filter(session => session.length > 3);
    if (batchingSessions.length > 2) {
      patterns.push({
        id: `pattern_${Date.now()}_batching`,
        pattern: 'task_batching',
        confidence: 0.75,
        frequency: batchingSessions.length,
        timeOfDay: [],
        duration: 45,
        triggers: ['Multiple task actions in sequence'],
        outcomes: ['Efficient task processing'],
        insights: ['You tend to batch task operations for efficiency'],
        recommendations: ['Continue batching similar tasks', 'Use bulk operations'],
        firstSeen: new Date(),
        lastSeen: new Date()
      });
    }

    return patterns;
  }

  private detectTimeBasedPatterns(events: AnalyticsEvent[]): UserBehaviorPattern[] {
    const patterns: UserBehaviorPattern[] = [];
    
    const morningEvents = events.filter(e => e.timestamp.getHours() < 12);
    const eveningEvents = events.filter(e => e.timestamp.getHours() >= 18);
    
    if (morningEvents.length > events.length * 0.6) {
      patterns.push({
        id: `pattern_${Date.now()}_morning`,
        pattern: 'morning_planner',
        confidence: 0.8,
        frequency: morningEvents.length,
        timeOfDay: [8, 9, 10, 11],
        duration: 120,
        triggers: ['Morning routine', 'Day planning'],
        outcomes: ['Organized day', 'Clear priorities'],
        insights: ['You\'re most active in the morning hours'],
        recommendations: ['Schedule important tasks in the morning', 'Use morning time for planning'],
        firstSeen: new Date(),
        lastSeen: new Date()
      });
    }

    return patterns;
  }

  private detectFeatureUsagePatterns(events: AnalyticsEvent[]): UserBehaviorPattern[] {
    const patterns: UserBehaviorPattern[] = [];
    
    const shortcutEvents = events.filter(e => e.action === 'shortcut_used');
    if (shortcutEvents.length > 20) {
      patterns.push({
        id: `pattern_${Date.now()}_keyboard`,
        pattern: 'keyboard_power_user',
        confidence: 0.9,
        frequency: shortcutEvents.length,
        timeOfDay: [],
        duration: 0,
        triggers: ['Keyboard shortcuts'],
        outcomes: ['Faster navigation', 'Efficient workflow'],
        insights: ['You rely heavily on keyboard shortcuts for efficiency'],
        recommendations: ['Explore advanced shortcuts', 'Customize shortcuts for your workflow'],
        firstSeen: new Date(),
        lastSeen: new Date()
      });
    }

    return patterns;
  }

  private detectKeyboardShortcutPatterns(events: AnalyticsEvent[]): UserBehaviorPattern[] {
    // This is a duplicate of detectFeatureUsagePatterns for keyboard shortcuts
    // Keeping it separate for future expansion
    return [];
  }

  // Utility methods
  private calculateTimeSpent(events: AnalyticsEvent[]): number {
    // Calculate total time spent based on session duration
    const sessions = this.groupEventsBySessions(events);
    return sessions.reduce((total, session) => {
      if (session.length < 2) return total;
      const start = Math.min(...session.map(e => e.timestamp.getTime()));
      const end = Math.max(...session.map(e => e.timestamp.getTime()));
      return total + (end - start) / (1000 * 60); // Convert to minutes
    }, 0);
  }

  private calculateActiveTime(events: AnalyticsEvent[]): number {
    // Active time is time when user is interacting
    return this.calculateTimeSpent(events.filter(e => e.type === 'user_action')) * 0.8; // Estimate 80% active
  }

  private calculateIdleTime(events: AnalyticsEvent[]): number {
    const totalTime = this.calculateTimeSpent(events);
    const activeTime = this.calculateActiveTime(events);
    return totalTime - activeTime;
  }

  private calculateTrend(values: number[], metric: string): { direction: TrendDirection; confidence: number } {
    if (values.length < 3) return { direction: 'stable', confidence: 0.5 };

    const recentAvg = values.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const earlierAvg = values.slice(0, -3).reduce((a, b) => a + b, 0) / Math.max(values.length - 3, 1);
    
    const change = (recentAvg - earlierAvg) / Math.max(earlierAvg, 1);
    
    if (Math.abs(change) < 0.05) return { direction: 'stable', confidence: 0.8 };
    if (change > 0.05) return { direction: 'increasing', confidence: Math.min(change * 2, 0.95) };
    return { direction: 'decreasing', confidence: Math.min(Math.abs(change) * 2, 0.95) };
  }

  private predictValue(values: number[], horizon: number): number {
    if (values.length < 2) return values[0] || 0;

    // Simple linear regression for prediction
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = values.reduce((sum, _, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return slope * (n + horizon - 1) + intercept;
  }

  private groupEventsByHour(events: AnalyticsEvent[]): Record<number, number> {
    return events.reduce((acc, event) => {
      const hour = event.timestamp.getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
  }

  private findPeakHours(hourlyActivity: Record<number, number>): number[] {
    const sortedHours = Object.entries(hourlyActivity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
    
    return sortedHours.sort((a, b) => a - b);
  }

  private groupEventsBySessions(events: AnalyticsEvent[]): AnalyticsEvent[][] {
    if (events.length === 0) return [];

    const sessions: AnalyticsEvent[][] = [];
    let currentSession: AnalyticsEvent[] = [events[0]];

    for (let i = 1; i < events.length; i++) {
      const timeDiff = events[i].timestamp.getTime() - events[i-1].timestamp.getTime();
      
      // If more than 30 minutes gap, start new session
      if (timeDiff > 30 * 60 * 1000) {
        sessions.push(currentSession);
        currentSession = [events[i]];
      } else {
        currentSession.push(events[i]);
      }
    }
    
    sessions.push(currentSession);
    return sessions;
  }

  private getLastMonthPeriod(): TimePeriod {
    const end = new Date();
    const start = new Date(end);
    start.setMonth(start.getMonth() - 1);
    
    return {
      type: 'month',
      start,
      end,
      label: 'Last Month'
    };
  }

  private exportToCSV(data: any): Blob {
    const csvContent = this.convertToCSV(data.events);
    return new Blob([csvContent], { type: 'text/csv' });
  }

  private exportToExcel(data: any): Blob {
    // This would require a library like xlsx
    // For now, return CSV format
    return this.exportToCSV(data);
  }

  private convertToCSV(events: AnalyticsEvent[]): string {
    const headers = ['id', 'type', 'category', 'action', 'label', 'value', 'timestamp'];
    const rows = events.map(event => [
      event.id,
      event.type,
      event.category,
      event.action,
      event.label || '',
      event.value || '',
      event.timestamp.toISOString()
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    this.activityTracker.stop();
    this.flush(); // Final flush
  }
}

/**
 * Activity Tracker
 * Tracks user activity and idle time
 */
class ActivityTracker {
  private isActive = true;
  private lastActivity = Date.now();
  private activityListeners: (() => void)[] = [];

  start(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handler = () => {
      this.isActive = true;
      this.lastActivity = Date.now();
    };

    for (const event of events) {
      document.addEventListener(event, handler, true);
      this.activityListeners.push(() => document.removeEventListener(event, handler, true));
    }

    // Check for inactivity every minute
    setInterval(() => {
      if (Date.now() - this.lastActivity > 5 * 60 * 1000) { // 5 minutes idle
        this.isActive = false;
      }
    }, 60000);
  }

  stop(): void {
    for (const removeListener of this.activityListeners) {
      removeListener();
    }
    this.activityListeners = [];
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getLastActivity(): number {
    return this.lastActivity;
  }
}
