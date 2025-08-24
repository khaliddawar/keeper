/**
 * Barrel export for Performance feature
 * 
 * This file exports all core Performance Optimization & Monitoring functionality
 * including the engine, provider, hooks, components, and demo for easy integration.
 */

// Core functionality
export { PerformanceEngine } from './PerformanceEngine';
export { PerformanceProvider } from './PerformanceProvider';

// Hooks for consuming components
export {
  usePerformance,
  useMemoryOptimization,
  useLazyLoading,
  useBundleAnalysis
} from './PerformanceProvider';

// Components
export * from './components';

// Demo component
export { PerformanceDemo } from './demo/PerformanceDemo';

// Types
export * from './types';
