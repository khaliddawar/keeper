import React, { useState } from 'react';
import type { StorageQuota } from '../types';

/**
 * Storage Quota Indicator Component
 * 
 * Displays storage usage, quota limits, breakdown by type,
 * and provides storage management controls.
 */
interface StorageQuotaIndicatorProps {
  quota: StorageQuota;
  layout?: 'compact' | 'detailed';
  showBreakdown?: boolean;
  onClearCache?: (selective: boolean) => void;
}

export const StorageQuotaIndicator: React.FC<StorageQuotaIndicatorProps> = ({
  quota,
  layout = 'detailed',
  showBreakdown = true,
  onClearCache
}) => {
  const [isClearing, setIsClearing] = useState(false);

  // Format bytes to human readable
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get usage color based on percentage
  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return '#dc2626';
    if (percentage >= 75) return '#ea580c';
    if (percentage >= 50) return '#f59e0b';
    return '#10b981';
  };

  // Get warning level
  const getWarningLevel = (percentage: number) => {
    if (percentage >= 90) return 'critical';
    if (percentage >= 75) return 'high';
    if (percentage >= 50) return 'medium';
    return 'low';
  };

  // Handle cache clearing
  const handleClearCache = async (selective: boolean) => {
    if (!onClearCache) return;
    
    setIsClearing(true);
    try {
      await onClearCache(selective);
    } catch (error) {
      console.error('Cache clear failed:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const usageColor = getUsageColor(quota.usagePercentage);
  const warningLevel = getWarningLevel(quota.usagePercentage);

  // Compact layout
  if (layout === 'compact') {
    return (
      <div className="storage-quota storage-quota--compact">
        <div className="storage-quota__header">
          <div className="storage-quota__usage-info">
            <span className="storage-quota__usage-percent">
              {quota.usagePercentage}%
            </span>
            <span className="storage-quota__usage-text">
              {formatBytes(quota.usage)} of {formatBytes(quota.quota)}
            </span>
          </div>
        </div>

        <div className="storage-quota__progress-bar">
          <div 
            className="storage-quota__progress-fill"
            style={{ 
              width: `${quota.usagePercentage}%`,
              backgroundColor: usageColor
            }}
          />
        </div>

        {showBreakdown && (
          <div className="storage-quota__breakdown">
            {Object.entries(quota.breakdown).map(([type, size]) => (
              size > 0 && (
                <div key={type} className="storage-quota__breakdown-item">
                  <span className="storage-quota__breakdown-label">{type}:</span>
                  <span className="storage-quota__breakdown-value">{formatBytes(size)}</span>
                </div>
              )
            ))}
          </div>
        )}

        <style>{`
          .storage-quota--compact {
            padding: 12px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            min-width: 200px;
          }

          .storage-quota__header {
            margin-bottom: 8px;
          }

          .storage-quota__usage-percent {
            font-size: 1.25rem;
            font-weight: 700;
            color: ${usageColor};
            margin-right: 8px;
          }

          .storage-quota__usage-text {
            font-size: 0.75rem;
            color: #64748b;
          }

          .storage-quota__progress-bar {
            height: 6px;
            background: #e5e7eb;
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 8px;
          }

          .storage-quota__progress-fill {
            height: 100%;
            border-radius: 3px;
            transition: width 0.3s ease;
          }

          .storage-quota__breakdown {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .storage-quota__breakdown-item {
            display: flex;
            justify-content: space-between;
            font-size: 0.6875rem;
          }

          .storage-quota__breakdown-label {
            color: #6b7280;
            text-transform: capitalize;
          }

          .storage-quota__breakdown-value {
            color: #1e293b;
            font-weight: 600;
            font-family: monospace;
          }

          /* Dark theme */
          @media (prefers-color-scheme: dark) {
            .storage-quota--compact {
              background: #1e293b;
              border-color: #334155;
            }

            .storage-quota__usage-text {
              color: #94a3b8;
            }

            .storage-quota__progress-bar {
              background: #374151;
            }

            .storage-quota__breakdown-label {
              color: #9ca3af;
            }

            .storage-quota__breakdown-value {
              color: #f1f5f9;
            }
          }
        `}</style>
      </div>
    );
  }

  // Detailed layout
  return (
    <div className="storage-quota storage-quota--detailed">
      {/* Header */}
      <div className="storage-quota__header">
        <div className="storage-quota__usage-summary">
          <div className="storage-quota__usage-circle">
            <div className="storage-quota__usage-percent">{quota.usagePercentage}%</div>
            <div className="storage-quota__usage-label">Used</div>
          </div>
          
          <div className="storage-quota__usage-details">
            <div className="storage-quota__usage-amounts">
              <div className="storage-quota__usage-amount">
                <span className="storage-quota__amount-value">{formatBytes(quota.usage)}</span>
                <span className="storage-quota__amount-label">Used</span>
              </div>
              <div className="storage-quota__usage-divider">/</div>
              <div className="storage-quota__usage-amount">
                <span className="storage-quota__amount-value">{formatBytes(quota.quota)}</span>
                <span className="storage-quota__amount-label">Total</span>
              </div>
            </div>
            
            <div className="storage-quota__usage-available">
              <span className="storage-quota__available-value">
                {formatBytes(quota.quota - quota.usage)} available
              </span>
            </div>
          </div>
        </div>

        {/* Warning Messages */}
        {warningLevel === 'critical' && (
          <div className="storage-quota__warning storage-quota__warning--critical">
            <span className="storage-quota__warning-icon">🚨</span>
            <div className="storage-quota__warning-text">
              <div className="storage-quota__warning-title">Storage Almost Full</div>
              <div className="storage-quota__warning-description">
                Clear some data to free up space and ensure proper functionality.
              </div>
            </div>
          </div>
        )}

        {warningLevel === 'high' && (
          <div className="storage-quota__warning storage-quota__warning--high">
            <span className="storage-quota__warning-icon">⚠️</span>
            <div className="storage-quota__warning-text">
              <div className="storage-quota__warning-title">Storage Running Low</div>
              <div className="storage-quota__warning-description">
                Consider clearing cache or old data to prevent issues.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="storage-quota__progress">
        <div className="storage-quota__progress-bar">
          <div 
            className="storage-quota__progress-fill"
            style={{ 
              width: `${quota.usagePercentage}%`,
              backgroundColor: usageColor
            }}
          />
        </div>
        
        <div className="storage-quota__progress-markers">
          <span className="storage-quota__progress-marker">0%</span>
          <span className="storage-quota__progress-marker">25%</span>
          <span className="storage-quota__progress-marker">50%</span>
          <span className="storage-quota__progress-marker">75%</span>
          <span className="storage-quota__progress-marker">100%</span>
        </div>
      </div>

      {/* Storage Breakdown */}
      {showBreakdown && (
        <div className="storage-quota__breakdown">
          <h4 className="storage-quota__breakdown-title">Storage Breakdown</h4>
          
          <div className="storage-quota__breakdown-list">
            {Object.entries(quota.breakdown)
              .filter(([, size]) => size > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([type, size]) => {
                const percentage = quota.quota > 0 ? (size / quota.quota) * 100 : 0;
                
                return (
                  <div key={type} className="storage-quota__breakdown-item">
                    <div className="storage-quota__breakdown-item-header">
                      <div className="storage-quota__breakdown-item-info">
                        <span className="storage-quota__breakdown-item-name">
                          {type === 'indexedDB' ? 'IndexedDB' :
                           type === 'cache' ? 'Cache' :
                           type === 'serviceWorker' ? 'Service Worker' :
                           'Other'}
                        </span>
                        <span className="storage-quota__breakdown-item-size">
                          {formatBytes(size)}
                        </span>
                      </div>
                      <span className="storage-quota__breakdown-item-percent">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="storage-quota__breakdown-item-bar">
                      <div 
                        className="storage-quota__breakdown-item-fill"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: usageColor
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Management Actions */}
      {onClearCache && (
        <div className="storage-quota__actions">
          <h4 className="storage-quota__actions-title">Storage Management</h4>
          
          <div className="storage-quota__action-buttons">
            <button
              onClick={() => handleClearCache(true)}
              disabled={isClearing}
              className="storage-quota__action-btn storage-quota__action-btn--primary"
            >
              {isClearing ? '🔄' : '🧹'} Clear Cache
            </button>
            
            <button
              onClick={() => handleClearCache(false)}
              disabled={isClearing}
              className="storage-quota__action-btn storage-quota__action-btn--secondary"
            >
              {isClearing ? '🔄' : '🗑️'} Clear All
            </button>
          </div>
          
          <div className="storage-quota__action-description">
            <p>Clear Cache: Remove temporary files and cached data</p>
            <p>Clear All: Remove all offline data (requires re-sync)</p>
          </div>
        </div>
      )}

      <style>{`
        .storage-quota--detailed {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
        }

        .storage-quota__header {
          margin-bottom: 24px;
        }

        .storage-quota__usage-summary {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 16px;
        }

        .storage-quota__usage-circle {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: conic-gradient(${usageColor} ${quota.usagePercentage}%, #e5e7eb 0%);
          position: relative;
        }

        .storage-quota__usage-circle::before {
          content: '';
          position: absolute;
          width: 60px;
          height: 60px;
          background: white;
          border-radius: 50%;
        }

        .storage-quota__usage-percent {
          font-size: 1.125rem;
          font-weight: 700;
          color: ${usageColor};
          z-index: 1;
        }

        .storage-quota__usage-label {
          font-size: 0.75rem;
          color: #64748b;
          z-index: 1;
        }

        .storage-quota__usage-details {
          flex: 1;
        }

        .storage-quota__usage-amounts {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 8px;
        }

        .storage-quota__usage-amount {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .storage-quota__amount-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          font-family: monospace;
        }

        .storage-quota__amount-label {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .storage-quota__usage-divider {
          font-size: 1.5rem;
          color: #cbd5e0;
          margin: 0 4px;
        }

        .storage-quota__usage-available {
          text-align: center;
        }

        .storage-quota__available-value {
          font-size: 0.875rem;
          color: #10b981;
          font-weight: 600;
        }

        .storage-quota__warning {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          border-radius: 6px;
          margin-top: 16px;
        }

        .storage-quota__warning--critical {
          background: #fef2f2;
          border: 1px solid #fecaca;
        }

        .storage-quota__warning--high {
          background: #fffbeb;
          border: 1px solid #fed7aa;
        }

        .storage-quota__warning-icon {
          font-size: 1.25rem;
          margin-top: 2px;
        }

        .storage-quota__warning-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #92400e;
          margin-bottom: 2px;
        }

        .storage-quota__warning-description {
          font-size: 0.75rem;
          color: #b45309;
          line-height: 1.4;
        }

        .storage-quota__progress {
          margin-bottom: 24px;
        }

        .storage-quota__progress-bar {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .storage-quota__progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .storage-quota__progress-markers {
          display: flex;
          justify-content: space-between;
        }

        .storage-quota__progress-marker {
          font-size: 0.6875rem;
          color: #9ca3af;
          font-family: monospace;
        }

        .storage-quota__breakdown {
          margin-bottom: 24px;
        }

        .storage-quota__breakdown-title {
          margin: 0 0 12px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .storage-quota__breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .storage-quota__breakdown-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .storage-quota__breakdown-item-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .storage-quota__breakdown-item-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .storage-quota__breakdown-item-size {
          font-size: 0.75rem;
          color: #6b7280;
          font-family: monospace;
        }

        .storage-quota__breakdown-item-percent {
          font-size: 0.75rem;
          font-weight: 600;
          color: ${usageColor};
          font-family: monospace;
        }

        .storage-quota__breakdown-item-bar {
          height: 4px;
          background: #f1f5f9;
          border-radius: 2px;
          overflow: hidden;
        }

        .storage-quota__breakdown-item-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .storage-quota__actions-title {
          margin: 0 0 12px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .storage-quota__action-buttons {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .storage-quota__action-btn {
          flex: 1;
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .storage-quota__action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .storage-quota__action-btn--primary {
          background: #3b82f6;
          color: white;
        }

        .storage-quota__action-btn--primary:hover:not(:disabled) {
          background: #2563eb;
        }

        .storage-quota__action-btn--secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .storage-quota__action-btn--secondary:hover:not(:disabled) {
          background: #e5e7eb;
          border-color: #9ca3af;
        }

        .storage-quota__action-description {
          font-size: 0.75rem;
          color: #6b7280;
          line-height: 1.4;
        }

        .storage-quota__action-description p {
          margin: 4px 0;
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          .storage-quota--detailed {
            background: #1e293b;
            border-color: #334155;
          }

          .storage-quota__usage-circle::before {
            background: #1e293b;
          }

          .storage-quota__usage-label {
            color: #94a3b8;
          }

          .storage-quota__amount-value {
            color: #f1f5f9;
          }

          .storage-quota__amount-label {
            color: #94a3b8;
          }

          .storage-quota__usage-divider {
            color: #4b5563;
          }

          .storage-quota__warning--critical {
            background: #450a0a;
            border-color: #7f1d1d;
          }

          .storage-quota__warning--high {
            background: #451a03;
            border-color: #92400e;
          }

          .storage-quota__warning-title {
            color: #fbbf24;
          }

          .storage-quota__warning-description {
            color: #d97706;
          }

          .storage-quota__progress-bar {
            background: #374151;
          }

          .storage-quota__progress-marker {
            color: #6b7280;
          }

          .storage-quota__breakdown-title {
            color: #f1f5f9;
          }

          .storage-quota__breakdown-item-name {
            color: #e2e8f0;
          }

          .storage-quota__breakdown-item-size {
            color: #9ca3af;
          }

          .storage-quota__breakdown-item-bar {
            background: #334155;
          }

          .storage-quota__actions-title {
            color: #f1f5f9;
          }

          .storage-quota__action-btn--secondary {
            background: #374151;
            color: #f9fafb;
            border-color: #4b5563;
          }

          .storage-quota__action-btn--secondary:hover:not(:disabled) {
            background: #4b5563;
            border-color: #6b7280;
          }

          .storage-quota__action-description {
            color: #9ca3af;
          }
        }

        /* Responsive */
        @media (max-width: 640px) {
          .storage-quota__usage-summary {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }

          .storage-quota__action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};
