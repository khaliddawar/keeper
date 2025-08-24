/**
 * Barrel export for Performance components
 * 
 * This file exports all components related to the Performance
 * Optimization & Monitoring system for easy importing.
 */

// Main dashboard component
export { PerformanceDashboard } from './PerformanceDashboard';

// Individual performance monitoring components
// export { MetricDisplay } from './MetricDisplay'; // Component doesn't exist
export { BundleAnalyzer } from './BundleAnalyzer';
export { MemoryProfiler } from './MemoryProfiler';
// export { LazyLoadManager } from './LazyLoadManager'; // Component doesn't exist
// export { OptimizationRecommendations } from './OptimizationRecommendations'; // Component doesn't exist

// Re-export available component types
export type {
  PerformanceDashboardProps,
  BundleAnalyzerProps,
  MemoryMonitorProps
} from '../types';
