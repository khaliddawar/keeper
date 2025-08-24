import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { AnalyticsEngine } from './AnalyticsEngine';
import { AnalyticsStorage } from './AnalyticsStorage';
import type {
  AnalyticsContext as IAnalyticsContext,
  AnalyticsConfig,
  AnalyticsEvent,
  ProductivityMetrics,
  AnalyticsInsight,
  UserBehaviorPattern,
  ProductivityGoal,
  AnalyticsDashboard,
  ExportFormat,
  TimePeriod,
  UseAnalytics
} from './types';

/**
 * Analytics Context
 */
const AnalyticsContext = createContext<IAnalyticsContext | null>(null);

/**
 * Provider Props
 */
interface AnalyticsProviderProps {
  children: React.ReactNode;
  config?: Partial<AnalyticsConfig>;
  autoStart?: boolean;
  trackPageViews?: boolean;
  trackPerformance?: boolean;
  trackErrors?: boolean;
}

/**
 * Analytics Provider Component
 */
export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
  config,
  autoStart = true,
  trackPageViews = true,
  trackPerformance = true,
  trackErrors = true
}) => {
  // Core engine and storage
  const engineRef = useRef<AnalyticsEngine | null>(null);
  const storageRef = useRef<AnalyticsStorage | null>(null);
  
  // Data state
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [metrics, setMetrics] = useState<ProductivityMetrics[]>([]);
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [patterns, setPatterns] = useState<UserBehaviorPattern[]>([]);
  const [goals, setGoals] = useState<ProductivityGoal[]>([]);
  const [dashboards, setDashboards] = useState<AnalyticsDashboard[]>([]);
  const [activeDashboard, setActiveDashboard] = useState<AnalyticsDashboard | null>(null);

  // Configuration state
  const [currentConfig, setCurrentConfig] = useState<AnalyticsConfig | null>(null);

  // Loading states
  const [loading, setLoading] = useState({
    events: false,
    metrics: false,
    insights: false,
    patterns: false,
    goals: false
  });

  // Initialize analytics engine
  useEffect(() => {
    const initializeAnalytics = async () => {
      try {
        // Create storage
        const storage = new AnalyticsStorage();
        storageRef.current = storage;
        
        // Wait for storage to be ready
        await storage.waitForReady();

        // Create engine
        const engine = new AnalyticsEngine(storage, config);
        engineRef.current = engine;
        
        // Set initial configuration
        setCurrentConfig(engine.getConfig());

        // Track initial page view if enabled
        if (autoStart && trackPageViews) {
          engine.trackPageView(window.location.pathname, {
            title: document.title,
            referrer: document.referrer
          });
        }

        // Setup error tracking if enabled
        if (trackErrors) {
          window.addEventListener('error', (event) => {
            engine.trackError(new Error(event.message), {
              filename: event.filename,
              lineno: event.lineno,
              colno: event.colno
            });
          });

          window.addEventListener('unhandledrejection', (event) => {
            engine.trackError(new Error(`Unhandled promise rejection: ${event.reason}`), {
              type: 'unhandledrejection',
              reason: event.reason
            });
          });
        }

        // Setup performance tracking if enabled
        if (trackPerformance) {
          // Track page load performance
          if (document.readyState === 'complete') {
            trackPageLoadPerformance();
          } else {
            window.addEventListener('load', trackPageLoadPerformance);
          }
        }

        // Load initial data
        await refreshData();

        console.log('📊 Analytics system initialized');
      } catch (error) {
        console.error('Failed to initialize analytics system:', error);
      }
    };

    initializeAnalytics();

    // Cleanup on unmount
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
      }
      if (storageRef.current) {
        storageRef.current.destroy();
      }
    };
  }, [config, autoStart, trackPageViews, trackPerformance, trackErrors]);

  /**
   * Track page load performance
   */
  const trackPageLoadPerformance = useCallback(() => {
    if (!engineRef.current || typeof performance === 'undefined') return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return;

    engineRef.current.trackPerformance({
      pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
      renderTime: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      apiResponseTime: navigation.responseEnd - navigation.requestStart,
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
  }, []);

  /**
   * Track analytics event
   */
  const track = useCallback((event: Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'>) => {
    if (engineRef.current) {
      engineRef.current.track(event);
    }
  }, []);

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async () => {
    if (!engineRef.current) return;

    setLoading({
      events: true,
      metrics: true,
      insights: true,
      patterns: true,
      goals: true
    });

    try {
      const now = new Date();
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);

      const [
        recentEvents,
        recentMetrics,
        currentInsights,
        currentPatterns,
        activeGoals
      ] = await Promise.all([
        engineRef.current.getEvents({
          timeRange: {
            type: 'relative',
            relative: { amount: 7, unit: 'days' }
          },
          limit: 1000
        }),
        engineRef.current.getMetrics({
          periods: [createTimePeriod('week', lastWeek, now)]
        }),
        engineRef.current.getInsights({
          dismissed: false,
          timeRange: {
            type: 'relative',
            relative: { amount: 30, unit: 'days' }
          }
        }),
        engineRef.current.getPatterns({
          minConfidence: 0.6,
          timeRange: {
            type: 'relative',
            relative: { amount: 30, unit: 'days' }
          }
        }),
        engineRef.current.getGoals({
          status: ['active', 'paused']
        })
      ]);

      setEvents(recentEvents);
      setMetrics(recentMetrics);
      setInsights(currentInsights);
      setPatterns(currentPatterns);
      setGoals(activeGoals);

    } catch (error) {
      console.error('Failed to refresh analytics data:', error);
    } finally {
      setLoading({
        events: false,
        metrics: false,
        insights: false,
        patterns: false,
        goals: false
      });
    }
  }, []);

  /**
   * Generate new insights
   */
  const generateInsights = useCallback(async () => {
    if (!engineRef.current) return;

    try {
      const now = new Date();
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);

      const newInsights = await engineRef.current.generateInsights(
        createTimePeriod('week', lastWeek, now)
      );

      setInsights(prev => [...prev, ...newInsights]);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    }
  }, []);

  /**
   * Export analytics data
   */
  const exportData = useCallback(async (format: ExportFormat): Promise<Blob> => {
    if (!engineRef.current) {
      throw new Error('Analytics engine not initialized');
    }

    return await engineRef.current.exportData(format);
  }, []);

  /**
   * Update configuration
   */
  const updateConfig = useCallback((configUpdates: Partial<AnalyticsConfig>) => {
    if (!engineRef.current) return;

    engineRef.current.updateConfig(configUpdates);
    setCurrentConfig(engineRef.current.getConfig());
  }, []);

  /**
   * Create new goal
   */
  const createGoal = useCallback(async (goalData: Omit<ProductivityGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!storageRef.current) return;

    const goal: ProductivityGoal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...goalData
    };

    await storageRef.current.saveGoal(goal);
    setGoals(prev => [...prev, goal]);

    // Track goal creation
    track({
      type: 'user_action',
      category: 'productivity',
      action: 'goal_created',
      label: goal.category,
      value: goal.target,
      context: {
        page: 'analytics',
        route: '/analytics',
        userAgent: navigator.userAgent,
        viewport: { width: window.innerWidth, height: window.innerHeight }
      }
    });
  }, [track]);

  /**
   * Update goal
   */
  const updateGoal = useCallback(async (id: string, updates: Partial<ProductivityGoal>) => {
    if (!storageRef.current) return;

    await storageRef.current.updateGoal(id, updates);
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, ...updates, updatedAt: new Date() } : goal
    ));

    // Track goal update
    track({
      type: 'user_action',
      category: 'productivity',
      action: 'goal_updated',
      label: id,
      context: {
        page: 'analytics',
        route: '/analytics',
        userAgent: navigator.userAgent,
        viewport: { width: window.innerWidth, height: window.innerHeight }
      }
    });
  }, [track]);

  /**
   * Delete goal
   */
  const deleteGoal = useCallback(async (id: string) => {
    if (!storageRef.current) return;

    // Update goal status to archived instead of deleting
    await updateGoal(id, { 
      status: 'archived', 
      archivedAt: new Date() 
    });

    setGoals(prev => prev.filter(goal => goal.id !== id));

    // Track goal deletion
    track({
      type: 'user_action',
      category: 'productivity',
      action: 'goal_deleted',
      label: id,
      context: {
        page: 'analytics',
        route: '/analytics',
        userAgent: navigator.userAgent,
        viewport: { width: window.innerWidth, height: window.innerHeight }
      }
    });
  }, [updateGoal, track]);

  /**
   * Dismiss insight
   */
  const dismissInsight = useCallback(async (id: string) => {
    if (!storageRef.current) return;

    await storageRef.current.updateInsight(id, { 
      dismissed: true 
    });

    setInsights(prev => prev.map(insight => 
      insight.id === id ? { ...insight, dismissed: true } : insight
    ));

    // Track insight dismissal
    track({
      type: 'user_action',
      category: 'productivity',
      action: 'insight_dismissed',
      label: id,
      context: {
        page: 'analytics',
        route: '/analytics',
        userAgent: navigator.userAgent,
        viewport: { width: window.innerWidth, height: window.innerHeight }
      }
    });
  }, [track]);

  /**
   * Implement insight
   */
  const implementInsight = useCallback(async (id: string) => {
    if (!storageRef.current) return;

    await storageRef.current.updateInsight(id, { 
      implemented: true 
    });

    setInsights(prev => prev.map(insight => 
      insight.id === id ? { ...insight, implemented: true } : insight
    ));

    // Track insight implementation
    track({
      type: 'user_action',
      category: 'productivity',
      action: 'insight_implemented',
      label: id,
      context: {
        page: 'analytics',
        route: '/analytics',
        userAgent: navigator.userAgent,
        viewport: { width: window.innerWidth, height: window.innerHeight }
      }
    });
  }, [track]);

  /**
   * Create dashboard
   */
  const createDashboard = useCallback(async (dashboardData: Omit<AnalyticsDashboard, 'id' | 'createdAt' | 'updatedAt'>) => {
    const dashboard: AnalyticsDashboard = {
      id: `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...dashboardData
    };

    setDashboards(prev => [...prev, dashboard]);

    // Track dashboard creation
    track({
      type: 'user_action',
      category: 'features',
      action: 'dashboard_created',
      label: dashboard.name,
      context: {
        page: 'analytics',
        route: '/analytics',
        userAgent: navigator.userAgent,
        viewport: { width: window.innerWidth, height: window.innerHeight }
      }
    });
  }, [track]);

  /**
   * Update dashboard
   */
  const updateDashboard = useCallback(async (id: string, updates: Partial<AnalyticsDashboard>) => {
    setDashboards(prev => prev.map(dashboard => 
      dashboard.id === id ? { ...dashboard, ...updates, updatedAt: new Date() } : dashboard
    ));

    // Track dashboard update
    track({
      type: 'user_action',
      category: 'features',
      action: 'dashboard_updated',
      label: id,
      context: {
        page: 'analytics',
        route: '/analytics',
        userAgent: navigator.userAgent,
        viewport: { width: window.innerWidth, height: window.innerHeight }
      }
    });
  }, [track]);

  /**
   * Delete dashboard
   */
  const deleteDashboard = useCallback(async (id: string) => {
    setDashboards(prev => prev.filter(dashboard => dashboard.id !== id));

    // Update active dashboard if it was deleted
    if (activeDashboard?.id === id) {
      setActiveDashboard(dashboards.find(d => d.isDefault) || null);
    }

    // Track dashboard deletion
    track({
      type: 'user_action',
      category: 'features',
      action: 'dashboard_deleted',
      label: id,
      context: {
        page: 'analytics',
        route: '/analytics',
        userAgent: navigator.userAgent,
        viewport: { width: window.innerWidth, height: window.innerHeight }
      }
    });
  }, [activeDashboard, dashboards, track]);

  /**
   * Set active dashboard
   */
  const setActiveDashboardHandler = useCallback((dashboard: AnalyticsDashboard) => {
    setActiveDashboard(dashboard);

    // Track dashboard switch
    track({
      type: 'user_action',
      category: 'features',
      action: 'dashboard_switched',
      label: dashboard.name,
      context: {
        page: 'analytics',
        route: '/analytics',
        userAgent: navigator.userAgent,
        viewport: { width: window.innerWidth, height: window.innerHeight }
      }
    });
  }, [track]);

  // Auto-refresh data periodically
  useEffect(() => {
    if (!currentConfig?.dashboard.autoRefresh) return;

    const interval = setInterval(() => {
      refreshData();
    }, (currentConfig.dashboard.refreshInterval || 60) * 1000);

    return () => clearInterval(interval);
  }, [currentConfig?.dashboard.autoRefresh, currentConfig?.dashboard.refreshInterval, refreshData]);

  // Auto-generate insights periodically
  useEffect(() => {
    if (!currentConfig?.insights.autoGenerate) return;

    const interval = setInterval(() => {
      generateInsights();
    }, (currentConfig.insights.generationInterval || 24) * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [currentConfig?.insights.autoGenerate, currentConfig?.insights.generationInterval, generateInsights]);

  // Create context value
  const contextValue: IAnalyticsContext = {
    engine: engineRef.current!,
    config: currentConfig!,
    
    // Data
    events,
    metrics,
    insights,
    patterns,
    goals,
    
    // Loading states
    loading,
    
    // Actions
    track,
    refreshData,
    generateInsights,
    exportData,
    updateConfig,
    
    // Goals
    createGoal,
    updateGoal,
    deleteGoal,
    
    // Insights
    dismissInsight,
    implementInsight,
    
    // Dashboard
    dashboards,
    activeDashboard,
    setActiveDashboard: setActiveDashboardHandler,
    createDashboard,
    updateDashboard,
    deleteDashboard
  };

  // Don't render until engine is initialized
  if (!engineRef.current || !currentConfig) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '20px',
        color: '#666'
      }}>
        <span>📊 Initializing analytics...</span>
      </div>
    );
  }

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

/**
 * Hook to use analytics
 */
export const useAnalytics = (): UseAnalytics => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }

  return {
    // Tracking methods
    track: context.track,
    trackPageView: context.engine.trackPageView.bind(context.engine),
    trackUserAction: context.engine.trackUserAction.bind(context.engine),
    trackFeatureUsage: context.engine.trackFeatureUsage.bind(context.engine),
    trackPerformance: context.engine.trackPerformance.bind(context.engine),
    trackError: context.engine.trackError.bind(context.engine),

    // Data
    events: context.events,
    metrics: context.metrics,
    insights: context.insights,
    patterns: context.patterns,
    goals: context.goals,

    // Loading states
    loading: context.loading,

    // Actions
    refreshData: context.refreshData,
    generateInsights: context.generateInsights,
    exportData: context.exportData,

    // Configuration
    config: context.config,
    updateConfig: context.updateConfig
  };
};

/**
 * Hook for automatic feature usage tracking
 */
export const useFeatureTracking = (feature: string, enabled = true): void => {
  const { trackFeatureUsage } = useAnalytics();
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Track feature mount
    startTime.current = Date.now();
    trackFeatureUsage(feature, 'mount');

    return () => {
      // Track feature unmount with duration
      if (startTime.current) {
        const duration = Date.now() - startTime.current;
        trackFeatureUsage(feature, 'unmount', duration);
      }
    };
  }, [feature, enabled, trackFeatureUsage]);
};

/**
 * Hook for automatic page view tracking
 */
export const usePageTracking = (pageName?: string): void => {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    const page = pageName || window.location.pathname;
    trackPageView(page, {
      title: document.title,
      referrer: document.referrer
    });
  }, [pageName, trackPageView]);
};

/**
 * Hook for performance tracking
 */
export const usePerformanceTracking = (componentName: string): {
  startMeasure: () => void;
  endMeasure: () => void;
} => {
  const { trackPerformance } = useAnalytics();

  const startMeasure = useCallback(() => {
    performance.mark(`${componentName}-start`);
  }, [componentName]);

  const endMeasure = useCallback(() => {
    performance.mark(`${componentName}-end`);
    performance.measure(`${componentName}`, `${componentName}-start`, `${componentName}-end`);
    
    const measure = performance.getEntriesByName(`${componentName}`)[0];
    if (measure) {
      trackPerformance({
        pageLoadTime: 0,
        renderTime: measure.duration,
        apiResponseTime: 0,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
        domNodes: document.querySelectorAll('*').length,
        virtualScrollPerformance: {
          itemsRendered: 0,
          scrollFps: 0,
          renderTime: measure.duration
        },
        searchPerformance: {
          queryTime: 0,
          resultsCount: 0,
          indexSize: 0
        },
        page: `component:${componentName}`
      });
    }
  }, [componentName, trackPerformance]);

  return { startMeasure, endMeasure };
};

/**
 * Utility functions
 */
function createTimePeriod(type: 'day' | 'week' | 'month' | 'year', start: Date, end: Date): TimePeriod {
  return {
    type,
    start,
    end,
    label: `${type.charAt(0).toUpperCase() + type.slice(1)} (${start.toLocaleDateString()} - ${end.toLocaleDateString()})`
  };
}

/**
 * Development utilities
 */
if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.NODE_ENV === 'development') {
  (window as any).Analytics = {
    useAnalytics,
    useFeatureTracking,
    usePageTracking,
    usePerformanceTracking
  };
  
  console.log('📊 Analytics system loaded');
  console.log('  🛠️  Hooks available at window.Analytics');
}
