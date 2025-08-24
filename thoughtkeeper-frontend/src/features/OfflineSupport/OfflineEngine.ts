/**
 * Offline Engine
 * 
 * Core engine for managing offline functionality including data persistence,
 * background sync, network monitoring, and service worker coordination.
 */

import type {
  NetworkStatus,
  SyncStatus,
  OfflineEntity,
  SyncOperation,
  DataConflict,
  OfflineSupportConfig,
  StorageQuota,
  OfflineEvent,
  ServiceWorkerMessage,
  ConflictResolutionStrategy,
  SyncReport,
  EntitySyncStatus
} from './types';

export class OfflineEngine {
  private config: OfflineSupportConfig;
  private eventListeners = new Map<string, Set<Function>>();
  private db: IDBDatabase | null = null;
  private syncTimer: number | null = null;
  private networkMonitor: number | null = null;
  
  // State
  private networkStatus: NetworkStatus = {
    isOnline: navigator.onLine,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false,
    connectivityScore: 'offline'
  };
  
  private syncStatus: SyncStatus = {
    status: 'offline',
    pendingOperations: 0,
    failedOperations: 0,
    totalOperations: 0
  };
  
  private pendingOperations: SyncOperation[] = [];
  private conflicts: DataConflict[] = [];
  private recentEvents: OfflineEvent[] = [];
  private storageQuota: StorageQuota = {
    usage: 0,
    quota: 0,
    usagePercentage: 0,
    breakdown: {
      indexedDB: 0,
      cache: 0,
      serviceWorker: 0,
      other: 0
    }
  };

  constructor(config: OfflineSupportConfig) {
    this.config = {
      syncConfig: {
        enabled: true,
        syncInterval: 30000, // 30 seconds
        maxRetries: 3,
        retryBackoff: 'exponential',
        batchSize: 10,
        priorityThreshold: 'medium'
      },
      indexedDBConfig: {
        name: 'ThoughtKeeperDB',
        version: 1,
        stores: ['notebooks', 'tasks', 'projects', 'settings', 'sync_operations'],
        maxStorageSize: 50 * 1024 * 1024 // 50MB
      },
      cacheConfig: {
        version: '1.0.0',
        strategies: {
          static: {
            name: 'cacheFirst',
            maxAge: 86400000, // 1 day
            updateStrategy: 'background'
          },
          dynamic: {
            name: 'networkFirst',
            maxAge: 3600000, // 1 hour
            updateStrategy: 'immediate'
          }
        },
        staticAssets: ['/', '/static/js/', '/static/css/'],
        dynamicAssets: ['/api/'],
        excludePatterns: [/\/_next\//, /\/api\/stream/]
      },
      conflictResolution: {
        defaultStrategy: 'user_choice',
        autoResolveTimeout: 300000, // 5 minutes
        maxConflicts: 100
      },
      pwaConfig: {
        manifestPath: '/manifest.json',
        installPromptDelay: 120000, // 2 minutes
        maxPromptDismissals: 3,
        updateCheckInterval: 3600000 // 1 hour
      },
      ...config
    };

    this.initializeEngine();
  }

  // Event System
  addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  removeEventListener(event: string, callback: Function): void {
    this.eventListeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any): void {
    this.eventListeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Offline engine event listener error:', error);
      }
    });
  }

  // Engine Initialization
  private async initializeEngine(): Promise<void> {
    if (!this.config.enabled) return;

    try {
      // Initialize IndexedDB
      await this.initializeIndexedDB();
      
      // Set up network monitoring
      this.setupNetworkMonitoring();
      
      // Start sync timer
      if (this.config.backgroundSyncEnabled) {
        this.startSyncTimer();
      }
      
      // Initialize service worker communication
      this.setupServiceWorkerCommunication();
      
      // Load pending operations
      await this.loadPendingOperations();
      
      // Update storage quota
      await this.updateStorageQuota();
      
      // Emit ready event
      this.addEvent({
        type: 'sync_started',
        data: { initialized: true },
        source: 'application'
      });
      
      this.emit('engine-initialized', this.getState());
      
    } catch (error) {
      console.error('Failed to initialize offline engine:', error);
      this.emit('engine-error', { error: error.message });
    }
  }

  // IndexedDB Management
  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(
        this.config.indexedDBConfig.name,
        this.config.indexedDBConfig.version
      );

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        this.config.indexedDBConfig.stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' });
            
            // Add indexes based on store type
            if (storeName === 'sync_operations') {
              store.createIndex('entityType', 'entityType', { unique: false });
              store.createIndex('status', 'metadata.status', { unique: false });
              store.createIndex('priority', 'metadata.priority', { unique: false });
              store.createIndex('createdAt', 'metadata.createdAt', { unique: false });
            }
            
            if (['notebooks', 'tasks', 'projects'].includes(storeName)) {
              store.createIndex('updatedAt', 'metadata.updatedAt', { unique: false });
              store.createIndex('syncStatus', 'syncStatus.status', { unique: false });
            }
          }
        });
      };
    });
  }

  // Data Persistence
  async saveEntity(entity: OfflineEntity): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([entity.entityType], 'readwrite');
      const store = transaction.objectStore(entity.entityType);
      
      // Update metadata
      entity.metadata.updatedAt = Date.now();
      entity.metadata.version += 1;
      entity.metadata.hash = this.generateHash(entity.data);
      entity.metadata.size = JSON.stringify(entity).length;
      
      // Mark as dirty if not already synced
      if (entity.syncStatus.status === 'synced') {
        entity.syncStatus.status = 'dirty';
        entity.syncStatus.localVersion += 1;
      }

      const request = store.put(entity);
      
      request.onsuccess = () => {
        // Create sync operation
        this.addSyncOperation({
          type: 'data_sync',
          entityType: entity.entityType,
          entityId: entity.id,
          operation: 'update',
          data: entity.data,
          metadata: {
            priority: 'medium',
            createdAt: Date.now(),
            attempts: 0,
            maxRetries: 3,
            estimatedDuration: 1000
          }
        });
        
        resolve();
        this.emit('entity-saved', entity);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to save entity'));
      };
    });
  }

  async getEntity(entityType: string, entityId: string): Promise<OfflineEntity | null> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([entityType], 'readonly');
      const store = transaction.objectStore(entityType);
      const request = store.get(entityId);
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to get entity'));
      };
    });
  }

  async getAllEntities(entityType: string): Promise<OfflineEntity[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([entityType], 'readonly');
      const store = transaction.objectStore(entityType);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to get entities'));
      };
    });
  }

  async deleteEntity(entityType: string, entityId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([entityType], 'readwrite');
      const store = transaction.objectStore(entityType);
      const request = store.delete(entityId);
      
      request.onsuccess = () => {
        // Create sync operation for deletion
        this.addSyncOperation({
          type: 'data_sync',
          entityType: entityType as any,
          entityId,
          operation: 'delete',
          data: null,
          metadata: {
            priority: 'high',
            createdAt: Date.now(),
            attempts: 0,
            maxRetries: 3,
            estimatedDuration: 500
          }
        });
        
        resolve();
        this.emit('entity-deleted', { entityType, entityId });
      };
      
      request.onerror = () => {
        reject(new Error('Failed to delete entity'));
      };
    });
  }

  // Sync Operations Management
  private async addSyncOperation(operation: Omit<SyncOperation, 'id'>): Promise<void> {
    const syncOperation: SyncOperation = {
      ...operation,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.pendingOperations.push(syncOperation);
    
    // Persist to IndexedDB
    if (this.db) {
      const transaction = this.db.transaction(['sync_operations'], 'readwrite');
      const store = transaction.objectStore('sync_operations');
      store.put({
        id: syncOperation.id,
        ...syncOperation,
        status: 'pending'
      });
    }
    
    this.updateSyncStatus();
    this.emit('sync-operation-added', syncOperation);
  }

  private async loadPendingOperations(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_operations'], 'readonly');
      const store = transaction.objectStore('sync_operations');
      const index = store.index('status');
      const request = index.getAll('pending');
      
      request.onsuccess = () => {
        this.pendingOperations = request.result.map(op => ({
          id: op.id,
          type: op.type,
          entityType: op.entityType,
          entityId: op.entityId,
          operation: op.operation,
          data: op.data,
          metadata: op.metadata
        }));
        
        this.updateSyncStatus();
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error('Failed to load pending operations'));
      };
    });
  }

  // Network Monitoring
  private setupNetworkMonitoring(): void {
    // Basic online/offline detection
    window.addEventListener('online', () => {
      this.updateNetworkStatus({ isOnline: true });
      this.addEvent({
        type: 'came_online',
        source: 'system'
      });
    });
    
    window.addEventListener('offline', () => {
      this.updateNetworkStatus({ isOnline: false });
      this.addEvent({
        type: 'went_offline',
        source: 'system'
      });
    });

    // Network Information API (if available)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const updateConnectionInfo = () => {
        this.updateNetworkStatus({
          isOnline: navigator.onLine,
          connectionType: connection.type || 'unknown',
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
          saveData: connection.saveData || false
        });
      };

      connection.addEventListener('change', updateConnectionInfo);
      updateConnectionInfo();
    }

    // Periodic connectivity check
    this.networkMonitor = window.setInterval(() => {
      this.checkConnectivity();
    }, 10000); // Every 10 seconds
  }

  private async checkConnectivity(): Promise<void> {
    if (!navigator.onLine) {
      this.updateNetworkStatus({ 
        isOnline: false,
        connectivityScore: 'offline',
        lastConnected: this.networkStatus.lastConnected
      });
      return;
    }

    try {
      const startTime = Date.now();
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });
      
      const responseTime = Date.now() - startTime;
      const isHealthy = response.ok;
      
      let connectivityScore: NetworkStatus['connectivityScore'] = 'excellent';
      if (!isHealthy) connectivityScore = 'offline';
      else if (responseTime > 2000) connectivityScore = 'poor';
      else if (responseTime > 500) connectivityScore = 'good';

      this.updateNetworkStatus({
        isOnline: isHealthy,
        connectivityScore,
        rtt: responseTime,
        lastConnected: isHealthy ? Date.now() : this.networkStatus.lastConnected
      });

    } catch (error) {
      this.updateNetworkStatus({
        isOnline: false,
        connectivityScore: 'offline'
      });
    }
  }

  private updateNetworkStatus(updates: Partial<NetworkStatus>): void {
    const wasOnline = this.networkStatus.isOnline;
    this.networkStatus = { ...this.networkStatus, ...updates };
    
    // Emit network status change
    this.emit('network-status-changed', this.networkStatus);
    
    // Start/stop sync based on connectivity
    if (!wasOnline && this.networkStatus.isOnline) {
      this.startSyncTimer();
    } else if (wasOnline && !this.networkStatus.isOnline) {
      this.stopSyncTimer();
    }
  }

  // Background Sync
  private startSyncTimer(): void {
    if (this.syncTimer || !this.config.syncConfig.enabled) return;
    
    this.syncTimer = window.setInterval(() => {
      if (this.networkStatus.isOnline && this.pendingOperations.length > 0) {
        this.performSync();
      }
    }, this.config.syncConfig.syncInterval);
  }

  private stopSyncTimer(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  async performSync(options?: { entityType?: string; entityId?: string; priority?: 'low' | 'medium' | 'high' }): Promise<SyncReport> {
    if (!this.networkStatus.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    const startTime = Date.now();
    let operationsProcessed = 0;
    let operationsSucceeded = 0;
    let operationsFailed = 0;
    let conflictsDetected = 0;
    let bytesTransferred = 0;
    const errors: string[] = [];

    this.updateSyncStatus({ status: 'syncing', syncProgress: 0 });
    this.addEvent({ type: 'sync_started', source: 'application' });

    try {
      // Filter operations based on options
      let operationsToSync = [...this.pendingOperations];
      
      if (options?.entityType) {
        operationsToSync = operationsToSync.filter(op => op.entityType === options.entityType);
      }
      
      if (options?.entityId) {
        operationsToSync = operationsToSync.filter(op => op.entityId === options.entityId);
      }
      
      if (options?.priority) {
        const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
        const minPriority = priorityOrder[options.priority];
        operationsToSync = operationsToSync.filter(op => 
          priorityOrder[op.metadata.priority] >= minPriority
        );
      }

      // Sort by priority and creation time
      operationsToSync.sort((a, b) => {
        const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
        const priorityDiff = priorityOrder[b.metadata.priority] - priorityOrder[a.metadata.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.metadata.createdAt - b.metadata.createdAt;
      });

      // Process operations in batches
      const batchSize = this.config.syncConfig.batchSize;
      for (let i = 0; i < operationsToSync.length; i += batchSize) {
        const batch = operationsToSync.slice(i, i + batchSize);
        
        for (const operation of batch) {
          try {
            operationsProcessed++;
            
            // Simulate API call
            const result = await this.syncOperation(operation);
            
            if (result.success) {
              operationsSucceeded++;
              bytesTransferred += result.bytesTransferred || 0;
              
              // Remove from pending operations
              this.pendingOperations = this.pendingOperations.filter(op => op.id !== operation.id);
              
              // Remove from IndexedDB
              if (this.db) {
                const transaction = this.db.transaction(['sync_operations'], 'readwrite');
                const store = transaction.objectStore('sync_operations');
                store.delete(operation.id);
              }
              
            } else if (result.conflict) {
              conflictsDetected++;
              this.handleSyncConflict(operation, result.conflictData);
              
            } else {
              operationsFailed++;
              errors.push(`Operation ${operation.id}: ${result.error}`);
              
              // Update retry count
              operation.metadata.attempts++;
              if (operation.metadata.attempts >= operation.metadata.maxRetries) {
                // Mark as failed permanently
                this.pendingOperations = this.pendingOperations.filter(op => op.id !== operation.id);
              } else {
                // Schedule retry with backoff
                const backoffMultiplier = this.config.syncConfig.retryBackoff === 'exponential' 
                  ? Math.pow(2, operation.metadata.attempts) 
                  : operation.metadata.attempts;
                operation.metadata.nextRetry = Date.now() + (5000 * backoffMultiplier);
              }
            }
            
          } catch (error) {
            operationsFailed++;
            errors.push(`Operation ${operation.id}: ${error.message}`);
          }
          
          // Update progress
          const progress = Math.round((operationsProcessed / operationsToSync.length) * 100);
          this.updateSyncStatus({ syncProgress: progress });
        }
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Determine overall status
      let status: SyncReport['status'] = 'success';
      if (operationsFailed > 0) {
        status = operationsSucceeded > 0 ? 'partial' : 'failed';
      }

      const report: SyncReport = {
        startTime,
        endTime,
        duration,
        operationsProcessed,
        operationsSucceeded,
        operationsFailed,
        conflictsDetected,
        conflictsResolved: 0, // TODO: Track resolved conflicts
        bytesTransferred,
        status,
        errors: errors.length > 0 ? errors : undefined
      };

      this.updateSyncStatus({
        status: this.pendingOperations.length === 0 ? 'synced' : 'pending',
        lastSync: Date.now(),
        syncProgress: undefined
      });

      this.addEvent({
        type: 'sync_completed',
        data: report,
        source: 'application'
      });

      this.emit('sync-completed', report);
      return report;

    } catch (error) {
      this.updateSyncStatus({
        status: 'failed',
        syncProgress: undefined
      });

      this.addEvent({
        type: 'sync_failed',
        data: { error: error.message },
        source: 'application'
      });

      throw error;
    }
  }

  private async syncOperation(operation: SyncOperation): Promise<{
    success: boolean;
    conflict?: boolean;
    conflictData?: any;
    error?: string;
    bytesTransferred?: number;
  }> {
    // Simulate API communication with realistic delays and responses
    const delay = Math.random() * 1000 + 500; // 500-1500ms
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Simulate different outcomes
    const random = Math.random();
    
    if (random < 0.05) { // 5% conflict rate
      return {
        success: false,
        conflict: true,
        conflictData: {
          remoteVersion: Date.now(),
          remoteData: { ...operation.data, modifiedBy: 'other_user' }
        }
      };
    } else if (random < 0.1) { // 5% error rate
      return {
        success: false,
        error: 'Network timeout'
      };
    } else { // 90% success rate
      return {
        success: true,
        bytesTransferred: JSON.stringify(operation.data).length
      };
    }
  }

  private handleSyncConflict(operation: SyncOperation, conflictData: any): void {
    const conflict: DataConflict = {
      id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      entityType: operation.entityType,
      entityId: operation.entityId,
      localData: operation.data,
      remoteData: conflictData.remoteData,
      conflictType: 'concurrent_edit',
      detectedAt: Date.now()
    };

    this.conflicts.push(conflict);
    this.addEvent({
      type: 'conflict_detected',
      data: conflict,
      source: 'application'
    });

    this.emit('conflict-detected', conflict);
  }

  async resolveConflict(
    conflictId: string, 
    strategy: ConflictResolutionStrategy, 
    customData?: any
  ): Promise<void> {
    const conflict = this.conflicts.find(c => c.id === conflictId);
    if (!conflict) throw new Error('Conflict not found');

    let resolvedData: any;

    switch (strategy) {
      case 'use_local':
        resolvedData = conflict.localData;
        break;
      case 'use_remote':
        resolvedData = conflict.remoteData;
        break;
      case 'merge_data':
        resolvedData = { ...conflict.remoteData, ...conflict.localData };
        break;
      case 'user_choice':
        resolvedData = customData;
        break;
      case 'create_copy':
        // Create a copy with a new ID
        resolvedData = { 
          ...conflict.localData, 
          id: `${conflict.entityId}_copy_${Date.now()}`,
          title: `${conflict.localData.title} (Copy)`
        };
        break;
      default:
        throw new Error('Invalid resolution strategy');
    }

    // Apply resolution
    const entity: OfflineEntity = {
      id: conflict.entityId,
      entityType: conflict.entityType,
      data: resolvedData,
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
        hash: this.generateHash(resolvedData),
        size: JSON.stringify(resolvedData).length,
        source: 'merged'
      },
      syncStatus: {
        status: 'dirty',
        localVersion: 1,
        retryCount: 0
      }
    };

    await this.saveEntity(entity);

    // Mark conflict as resolved
    conflict.resolved = true;
    conflict.resolvedAt = Date.now();
    conflict.resolvedBy = 'user';
    conflict.resolutionStrategy = strategy;

    // Remove from active conflicts
    this.conflicts = this.conflicts.filter(c => c.id !== conflictId);

    this.addEvent({
      type: 'conflict_resolved',
      data: { conflictId, strategy },
      source: 'application'
    });

    this.emit('conflict-resolved', { conflict, strategy });
  }

  // Service Worker Communication
  private setupServiceWorkerCommunication(): void {
    if (!('serviceWorker' in navigator) || !this.config.serviceWorkerEnabled) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      const message: ServiceWorkerMessage = event.data;
      this.handleServiceWorkerMessage(message);
    });
  }

  private handleServiceWorkerMessage(message: ServiceWorkerMessage): void {
    switch (message.type) {
      case 'CACHE_UPDATED':
        this.addEvent({
          type: 'cache_updated',
          data: message.payload,
          source: 'service-worker'
        });
        break;
      
      case 'SYNC_STARTED':
      case 'SYNC_COMPLETED':
      case 'SYNC_FAILED':
        // Handle service worker initiated sync
        break;
      
      case 'OFFLINE_DETECTED':
        this.updateNetworkStatus({ isOnline: false });
        break;
      
      case 'ONLINE_DETECTED':
        this.updateNetworkStatus({ isOnline: true });
        break;
    }
    
    this.emit('service-worker-message', message);
  }

  // Storage Management
  private async updateStorageQuota(): Promise<void> {
    if (!('storage' in navigator && 'estimate' in navigator.storage)) return;

    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const usagePercentage = quota > 0 ? Math.round((usage / quota) * 100) : 0;

      // Breakdown by usage details (if available)
      const usageDetails = estimate.usageDetails || {};
      
      this.storageQuota = {
        usage,
        quota,
        usagePercentage,
        breakdown: {
          indexedDB: usageDetails.indexedDB || 0,
          cache: usageDetails.caches || 0,
          serviceWorker: usageDetails.serviceWorker || 0,
          other: usage - (usageDetails.indexedDB || 0) - (usageDetails.caches || 0) - (usageDetails.serviceWorker || 0)
        }
      };

      this.emit('storage-quota-updated', this.storageQuota);

      // Warn if usage is high
      if (usagePercentage > 80) {
        this.addEvent({
          type: 'quota_exceeded',
          data: { usage, quota, percentage: usagePercentage },
          source: 'system'
        });
      }

    } catch (error) {
      console.warn('Failed to get storage estimate:', error);
    }
  }

  async clearCache(selective: boolean = false): Promise<void> {
    if (!('caches' in window)) return;

    try {
      if (selective) {
        // Clear only dynamic caches, keep static assets
        const cacheNames = await caches.keys();
        const dynamicCaches = cacheNames.filter(name => 
          name.includes('dynamic') || name.includes('runtime')
        );
        
        await Promise.all(dynamicCaches.map(name => caches.delete(name)));
      } else {
        // Clear all caches
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      await this.updateStorageQuota();
      
      this.addEvent({
        type: 'cache_updated',
        data: { cleared: true, selective },
        source: 'application'
      });

    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  // Event Management
  private addEvent(event: Omit<OfflineEvent, 'id' | 'timestamp'>): void {
    const fullEvent: OfflineEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    this.recentEvents.unshift(fullEvent);
    
    // Keep only recent events (last 100)
    if (this.recentEvents.length > 100) {
      this.recentEvents = this.recentEvents.slice(0, 100);
    }

    this.emit('event-added', fullEvent);
  }

  // Utility Methods
  private generateHash(data: any): string {
    // Simple hash function for data integrity
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private updateSyncStatus(updates: Partial<SyncStatus>): void {
    this.syncStatus = {
      ...this.syncStatus,
      pendingOperations: this.pendingOperations.length,
      failedOperations: this.pendingOperations.filter(op => op.metadata.attempts >= op.metadata.maxRetries).length,
      totalOperations: this.pendingOperations.length,
      ...updates
    };

    this.emit('sync-status-updated', this.syncStatus);
  }

  // Public Getters
  getNetworkStatus(): NetworkStatus {
    return { ...this.networkStatus };
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  getPendingOperations(): SyncOperation[] {
    return [...this.pendingOperations];
  }

  getConflicts(): DataConflict[] {
    return [...this.conflicts];
  }

  getRecentEvents(limit: number = 20): OfflineEvent[] {
    return this.recentEvents.slice(0, limit);
  }

  getStorageQuota(): StorageQuota {
    return { ...this.storageQuota };
  }

  getState() {
    return {
      networkStatus: this.getNetworkStatus(),
      syncStatus: this.getSyncStatus(),
      pendingOperations: this.getPendingOperations(),
      conflicts: this.getConflicts(),
      storageQuota: this.getStorageQuota(),
      recentEvents: this.getRecentEvents()
    };
  }

  getEntitySyncStatus(entityType: string, entityId: string): EntitySyncStatus | null {
    const operation = this.pendingOperations.find(op => 
      op.entityType === entityType && op.entityId === entityId
    );
    
    if (operation) {
      return {
        status: 'dirty',
        localVersion: 1,
        retryCount: operation.metadata.attempts,
        lastAttempt: operation.metadata.nextRetry
      };
    }
    
    return null; // Entity is synced
  }

  // Cleanup
  destroy(): void {
    this.stopSyncTimer();
    
    if (this.networkMonitor) {
      clearInterval(this.networkMonitor);
    }
    
    this.eventListeners.clear();
    
    if (this.db) {
      this.db.close();
    }
  }
}
