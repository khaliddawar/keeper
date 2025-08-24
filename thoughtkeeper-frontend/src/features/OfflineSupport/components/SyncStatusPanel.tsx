import React, { useState } from 'react';
import type { SyncStatus, SyncOperation } from '../types';

/**
 * Sync Status Panel Component
 * 
 * Displays synchronization status, pending operations, progress tracking,
 * and provides controls for manual sync operations.
 */
interface SyncStatusPanelProps {
  status: SyncStatus;
  pendingOperations: SyncOperation[];
  onManualSync: () => Promise<void>;
  isLoading?: boolean;
}

export const SyncStatusPanel: React.FC<SyncStatusPanelProps> = ({
  status,
  pendingOperations,
  onManualSync,
  isLoading = false
}) => {
  const [expandedOperations, setExpandedOperations] = useState<Set<string>>(new Set());
  const [selectedOperations, setSelectedOperations] = useState<Set<string>>(new Set());

  // Get sync status info
  const getSyncStatusInfo = () => {
    switch (status.status) {
      case 'synced':
        return {
          icon: '✅',
          label: 'Synchronized',
          description: 'All data is up to date',
          color: '#10b981'
        };
      case 'syncing':
        return {
          icon: '🔄',
          label: 'Synchronizing',
          description: 'Syncing data with server',
          color: '#3b82f6'
        };
      case 'pending':
        return {
          icon: '⏳',
          label: 'Pending Sync',
          description: `${status.pendingOperations} operations waiting`,
          color: '#f59e0b'
        };
      case 'failed':
        return {
          icon: '❌',
          label: 'Sync Failed',
          description: 'Last sync encountered errors',
          color: '#ef4444'
        };
      default:
        return {
          icon: '📴',
          label: 'Offline',
          description: 'Sync unavailable offline',
          color: '#6b7280'
        };
    }
  };

  // Format operation type
  const formatOperationType = (type: string) => {
    const types: Record<string, string> = {
      'data_sync': 'Data Sync',
      'schema_migration': 'Schema Migration',
      'cache_update': 'Cache Update',
      'conflict_resolution': 'Conflict Resolution',
      'batch_operation': 'Batch Operation'
    };
    return types[type] || type;
  };

  // Format operation action
  const formatOperation = (operation: string) => {
    const operations: Record<string, string> = {
      'create': '➕ Create',
      'update': '✏️ Update',
      'delete': '🗑️ Delete'
    };
    return operations[operation] || operation;
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'critical': '#dc2626',
      'high': '#ea580c',
      'medium': '#f59e0b',
      'low': '#10b981'
    };
    return colors[priority] || '#6b7280';
  };

  // Format time
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Toggle operation expansion
  const toggleOperationExpanded = (operationId: string) => {
    const newExpanded = new Set(expandedOperations);
    if (newExpanded.has(operationId)) {
      newExpanded.delete(operationId);
    } else {
      newExpanded.add(operationId);
    }
    setExpandedOperations(newExpanded);
  };

  // Toggle operation selection
  const toggleOperationSelected = (operationId: string) => {
    const newSelected = new Set(selectedOperations);
    if (newSelected.has(operationId)) {
      newSelected.delete(operationId);
    } else {
      newSelected.add(operationId);
    }
    setSelectedOperations(newSelected);
  };

  // Select all operations
  const selectAllOperations = () => {
    if (selectedOperations.size === pendingOperations.length) {
      setSelectedOperations(new Set());
    } else {
      setSelectedOperations(new Set(pendingOperations.map(op => op.id)));
    }
  };

  const syncStatusInfo = getSyncStatusInfo();

  return (
    <div className="sync-status-panel">
      {/* Header */}
      <div className="sync-status-panel__header">
        <div className="sync-status-panel__status">
          <div className="sync-status-panel__status-indicator">
            <span className="sync-status-panel__status-icon">{syncStatusInfo.icon}</span>
            <div className="sync-status-panel__status-text">
              <div className="sync-status-panel__status-label">{syncStatusInfo.label}</div>
              <div className="sync-status-panel__status-description">{syncStatusInfo.description}</div>
            </div>
          </div>

          {/* Progress Bar */}
          {status.status === 'syncing' && typeof status.syncProgress === 'number' && (
            <div className="sync-status-panel__progress">
              <div className="sync-status-panel__progress-bar">
                <div 
                  className="sync-status-panel__progress-fill"
                  style={{ 
                    width: `${status.syncProgress}%`,
                    backgroundColor: syncStatusInfo.color
                  }}
                />
              </div>
              <span className="sync-status-panel__progress-text">
                {status.syncProgress}%
              </span>
            </div>
          )}
        </div>

        <div className="sync-status-panel__actions">
          <button
            onClick={onManualSync}
            disabled={isLoading || status.status === 'offline'}
            className="sync-status-panel__sync-btn"
          >
            {isLoading ? '🔄' : '🔄'} {isLoading ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>

      {/* Sync Statistics */}
      <div className="sync-status-panel__stats">
        <div className="sync-status-panel__stat">
          <div className="sync-status-panel__stat-value">{status.pendingOperations}</div>
          <div className="sync-status-panel__stat-label">Pending</div>
        </div>
        <div className="sync-status-panel__stat">
          <div className="sync-status-panel__stat-value">{status.failedOperations}</div>
          <div className="sync-status-panel__stat-label">Failed</div>
        </div>
        <div className="sync-status-panel__stat">
          <div className="sync-status-panel__stat-value">{status.totalOperations}</div>
          <div className="sync-status-panel__stat-label">Total</div>
        </div>
        {status.lastSync && (
          <div className="sync-status-panel__stat">
            <div className="sync-status-panel__stat-value">
              {formatTime(status.lastSync)}
            </div>
            <div className="sync-status-panel__stat-label">Last Sync</div>
          </div>
        )}
      </div>

      {/* Pending Operations */}
      {pendingOperations.length > 0 && (
        <div className="sync-status-panel__operations">
          <div className="sync-status-panel__operations-header">
            <h3 className="sync-status-panel__operations-title">
              Pending Operations ({pendingOperations.length})
            </h3>
            
            <div className="sync-status-panel__operations-controls">
              <button
                onClick={selectAllOperations}
                className="sync-status-panel__select-all-btn"
              >
                {selectedOperations.size === pendingOperations.length ? '☑️' : '☐'} Select All
              </button>
            </div>
          </div>

          <div className="sync-status-panel__operations-list">
            {pendingOperations.map(operation => {
              const isExpanded = expandedOperations.has(operation.id);
              const isSelected = selectedOperations.has(operation.id);
              
              return (
                <div 
                  key={operation.id}
                  className={`sync-status-panel__operation ${isSelected ? 'selected' : ''}`}
                >
                  <div className="sync-status-panel__operation-header">
                    <div className="sync-status-panel__operation-main">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOperationSelected(operation.id)}
                        className="sync-status-panel__operation-checkbox"
                      />
                      
                      <div className="sync-status-panel__operation-info">
                        <div className="sync-status-panel__operation-title">
                          {formatOperation(operation.operation)} {operation.entityType}
                        </div>
                        <div className="sync-status-panel__operation-subtitle">
                          {formatOperationType(operation.type)} • {operation.entityId}
                        </div>
                      </div>
                    </div>

                    <div className="sync-status-panel__operation-meta">
                      <div 
                        className="sync-status-panel__operation-priority"
                        style={{ color: getPriorityColor(operation.metadata.priority) }}
                      >
                        {operation.metadata.priority.toUpperCase()}
                      </div>
                      <div className="sync-status-panel__operation-time">
                        {formatTime(operation.metadata.createdAt)}
                      </div>
                      <button
                        onClick={() => toggleOperationExpanded(operation.id)}
                        className="sync-status-panel__operation-toggle"
                      >
                        {isExpanded ? '▼' : '▶'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="sync-status-panel__operation-details">
                      <div className="sync-status-panel__operation-detail-grid">
                        <div className="sync-status-panel__operation-detail">
                          <span className="sync-status-panel__operation-detail-label">Type:</span>
                          <span className="sync-status-panel__operation-detail-value">
                            {formatOperationType(operation.type)}
                          </span>
                        </div>
                        
                        <div className="sync-status-panel__operation-detail">
                          <span className="sync-status-panel__operation-detail-label">Entity:</span>
                          <span className="sync-status-panel__operation-detail-value">
                            {operation.entityType} ({operation.entityId})
                          </span>
                        </div>
                        
                        <div className="sync-status-panel__operation-detail">
                          <span className="sync-status-panel__operation-detail-label">Attempts:</span>
                          <span className="sync-status-panel__operation-detail-value">
                            {operation.metadata.attempts} / {operation.metadata.maxRetries}
                          </span>
                        </div>
                        
                        <div className="sync-status-panel__operation-detail">
                          <span className="sync-status-panel__operation-detail-label">Created:</span>
                          <span className="sync-status-panel__operation-detail-value">
                            {new Date(operation.metadata.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {operation.metadata.nextRetry && (
                          <div className="sync-status-panel__operation-detail">
                            <span className="sync-status-panel__operation-detail-label">Next Retry:</span>
                            <span className="sync-status-panel__operation-detail-value">
                              {new Date(operation.metadata.nextRetry).toLocaleString()}
                            </span>
                          </div>
                        )}
                        
                        <div className="sync-status-panel__operation-detail">
                          <span className="sync-status-panel__operation-detail-label">Est. Duration:</span>
                          <span className="sync-status-panel__operation-detail-value">
                            {operation.metadata.estimatedDuration}ms
                          </span>
                        </div>
                      </div>

                      {/* Operation Data */}
                      {operation.data && (
                        <div className="sync-status-panel__operation-data">
                          <div className="sync-status-panel__operation-data-label">Data Preview:</div>
                          <pre className="sync-status-panel__operation-data-content">
                            {JSON.stringify(operation.data, null, 2).slice(0, 500)}
                            {JSON.stringify(operation.data, null, 2).length > 500 ? '...' : ''}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bulk Actions */}
          {selectedOperations.size > 0 && (
            <div className="sync-status-panel__bulk-actions">
              <div className="sync-status-panel__bulk-info">
                {selectedOperations.size} operation{selectedOperations.size !== 1 ? 's' : ''} selected
              </div>
              <div className="sync-status-panel__bulk-buttons">
                <button className="sync-status-panel__bulk-btn">
                  🔄 Retry Selected
                </button>
                <button className="sync-status-panel__bulk-btn sync-status-panel__bulk-btn--danger">
                  🗑️ Cancel Selected
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {pendingOperations.length === 0 && status.status === 'synced' && (
        <div className="sync-status-panel__empty-state">
          <div className="sync-status-panel__empty-icon">✨</div>
          <h3>All Synchronized</h3>
          <p>All your data is up to date and synchronized with the server.</p>
        </div>
      )}

      <style>{`
        .sync-status-panel {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .sync-status-panel__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px;
          border-bottom: 1px solid #f1f5f9;
          background: #f8fafc;
        }

        .sync-status-panel__status-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .sync-status-panel__status-icon {
          font-size: 1.5rem;
        }

        .sync-status-panel__status-label {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .sync-status-panel__status-description {
          font-size: 0.875rem;
          color: #64748b;
        }

        .sync-status-panel__progress {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sync-status-panel__progress-bar {
          flex: 1;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
        }

        .sync-status-panel__progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .sync-status-panel__progress-text {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          font-family: monospace;
        }

        .sync-status-panel__sync-btn {
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sync-status-panel__sync-btn:hover:not(:disabled) {
          background: #2563eb;
        }

        .sync-status-panel__sync-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .sync-status-panel__stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 16px;
          padding: 20px;
          border-bottom: 1px solid #f1f5f9;
          background: #f8fafc;
        }

        .sync-status-panel__stat {
          text-align: center;
        }

        .sync-status-panel__stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .sync-status-panel__stat-label {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sync-status-panel__operations {
          padding: 20px;
        }

        .sync-status-panel__operations-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .sync-status-panel__operations-title {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .sync-status-panel__select-all-btn {
          padding: 4px 8px;
          background: none;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sync-status-panel__select-all-btn:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .sync-status-panel__operations-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sync-status-panel__operation {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .sync-status-panel__operation:hover {
          border-color: #cbd5e0;
        }

        .sync-status-panel__operation.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .sync-status-panel__operation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
        }

        .sync-status-panel__operation-main {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .sync-status-panel__operation-checkbox {
          margin: 0;
        }

        .sync-status-panel__operation-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e293b;
        }

        .sync-status-panel__operation-subtitle {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 2px;
        }

        .sync-status-panel__operation-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sync-status-panel__operation-priority {
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .sync-status-panel__operation-time {
          font-size: 0.75rem;
          color: #9ca3af;
          font-family: monospace;
        }

        .sync-status-panel__operation-toggle {
          padding: 4px;
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          font-family: monospace;
        }

        .sync-status-panel__operation-details {
          border-top: 1px solid #f1f5f9;
          padding: 16px;
          background: #f8fafc;
        }

        .sync-status-panel__operation-detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .sync-status-panel__operation-detail {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sync-status-panel__operation-detail-label {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }

        .sync-status-panel__operation-detail-value {
          font-size: 0.875rem;
          color: #1e293b;
          font-weight: 600;
        }

        .sync-status-panel__operation-data {
          margin-top: 16px;
        }

        .sync-status-panel__operation-data-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .sync-status-panel__operation-data-content {
          font-size: 0.75rem;
          font-family: monospace;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 8px;
          max-height: 200px;
          overflow-y: auto;
          color: #374151;
        }

        .sync-status-panel__bulk-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-top: 1px solid #e5e7eb;
          background: #f8fafc;
          margin-top: 16px;
          border-radius: 6px;
        }

        .sync-status-panel__bulk-info {
          font-size: 0.875rem;
          color: #374151;
          font-weight: 500;
        }

        .sync-status-panel__bulk-buttons {
          display: flex;
          gap: 8px;
        }

        .sync-status-panel__bulk-btn {
          padding: 6px 12px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sync-status-panel__bulk-btn:hover {
          background: #2563eb;
        }

        .sync-status-panel__bulk-btn--danger {
          background: #ef4444;
        }

        .sync-status-panel__bulk-btn--danger:hover {
          background: #dc2626;
        }

        .sync-status-panel__empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;
        }

        .sync-status-panel__empty-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .sync-status-panel__empty-state h3 {
          margin: 0 0 8px 0;
          color: #1e293b;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .sync-status-panel__empty-state p {
          margin: 0;
          color: #64748b;
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          .sync-status-panel {
            background: #1e293b;
            border-color: #334155;
          }

          .sync-status-panel__header {
            background: #0f172a;
            border-color: #334155;
          }

          .sync-status-panel__status-label {
            color: #f1f5f9;
          }

          .sync-status-panel__status-description {
            color: #94a3b8;
          }

          .sync-status-panel__progress-text {
            color: #e2e8f0;
          }

          .sync-status-panel__progress-bar {
            background: #374151;
          }

          .sync-status-panel__stats {
            background: #0f172a;
            border-color: #334155;
          }

          .sync-status-panel__stat-value {
            color: #f1f5f9;
          }

          .sync-status-panel__stat-label {
            color: #94a3b8;
          }

          .sync-status-panel__operations-title {
            color: #f1f5f9;
          }

          .sync-status-panel__select-all-btn {
            background: #374151;
            border-color: #4b5563;
            color: #f9fafb;
          }

          .sync-status-panel__select-all-btn:hover {
            background: #4b5563;
            border-color: #6b7280;
          }

          .sync-status-panel__operation {
            border-color: #374151;
          }

          .sync-status-panel__operation:hover {
            border-color: #4b5563;
          }

          .sync-status-panel__operation.selected {
            border-color: #60a5fa;
            background: #1e3a8a;
          }

          .sync-status-panel__operation-title {
            color: #f1f5f9;
          }

          .sync-status-panel__operation-subtitle {
            color: #94a3b8;
          }

          .sync-status-panel__operation-time {
            color: #6b7280;
          }

          .sync-status-panel__operation-toggle {
            color: #94a3b8;
          }

          .sync-status-panel__operation-details {
            background: #0f172a;
            border-color: #334155;
          }

          .sync-status-panel__operation-detail-label {
            color: #9ca3af;
          }

          .sync-status-panel__operation-detail-value {
            color: #f1f5f9;
          }

          .sync-status-panel__operation-data-label {
            color: #e2e8f0;
          }

          .sync-status-panel__operation-data-content {
            background: #1e293b;
            border-color: #334155;
            color: #cbd5e0;
          }

          .sync-status-panel__bulk-actions {
            background: #0f172a;
            border-color: #334155;
          }

          .sync-status-panel__bulk-info {
            color: #e2e8f0;
          }

          .sync-status-panel__empty-state h3 {
            color: #f1f5f9;
          }

          .sync-status-panel__empty-state p {
            color: #94a3b8;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .sync-status-panel__header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .sync-status-panel__stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .sync-status-panel__operation-detail-grid {
            grid-template-columns: 1fr;
          }

          .sync-status-panel__bulk-actions {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .sync-status-panel__bulk-buttons {
            justify-content: stretch;
          }

          .sync-status-panel__bulk-btn {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};
