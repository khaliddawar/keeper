/**
 * Offline Support & PWA Feature Barrel Export
 * 
 * Comprehensive offline-first architecture with Progressive Web App capabilities,
 * background synchronization, conflict resolution, and storage management.
 */

// Core functionality
export { OfflineEngine } from './OfflineEngine';
export { OfflineSupportProvider } from './OfflineSupportProvider';

// Hooks for consuming components
export {
  useOfflineSupport,
  useNetworkStatus,
  useDataSync,
  usePWA
} from './OfflineSupportProvider';

// Components
export {
  ConflictResolutionPanel,
  NetworkStatusIndicator,
  OfflineCapabilities,
  OfflineDashboard,
  PWAInstallPrompt,
  StorageQuotaIndicator
} from './components';

// Demo component
export { OfflineSupportDemo } from './demo/OfflineSupportDemo';

// Types
export * from './types';

// Re-export key types for convenience
export type {
  NetworkStatus,
  SyncStatus,
  PWAInstallState,
  ServiceWorkerState,
  StorageQuota,
  SyncOperation,
  DataConflict,
  OfflineSupportConfig,
  OfflineSupportContextValue,
  ConflictResolutionStrategy,
  UseOfflineSupportReturn,
  UseNetworkStatusReturn,
  UseDataSyncReturn,
  UsePWAReturn
} from './types';
