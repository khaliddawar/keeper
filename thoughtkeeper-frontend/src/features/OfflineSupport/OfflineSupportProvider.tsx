/**
 * Offline Support Provider
 * 
 * React context provider that wraps the OfflineEngine and provides
 * offline capabilities, sync management, and PWA features to the application.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { OfflineEngine } from './OfflineEngine';
import type {
  NetworkStatus,
  SyncStatus,
  PWAInstallState,
  ServiceWorkerState,
  StorageQuota,
  SyncOperation,
  DataConflict,
  OfflineEvent,
  OfflineSupportConfig,
  OfflineSupportContextValue,
  ConflictResolutionStrategy,
  OfflineEntity
} from './types';

// Default configuration
const DEFAULT_CONFIG: OfflineSupportConfig = {
  enabled: true,
  serviceWorkerEnabled: true,
  backgroundSyncEnabled: true,
  pwaEnabled: true,
  indexedDBConfig: {
    name: 'ThoughtKeeperDB',
    version: 1,
    stores: ['notebooks', 'tasks', 'projects', 'settings', 'sync_operations'],
    maxStorageSize: 50 * 1024 * 1024 // 50MB
  },
  syncConfig: {
    enabled: true,
    syncInterval: 30000, // 30 seconds
    maxRetries: 3,
    retryBackoff: 'exponential',
    batchSize: 10,
    priorityThreshold: 'medium'
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
  }
};

// Context
const OfflineSupportContext = createContext<OfflineSupportContextValue | null>(null);

// Provider Props
interface OfflineSupportProviderProps {
  children: React.ReactNode;
  config?: Partial<OfflineSupportConfig>;
}

export const OfflineSupportProvider: React.FC<OfflineSupportProviderProps> = ({
  children,
  config = {}
}) => {
  const engineRef = useRef<OfflineEngine | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // State
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false,
    connectivityScore: 'offline'
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    status: 'offline',
    pendingOperations: 0,
    failedOperations: 0,
    totalOperations: 0
  });

  const [pwaStatus, setPwaStatus] = useState<PWAInstallState>({
    isInstallable: false,
    isInstalled: false,
    userDismissedCount: 0
  });

  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<ServiceWorkerState>({
    isRegistered: false,
    isInstalling: false,
    isWaiting: false,
    isActive: false,
    hasUpdate: false
  });

  const [storageQuota, setStorageQuota] = useState<StorageQuota>({
    usage: 0,
    quota: 0,
    usagePercentage: 0,
    breakdown: {
      indexedDB: 0,
      cache: 0,
      serviceWorker: 0,
      other: 0
    }
  });

  const [pendingOperations, setPendingOperations] = useState<SyncOperation[]>([]);
  const [conflicts, setConflicts] = useState<DataConflict[]>([]);
  const [recentEvents, setRecentEvents] = useState<OfflineEvent[]>([]);

  // Initialize engine
  useEffect(() => {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    engineRef.current = new OfflineEngine(finalConfig);

    const engine = engineRef.current;

    // Set up event listeners
    engine.addEventListener('engine-initialized', (state) => {
      setNetworkStatus(state.networkStatus);
      setSyncStatus(state.syncStatus);
      setPendingOperations(state.pendingOperations);
      setConflicts(state.conflicts);
      setStorageQuota(state.storageQuota);
      setRecentEvents(state.recentEvents);
      setIsInitialized(true);
    });

    engine.addEventListener('network-status-changed', (status: NetworkStatus) => {
      setNetworkStatus(status);
    });

    engine.addEventListener('sync-status-updated', (status: SyncStatus) => {
      setSyncStatus(status);
    });

    engine.addEventListener('sync-operation-added', (operation: SyncOperation) => {
      setPendingOperations(prev => [...prev, operation]);
    });

    engine.addEventListener('conflict-detected', (conflict: DataConflict) => {
      setConflicts(prev => [...prev, conflict]);
    });

    engine.addEventListener('conflict-resolved', ({ conflict }: { conflict: DataConflict }) => {
      setConflicts(prev => prev.filter(c => c.id !== conflict.id));
    });

    engine.addEventListener('event-added', (event: OfflineEvent) => {
      setRecentEvents(prev => [event, ...prev.slice(0, 99)]);
    });

    engine.addEventListener('storage-quota-updated', (quota: StorageQuota) => {
      setStorageQuota(quota);
    });

    // Initialize PWA features
    initializePWA();
    
    // Initialize service worker
    initializeServiceWorker();

    // Cleanup on unmount
    return () => {
      engine.destroy();
    };
  }, []);

  // PWA Initialization
  const initializePWA = useCallback(() => {
    if (!DEFAULT_CONFIG.pwaEnabled) return;

    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone ||
                       document.referrer.includes('android-app://');

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as any; // BeforeInstallPromptEvent
      
      setPwaStatus(prev => ({
        ...prev,
        isInstallable: true,
        installPromptEvent: event
      }));

      // Show install prompt after delay (if not dismissed too many times)
      const dismissCount = parseInt(localStorage.getItem('pwa-dismiss-count') || '0', 10);
      if (dismissCount < DEFAULT_CONFIG.pwaConfig.maxPromptDismissals) {
        setTimeout(() => {
          if (pwaStatus.userDismissedCount < DEFAULT_CONFIG.pwaConfig.maxPromptDismissals) {
            // Could show install prompt here or leave it for manual triggering
          }
        }, DEFAULT_CONFIG.pwaConfig.installPromptDelay);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Handle app installed event
    window.addEventListener('appinstalled', () => {
      setPwaStatus(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installationDate: Date.now(),
        installPromptEvent: undefined
      }));
      
      localStorage.setItem('pwa-installed', 'true');
      localStorage.setItem('pwa-install-date', Date.now().toString());
    });

    setPwaStatus(prev => ({
      ...prev,
      isInstalled,
      userDismissedCount: parseInt(localStorage.getItem('pwa-dismiss-count') || '0', 10)
    }));

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Service Worker Initialization
  const initializeServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !DEFAULT_CONFIG.serviceWorkerEnabled) return;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      setServiceWorkerStatus(prev => ({
        ...prev,
        isRegistered: true,
        isActive: registration.active !== null,
        isInstalling: registration.installing !== null,
        isWaiting: registration.waiting !== null
      }));

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        setServiceWorkerStatus(prev => ({
          ...prev,
          isInstalling: true
        }));

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setServiceWorkerStatus(prev => ({
              ...prev,
              hasUpdate: true,
              isWaiting: true
            }));
          }
        });
      });

      // Handle controlled change (new service worker took over)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setServiceWorkerStatus(prev => ({
          ...prev,
          hasUpdate: false,
          isWaiting: false,
          lastUpdated: Date.now()
        }));
      });

      // Periodic update checks
      setInterval(() => {
        registration.update();
      }, DEFAULT_CONFIG.pwaConfig.updateCheckInterval);

    } catch (error) {
      console.error('Service Worker registration failed:', error);
      setServiceWorkerStatus(prev => ({
        ...prev,
        registrationError: error.message
      }));
    }
  }, []);

  // Context methods
  const syncData = useCallback(async (options?: { 
    entityType?: string; 
    entityId?: string; 
    priority?: 'low' | 'medium' | 'high';
  }) => {
    if (!engineRef.current) throw new Error('Engine not initialized');
    
    try {
      const report = await engineRef.current.performSync(options);
      return report;
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }, []);

  const clearCache = useCallback(async (selective: boolean = false) => {
    if (!engineRef.current) return;
    
    try {
      await engineRef.current.clearCache(selective);
    } catch (error) {
      console.error('Clear cache failed:', error);
      throw error;
    }
  }, []);

  const resolveConflict = useCallback(async (
    conflictId: string, 
    strategy: ConflictResolutionStrategy, 
    customData?: any
  ) => {
    if (!engineRef.current) throw new Error('Engine not initialized');
    
    try {
      await engineRef.current.resolveConflict(conflictId, strategy, customData);
    } catch (error) {
      console.error('Conflict resolution failed:', error);
      throw error;
    }
  }, []);

  const showInstallPrompt = useCallback(async (): Promise<boolean> => {
    if (!pwaStatus.installPromptEvent) return false;

    try {
      await pwaStatus.installPromptEvent.prompt();
      const choiceResult = await pwaStatus.installPromptEvent.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setPwaStatus(prev => ({
          ...prev,
          isInstallable: false,
          installPromptEvent: undefined
        }));
        return true;
      } else {
        // User dismissed the prompt
        const newDismissCount = pwaStatus.userDismissedCount + 1;
        setPwaStatus(prev => ({
          ...prev,
          userDismissedCount: newDismissCount,
          lastPromptShown: Date.now()
        }));
        localStorage.setItem('pwa-dismiss-count', newDismissCount.toString());
        return false;
      }
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }, [pwaStatus.installPromptEvent, pwaStatus.userDismissedCount]);

  const updateServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Wait for controller change
        return new Promise<void>((resolve) => {
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
            resolve();
          });
        });
      }
    } catch (error) {
      console.error('Service worker update failed:', error);
      throw error;
    }
  }, []);

  const getOfflineCapability = useCallback((feature: string): boolean => {
    if (!networkStatus.isOnline) {
      // Define which features work offline
      const offlineCapabilities = {
        'dataAccess': true,
        'dataModification': true,
        'search': true,
        'analytics': true,
        'collaboration': false, // Requires network
        'exportImport': true,
        'fullFunctionality': false
      };
      
      return offlineCapabilities[feature] || false;
    }
    
    return true; // All features work when online
  }, [networkStatus.isOnline]);

  const estimateOfflineTime = useCallback((): number => {
    // Estimate how long the app can run offline based on storage and usage patterns
    const averageUsage = 1024 * 1024; // 1MB per hour (rough estimate)
    const availableSpace = storageQuota.quota - storageQuota.usage;
    const hoursEstimate = Math.floor(availableSpace / averageUsage);
    
    return Math.max(1, Math.min(hoursEstimate, 168)); // Between 1 hour and 1 week
  }, [storageQuota]);

  const getStorageBreakdown = useCallback(() => {
    return storageQuota.breakdown;
  }, [storageQuota.breakdown]);

  // Save entity method for components
  const saveEntity = useCallback(async (entity: OfflineEntity) => {
    if (!engineRef.current) throw new Error('Engine not initialized');
    return engineRef.current.saveEntity(entity);
  }, []);

  // Get entity method for components
  const getEntity = useCallback(async (entityType: string, entityId: string) => {
    if (!engineRef.current) return null;
    return engineRef.current.getEntity(entityType, entityId);
  }, []);

  // Context value
  const contextValue: OfflineSupportContextValue = {
    // Status
    networkStatus,
    syncStatus,
    pwaStatus,
    serviceWorkerStatus,
    storageQuota,
    
    // Data
    pendingOperations,
    conflicts,
    recentEvents,
    
    // Actions
    syncData,
    clearCache,
    resolveConflict,
    showInstallPrompt,
    updateServiceWorker,
    
    // Utilities
    getOfflineCapability,
    estimateOfflineTime,
    getStorageBreakdown
  };

  // Don't render children until initialized
  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        📱 Initializing offline support...
      </div>
    );
  }

  return (
    <OfflineSupportContext.Provider value={contextValue}>
      {children}
    </OfflineSupportContext.Provider>
  );
};

// Hook for consuming the offline support context
export const useOfflineSupport = () => {
  const context = useContext(OfflineSupportContext);
  if (!context) {
    throw new Error('useOfflineSupport must be used within an OfflineSupportProvider');
  }
  return context;
};

// Specialized hooks for specific offline features
export const useNetworkStatus = () => {
  const { networkStatus } = useOfflineSupport();

  const isOnline = networkStatus.isOnline;
  const connectionQuality = networkStatus.connectivityScore;
  const estimatedBandwidth = networkStatus.downlink;
  const isSlowConnection = networkStatus.saveData || networkStatus.effectiveType === '2g' || networkStatus.effectiveType === '3g';

  return {
    networkStatus,
    isOnline,
    connectionQuality,
    estimatedBandwidth,
    isSlowConnection
  };
};

export const useDataSync = () => {
  const { 
    syncStatus, 
    pendingOperations, 
    conflicts, 
    syncData, 
    resolveConflict 
  } = useOfflineSupport();

  const retryFailedOperations = useCallback(async () => {
    // Retry operations that have failed but haven't exceeded max retries
    const failedOps = pendingOperations.filter(op => 
      op.metadata.attempts > 0 && op.metadata.attempts < op.metadata.maxRetries
    );

    for (const op of failedOps) {
      await syncData({ 
        entityType: op.entityType, 
        entityId: op.entityId,
        priority: op.metadata.priority
      });
    }
  }, [pendingOperations, syncData]);

  const isEntitySynced = useCallback((entityType: string, entityId: string): boolean => {
    return !pendingOperations.some(op => 
      op.entityType === entityType && op.entityId === entityId
    );
  }, [pendingOperations]);

  const getEntityStatus = useCallback((entityType: string, entityId: string) => {
    const engine = (useContext(OfflineSupportContext) as any)?.engineRef?.current;
    return engine?.getEntitySyncStatus(entityType, entityId) || null;
  }, []);

  return {
    syncStatus,
    pendingOperations,
    conflicts,
    syncData,
    resolveConflict,
    retryFailedOperations,
    isEntitySynced,
    getEntityStatus
  };
};

export const usePWA = () => {
  const { 
    pwaStatus, 
    serviceWorkerStatus, 
    showInstallPrompt, 
    updateServiceWorker 
  } = useOfflineSupport();

  const canInstall = pwaStatus.isInstallable && !pwaStatus.isInstalled;
  const isUpdateAvailable = serviceWorkerStatus.hasUpdate;

  const dismissInstallPrompt = useCallback(() => {
    const newDismissCount = pwaStatus.userDismissedCount + 1;
    localStorage.setItem('pwa-dismiss-count', newDismissCount.toString());
  }, [pwaStatus.userDismissedCount]);

  const installUpdate = useCallback(async () => {
    await updateServiceWorker();
  }, [updateServiceWorker]);

  return {
    pwaStatus,
    serviceWorkerStatus,
    canInstall,
    isUpdateAvailable,
    showInstallPrompt,
    installUpdate,
    dismissInstallPrompt
  };
};
