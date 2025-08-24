/**
 * Offline Support & PWA Types
 * 
 * Defines the type system for offline-first architecture including
 * service workers, background sync, data persistence, and PWA capabilities.
 */

// Network and Connection Types
export interface NetworkStatus {
  isOnline: boolean;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'bluetooth' | 'unknown';
  effectiveType: '2g' | '3g' | '4g' | 'unknown';
  downlink: number; // Mbps
  rtt: number; // ms
  saveData: boolean;
  lastConnected?: number; // timestamp
  connectivityScore: 'excellent' | 'good' | 'poor' | 'offline';
}

export interface SyncStatus {
  status: 'synced' | 'syncing' | 'pending' | 'failed' | 'offline';
  lastSync?: number; // timestamp
  nextSync?: number; // timestamp
  pendingOperations: number;
  failedOperations: number;
  totalOperations: number;
  syncProgress?: number; // 0-100
  estimatedSyncTime?: number; // ms
}

// Data Persistence Types
export interface OfflineEntity {
  id: string;
  entityType: 'notebook' | 'task' | 'project' | 'settings';
  data: any;
  metadata: EntityMetadata;
  syncStatus: EntitySyncStatus;
}

export interface EntityMetadata {
  createdAt: number;
  updatedAt: number;
  lastSynced?: number;
  version: number;
  hash: string; // For integrity checking
  size: number; // In bytes
  source: 'local' | 'remote' | 'merged';
}

export interface EntitySyncStatus {
  status: 'synced' | 'dirty' | 'conflict' | 'deleted' | 'new';
  remoteVersion?: number;
  localVersion: number;
  conflictData?: any;
  retryCount: number;
  lastAttempt?: number;
}

// Service Worker Types
export interface ServiceWorkerMessage {
  type: ServiceWorkerMessageType;
  payload?: any;
  requestId?: string;
  timestamp: number;
}

export type ServiceWorkerMessageType =
  | 'CACHE_UPDATED'
  | 'SYNC_STARTED'
  | 'SYNC_COMPLETED'
  | 'SYNC_FAILED'
  | 'OFFLINE_DETECTED'
  | 'ONLINE_DETECTED'
  | 'DATA_UPDATED'
  | 'CONFLICT_DETECTED'
  | 'INSTALL_PROMPT'
  | 'UPDATE_AVAILABLE';

export interface ServiceWorkerState {
  isRegistered: boolean;
  isInstalling: boolean;
  isWaiting: boolean;
  isActive: boolean;
  hasUpdate: boolean;
  registrationError?: string;
  lastUpdated?: number;
}

// Background Sync Types
export interface BackgroundSyncConfig {
  enabled: boolean;
  syncInterval: number; // ms
  maxRetries: number;
  retryBackoff: 'linear' | 'exponential';
  batchSize: number;
  priorityThreshold: 'low' | 'medium' | 'high';
}

export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  entityType: 'notebook' | 'task' | 'project' | 'settings';
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  metadata: SyncOperationMetadata;
}

export type SyncOperationType =
  | 'data_sync'
  | 'schema_migration'
  | 'cache_update'
  | 'conflict_resolution'
  | 'batch_operation';

export interface SyncOperationMetadata {
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: number;
  attempts: number;
  maxRetries: number;
  nextRetry?: number;
  estimatedDuration: number; // ms
  dependencies?: string[]; // Other operation IDs
}

// PWA Installation Types
export interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  installPromptEvent?: BeforeInstallPromptEvent;
  installationMethod?: 'browser' | 'store' | 'manual';
  installationDate?: number;
  lastPromptShown?: number;
  userDismissedCount: number;
}

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Cache Management Types
export interface CacheStrategy {
  name: 'cacheFirst' | 'networkFirst' | 'staleWhileRevalidate' | 'networkOnly' | 'cacheOnly';
  maxAge: number; // ms
  maxEntries?: number;
  updateStrategy: 'immediate' | 'background' | 'manual';
}

export interface CacheConfig {
  version: string;
  strategies: Record<string, CacheStrategy>;
  staticAssets: string[];
  dynamicAssets: string[];
  excludePatterns: RegExp[];
}

export interface StorageQuota {
  usage: number; // bytes
  quota: number; // bytes
  usagePercentage: number;
  breakdown: {
    indexedDB: number;
    cache: number;
    serviceWorker: number;
    other: number;
  };
}

// Conflict Resolution Types
export interface DataConflict {
  id: string;
  entityType: 'notebook' | 'task' | 'project';
  entityId: string;
  localData: any;
  remoteData: any;
  conflictType: ConflictType;
  detectedAt: number;
  resolutionStrategy?: ConflictResolutionStrategy;
  resolved?: boolean;
  resolvedAt?: number;
  resolvedBy?: 'user' | 'auto' | 'system';
}

export type ConflictType =
  | 'version_mismatch'
  | 'concurrent_edit'
  | 'delete_conflict'
  | 'schema_conflict'
  | 'integrity_violation';

export type ConflictResolutionStrategy =
  | 'use_local'
  | 'use_remote'
  | 'merge_data'
  | 'user_choice'
  | 'create_copy'
  | 'skip_sync';

// Event Types
export interface OfflineEvent {
  id: string;
  type: OfflineEventType;
  timestamp: number;
  data?: any;
  source: 'service-worker' | 'application' | 'system';
}

export type OfflineEventType =
  | 'went_offline'
  | 'came_online'
  | 'sync_started'
  | 'sync_completed'
  | 'sync_failed'
  | 'data_updated'
  | 'conflict_detected'
  | 'conflict_resolved'
  | 'cache_updated'
  | 'quota_exceeded'
  | 'install_prompted'
  | 'app_installed'
  | 'update_available';

// Hook Return Types
export interface UseOfflineSupportReturn {
  // Network status
  networkStatus: NetworkStatus;
  isOnline: boolean;
  
  // Sync status
  syncStatus: SyncStatus;
  isSyncing: boolean;
  
  // PWA status
  pwaStatus: PWAInstallState;
  serviceWorkerStatus: ServiceWorkerState;
  
  // Actions
  forcSync: () => Promise<void>;
  clearCache: () => Promise<void>;
  showInstallPrompt: () => Promise<void>;
  updateServiceWorker: () => Promise<void>;
}

export interface UseNetworkStatusReturn {
  networkStatus: NetworkStatus;
  isOnline: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
  estimatedBandwidth: number;
  isSlowConnection: boolean;
}

export interface UseDataSyncReturn {
  syncStatus: SyncStatus;
  pendingOperations: SyncOperation[];
  conflicts: DataConflict[];
  
  // Actions
  syncData: (entityType?: string, entityId?: string) => Promise<void>;
  resolveConflict: (conflictId: string, strategy: ConflictResolutionStrategy) => Promise<void>;
  retryFailedOperations: () => Promise<void>;
  
  // Utilities
  isEntitySynced: (entityType: string, entityId: string) => boolean;
  getEntityStatus: (entityType: string, entityId: string) => EntitySyncStatus | null;
}

export interface UsePWAReturn {
  pwaStatus: PWAInstallState;
  serviceWorkerStatus: ServiceWorkerState;
  canInstall: boolean;
  isUpdateAvailable: boolean;
  
  // Actions
  showInstallPrompt: () => Promise<boolean>;
  installUpdate: () => Promise<void>;
  dismissInstallPrompt: () => void;
}

// Configuration Types
export interface OfflineSupportConfig {
  enabled: boolean;
  serviceWorkerEnabled: boolean;
  backgroundSyncEnabled: boolean;
  pwaEnabled: boolean;
  
  // Storage configuration
  indexedDBConfig: {
    name: string;
    version: number;
    stores: string[];
    maxStorageSize: number; // bytes
  };
  
  // Sync configuration
  syncConfig: BackgroundSyncConfig;
  
  // Cache configuration
  cacheConfig: CacheConfig;
  
  // Conflict resolution
  conflictResolution: {
    defaultStrategy: ConflictResolutionStrategy;
    autoResolveTimeout: number; // ms
    maxConflicts: number;
  };
  
  // PWA configuration
  pwaConfig: {
    manifestPath: string;
    installPromptDelay: number; // ms
    maxPromptDismissals: number;
    updateCheckInterval: number; // ms
  };
}

// Context Value Types
export interface OfflineSupportContextValue {
  // Status
  networkStatus: NetworkStatus;
  syncStatus: SyncStatus;
  pwaStatus: PWAInstallState;
  serviceWorkerStatus: ServiceWorkerState;
  storageQuota: StorageQuota;
  
  // Data
  pendingOperations: SyncOperation[];
  conflicts: DataConflict[];
  recentEvents: OfflineEvent[];
  
  // Actions
  syncData: (options?: { entityType?: string; entityId?: string; priority?: 'low' | 'medium' | 'high' }) => Promise<void>;
  clearCache: (selective?: boolean) => Promise<void>;
  resolveConflict: (conflictId: string, strategy: ConflictResolutionStrategy, customData?: any) => Promise<void>;
  showInstallPrompt: () => Promise<boolean>;
  updateServiceWorker: () => Promise<void>;
  
  // Utilities
  getOfflineCapability: (feature: string) => boolean;
  estimateOfflineTime: () => number; // hours
  getStorageBreakdown: () => StorageQuota['breakdown'];
}

// Utility Types
export interface OfflineCapabilities {
  dataAccess: boolean;
  dataModification: boolean;
  search: boolean;
  analytics: boolean;
  collaboration: boolean;
  exportImport: boolean;
  fullFunctionality: boolean;
}

export interface SyncReport {
  startTime: number;
  endTime: number;
  duration: number;
  operationsProcessed: number;
  operationsSucceeded: number;
  operationsFailed: number;
  conflictsDetected: number;
  conflictsResolved: number;
  bytesTransferred: number;
  status: 'success' | 'partial' | 'failed';
  errors?: string[];
}

// Storage Adapter Types
export interface StorageAdapter {
  name: string;
  get: <T>(key: string) => Promise<T | null>;
  set: <T>(key: string, value: T) => Promise<void>;
  delete: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  keys: () => Promise<string[]>;
  size: () => Promise<number>;
}

export interface IndexedDBAdapter extends StorageAdapter {
  openDB: (name: string, version: number) => Promise<IDBDatabase>;
  createStore: (storeName: string, keyPath: string) => Promise<void>;
  query: (storeName: string, query: any) => Promise<any[]>;
  transaction: (storeNames: string[], mode: 'readonly' | 'readwrite') => Promise<IDBTransaction>;
}
