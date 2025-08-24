import React, { useState, useEffect } from 'react';
import { useOfflineSupport } from '../OfflineSupportProvider';
import { NetworkStatusIndicator } from './NetworkStatusIndicator';
import { SyncStatusPanel } from './SyncStatusPanel';
import { StorageQuotaIndicator } from './StorageQuotaIndicator';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { ConflictResolutionPanel } from './ConflictResolutionPanel';
import { OfflineCapabilities } from './OfflineCapabilities';

/**
 * Offline Dashboard Component
 * 
 * Main interface for offline functionality showing network status,
 * sync progress, storage management, PWA features, and offline capabilities.
 */
interface OfflineDashboardProps {
  layout?: 'compact' | 'full' | 'sidebar';
  showPWAPrompt?: boolean;
  showStorageDetails?: boolean;
  showCapabilities?: boolean;
}

export const OfflineDashboard: React.FC<OfflineDashboardProps> = ({
  layout = 'full',
  showPWAPrompt = true,
  showStorageDetails = true,
  showCapabilities = true
}) => {
  const {
    networkStatus,
    syncStatus,
    pwaStatus,
    storageQuota,
    conflicts,
    pendingOperations,
    recentEvents,
    syncData,
    clearCache,
    estimateOfflineTime,
    getOfflineCapability
  } = useOfflineSupport();

  const [activeTab, setActiveTab] = useState<'overview' | 'sync' | 'storage' | 'conflicts' | 'capabilities'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Get offline statistics
  const offlineStats = {
    totalPendingOps: pendingOperations.length,
    activeConflicts: conflicts.length,
    storageUsedPercent: storageQuota.usagePercentage,
    estimatedOfflineHours: estimateOfflineTime(),
    canWorkOffline: getOfflineCapability('dataAccess'),
    lastSync: syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString() : 'Never'
  };

  // Handle manual sync
  const handleManualSync = async () => {
    if (!networkStatus.isOnline) return;
    
    setIsLoading(true);
    try {
      await syncData();
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cache clear
  const handleClearCache = async (selective: boolean = false) => {
    setIsLoading(true);
    try {
      await clearCache(selective);
    } catch (error) {
      console.error('Clear cache failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Compact layout for sidebars
  if (layout === 'compact') {
    return (
      <div className="offline-dashboard offline-dashboard--compact">
        <div className="offline-dashboard__header">
          <h3 className="offline-dashboard__title">📱 Offline Mode</h3>
          <NetworkStatusIndicator status={networkStatus} size="small" />
        </div>

        <div className="offline-dashboard__content">
          <div className="offline-dashboard__stats">
            <div className="offline-dashboard__stat">
              <span className="offline-dashboard__stat-label">Sync</span>
              <span className="offline-dashboard__stat-value">
                {syncStatus.status === 'synced' ? '✅' : 
                 syncStatus.status === 'syncing' ? '🔄' : 
                 pendingOperations.length > 0 ? '⏳' : '❌'}
              </span>
            </div>
            
            <div className="offline-dashboard__stat">
              <span className="offline-dashboard__stat-label">Storage</span>
              <span className="offline-dashboard__stat-value">{storageQuota.usagePercentage}%</span>
            </div>

            {conflicts.length > 0 && (
              <div className="offline-dashboard__stat">
                <span className="offline-dashboard__stat-label">Conflicts</span>
                <span className="offline-dashboard__stat-value">⚠️ {conflicts.length}</span>
              </div>
            )}
          </div>

          {!networkStatus.isOnline && (
            <div className="offline-dashboard__offline-notice">
              <span className="offline-dashboard__offline-icon">📴</span>
              <div className="offline-dashboard__offline-text">
                <div>Working offline</div>
                <div className="offline-dashboard__offline-estimate">
                  ~{offlineStats.estimatedOfflineHours}h remaining
                </div>
              </div>
            </div>
          )}

          {showPWAPrompt && pwaStatus.isInstallable && (
            <PWAInstallPrompt layout="compact" />
          )}
        </div>

        <style>{`
          .offline-dashboard--compact {
            width: 300px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
          }

          .offline-dashboard__header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            border-bottom: 1px solid #e2e8f0;
            background: #f8fafc;
          }

          .offline-dashboard__title {
            margin: 0;
            font-size: 0.875rem;
            font-weight: 600;
            color: #1a202c;
          }

          .offline-dashboard__content {
            padding: 16px;
          }

          .offline-dashboard__stats {
            display: flex;
            justify-content: space-between;
            margin-bottom: 16px;
          }

          .offline-dashboard__stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
          }

          .offline-dashboard__stat-label {
            font-size: 0.75rem;
            color: #64748b;
            font-weight: 500;
          }

          .offline-dashboard__stat-value {
            font-size: 0.875rem;
            font-weight: 600;
            color: #1e293b;
          }

          .offline-dashboard__offline-notice {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px;
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 6px;
            margin-bottom: 12px;
          }

          .offline-dashboard__offline-icon {
            font-size: 1.25rem;
          }

          .offline-dashboard__offline-text {
            flex: 1;
          }

          .offline-dashboard__offline-text div:first-child {
            font-size: 0.875rem;
            font-weight: 600;
            color: #92400e;
          }

          .offline-dashboard__offline-estimate {
            font-size: 0.75rem;
            color: #b45309;
          }

          /* Dark theme */
          @media (prefers-color-scheme: dark) {
            .offline-dashboard--compact {
              background: #1e293b;
              border-color: #334155;
            }

            .offline-dashboard__header {
              background: #0f172a;
              border-color: #334155;
            }

            .offline-dashboard__title {
              color: #f1f5f9;
            }

            .offline-dashboard__stat-label {
              color: #94a3b8;
            }

            .offline-dashboard__stat-value {
              color: #f1f5f9;
            }

            .offline-dashboard__offline-notice {
              background: #451a03;
              border-color: #92400e;
            }
          }
        `}</style>
      </div>
    );
  }

  // Full dashboard layout
  return (
    <div className="offline-dashboard">
      {/* Header */}
      <div className="offline-dashboard__header">
        <div className="offline-dashboard__title-section">
          <h1 className="offline-dashboard__title">
            📱 Offline & PWA Dashboard
          </h1>
          <p className="offline-dashboard__subtitle">
            Manage offline capabilities, sync status, and progressive web app features
          </p>
        </div>

        <div className="offline-dashboard__header-actions">
          <NetworkStatusIndicator status={networkStatus} />
          
          <div className="offline-dashboard__action-buttons">
            <button
              onClick={handleManualSync}
              disabled={!networkStatus.isOnline || isLoading}
              className="offline-dashboard__action-btn offline-dashboard__action-btn--primary"
            >
              {isLoading ? '🔄' : '🔄'} {isLoading ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="offline-dashboard__stats-grid">
        <div className="offline-dashboard__stat-card">
          <div className="offline-dashboard__stat-icon">🌐</div>
          <div className="offline-dashboard__stat-content">
            <div className="offline-dashboard__stat-label">Connection</div>
            <div className="offline-dashboard__stat-value">
              {networkStatus.isOnline ? 'Online' : 'Offline'}
            </div>
            <div className="offline-dashboard__stat-detail">
              {networkStatus.isOnline ? networkStatus.connectivityScore : 'Working offline'}
            </div>
          </div>
        </div>

        <div className="offline-dashboard__stat-card">
          <div className="offline-dashboard__stat-icon">
            {syncStatus.status === 'synced' ? '✅' : 
             syncStatus.status === 'syncing' ? '🔄' : '⏳'}
          </div>
          <div className="offline-dashboard__stat-content">
            <div className="offline-dashboard__stat-label">Sync Status</div>
            <div className="offline-dashboard__stat-value">
              {syncStatus.status.charAt(0).toUpperCase() + syncStatus.status.slice(1)}
            </div>
            <div className="offline-dashboard__stat-detail">
              {pendingOperations.length} pending operations
            </div>
          </div>
        </div>

        <div className="offline-dashboard__stat-card">
          <div className="offline-dashboard__stat-icon">💾</div>
          <div className="offline-dashboard__stat-content">
            <div className="offline-dashboard__stat-label">Storage</div>
            <div className="offline-dashboard__stat-value">
              {storageQuota.usagePercentage}%
            </div>
            <div className="offline-dashboard__stat-detail">
              {Math.round(storageQuota.usage / (1024 * 1024))}MB used
            </div>
          </div>
        </div>

        <div className="offline-dashboard__stat-card">
          <div className="offline-dashboard__stat-icon">⏱️</div>
          <div className="offline-dashboard__stat-content">
            <div className="offline-dashboard__stat-label">Offline Time</div>
            <div className="offline-dashboard__stat-value">
              ~{offlineStats.estimatedOfflineHours}h
            </div>
            <div className="offline-dashboard__stat-detail">
              Estimated remaining
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="offline-dashboard__nav">
        <div className="offline-dashboard__tabs">
          {[
            { key: 'overview', label: 'Overview', icon: '👀' },
            { key: 'sync', label: 'Sync', icon: '🔄', badge: pendingOperations.length },
            { key: 'storage', label: 'Storage', icon: '💾' },
            { key: 'conflicts', label: 'Conflicts', icon: '⚠️', badge: conflicts.length },
            { key: 'capabilities', label: 'Capabilities', icon: '⚡' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`offline-dashboard__tab ${activeTab === tab.key ? 'active' : ''}`}
            >
              <span className="offline-dashboard__tab-icon">{tab.icon}</span>
              <span className="offline-dashboard__tab-label">{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="offline-dashboard__tab-badge">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="offline-dashboard__content">
        {activeTab === 'overview' && (
          <div className="offline-dashboard__overview">
            <div className="offline-dashboard__grid">
              {/* Network Status */}
              <div className="offline-dashboard__card">
                <h3 className="offline-dashboard__card-title">🌐 Network Status</h3>
                <NetworkStatusIndicator status={networkStatus} layout="detailed" />
              </div>

              {/* PWA Installation */}
              {showPWAPrompt && (pwaStatus.isInstallable || !pwaStatus.isInstalled) && (
                <div className="offline-dashboard__card">
                  <h3 className="offline-dashboard__card-title">📱 App Installation</h3>
                  <PWAInstallPrompt layout="detailed" />
                </div>
              )}

              {/* Storage Usage */}
              {showStorageDetails && (
                <div className="offline-dashboard__card">
                  <h3 className="offline-dashboard__card-title">💾 Storage Usage</h3>
                  <StorageQuotaIndicator 
                    quota={storageQuota} 
                    layout="detailed"
                    onClearCache={handleClearCache}
                  />
                </div>
              )}

              {/* Recent Activity */}
              <div className="offline-dashboard__card">
                <h3 className="offline-dashboard__card-title">📈 Recent Activity</h3>
                <div className="offline-dashboard__activity">
                  {recentEvents.slice(0, 5).map(event => (
                    <div key={event.id} className="offline-dashboard__activity-item">
                      <span className="offline-dashboard__activity-time">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="offline-dashboard__activity-description">
                        {event.type.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                  
                  {recentEvents.length === 0 && (
                    <div className="offline-dashboard__empty-state">
                      No recent activity
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="offline-dashboard__sync">
            <SyncStatusPanel
              status={syncStatus}
              pendingOperations={pendingOperations}
              onManualSync={handleManualSync}
              isLoading={isLoading}
            />
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="offline-dashboard__storage">
            <StorageQuotaIndicator
              quota={storageQuota}
              layout="detailed"
              onClearCache={handleClearCache}
              showBreakdown={true}
            />
          </div>
        )}

        {activeTab === 'conflicts' && (
          <div className="offline-dashboard__conflicts">
            {conflicts.length > 0 ? (
              <ConflictResolutionPanel conflicts={conflicts} />
            ) : (
              <div className="offline-dashboard__empty-state">
                <div className="offline-dashboard__empty-icon">✅</div>
                <h3>No Conflicts</h3>
                <p>All data is synchronized without conflicts.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'capabilities' && showCapabilities && (
          <div className="offline-dashboard__capabilities">
            <OfflineCapabilities
              networkStatus={networkStatus}
              getOfflineCapability={getOfflineCapability}
            />
          </div>
        )}
      </div>

      <style>{`
        .offline-dashboard {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .offline-dashboard__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px 32px;
          border-bottom: 1px solid #e2e8f0;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
        }

        .offline-dashboard__title {
          margin: 0 0 8px 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .offline-dashboard__subtitle {
          margin: 0;
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .offline-dashboard__header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .offline-dashboard__action-buttons {
          display: flex;
          gap: 8px;
        }

        .offline-dashboard__action-btn {
          padding: 8px 16px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .offline-dashboard__action-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
        }

        .offline-dashboard__action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .offline-dashboard__action-btn--primary {
          background: rgba(16, 185, 129, 0.8);
          border-color: rgba(16, 185, 129, 1);
        }

        .offline-dashboard__stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          padding: 24px 32px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .offline-dashboard__stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .offline-dashboard__stat-icon {
          font-size: 1.5rem;
        }

        .offline-dashboard__stat-label {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .offline-dashboard__stat-value {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 2px;
        }

        .offline-dashboard__stat-detail {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .offline-dashboard__nav {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .offline-dashboard__tabs {
          display: flex;
          gap: 0;
        }

        .offline-dashboard__tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          color: #64748b;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .offline-dashboard__tab:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        .offline-dashboard__tab.active {
          background: white;
          color: #6366f1;
          border-bottom-color: #6366f1;
        }

        .offline-dashboard__tab-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 6px;
          background: #ef4444;
          color: white;
          border-radius: 9px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .offline-dashboard__content {
          padding: 32px;
          min-height: 400px;
        }

        .offline-dashboard__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .offline-dashboard__card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
        }

        .offline-dashboard__card-title {
          margin: 0 0 16px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .offline-dashboard__activity {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .offline-dashboard__activity-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.875rem;
        }

        .offline-dashboard__activity-time {
          color: #64748b;
          font-family: monospace;
        }

        .offline-dashboard__activity-description {
          color: #1e293b;
          text-transform: capitalize;
        }

        .offline-dashboard__empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;
          color: #64748b;
        }

        .offline-dashboard__empty-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .offline-dashboard__empty-state h3 {
          margin: 0 0 8px 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
        }

        .offline-dashboard__empty-state p {
          margin: 0;
          color: #64748b;
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          .offline-dashboard {
            background: #1e293b;
          }

          .offline-dashboard__header {
            border-color: #334155;
          }

          .offline-dashboard__stats-grid {
            background: #0f172a;
            border-color: #334155;
          }

          .offline-dashboard__stat-card {
            background: #1e293b;
            border-color: #334155;
          }

          .offline-dashboard__stat-label {
            color: #94a3b8;
          }

          .offline-dashboard__stat-value {
            color: #f1f5f9;
          }

          .offline-dashboard__stat-detail {
            color: #6b7280;
          }

          .offline-dashboard__nav {
            background: #0f172a;
            border-color: #334155;
          }

          .offline-dashboard__tab {
            color: #94a3b8;
          }

          .offline-dashboard__tab:hover {
            background: #334155;
            color: #f1f5f9;
          }

          .offline-dashboard__tab.active {
            background: #1e293b;
            color: #a78bfa;
          }

          .offline-dashboard__card {
            background: #0f172a;
            border-color: #334155;
          }

          .offline-dashboard__card-title {
            color: #f1f5f9;
          }

          .offline-dashboard__activity-time {
            color: #94a3b8;
          }

          .offline-dashboard__activity-description {
            color: #f1f5f9;
          }

          .offline-dashboard__empty-state {
            color: #94a3b8;
          }

          .offline-dashboard__empty-state h3 {
            color: #f1f5f9;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .offline-dashboard__header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .offline-dashboard__content {
            padding: 16px;
          }

          .offline-dashboard__grid {
            grid-template-columns: 1fr;
          }

          .offline-dashboard__tabs {
            flex-wrap: wrap;
          }

          .offline-dashboard__tab {
            min-width: 120px;
            justify-content: center;
          }

          .offline-dashboard__stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .offline-dashboard__stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
