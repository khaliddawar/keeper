import React, { useState } from 'react';
import { OfflineSupportProvider } from '../OfflineSupportProvider';
import { OfflineDashboard } from '../components/OfflineDashboard';
import { NetworkStatusIndicator } from '../components/NetworkStatusIndicator';
import { PWAInstallPrompt } from '../components/PWAInstallPrompt';
import { StorageQuotaIndicator } from '../components/StorageQuotaIndicator';
import { SyncStatusPanel } from '../components/SyncStatusPanel';
import { ConflictResolutionPanel } from '../components/ConflictResolutionPanel';
import { OfflineCapabilities } from '../components/OfflineCapabilities';
import type { OfflineSupportConfig, NetworkStatus, SyncStatus, StorageQuota, DataConflict, SyncOperation } from '../types';

/**
 * Offline Support & PWA Demo Component
 * 
 * Interactive demonstration of offline capabilities, service worker management,
 * PWA installation, sync status, conflict resolution, and storage management.
 */

// Mock data for demonstration
const createMockNetworkStatus = (isOnline: boolean): NetworkStatus => ({
  isOnline,
  connectionType: isOnline ? 'wifi' : 'unknown',
  effectiveType: isOnline ? '4g' : 'unknown',
  downlink: isOnline ? 25.5 : 0,
  rtt: isOnline ? 45 : 0,
  saveData: false,
  lastConnected: isOnline ? Date.now() : Date.now() - 300000, // 5 minutes ago if offline
  connectivityScore: isOnline ? 'excellent' : 'offline'
});

const createMockSyncStatus = (pendingOps: number): SyncStatus => ({
  status: pendingOps > 0 ? 'pending' : 'synced',
  lastSync: Date.now() - 120000, // 2 minutes ago
  pendingOperations: pendingOps,
  failedOperations: Math.floor(pendingOps * 0.1),
  totalOperations: pendingOps + 45,
  syncProgress: pendingOps > 0 ? 75 : undefined
});

const createMockStorageQuota = (): StorageQuota => ({
  usage: 45 * 1024 * 1024, // 45MB
  quota: 100 * 1024 * 1024, // 100MB
  usagePercentage: 45,
  breakdown: {
    indexedDB: 25 * 1024 * 1024,
    cache: 15 * 1024 * 1024,
    serviceWorker: 3 * 1024 * 1024,
    other: 2 * 1024 * 1024
  }
});

const createMockConflicts = (): DataConflict[] => [
  {
    id: 'conflict-1',
    entityType: 'task',
    entityId: 'task-123',
    localData: {
      id: 'task-123',
      title: 'Updated Task Title (Local)',
      description: 'This was modified locally',
      status: 'in-progress',
      updatedAt: Date.now() - 30000
    },
    remoteData: {
      id: 'task-123',
      title: 'Updated Task Title (Remote)',
      description: 'This was modified remotely',
      status: 'completed',
      updatedAt: Date.now() - 60000
    },
    conflictType: 'concurrent_edit',
    detectedAt: Date.now() - 10000
  },
  {
    id: 'conflict-2',
    entityType: 'notebook',
    entityId: 'notebook-456',
    localData: {
      id: 'notebook-456',
      name: 'Work Notes',
      content: 'Local version of content...',
      tags: ['work', 'important']
    },
    remoteData: {
      id: 'notebook-456',
      name: 'Work Notes',
      content: 'Remote version of content...',
      tags: ['work', 'urgent']
    },
    conflictType: 'version_mismatch',
    detectedAt: Date.now() - 300000
  }
];

const createMockSyncOperations = (count: number): SyncOperation[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `sync-op-${i + 1}`,
    type: 'data_sync',
    entityType: i % 2 === 0 ? 'task' : 'notebook',
    entityId: `entity-${i + 1}`,
    operation: ['create', 'update', 'delete'][i % 3] as any,
    data: {
      id: `entity-${i + 1}`,
      title: `Sample ${i % 2 === 0 ? 'Task' : 'Notebook'} ${i + 1}`,
      content: 'Sample content...'
    },
    metadata: {
      priority: ['low', 'medium', 'high'][i % 3] as any,
      createdAt: Date.now() - (i * 60000), // Spread over time
      attempts: Math.floor(i / 5), // Some with retry attempts
      maxRetries: 3,
      estimatedDuration: 1000 + (i * 200),
      nextRetry: i > 10 ? Date.now() + (i * 5000) : undefined
    }
  }));
};

export const OfflineSupportDemo: React.FC = () => {
  // Demo state controls
  const [demoIsOnline, setDemoIsOnline] = useState(true);
  const [demoPendingOps, setDemoPendingOps] = useState(8);
  const [demoConflicts, setDemoConflicts] = useState(2);
  const [activeDemo, setActiveDemo] = useState<'dashboard' | 'components' | 'scenarios'>('dashboard');
  const [selectedComponent, setSelectedComponent] = useState<string>('network-status');

  // Mock configuration
  const demoConfig: Partial<OfflineSupportConfig> = {
    enabled: true,
    serviceWorkerEnabled: true,
    backgroundSyncEnabled: true,
    pwaEnabled: true,
    syncConfig: {
      enabled: true,
      syncInterval: 30000,
      maxRetries: 3,
      retryBackoff: 'exponential',
      batchSize: 10,
      priorityThreshold: 'medium'
    }
  };

  // Create mock data based on demo state
  const mockNetworkStatus = createMockNetworkStatus(demoIsOnline);
  const mockSyncStatus = createMockSyncStatus(demoPendingOps);
  const mockStorageQuota = createMockStorageQuota();
  const mockConflicts = createMockConflicts().slice(0, demoConflicts);
  const mockSyncOperations = createMockSyncOperations(demoPendingOps);

  // Mock functions
  const mockGetOfflineCapability = (feature: string): boolean => {
    if (!demoIsOnline) {
      const offlineCapabilities: Record<string, boolean> = {
        'dataAccess': true,
        'dataModification': true,
        'search': true,
        'analytics': true,
        'exportImport': true,
        'keyboardShortcuts': true,
        'virtualScrolling': true,
        'collaboration': false,
        'notifications': false,
        'backup': false
      };
      return offlineCapabilities[feature] || false;
    }
    return true;
  };

  const mockHandleManualSync = async () => {
    console.log('Demo: Manual sync triggered');
    // Simulate sync delay
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const mockHandleClearCache = async (selective: boolean) => {
    console.log('Demo: Clear cache triggered', { selective });
  };

  return (
    <div className="offline-support-demo">
      {/* Demo Header */}
      <div className="offline-support-demo__header">
        <h1 className="offline-support-demo__title">
          📱 Offline Support & PWA Demo
        </h1>
        <p className="offline-support-demo__description">
          Experience ThoughtKeeper's offline-first architecture with PWA capabilities, 
          background sync, conflict resolution, and comprehensive storage management.
        </p>
      </div>

      {/* Demo Controls */}
      <div className="offline-support-demo__controls">
        <div className="offline-support-demo__control-section">
          <h3 className="offline-support-demo__control-title">Demo Controls</h3>
          
          <div className="offline-support-demo__control-grid">
            <div className="offline-support-demo__control-group">
              <label className="offline-support-demo__control-label">
                Network Status:
              </label>
              <div className="offline-support-demo__control-buttons">
                <button
                  onClick={() => setDemoIsOnline(true)}
                  className={`offline-support-demo__control-btn ${demoIsOnline ? 'active' : ''}`}
                >
                  🌐 Online
                </button>
                <button
                  onClick={() => setDemoIsOnline(false)}
                  className={`offline-support-demo__control-btn ${!demoIsOnline ? 'active' : ''}`}
                >
                  📴 Offline
                </button>
              </div>
            </div>

            <div className="offline-support-demo__control-group">
              <label className="offline-support-demo__control-label">
                Pending Operations: {demoPendingOps}
              </label>
              <input
                type="range"
                min="0"
                max="25"
                value={demoPendingOps}
                onChange={(e) => setDemoPendingOps(parseInt(e.target.value, 10))}
                className="offline-support-demo__control-slider"
              />
            </div>

            <div className="offline-support-demo__control-group">
              <label className="offline-support-demo__control-label">
                Data Conflicts: {demoConflicts}
              </label>
              <input
                type="range"
                min="0"
                max="5"
                value={demoConflicts}
                onChange={(e) => setDemoConflicts(parseInt(e.target.value, 10))}
                className="offline-support-demo__control-slider"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Demo Navigation */}
      <div className="offline-support-demo__nav">
        <div className="offline-support-demo__nav-tabs">
          {[
            { key: 'dashboard', label: 'Full Dashboard', icon: '🎛️' },
            { key: 'components', label: 'Individual Components', icon: '🧩' },
            { key: 'scenarios', label: 'Usage Scenarios', icon: '📋' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveDemo(tab.key as any)}
              className={`offline-support-demo__nav-tab ${activeDemo === tab.key ? 'active' : ''}`}
            >
              <span className="offline-support-demo__nav-tab-icon">{tab.icon}</span>
              <span className="offline-support-demo__nav-tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Demo Content */}
      <div className="offline-support-demo__content">
        {activeDemo === 'dashboard' && (
          <div className="offline-support-demo__dashboard">
            <OfflineSupportProvider config={demoConfig}>
              <OfflineDashboard
                layout="full"
                showPWAPrompt={true}
                showStorageDetails={true}
                showCapabilities={true}
              />
            </OfflineSupportProvider>
          </div>
        )}

        {activeDemo === 'components' && (
          <div className="offline-support-demo__components">
            {/* Component Selector */}
            <div className="offline-support-demo__component-selector">
              <h3 className="offline-support-demo__selector-title">Select Component:</h3>
              <div className="offline-support-demo__selector-buttons">
                {[
                  { key: 'network-status', label: 'Network Status', icon: '🌐' },
                  { key: 'sync-panel', label: 'Sync Panel', icon: '🔄' },
                  { key: 'storage-quota', label: 'Storage Quota', icon: '💾' },
                  { key: 'pwa-install', label: 'PWA Install', icon: '📱' },
                  { key: 'conflicts', label: 'Conflict Resolution', icon: '⚠️' },
                  { key: 'capabilities', label: 'Offline Capabilities', icon: '⚡' }
                ].map(comp => (
                  <button
                    key={comp.key}
                    onClick={() => setSelectedComponent(comp.key)}
                    className={`offline-support-demo__selector-btn ${selectedComponent === comp.key ? 'active' : ''}`}
                  >
                    <span>{comp.icon}</span>
                    <span>{comp.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Component Display */}
            <div className="offline-support-demo__component-display">
              {selectedComponent === 'network-status' && (
                <div className="offline-support-demo__component-showcase">
                  <h4>Network Status Indicator</h4>
                  <div className="offline-support-demo__component-variants">
                    <div>
                      <h5>Small Size</h5>
                      <NetworkStatusIndicator status={mockNetworkStatus} size="small" />
                    </div>
                    <div>
                      <h5>Compact Layout</h5>
                      <NetworkStatusIndicator status={mockNetworkStatus} layout="compact" />
                    </div>
                    <div>
                      <h5>Detailed Layout</h5>
                      <NetworkStatusIndicator status={mockNetworkStatus} layout="detailed" showDetails={true} />
                    </div>
                  </div>
                </div>
              )}

              {selectedComponent === 'sync-panel' && (
                <div className="offline-support-demo__component-showcase">
                  <h4>Sync Status Panel</h4>
                  <SyncStatusPanel
                    status={mockSyncStatus}
                    pendingOperations={mockSyncOperations}
                    onManualSync={mockHandleManualSync}
                    isLoading={false}
                  />
                </div>
              )}

              {selectedComponent === 'storage-quota' && (
                <div className="offline-support-demo__component-showcase">
                  <h4>Storage Quota Indicator</h4>
                  <div className="offline-support-demo__component-variants">
                    <div>
                      <h5>Compact Layout</h5>
                      <StorageQuotaIndicator quota={mockStorageQuota} layout="compact" />
                    </div>
                    <div>
                      <h5>Detailed Layout</h5>
                      <StorageQuotaIndicator
                        quota={mockStorageQuota}
                        layout="detailed"
                        showBreakdown={true}
                        onClearCache={mockHandleClearCache}
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedComponent === 'pwa-install' && (
                <div className="offline-support-demo__component-showcase">
                  <h4>PWA Install Prompt</h4>
                  <div className="offline-support-demo__component-variants">
                    <div>
                      <h5>Banner Layout</h5>
                      <PWAInstallPrompt layout="banner" />
                    </div>
                    <div>
                      <h5>Compact Layout</h5>
                      <PWAInstallPrompt layout="compact" />
                    </div>
                    <div>
                      <h5>Detailed Layout</h5>
                      <PWAInstallPrompt layout="detailed" showDismiss={true} />
                    </div>
                  </div>
                </div>
              )}

              {selectedComponent === 'conflicts' && (
                <div className="offline-support-demo__component-showcase">
                  <h4>Conflict Resolution Panel</h4>
                  <ConflictResolutionPanel conflicts={mockConflicts} />
                </div>
              )}

              {selectedComponent === 'capabilities' && (
                <div className="offline-support-demo__component-showcase">
                  <h4>Offline Capabilities</h4>
                  <OfflineCapabilities
                    networkStatus={mockNetworkStatus}
                    getOfflineCapability={mockGetOfflineCapability}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {activeDemo === 'scenarios' && (
          <div className="offline-support-demo__scenarios">
            <div className="offline-support-demo__scenario-list">
              <div className="offline-support-demo__scenario">
                <h4 className="offline-support-demo__scenario-title">
                  📴 Going Offline Scenario
                </h4>
                <p className="offline-support-demo__scenario-description">
                  Demonstrates how the app behaves when network connectivity is lost, 
                  showing offline capabilities and data persistence.
                </p>
                <div className="offline-support-demo__scenario-steps">
                  <div className="offline-support-demo__step">
                    1. Set network to offline using the demo controls
                  </div>
                  <div className="offline-support-demo__step">
                    2. Notice how the app continues to function with cached data
                  </div>
                  <div className="offline-support-demo__step">
                    3. Make changes - they're queued for sync when online
                  </div>
                  <div className="offline-support-demo__step">
                    4. View offline capabilities to see what's available
                  </div>
                </div>
              </div>

              <div className="offline-support-demo__scenario">
                <h4 className="offline-support-demo__scenario-title">
                  🔄 Sync Conflict Scenario
                </h4>
                <p className="offline-support-demo__scenario-description">
                  Shows how data conflicts are detected and resolved when the same 
                  content is modified both locally and remotely.
                </p>
                <div className="offline-support-demo__scenario-steps">
                  <div className="offline-support-demo__step">
                    1. Increase conflicts using the demo controls
                  </div>
                  <div className="offline-support-demo__step">
                    2. View the conflict resolution panel
                  </div>
                  <div className="offline-support-demo__step">
                    3. Compare local vs remote changes
                  </div>
                  <div className="offline-support-demo__step">
                    4. Choose resolution strategy or create custom resolution
                  </div>
                </div>
              </div>

              <div className="offline-support-demo__scenario">
                <h4 className="offline-support-demo__scenario-title">
                  📱 PWA Installation Scenario
                </h4>
                <p className="offline-support-demo__scenario-description">
                  Demonstrates the Progressive Web App installation process and 
                  native app-like experience features.
                </p>
                <div className="offline-support-demo__scenario-steps">
                  <div className="offline-support-demo__step">
                    1. View PWA installation prompts in different layouts
                  </div>
                  <div className="offline-support-demo__step">
                    2. Experience native app features (when installed)
                  </div>
                  <div className="offline-support-demo__step">
                    3. Handle app updates and service worker changes
                  </div>
                  <div className="offline-support-demo__step">
                    4. Manage offline storage and caching
                  </div>
                </div>
              </div>

              <div className="offline-support-demo__scenario">
                <h4 className="offline-support-demo__scenario-title">
                  💾 Storage Management Scenario
                </h4>
                <p className="offline-support-demo__scenario-description">
                  Shows storage quota monitoring, cache management, and optimization 
                  for local data persistence.
                </p>
                <div className="offline-support-demo__scenario-steps">
                  <div className="offline-support-demo__step">
                    1. View storage breakdown by type (IndexedDB, Cache, etc.)
                  </div>
                  <div className="offline-support-demo__step">
                    2. Monitor storage usage percentage and warnings
                  </div>
                  <div className="offline-support-demo__step">
                    3. Use selective or complete cache clearing
                  </div>
                  <div className="offline-support-demo__step">
                    4. Understand storage optimization strategies
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .offline-support-demo {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
          background: #f8fafc;
          min-height: 100vh;
        }

        .offline-support-demo__header {
          text-align: center;
          margin-bottom: 32px;
        }

        .offline-support-demo__title {
          margin: 0 0 16px 0;
          font-size: 2rem;
          font-weight: 800;
          color: #1e293b;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .offline-support-demo__description {
          margin: 0;
          font-size: 1.125rem;
          color: #64748b;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
        }

        .offline-support-demo__controls {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .offline-support-demo__control-title {
          margin: 0 0 16px 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
        }

        .offline-support-demo__control-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .offline-support-demo__control-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .offline-support-demo__control-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .offline-support-demo__control-buttons {
          display: flex;
          gap: 8px;
        }

        .offline-support-demo__control-btn {
          flex: 1;
          padding: 8px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          color: #374151;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .offline-support-demo__control-btn:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .offline-support-demo__control-btn.active {
          border-color: #3b82f6;
          background: #3b82f6;
          color: white;
        }

        .offline-support-demo__control-slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #e5e7eb;
          outline: none;
          cursor: pointer;
        }

        .offline-support-demo__nav {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 8px;
          margin-bottom: 24px;
        }

        .offline-support-demo__nav-tabs {
          display: flex;
          gap: 4px;
        }

        .offline-support-demo__nav-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          padding: 12px 16px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .offline-support-demo__nav-tab:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        .offline-support-demo__nav-tab.active {
          background: #3b82f6;
          color: white;
        }

        .offline-support-demo__nav-tab-icon {
          font-size: 1.25rem;
        }

        .offline-support-demo__nav-tab-label {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .offline-support-demo__content {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }

        .offline-support-demo__dashboard {
          padding: 0;
        }

        .offline-support-demo__components {
          padding: 24px;
        }

        .offline-support-demo__component-selector {
          margin-bottom: 32px;
        }

        .offline-support-demo__selector-title {
          margin: 0 0 16px 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
        }

        .offline-support-demo__selector-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 8px;
        }

        .offline-support-demo__selector-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .offline-support-demo__selector-btn:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .offline-support-demo__selector-btn.active {
          border-color: #3b82f6;
          background: #3b82f6;
          color: white;
        }

        .offline-support-demo__component-showcase h4,
        .offline-support-demo__component-showcase h5 {
          margin: 0 0 16px 0;
          color: #1e293b;
        }

        .offline-support-demo__component-showcase h4 {
          font-size: 1.25rem;
          font-weight: 600;
        }

        .offline-support-demo__component-showcase h5 {
          font-size: 1rem;
          font-weight: 500;
        }

        .offline-support-demo__component-variants {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .offline-support-demo__component-variants > div {
          padding: 20px;
          border: 1px solid #f1f5f9;
          border-radius: 8px;
          background: #f8fafc;
        }

        .offline-support-demo__scenarios {
          padding: 24px;
        }

        .offline-support-demo__scenario-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .offline-support-demo__scenario {
          padding: 24px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #f8fafc;
        }

        .offline-support-demo__scenario-title {
          margin: 0 0 12px 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
        }

        .offline-support-demo__scenario-description {
          margin: 0 0 16px 0;
          color: #64748b;
          line-height: 1.5;
        }

        .offline-support-demo__scenario-steps {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .offline-support-demo__step {
          padding: 8px 12px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 0.875rem;
          color: #374151;
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          .offline-support-demo {
            background: #0f172a;
          }

          .offline-support-demo__title {
            color: #f1f5f9;
          }

          .offline-support-demo__description {
            color: #94a3b8;
          }

          .offline-support-demo__controls,
          .offline-support-demo__nav,
          .offline-support-demo__content {
            background: #1e293b;
            border-color: #334155;
          }

          .offline-support-demo__control-title,
          .offline-support-demo__selector-title {
            color: #f1f5f9;
          }

          .offline-support-demo__control-label {
            color: #e2e8f0;
          }

          .offline-support-demo__control-btn,
          .offline-support-demo__selector-btn {
            background: #1e293b;
            border-color: #334155;
            color: #e2e8f0;
          }

          .offline-support-demo__control-btn:hover,
          .offline-support-demo__selector-btn:hover {
            border-color: #60a5fa;
            background: #1e3a8a;
          }

          .offline-support-demo__control-btn.active,
          .offline-support-demo__selector-btn.active {
            border-color: #60a5fa;
            background: #3b82f6;
          }

          .offline-support-demo__nav-tab {
            color: #94a3b8;
          }

          .offline-support-demo__nav-tab:hover {
            background: #334155;
            color: #f1f5f9;
          }

          .offline-support-demo__component-variants > div {
            background: #0f172a;
            border-color: #334155;
          }

          .offline-support-demo__scenario {
            background: #0f172a;
            border-color: #334155;
          }

          .offline-support-demo__scenario-title {
            color: #f1f5f9;
          }

          .offline-support-demo__scenario-description {
            color: #94a3b8;
          }

          .offline-support-demo__step {
            background: #1e293b;
            border-color: #334155;
            color: #e2e8f0;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .offline-support-demo {
            padding: 16px;
          }

          .offline-support-demo__title {
            font-size: 1.5rem;
          }

          .offline-support-demo__control-grid {
            grid-template-columns: 1fr;
          }

          .offline-support-demo__nav-tabs {
            flex-direction: column;
          }

          .offline-support-demo__selector-buttons {
            grid-template-columns: 1fr;
          }

          .offline-support-demo__component-variants {
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
};
