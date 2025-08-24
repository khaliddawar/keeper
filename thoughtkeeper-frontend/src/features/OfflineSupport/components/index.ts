/**
 * Offline Support Components Barrel Export
 * 
 * Centralized export point for all offline support and PWA components,
 * providing a clean API for consuming code.
 */

export { OfflineDashboard } from './OfflineDashboard';
export { NetworkStatusIndicator } from './NetworkStatusIndicator';
export { SyncStatusPanel } from './SyncStatusPanel';
export { StorageQuotaIndicator } from './StorageQuotaIndicator';
export { PWAInstallPrompt } from './PWAInstallPrompt';
export { ConflictResolutionPanel } from './ConflictResolutionPanel';
export { OfflineCapabilities } from './OfflineCapabilities';

// Type re-exports for component props
export type { default as OfflineDashboardProps } from './OfflineDashboard';
export type { default as NetworkStatusIndicatorProps } from './NetworkStatusIndicator';
export type { default as SyncStatusPanelProps } from './SyncStatusPanel';
export type { default as StorageQuotaIndicatorProps } from './StorageQuotaIndicator';
export type { default as PWAInstallPromptProps } from './PWAInstallPrompt';
export type { default as ConflictResolutionPanelProps } from './ConflictResolutionPanel';
export type { default as OfflineCapabilitiesProps } from './OfflineCapabilities';
