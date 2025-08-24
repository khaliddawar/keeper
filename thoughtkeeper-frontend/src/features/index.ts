/**
 * Features Index - Central export for all advanced features
 * 
 * This file provides organized access to all advanced features in ThoughtKeeper.
 * Each feature is self-contained with its own components, hooks, and utilities.
 */

// Drag & Drop System
export * as DragDrop from './DragDrop';

// Re-export commonly used drag & drop components and hooks for convenience
export { 
  DragDropProvider, 
  useDragDrop, 
  DragPreview 
} from './DragDrop';

// Bulk Operations System
export * as BulkOperations from './BulkOperations';

// Re-export commonly used bulk operations components and hooks for convenience
export {
  BulkOperationsProvider,
  useBulkOperations,
  BulkActionToolbar,
  SelectionCheckbox
} from './BulkOperations';

// Advanced Search System
export * as AdvancedSearch from './AdvancedSearch';

// Re-export commonly used advanced search components and hooks for convenience
export {
  AdvancedSearchProvider,
  useAdvancedSearch,
  SearchBar,
  SearchResults,
  SearchFilters,
  SavedSearches
} from './AdvancedSearch';

// Virtual Scrolling System
export * as VirtualScrolling from './VirtualScrolling';

// Re-export commonly used virtual scrolling components and hooks for convenience
export {
  VirtualList,
  VirtualTaskList,
  VirtualNotebookList,
  VirtualSearchResults,
  useVirtualScroll
} from './VirtualScrolling';

// Export/Import System
export * as ExportImport from './ExportImport';

// Re-export commonly used export/import components and hooks for convenience
export {
  ExportImportProvider,
  useExportImport,
  ExportImportUtils,
  EXPORT_FORMATS,
  IMPORT_FORMATS,
  DEFAULT_EXPORT_CONFIG,
  DEFAULT_IMPORT_CONFIG,
  EXPORT_TEMPLATES
} from './ExportImport';

// Keyboard Shortcuts System
export * as KeyboardShortcuts from './KeyboardShortcuts';

// Re-export commonly used keyboard shortcuts components and hooks for convenience
export {
  KeyboardShortcutsProvider,
  useKeyboardShortcuts,
  useShortcuts,
  useShortcut,
  ShortcutTooltip,
  ShortcutHelpModal,
  ShortcutRecorder,
  ShortcutKeys,
  KeyboardShortcutUtils,
  SHORTCUT_CONTEXTS,
  SHORTCUT_CATEGORIES,
  DEFAULT_SHORTCUT_CONFIG
} from './KeyboardShortcuts';

// Advanced Analytics System
export * as Analytics from './Analytics';

// Re-export commonly used analytics components and hooks for convenience
export {
  AnalyticsProvider,
  useAnalytics,
  AnalyticsDashboard,
  MetricCard,
  InsightCard,
  GoalTracker,
  ProductivityChart,
  PatternsList,
  ExportButton
} from './Analytics';

// Real-time Collaboration System
export * as Collaboration from './Collaboration';

// Re-export commonly used collaboration components and hooks for convenience
export {
  CollaborationProvider,
  useCollaboration,
  usePresence,
  useCollaborativeEditing,
  useConflictResolution,
  CollaborationDashboard,
  PresenceIndicator,
  ConflictResolutionPanel,
  ActivityFeed,
  NotificationCenter,
  LiveEditIndicators,
  ConnectionStatus,
  CollaborationDemo
} from './Collaboration';

// Offline Support & PWA System
export * as OfflineSupport from './OfflineSupport';

// Re-export commonly used offline support components and hooks for convenience
export {
  OfflineSupportProvider,
  useOfflineSupport,
  useNetworkStatus,
  useDataSync,
  usePWA,
  OfflineDashboard,
  NetworkStatusIndicator,
  SyncStatusPanel,
  StorageQuotaIndicator,
  PWAInstallPrompt,
  ConflictResolutionPanel as OfflineConflictResolutionPanel,
  OfflineCapabilities,
  OfflineSupportDemo
} from './OfflineSupport';

// Performance Optimization & Monitoring System
export * as Performance from './Performance';

// Re-export commonly used performance components and hooks for convenience
export {
  PerformanceProvider,
  usePerformance,
  useMemoryOptimization,
  useLazyLoading,
  useBundleAnalysis,
  PerformanceDashboard,
  MetricDisplay,
  BundleAnalyzer,
  MemoryProfiler,
  LazyLoadManager,
  OptimizationRecommendations,
  PerformanceDemo
} from './Performance';

// Feature type definitions
export type FeatureName = 'dragDrop' | 'bulkOperations' | 'advancedSearch' | 'virtualScrolling' | 'exportImport' | 'keyboardShortcuts' | 'analytics' | 'collaboration' | 'offlineSupport' | 'performance';

// Feature configuration
export interface FeatureConfig {
  enabled: boolean;
  settings?: Record<string, any>;
}

export interface FeaturesConfig {
  dragDrop: FeatureConfig;
  bulkOperations?: FeatureConfig;
  advancedSearch?: FeatureConfig;
  virtualScrolling?: FeatureConfig;
  exportImport?: FeatureConfig;
  keyboardShortcuts?: FeatureConfig;
  analytics?: FeatureConfig;
  collaboration?: FeatureConfig;
  offlineSupport?: FeatureConfig;
  performance?: FeatureConfig;
}

// Default feature configuration
export const DEFAULT_FEATURES_CONFIG: FeaturesConfig = {
  dragDrop: {
    enabled: true,
    settings: {
      touchSupport: true,
      keyboardSupport: true,
      visualFeedback: true
    }
  },
  bulkOperations: {
    enabled: true,
    settings: {
      maxSelection: 100,
      keyboardShortcuts: true
    }
  },
  advancedSearch: {
    enabled: true,
    settings: {
      fullTextSearch: true,
      savedQueries: true,
      searchHistory: true
    }
  },
  virtualScrolling: {
    enabled: true,
    settings: {
      itemHeight: 80,
      overscanCount: 5,
      smoothScrolling: true,
      performanceMode: false
    }
  },
  exportImport: {
    enabled: true,
    settings: {
      defaultFormat: 'json',
      includeMetadata: true,
      maxFileSize: 100 * 1024 * 1024,
      autoBackup: false
    }
  },
  keyboardShortcuts: {
    enabled: true,
    settings: {
      enableDefaults: true,
      showTooltips: true,
      enableSequences: true,
      autoSave: true
    }
  },
  analytics: {
    enabled: true,
    settings: {
      trackProductivity: true,
      generateInsights: true
    }
  },
  collaboration: {
    enabled: true, // Simulation mode enabled by default
    settings: {
      simulationMode: true,
      realTimeUpdates: true,
      conflictResolution: true,
      maxCollaborators: 10,
      autoResolveConflicts: false,
      enableNotifications: true
    }
  },
  offlineSupport: {
    enabled: true,
    settings: {
      serviceWorkerEnabled: true,
      backgroundSyncEnabled: true,
      pwaEnabled: true,
      syncInterval: 30000,
      maxRetries: 3,
      retryBackoff: 'exponential',
      maxStorageSize: 100 * 1024 * 1024, // 100MB
      defaultConflictResolution: 'user_choice',
      enableInstallPrompt: true,
      enableOfflineIndicators: true,
      enableStorageManagement: true
    }
  },
  performance: {
    enabled: true,
    settings: {
      enableMetrics: true,
      enableMemoryMonitoring: true,
      enableBundleAnalysis: true,
      enableLazyLoading: true,
      enableOptimizationRecommendations: true,
      autoOptimize: false,
      memoryThreshold: 75,
      performanceThreshold: 100,
      trackingInterval: 2000,
      maxDataPoints: 100,
      enableProfiling: true,
      enableTracing: true,
      enableReporting: true,
      reportingInterval: 60000
    }
  }
};

// Feature detection utilities
export const FeatureDetection = {
  /**
   * Check if a feature is enabled
   */
  isEnabled: (feature: FeatureName, config: FeaturesConfig = DEFAULT_FEATURES_CONFIG): boolean => {
    return config[feature]?.enabled ?? false;
  },
  
  /**
   * Get feature settings
   */
  getSettings: (feature: FeatureName, config: FeaturesConfig = DEFAULT_FEATURES_CONFIG): Record<string, any> => {
    return config[feature]?.settings ?? {};
  },
  
  /**
   * Check browser capabilities for features
   */
  browserSupport: {
    dragDrop: () => 'draggable' in document.createElement('div'),
    touch: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    webWorkers: () => typeof Worker !== 'undefined',
    indexedDB: () => 'indexedDB' in window,
    serviceWorker: () => 'serviceWorker' in navigator,
    intersection: () => 'IntersectionObserver' in window,
    resize: () => 'ResizeObserver' in window,
    fileApi: () => 'File' in window && 'FileList' in window && 'FileReader' in window,
    blob: () => 'Blob' in window && 'URL' in window && 'createObjectURL' in URL,
    performance: () => typeof performance !== 'undefined' && 'memory' in performance
  }
};

// Feature status type
export interface FeatureStatus {
  name: FeatureName;
  enabled: boolean;
  loaded: boolean;
  error?: string;
  browserSupported: boolean;
}

// Global feature manager (placeholder for future implementation)
export class FeatureManager {
  private config: FeaturesConfig;
  private loadedFeatures = new Set<FeatureName>();
  
  constructor(config: FeaturesConfig = DEFAULT_FEATURES_CONFIG) {
    this.config = config;
  }
  
  getStatus(feature: FeatureName): FeatureStatus {
    return {
      name: feature,
      enabled: this.config[feature]?.enabled ?? false,
      loaded: this.loadedFeatures.has(feature),
      browserSupported: this.checkBrowserSupport(feature)
    };
  }
  
  getAllStatus(): FeatureStatus[] {
    return Object.keys(this.config).map(feature => 
      this.getStatus(feature as FeatureName)
    );
  }
  
  private checkBrowserSupport(feature: FeatureName): boolean {
    switch (feature) {
      case 'dragDrop':
        return FeatureDetection.browserSupport.dragDrop() && FeatureDetection.browserSupport.touch();
      case 'bulkOperations':
        return FeatureDetection.browserSupport.intersection();
      case 'advancedSearch':
        return FeatureDetection.browserSupport.webWorkers();
      case 'virtualScrolling':
        return FeatureDetection.browserSupport.intersection() && FeatureDetection.browserSupport.resize();
      case 'exportImport':
        return FeatureDetection.browserSupport.fileApi() && FeatureDetection.browserSupport.blob();
      case 'keyboardShortcuts':
        return true; // Keyboard shortcuts work in all browsers
      case 'analytics':
        return FeatureDetection.browserSupport.indexedDB();
      case 'collaboration':
        return FeatureDetection.browserSupport.serviceWorker();
      case 'offlineSupport':
        return FeatureDetection.browserSupport.serviceWorker() && FeatureDetection.browserSupport.indexedDB();
      case 'performance':
        return FeatureDetection.browserSupport.performance();
      default:
        return true;
    }
  }
  
  enableFeature(feature: FeatureName, settings?: Record<string, any>): void {
    this.config[feature] = {
      enabled: true,
      settings: { ...this.config[feature]?.settings, ...settings }
    };
  }
  
  disableFeature(feature: FeatureName): void {
    if (this.config[feature]) {
      this.config[feature].enabled = false;
    }
  }
}

// Export default instance
export const featureManager = new FeatureManager();

// Development utilities
if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.NODE_ENV === 'development') {
  (window as any).FeatureManager = featureManager;
  (window as any).FeatureDetection = FeatureDetection;
  
  console.log('🎯 Features available:');
  featureManager.getAllStatus().forEach(status => {
    const icon = status.enabled ? '✅' : '❌';
    const support = status.browserSupported ? '🌐' : '⚠️';
    console.log(`  ${icon} ${support} ${status.name}`);
  });
}
