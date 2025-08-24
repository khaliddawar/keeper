import React, { useState, useEffect } from 'react';
import type { ConnectionStatus as ConnectionStatusType } from '../types';

/**
 * Connection Status Component
 * 
 * Displays real-time connection quality, sync status, latency,
 * and provides connection management controls.
 */
interface ConnectionStatusProps {
  status: ConnectionStatusType;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
  showLatency?: boolean;
  onClick?: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  size = 'medium',
  showDetails = true,
  showLatency = true,
  onClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // Update last sync time
  useEffect(() => {
    const updateSyncTime = () => {
      if (status.lastSync) {
        const now = Date.now();
        const diff = now - status.lastSync;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        
        if (seconds < 60) {
          setLastSyncTime(seconds < 10 ? 'just now' : `${seconds}s ago`);
        } else if (minutes < 60) {
          setLastSyncTime(`${minutes}m ago`);
        } else {
          setLastSyncTime('over 1h ago');
        }
      }
    };

    updateSyncTime();
    const interval = setInterval(updateSyncTime, 1000);
    return () => clearInterval(interval);
  }, [status.lastSync]);

  // Get status colors and icons
  const getStatusInfo = () => {
    if (!status.isConnected) {
      return {
        color: '#ef4444',
        backgroundColor: '#fef2f2',
        icon: '🔴',
        label: 'Disconnected',
        description: 'Unable to connect to collaboration server'
      };
    }

    switch (status.quality) {
      case 'excellent':
        return {
          color: '#10b981',
          backgroundColor: '#f0fdf4',
          icon: '🟢',
          label: 'Excellent',
          description: 'Real-time collaboration working perfectly'
        };
      case 'good':
        return {
          color: '#059669',
          backgroundColor: '#f0fdf4',
          icon: '🟡',
          label: 'Good',
          description: 'Minor delays may occur'
        };
      case 'poor':
        return {
          color: '#f59e0b',
          backgroundColor: '#fffbeb',
          icon: '🟠',
          label: 'Poor',
          description: 'Significant delays in real-time updates'
        };
      default:
        return {
          color: '#6b7280',
          backgroundColor: '#f9fafb',
          icon: '⚪',
          label: 'Unknown',
          description: 'Connection quality unknown'
        };
    }
  };

  // Get sync status info
  const getSyncStatusInfo = () => {
    switch (status.syncStatus) {
      case 'synced':
        return {
          icon: '✅',
          label: 'Synced',
          color: '#10b981'
        };
      case 'syncing':
        return {
          icon: '🔄',
          label: 'Syncing',
          color: '#3b82f6'
        };
      case 'conflict':
        return {
          icon: '⚠️',
          label: 'Conflict',
          color: '#f59e0b'
        };
      case 'error':
        return {
          icon: '❌',
          label: 'Error',
          color: '#ef4444'
        };
      default:
        return {
          icon: '❓',
          label: 'Unknown',
          color: '#6b7280'
        };
    }
  };

  // Get latency color
  const getLatencyColor = (latency?: number) => {
    if (!latency) return '#6b7280';
    if (latency < 100) return '#10b981';
    if (latency < 300) return '#f59e0b';
    return '#ef4444';
  };

  const statusInfo = getStatusInfo();
  const syncInfo = getSyncStatusInfo();

  // Small size for compact layouts
  if (size === 'small') {
    return (
      <div 
        className="connection-status connection-status--small"
        onClick={onClick}
        title={`Connection: ${statusInfo.label} • Sync: ${syncInfo.label}${status.latency ? ` • ${status.latency}ms` : ''}`}
      >
        <span className="connection-status__icon">{statusInfo.icon}</span>
        {showLatency && status.latency && (
          <span 
            className="connection-status__latency"
            style={{ color: getLatencyColor(status.latency) }}
          >
            {status.latency}ms
          </span>
        )}

        <style jsx>{`
          .connection-status--small {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 4px 8px;
            border-radius: 12px;
            background: ${statusInfo.backgroundColor};
            border: 1px solid ${statusInfo.color}33;
            cursor: ${onClick ? 'pointer' : 'default'};
            transition: all 0.2s ease;
          }

          .connection-status--small:hover {
            ${onClick ? `background: ${statusInfo.color}22; border-color: ${statusInfo.color}66;` : ''}
          }

          .connection-status__icon {
            font-size: 0.75rem;
          }

          .connection-status__latency {
            font-size: 0.6875rem;
            font-weight: 600;
            font-family: monospace;
          }

          /* Dark theme */
          @media (prefers-color-scheme: dark) {
            .connection-status--small {
              background: ${statusInfo.color}22;
              border-color: ${statusInfo.color}44;
            }

            .connection-status--small:hover {
              ${onClick ? `background: ${statusInfo.color}33; border-color: ${statusInfo.color}66;` : ''}
            }
          }
        `}</style>
      </div>
    );
  }

  // Medium/Large size for detailed displays
  return (
    <div 
      className={`connection-status connection-status--${size}`}
      onClick={() => onClick ? onClick() : setIsExpanded(!isExpanded)}
    >
      {/* Main Status Display */}
      <div className="connection-status__main">
        <div className="connection-status__indicator">
          <span className="connection-status__status-icon">{statusInfo.icon}</span>
          {status.syncStatus === 'syncing' && (
            <span className="connection-status__sync-spinner">{syncInfo.icon}</span>
          )}
        </div>

        <div className="connection-status__info">
          <div className="connection-status__primary">
            <span className="connection-status__quality">{statusInfo.label}</span>
            {showLatency && status.latency && (
              <span 
                className="connection-status__latency-badge"
                style={{ color: getLatencyColor(status.latency) }}
              >
                {status.latency}ms
              </span>
            )}
          </div>
          
          {showDetails && (
            <div className="connection-status__secondary">
              <span className="connection-status__sync-status">
                {syncInfo.icon} {syncInfo.label}
              </span>
              {status.pendingUpdates > 0 && (
                <span className="connection-status__pending">
                  • {status.pendingUpdates} pending
                </span>
              )}
              {lastSyncTime && (
                <span className="connection-status__last-sync">
                  • {lastSyncTime}
                </span>
              )}
            </div>
          )}
        </div>

        {(onClick || size === 'large') && (
          <button 
            className="connection-status__expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && showDetails && (
        <div className="connection-status__details">
          <div className="connection-status__detail-grid">
            <div className="connection-status__detail-item">
              <span className="connection-status__detail-label">Connection:</span>
              <span className="connection-status__detail-value">
                {status.isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div className="connection-status__detail-item">
              <span className="connection-status__detail-label">Quality:</span>
              <span 
                className="connection-status__detail-value"
                style={{ color: statusInfo.color }}
              >
                {statusInfo.label}
              </span>
            </div>

            {status.latency && (
              <div className="connection-status__detail-item">
                <span className="connection-status__detail-label">Latency:</span>
                <span 
                  className="connection-status__detail-value"
                  style={{ color: getLatencyColor(status.latency) }}
                >
                  {status.latency}ms
                </span>
              </div>
            )}

            <div className="connection-status__detail-item">
              <span className="connection-status__detail-label">Sync Status:</span>
              <span 
                className="connection-status__detail-value"
                style={{ color: syncInfo.color }}
              >
                {syncInfo.icon} {syncInfo.label}
              </span>
            </div>

            {status.pendingUpdates > 0 && (
              <div className="connection-status__detail-item">
                <span className="connection-status__detail-label">Pending:</span>
                <span className="connection-status__detail-value">
                  {status.pendingUpdates} update{status.pendingUpdates !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {status.lastSync && (
              <div className="connection-status__detail-item">
                <span className="connection-status__detail-label">Last Sync:</span>
                <span className="connection-status__detail-value">
                  {new Date(status.lastSync).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>

          <div className="connection-status__description">
            {statusInfo.description}
          </div>

          {/* Connection Actions */}
          <div className="connection-status__actions">
            <button className="connection-status__action-btn connection-status__action-btn--primary">
              🔄 Refresh Connection
            </button>
            <button className="connection-status__action-btn">
              ⚙️ Settings
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .connection-status--medium,
        .connection-status--large {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          cursor: ${onClick ? 'pointer' : 'default'};
          transition: all 0.2s ease;
          min-width: ${size === 'large' ? '280px' : '200px'};
        }

        .connection-status--medium:hover,
        .connection-status--large:hover {
          ${onClick ? 'border-color: #cbd5e0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);' : ''}
        }

        .connection-status__main {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
        }

        .connection-status__indicator {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .connection-status__status-icon {
          font-size: ${size === 'large' ? '1.25rem' : '1rem'};
        }

        .connection-status__sync-spinner {
          position: absolute;
          top: -4px;
          right: -4px;
          font-size: 0.75rem;
          animation: spin 2s linear infinite;
        }

        .connection-status__info {
          flex: 1;
          min-width: 0;
        }

        .connection-status__primary {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: ${showDetails ? '4px' : '0'};
        }

        .connection-status__quality {
          font-size: ${size === 'large' ? '0.875rem' : '0.8125rem'};
          font-weight: 600;
          color: ${statusInfo.color};
        }

        .connection-status__latency-badge {
          font-size: 0.75rem;
          font-weight: 600;
          font-family: monospace;
          background: rgba(0, 0, 0, 0.05);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .connection-status__secondary {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: #64748b;
        }

        .connection-status__sync-status {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .connection-status__pending,
        .connection-status__last-sync {
          color: #9ca3af;
        }

        .connection-status__expand-btn {
          padding: 4px;
          background: none;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          color: #6b7280;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: monospace;
        }

        .connection-status__expand-btn:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .connection-status__details {
          border-top: 1px solid #f1f5f9;
          background: #f8fafc;
          padding: 16px;
        }

        .connection-status__detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .connection-status__detail-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .connection-status__detail-label {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }

        .connection-status__detail-value {
          font-size: 0.875rem;
          color: #1e293b;
          font-weight: 600;
        }

        .connection-status__description {
          font-size: 0.875rem;
          color: #64748b;
          line-height: 1.4;
          margin-bottom: 16px;
          padding: 8px;
          background: white;
          border-radius: 4px;
          border-left: 3px solid ${statusInfo.color};
        }

        .connection-status__actions {
          display: flex;
          gap: 8px;
        }

        .connection-status__action-btn {
          flex: 1;
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .connection-status__action-btn:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .connection-status__action-btn--primary {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .connection-status__action-btn--primary:hover {
          background: #2563eb;
          border-color: #2563eb;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          .connection-status--medium,
          .connection-status--large {
            background: #1e293b;
            border-color: #334155;
          }

          .connection-status--medium:hover,
          .connection-status--large:hover {
            ${onClick ? 'border-color: #475569;' : ''}
          }

          .connection-status__latency-badge {
            background: rgba(255, 255, 255, 0.1);
          }

          .connection-status__secondary {
            color: #94a3b8;
          }

          .connection-status__pending,
          .connection-status__last-sync {
            color: #6b7280;
          }

          .connection-status__expand-btn {
            background: #374151;
            border-color: #4b5563;
            color: #d1d5db;
          }

          .connection-status__expand-btn:hover {
            background: #4b5563;
            border-color: #6b7280;
          }

          .connection-status__details {
            background: #0f172a;
            border-color: #334155;
          }

          .connection-status__detail-label {
            color: #9ca3af;
          }

          .connection-status__detail-value {
            color: #f1f5f9;
          }

          .connection-status__description {
            background: #1e293b;
            color: #cbd5e0;
          }

          .connection-status__action-btn {
            background: #374151;
            border-color: #4b5563;
            color: #f9fafb;
          }

          .connection-status__action-btn:hover {
            background: #4b5563;
            border-color: #6b7280;
          }
        }

        /* Responsive */
        @media (max-width: 640px) {
          .connection-status__detail-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .connection-status__actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};
