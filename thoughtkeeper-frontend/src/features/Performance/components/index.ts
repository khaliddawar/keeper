/**
 * Barrel export for Performance components
 * 
 * This file exports all components related to the Performance
 * Optimization & Monitoring system for easy importing.
 */

// Main dashboard component
export { PerformanceDashboard } from './PerformanceDashboard';

// Individual performance monitoring components
export { MetricDisplay } from './MetricDisplay';
export { BundleAnalyzer } from './BundleAnalyzer';
export { MemoryProfiler } from './MemoryProfiler';
export { LazyLoadManager } from './LazyLoadManager';
export { OptimizationRecommendations } from './OptimizationRecommendations';

// Re-export all component types
export type {
  PerformanceDashboardProps,
  MetricDisplayProps,
  BundleAnalyzerProps,
  MemoryMonitorProps,
  LazyLoadProps,
  OptimizationProps
} from '../types';
