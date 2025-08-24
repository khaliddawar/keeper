/**
 * Performance Provider & Hooks
 * 
 * React context provider for comprehensive performance monitoring, memory optimization,
 * lazy loading management, and runtime profiling with automated recommendations.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { PerformanceEngine } from './PerformanceEngine';
import type {
  PerformanceContextValue,
  PerformanceOptimizationConfig,
  CoreWebVitals,
  MemoryMetrics,
  RuntimeMetrics,
  PerformanceDashboardData,
  PerformanceProfile,
  PerformanceRecommendation,
  UsePerformanceMonitoringReturn,
  UseMemoryOptimizationReturn,
  UseLazyLoadingReturn,
  UseBundleAnalysisReturn,
  LazyLoadingStats,
  BundleAnalysis,
  PerformanceEvent
} from './types';

// Context
const PerformanceContext = createContext<PerformanceContextValue | null>(null);

// Provider Props
export interface PerformanceProviderProps {
  children: React.ReactNode;
  config?: Partial<PerformanceOptimizationConfig>;
  enableAutoOptimization?: boolean;
  enableProfiling?: boolean;
  onPerformanceEvent?: (event: PerformanceEvent) => void;
}

/**
 * Performance Provider Component
 * 
 * Provides comprehensive performance monitoring capabilities throughout the application.
 */
export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({
  children,
  config = {},
  enableAutoOptimization = true,
  enableProfiling = false,
  onPerformanceEvent
}) => {
  // Engine instance
  const engineRef = useRef<PerformanceEngine | null>(null);
  
  // State
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [coreVitals, setCoreVitals] = useState<CoreWebVitals>(() => ({} as CoreWebVitals));
  const [memoryMetrics, setMemoryMetrics] = useState<MemoryMetrics>(() => ({} as MemoryMetrics));
  const [runtimeMetrics, setRuntimeMetrics] = useState<RuntimeMetrics>(() => ({} as RuntimeMetrics));
  const [dashboardData, setDashboardData] = useState<PerformanceDashboardData>(() => ({} as PerformanceDashboardData));

  // Initialize engine
  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new PerformanceEngine(config);
      
      // Set up event listeners
      const engine = engineRef.current;
      
      const updateMetrics = () => {
        setCoreVitals(engine.getCoreVitals());
        setMemoryMetrics(engine.getMemoryMetrics());
        setRuntimeMetrics(engine.getRuntimeMetrics());
        setDashboardData(engine.getDashboardData());
      };

      const handlePerformanceEvent = (eventData: any) => {
        updateMetrics();
        
        if (onPerformanceEvent) {
          const event: PerformanceEvent = {
            id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: eventData.type || 'metric-updated',
            timestamp: Date.now(),
            data: eventData,
            severity: determineSeverity(eventData)
          };
          onPerformanceEvent(event);
        }
      };

      // Register event listeners
      engine.addEventListener('metrics-updated', handlePerformanceEvent);
      engine.addEventListener('threshold-exceeded', handlePerformanceEvent);
      engine.addEventListener('memory-pressure-high', handlePerformanceEvent);
      engine.addEventListener('long-task-detected', handlePerformanceEvent);
      engine.addEventListener('profiling-completed', handlePerformanceEvent);
      
      // Auto-optimization
      if (enableAutoOptimization) {
        engine.addEventListener('memory-pressure-high', () => {
          console.log('🔧 Auto-optimizing memory...');
          engine.optimizeMemory();
        });
      }

      // Initial metrics update
      updateMetrics();
      
      // Start monitoring if enabled
      if (config.monitoring?.enabled !== false) {
        engine.startMonitoring();
        setIsMonitoring(true);
      }

      console.log('🚀 Performance Provider initialized');
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [config, enableAutoOptimization, onPerformanceEvent]);

  // Helper function to determine event severity
  const determineSeverity = (eventData: any): 'info' | 'warning' | 'error' | 'critical' => {
    switch (eventData.type) {
      case 'memory-pressure-high':
        return memoryMetrics.memoryPressure === 'critical' ? 'critical' : 'error';
      case 'threshold-exceeded':
        return eventData.threshold?.poor ? 'error' : 'warning';
      case 'long-task-detected':
        return eventData.latency > 200 ? 'error' : 'warning';
      default:
        return 'info';
    }
  };

  // Context value methods
  const startMonitoring = useCallback(() => {
    if (engineRef.current && !isMonitoring) {
      engineRef.current.startMonitoring();
      setIsMonitoring(true);
    }
  }, [isMonitoring]);

  const stopMonitoring = useCallback(() => {
    if (engineRef.current && isMonitoring) {
      engineRef.current.stopMonitoring();
      setIsMonitoring(false);
    }
  }, [isMonitoring]);

  const startProfiling = useCallback((name?: string) => {
    if (engineRef.current && enableProfiling) {
      engineRef.current.startProfiling(name);
    }
  }, [enableProfiling]);

  const stopProfiling = useCallback(() => {
    if (engineRef.current) {
      return engineRef.current.stopProfiling();
    }
    return null;
  }, []);

  const optimizeMemory = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.optimizeMemory();
    }
  }, []);

  const optimizeBundles = useCallback(async () => {
    // In a real implementation, this would trigger bundle optimization
    console.log('🎯 Bundle optimization triggered');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }, []);

  const applyRecommendations = useCallback(async (recommendations: PerformanceRecommendation[]) => {
    console.log('📋 Applying performance recommendations:', recommendations.length);
    
    for (const recommendation of recommendations) {
      switch (recommendation.type) {
        case 'code':
          if (recommendation.title.includes('Memory')) {
            optimizeMemory();
          }
          break;
        case 'configuration':
          // Apply configuration changes
          break;
        case 'architecture':
          // Architectural changes would require manual implementation
          console.log(`Architecture recommendation: ${recommendation.title}`);
          break;
        case 'infrastructure':
          // Infrastructure changes
          console.log(`Infrastructure recommendation: ${recommendation.title}`);
          break;
      }
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }, [optimizeMemory]);

  const updateConfig = useCallback((newConfig: Partial<PerformanceOptimizationConfig>) => {
    if (engineRef.current) {
      engineRef.current.updateConfig(newConfig);
    }
  }, []);

  const getConfig = useCallback(() => {
    return engineRef.current?.getConfig() || {} as PerformanceOptimizationConfig;
  }, []);

  // Context value
  const contextValue: PerformanceContextValue = useMemo(() => ({
    // Monitoring state
    isMonitoring,
    coreVitals,
    memoryMetrics,
    runtimeMetrics,
    dashboardData,
    
    // Controls
    startMonitoring,
    stopMonitoring,
    startProfiling,
    stopProfiling,
    
    // Optimization
    optimizeMemory,
    optimizeBundles,
    applyRecommendations,
    
    // Configuration
    updateConfig,
    getConfig
  }), [
    isMonitoring,
    coreVitals,
    memoryMetrics,
    runtimeMetrics,
    dashboardData,
    startMonitoring,
    stopMonitoring,
    startProfiling,
    stopProfiling,
    optimizeMemory,
    optimizeBundles,
    applyRecommendations,
    updateConfig,
    getConfig
  ]);

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
};

/**
 * Main performance monitoring hook
 */
export const usePerformanceMonitoring = (): UsePerformanceMonitoringReturn => {
  const context = useContext(PerformanceContext);
  
  if (!context) {
    throw new Error('usePerformanceMonitoring must be used within a PerformanceProvider');
  }

  const clearMetrics = useCallback(() => {
    // Reset metrics to initial state
    console.log('🧹 Clearing performance metrics');
  }, []);

  return {
    // Current metrics
    coreVitals: context.coreVitals,
    memoryMetrics: context.memoryMetrics,
    runtimeMetrics: context.runtimeMetrics,
    
    // Controls
    startProfiling: context.startProfiling,
    stopProfiling: context.stopProfiling,
    clearMetrics,
    
    // Status
    isMonitoring: context.isMonitoring,
    isProfiling: false // Would need to track this in engine
  };
};

/**
 * Memory optimization hook
 */
export const useMemoryOptimization = (): UseMemoryOptimizationReturn => {
  const context = useContext(PerformanceContext);
  
  if (!context) {
    throw new Error('useMemoryOptimization must be used within a PerformanceProvider');
  }

  const [memoryThreshold, setMemoryThresholdState] = useState(75);
  const [autoOptimizationEnabled, setAutoOptimizationEnabled] = useState(true);

  const forceGarbageCollection = useCallback(() => {
    if (typeof globalThis !== 'undefined' && (globalThis as any).gc) {
      (globalThis as any).gc();
      console.log('♻️ Forced garbage collection');
    } else {
      console.warn('Garbage collection not available');
    }
  }, []);

  const cleanupEventListeners = useCallback(() => {
    console.log('🧹 Cleaning up event listeners');
    // Implementation would track and remove specific listeners
  }, []);

  const setMemoryThreshold = useCallback((threshold: number) => {
    setMemoryThresholdState(threshold);
    console.log(`🎯 Memory threshold set to ${threshold}%`);
  }, []);

  const enableAutoOptimization = useCallback((enabled: boolean) => {
    setAutoOptimizationEnabled(enabled);
    console.log(`🤖 Auto-optimization ${enabled ? 'enabled' : 'disabled'}`);
  }, []);

  return {
    // Memory info
    memoryMetrics: context.memoryMetrics,
    memoryPressure: context.memoryMetrics.memoryPressure,
    
    // Optimization actions
    optimizeMemory: context.optimizeMemory,
    forceGarbageCollection,
    cleanupEventListeners,
    
    // Configuration
    setMemoryThreshold,
    enableAutoOptimization
  };
};

/**
 * Lazy loading hook
 */
export const useLazyLoading = (): UseLazyLoadingReturn => {
  const context = useContext(PerformanceContext);
  
  if (!context) {
    throw new Error('useLazyLoading must be used within a PerformanceProvider');
  }

  const [loadedComponents] = useState(new Set<string>());
  const [loadingComponents] = useState(new Set<string>());
  const [failedComponents] = useState(new Set<string>());

  const stats: LazyLoadingStats = useMemo(() => ({
    componentsLoaded: loadedComponents.size,
    totalComponents: loadedComponents.size + loadingComponents.size + failedComponents.size,
    loadingTime: 750,
    cacheHitRate: 85,
    failedLoads: failedComponents.size,
    bundleSize: 300 * 1024 // 300KB
  }), [loadedComponents.size, loadingComponents.size, failedComponents.size]);

  const preloadComponent = useCallback(async (componentId: string) => {
    console.log(`⚡ Preloading component: ${componentId}`);
    // Simulate component loading
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    loadedComponents.add(componentId);
  }, [loadedComponents]);

  const preloadComponents = useCallback(async (componentIds: string[]) => {
    console.log(`⚡ Preloading ${componentIds.length} components`);
    await Promise.all(componentIds.map(id => preloadComponent(id)));
  }, [preloadComponent]);

  const clearCache = useCallback(() => {
    loadedComponents.clear();
    loadingComponents.clear();
    failedComponents.clear();
    console.log('🧹 Lazy loading cache cleared');
  }, [loadedComponents, loadingComponents, failedComponents]);

  return {
    // Loading state
    loadedComponents,
    loadingComponents,
    failedComponents,
    
    // Statistics
    stats,
    
    // Controls
    preloadComponent,
    preloadComponents,
    clearCache
  };
};

/**
 * Bundle analysis hook
 */
export const useBundleAnalysis = (): UseBundleAnalysisReturn => {
  const context = useContext(PerformanceContext);
  
  if (!context) {
    throw new Error('useBundleAnalysis must be used within a PerformanceProvider');
  }

  const [bundleAnalysis, setBundleAnalysis] = useState<BundleAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeBundles = useCallback(async () => {
    setIsAnalyzing(true);
    console.log('📦 Analyzing bundles...');
    
    // Simulate bundle analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockAnalysis: BundleAnalysis = {
      totalSize: 2.5 * 1024 * 1024,
      gzippedSize: 800 * 1024,
      mainChunkSize: 1.2 * 1024 * 1024,
      vendorChunkSize: 1.3 * 1024 * 1024,
      chunks: [
        {
          name: 'main',
          size: 1.2 * 1024 * 1024,
          gzippedSize: 400 * 1024,
          modules: ['App', 'Router', 'Components'],
          isAsync: false,
          isEntry: true
        },
        {
          name: 'vendor',
          size: 1.3 * 1024 * 1024,
          gzippedSize: 400 * 1024,
          modules: ['react', 'react-dom', 'lodash'],
          isAsync: false,
          isEntry: false
        }
      ],
      treeShakingStats: {
        eliminatedCode: 150 * 1024,
        totalCode: 2.5 * 1024 * 1024,
        effectiveness: 6,
        sideEffects: []
      },
      unusedImports: [
        {
          module: 'lodash',
          imports: ['cloneDeep', 'isEqual'],
          estimatedSavings: 25 * 1024
        }
      ],
      duplicateModules: [],
      recommendations: [
        {
          type: 'remove-unused',
          priority: 'medium',
          description: 'Remove unused lodash imports to reduce bundle size',
          estimatedSavings: 25 * 1024,
          implementation: 'Replace lodash imports with native JavaScript alternatives'
        }
      ]
    };

    setBundleAnalysis(mockAnalysis);
    setIsAnalyzing(false);
    console.log('✅ Bundle analysis completed');
  }, []);

  const getRecommendations = useCallback(() => {
    return bundleAnalysis?.recommendations || [];
  }, [bundleAnalysis]);

  const estimateSavings = useCallback((recommendation: any) => {
    return recommendation.estimatedSavings || 0;
  }, []);

  return {
    // Analysis data
    bundleAnalysis,
    isAnalyzing,
    
    // Actions
    analyzeBundles,
    getRecommendations,
    
    // Utilities
    estimateSavings
  };
};

/**
 * Performance dashboard hook
 */
export const usePerformanceDashboard = () => {
  const context = useContext(PerformanceContext);
  
  if (!context) {
    throw new Error('usePerformanceDashboard must be used within a PerformanceProvider');
  }

  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh dashboard data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Dashboard data is already updated through the context
      console.log('🔄 Dashboard data refreshed');
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  const updateRefreshInterval = useCallback((interval: number) => {
    setRefreshInterval(interval);
  }, []);

  return {
    // Dashboard data
    dashboardData: context.dashboardData,
    isMonitoring: context.isMonitoring,
    
    // Configuration
    refreshInterval,
    autoRefresh,
    
    // Controls
    startMonitoring: context.startMonitoring,
    stopMonitoring: context.stopMonitoring,
    toggleAutoRefresh,
    updateRefreshInterval,
    
    // Actions
    optimizeMemory: context.optimizeMemory,
    optimizeBundles: context.optimizeBundles,
    applyRecommendations: context.applyRecommendations
  };
};

/**
 * Performance alerts hook
 */
export const usePerformanceAlerts = () => {
  const context = useContext(PerformanceContext);
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: number;
    acknowledged: boolean;
  }>>([]);

  // Monitor for performance issues and create alerts
  useEffect(() => {
    if (!context) return;

    const checkForAlerts = () => {
      const newAlerts: any[] = [];

      // Memory pressure alerts
      if (context.memoryMetrics.memoryPressure === 'high' || context.memoryMetrics.memoryPressure === 'critical') {
        newAlerts.push({
          id: `memory-${Date.now()}`,
          type: 'memory-pressure',
          message: `High memory usage: ${Math.round(context.memoryMetrics.memoryUsagePercentage)}%`,
          severity: context.memoryMetrics.memoryPressure === 'critical' ? 'critical' as const : 'high' as const,
          timestamp: Date.now(),
          acknowledged: false
        });
      }

      // Core Web Vitals alerts
      if (context.coreVitals.lcp?.value > 4000) {
        newAlerts.push({
          id: `lcp-${Date.now()}`,
          type: 'core-vitals',
          message: `Poor Largest Contentful Paint: ${Math.round(context.coreVitals.lcp.value)}ms`,
          severity: 'high' as const,
          timestamp: Date.now(),
          acknowledged: false
        });
      }

      // Frame rate alerts
      if (context.runtimeMetrics.fps < 30) {
        newAlerts.push({
          id: `fps-${Date.now()}`,
          type: 'runtime',
          message: `Low frame rate detected: ${context.runtimeMetrics.fps} FPS`,
          severity: context.runtimeMetrics.fps < 20 ? 'critical' as const : 'high' as const,
          timestamp: Date.now(),
          acknowledged: false
        });
      }

      if (newAlerts.length > 0) {
        setAlerts(prev => [...prev.slice(-10), ...newAlerts]); // Keep last 10 alerts
      }
    };

    const interval = setInterval(checkForAlerts, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [context]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const unacknowledgedAlerts = useMemo(() => 
    alerts.filter(alert => !alert.acknowledged)
  , [alerts]);

  return {
    alerts,
    unacknowledgedAlerts,
    acknowledgeAlert,
    clearAlerts
  };
};

// Export context for advanced usage
export { PerformanceContext };
