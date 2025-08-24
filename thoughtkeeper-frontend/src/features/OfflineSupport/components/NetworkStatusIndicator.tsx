import React, { useState } from 'react';
import type { NetworkStatus } from '../types';

/**
 * Network Status Indicator Component
 * 
 * Displays real-time network connection status including quality,
 * bandwidth, latency, and connection type with visual indicators.
 */
interface NetworkStatusIndicatorProps {
  status: NetworkStatus;
  size?: 'small' | 'medium' | 'large';
  layout?: 'compact' | 'detailed';
  showDetails?: boolean;
  onClick?: () => void;
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  status,
  size = 'medium',
  layout = 'compact',
  showDetails = true,
  onClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get status info
  const getStatusInfo = () => {
    if (!status.isOnline) {
      return {
        color: '#ef4444',
        backgroundColor: '#fef2f2',
        icon: '📴',
        label: 'Offline',
        description: 'No internet connection available'
      };
    }

    switch (status.connectivityScore) {
      case 'excellent':
        return {
          color: '#10b981',
          backgroundColor: '#f0fdf4',
          icon: '🟢',
          label: 'Excellent',
          description: 'Fast, stable connection'
        };
      case 'good':
        return {
          color: '#059669',
          backgroundColor: '#f0fdf4',
          icon: '🟡',
          label: 'Good',
          description: 'Reliable connection with minor delays'
        };
      case 'poor':
        return {
          color: '#f59e0b',
          backgroundColor: '#fffbeb',
          icon: '🟠',
          label: 'Poor',
          description: 'Slow connection, delays expected'
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

  // Format connection info
  const formatConnectionType = (type: string) => {
    const types = {
      'wifi': 'WiFi',
      'cellular': 'Mobile',
      'ethernet': 'Ethernet',
      'bluetooth': 'Bluetooth',
      'unknown': 'Unknown'
    };
    return types[type] || type;
  };

  const formatEffectiveType = (type: string) => {
    const types = {
      '2g': '2G',
      '3g': '3G',
      '4g': '4G',
      'unknown': '?'
    };
    return types[type] || type;
  };

  const formatBandwidth = (downlink: number) => {
    if (downlink === 0) return '?';
    if (downlink < 1) return `${Math.round(downlink * 1000)}kbps`;
    return `${downlink.toFixed(1)}Mbps`;
  };

  const formatLatency = (rtt: number) => {
    if (rtt === 0) return '?';
    return `${rtt}ms`;
  };

  const statusInfo = getStatusInfo();

  // Small size for minimal displays
  if (size === 'small') {
    return (
      <div 
        className="network-status network-status--small"
        onClick={onClick}
        title={`${statusInfo.label} - ${statusInfo.description}`}
      >
        <span className="network-status__icon">{statusInfo.icon}</span>
        {status.isOnline && status.downlink > 0 && (
          <span className="network-status__bandwidth">
            {formatBandwidth(status.downlink)}
          </span>
        )}

        <style jsx>{`
          .network-status--small {
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

          .network-status--small:hover {
            ${onClick ? `background: ${statusInfo.color}22; border-color: ${statusInfo.color}66;` : ''}
          }

          .network-status__icon {
            font-size: 0.75rem;
          }

          .network-status__bandwidth {
            font-size: 0.6875rem;
            font-weight: 600;
            color: ${statusInfo.color};
            font-family: monospace;
          }

          /* Dark theme */
          @media (prefers-color-scheme: dark) {
            .network-status--small {
              background: ${statusInfo.color}22;
              border-color: ${statusInfo.color}44;
            }

            .network-status--small:hover {
              ${onClick ? `background: ${statusInfo.color}33; border-color: ${statusInfo.color}66;` : ''}
            }
          }
        `}</style>
      </div>
    );
  }

  // Compact layout
  if (layout === 'compact') {
    return (
      <div className="network-status network-status--compact">
        <div className="network-status__indicator">
          <span 
            className="network-status__status-dot"
            style={{ backgroundColor: statusInfo.color }}
          />
          <span className="network-status__label">{statusInfo.label}</span>
        </div>

        {status.isOnline && (
          <div className="network-status__details">
            <span className="network-status__connection-type">
              {formatConnectionType(status.connectionType)}
            </span>
            {status.effectiveType !== 'unknown' && (
              <span className="network-status__effective-type">
                {formatEffectiveType(status.effectiveType)}
              </span>
            )}
            {status.downlink > 0 && (
              <span className="network-status__bandwidth">
                {formatBandwidth(status.downlink)}
              </span>
            )}
          </div>
        )}

        <style jsx>{`
          .network-status--compact {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 12px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            min-width: 180px;
          }

          .network-status__indicator {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .network-status__status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            animation: pulse 2s infinite;
          }

          .network-status__label {
            font-weight: 600;
            color: #1e293b;
          }

          .network-status__details {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.875rem;
            color: #64748b;
          }

          .network-status__connection-type,
          .network-status__effective-type,
          .network-status__bandwidth {
            padding: 2px 6px;
            background: #f1f5f9;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
          }

          .network-status__bandwidth {
            font-family: monospace;
            background: ${statusInfo.backgroundColor};
            color: ${statusInfo.color};
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }

          /* Dark theme */
          @media (prefers-color-scheme: dark) {
            .network-status--compact {
              background: #1e293b;
              border-color: #334155;
            }

            .network-status__label {
              color: #f1f5f9;
            }

            .network-status__details {
              color: #94a3b8;
            }

            .network-status__connection-type,
            .network-status__effective-type {
              background: #334155;
              color: #cbd5e0;
            }

            .network-status__bandwidth {
              background: ${statusInfo.color}33;
              color: ${statusInfo.color};
            }
          }
        `}</style>
      </div>
    );
  }

  // Detailed layout
  return (
    <div className="network-status network-status--detailed">
      {/* Header */}
      <div 
        className="network-status__header"
        onClick={() => onClick ? onClick() : setIsExpanded(!isExpanded)}
      >
        <div className="network-status__main-info">
          <div className="network-status__status-indicator">
            <span className="network-status__status-icon">{statusInfo.icon}</span>
            <div className="network-status__status-text">
              <div className="network-status__status-label">{statusInfo.label}</div>
              <div className="network-status__status-description">{statusInfo.description}</div>
            </div>
          </div>
        </div>

        {showDetails && (
          <button 
            className="network-status__expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
      </div>

      {/* Connection Summary */}
      {status.isOnline && (
        <div className="network-status__summary">
          <div className="network-status__metric">
            <span className="network-status__metric-label">Type:</span>
            <span className="network-status__metric-value">
              {formatConnectionType(status.connectionType)}
              {status.effectiveType !== 'unknown' && ` (${formatEffectiveType(status.effectiveType)})`}
            </span>
          </div>
          
          {status.downlink > 0 && (
            <div className="network-status__metric">
              <span className="network-status__metric-label">Speed:</span>
              <span className="network-status__metric-value">
                {formatBandwidth(status.downlink)}
              </span>
            </div>
          )}
          
          {status.rtt > 0 && (
            <div className="network-status__metric">
              <span className="network-status__metric-label">Latency:</span>
              <span className="network-status__metric-value">
                {formatLatency(status.rtt)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && showDetails && (
        <div className="network-status__details-panel">
          <div className="network-status__detail-grid">
            <div className="network-status__detail-item">
              <span className="network-status__detail-label">Status:</span>
              <span className="network-status__detail-value">
                {status.isOnline ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div className="network-status__detail-item">
              <span className="network-status__detail-label">Quality:</span>
              <span 
                className="network-status__detail-value"
                style={{ color: statusInfo.color }}
              >
                {statusInfo.label}
              </span>
            </div>

            {status.connectionType !== 'unknown' && (
              <div className="network-status__detail-item">
                <span className="network-status__detail-label">Connection:</span>
                <span className="network-status__detail-value">
                  {formatConnectionType(status.connectionType)}
                </span>
              </div>
            )}

            {status.effectiveType !== 'unknown' && (
              <div className="network-status__detail-item">
                <span className="network-status__detail-label">Network:</span>
                <span className="network-status__detail-value">
                  {formatEffectiveType(status.effectiveType)}
                </span>
              </div>
            )}

            {status.downlink > 0 && (
              <div className="network-status__detail-item">
                <span className="network-status__detail-label">Download:</span>
                <span className="network-status__detail-value">
                  {formatBandwidth(status.downlink)}
                </span>
              </div>
            )}

            {status.rtt > 0 && (
              <div className="network-status__detail-item">
                <span className="network-status__detail-label">RTT:</span>
                <span className="network-status__detail-value">
                  {formatLatency(status.rtt)}
                </span>
              </div>
            )}

            <div className="network-status__detail-item">
              <span className="network-status__detail-label">Data Saver:</span>
              <span className="network-status__detail-value">
                {status.saveData ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            {status.lastConnected && (
              <div className="network-status__detail-item">
                <span className="network-status__detail-label">Last Online:</span>
                <span className="network-status__detail-value">
                  {new Date(status.lastConnected).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Connection Quality Bar */}
          <div className="network-status__quality-bar">
            <div className="network-status__quality-label">Connection Quality</div>
            <div className="network-status__quality-track">
              <div 
                className="network-status__quality-fill"
                style={{ 
                  width: status.isOnline ? 
                    (status.connectivityScore === 'excellent' ? '100%' :
                     status.connectivityScore === 'good' ? '75%' :
                     status.connectivityScore === 'poor' ? '50%' : '25%') : '0%',
                  backgroundColor: statusInfo.color
                }}
              />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .network-status--detailed {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          cursor: ${onClick ? 'pointer' : 'default'};
          transition: all 0.2s ease;
          min-width: 300px;
        }

        .network-status--detailed:hover {
          ${onClick ? 'border-color: #cbd5e0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);' : ''}
        }

        .network-status__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
        }

        .network-status__status-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .network-status__status-icon {
          font-size: 1.5rem;
        }

        .network-status__status-label {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 2px;
        }

        .network-status__status-description {
          font-size: 0.875rem;
          color: #64748b;
        }

        .network-status__expand-btn {
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

        .network-status__expand-btn:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .network-status__summary {
          display: flex;
          gap: 16px;
          padding: 0 16px 16px;
          flex-wrap: wrap;
        }

        .network-status__metric {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.875rem;
        }

        .network-status__metric-label {
          color: #64748b;
          font-weight: 500;
        }

        .network-status__metric-value {
          color: #1e293b;
          font-weight: 600;
        }

        .network-status__details-panel {
          border-top: 1px solid #f1f5f9;
          background: #f8fafc;
          padding: 16px;
        }

        .network-status__detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .network-status__detail-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .network-status__detail-label {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }

        .network-status__detail-value {
          font-size: 0.875rem;
          color: #1e293b;
          font-weight: 600;
        }

        .network-status__quality-bar {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .network-status__quality-label {
          font-size: 0.875rem;
          color: #374151;
          font-weight: 600;
        }

        .network-status__quality-track {
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
        }

        .network-status__quality-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          .network-status--detailed {
            background: #1e293b;
            border-color: #334155;
          }

          .network-status--detailed:hover {
            ${onClick ? 'border-color: #475569;' : ''}
          }

          .network-status__status-label {
            color: #f1f5f9;
          }

          .network-status__status-description {
            color: #94a3b8;
          }

          .network-status__expand-btn {
            background: #374151;
            border-color: #4b5563;
            color: #d1d5db;
          }

          .network-status__expand-btn:hover {
            background: #4b5563;
            border-color: #6b7280;
          }

          .network-status__metric-label {
            color: #94a3b8;
          }

          .network-status__metric-value {
            color: #f1f5f9;
          }

          .network-status__details-panel {
            background: #0f172a;
            border-color: #334155;
          }

          .network-status__detail-label {
            color: #9ca3af;
          }

          .network-status__detail-value {
            color: #f1f5f9;
          }

          .network-status__quality-label {
            color: #e2e8f0;
          }

          .network-status__quality-track {
            background: #374151;
          }
        }

        /* Responsive */
        @media (max-width: 640px) {
          .network-status__detail-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .network-status__summary {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};
