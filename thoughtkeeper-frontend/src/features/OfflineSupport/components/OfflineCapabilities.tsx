import React from 'react';
import type { NetworkStatus } from '../types';

/**
 * Offline Capabilities Component
 * 
 * Displays what features and functionality are available when offline,
 * providing users with clear understanding of app capabilities.
 */
interface OfflineCapabilitiesProps {
  networkStatus: NetworkStatus;
  getOfflineCapability: (feature: string) => boolean;
}

export const OfflineCapabilities: React.FC<OfflineCapabilitiesProps> = ({
  networkStatus,
  getOfflineCapability
}) => {
  // Define all app capabilities with details
  const capabilities = [
    {
      id: 'dataAccess',
      name: 'View Data',
      description: 'Access all your notebooks, tasks, and projects',
      icon: '👀',
      category: 'core'
    },
    {
      id: 'dataModification',
      name: 'Edit Data', 
      description: 'Create, edit, and delete items (synced when online)',
      icon: '✏️',
      category: 'core'
    },
    {
      id: 'search',
      name: 'Search',
      description: 'Search through your locally cached content',
      icon: '🔍',
      category: 'core'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'View productivity insights and metrics',
      icon: '📊',
      category: 'productivity'
    },
    {
      id: 'exportImport',
      name: 'Export Data',
      description: 'Export your data to various formats',
      icon: '📤',
      category: 'productivity'
    },
    {
      id: 'keyboardShortcuts',
      name: 'Keyboard Shortcuts',
      description: 'Full keyboard navigation and shortcuts',
      icon: '⌨️',
      category: 'productivity'
    },
    {
      id: 'virtualScrolling',
      name: 'Large Datasets',
      description: 'Handle thousands of items smoothly',
      icon: '🚀',
      category: 'performance'
    },
    {
      id: 'collaboration',
      name: 'Real-time Collaboration',
      description: 'Live collaboration and conflict resolution',
      icon: '👥',
      category: 'collaboration'
    },
    {
      id: 'notifications',
      name: 'Push Notifications',
      description: 'Receive updates and reminders',
      icon: '🔔',
      category: 'collaboration'
    },
    {
      id: 'backup',
      name: 'Cloud Backup',
      description: 'Automatic backup to cloud storage',
      icon: '☁️',
      category: 'collaboration'
    }
  ];

  // Group capabilities by category
  const categorizedCapabilities = {
    core: capabilities.filter(cap => cap.category === 'core'),
    productivity: capabilities.filter(cap => cap.category === 'productivity'),
    performance: capabilities.filter(cap => cap.category === 'performance'),
    collaboration: capabilities.filter(cap => cap.category === 'collaboration')
  };

  // Get category info
  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'core':
        return {
          name: 'Core Features',
          icon: '⚡',
          description: 'Essential functionality that works offline'
        };
      case 'productivity':
        return {
          name: 'Productivity Tools',
          icon: '🎯',
          description: 'Advanced features for enhanced productivity'
        };
      case 'performance':
        return {
          name: 'Performance',
          icon: '🚀',
          description: 'High-performance features and optimizations'
        };
      case 'collaboration':
        return {
          name: 'Collaboration & Cloud',
          icon: '🌐',
          description: 'Features requiring internet connection'
        };
      default:
        return {
          name: 'Other',
          icon: '📦',
          description: 'Additional features'
        };
    }
  };

  // Get overall offline score
  const getOfflineScore = () => {
    const totalCapabilities = capabilities.length;
    const availableOfflineCapabilities = capabilities.filter(cap => 
      getOfflineCapability(cap.id)
    ).length;
    
    return Math.round((availableOfflineCapabilities / totalCapabilities) * 100);
  };

  const offlineScore = getOfflineScore();

  return (
    <div className="offline-capabilities">
      {/* Header */}
      <div className="offline-capabilities__header">
        <div className="offline-capabilities__status">
          <div className="offline-capabilities__connection-status">
            <span className="offline-capabilities__status-icon">
              {networkStatus.isOnline ? '🌐' : '📴'}
            </span>
            <div className="offline-capabilities__status-text">
              <div className="offline-capabilities__status-label">
                {networkStatus.isOnline ? 'Online Mode' : 'Offline Mode'}
              </div>
              <div className="offline-capabilities__status-description">
                {networkStatus.isOnline 
                  ? 'All features available'
                  : `${offlineScore}% of features available offline`
                }
              </div>
            </div>
          </div>

          {/* Offline Score */}
          <div className="offline-capabilities__score">
            <div className="offline-capabilities__score-circle">
              <div className="offline-capabilities__score-value">{offlineScore}%</div>
              <div className="offline-capabilities__score-label">Available</div>
            </div>
          </div>
        </div>

        {/* Offline Tips */}
        {!networkStatus.isOnline && (
          <div className="offline-capabilities__tips">
            <h4 className="offline-capabilities__tips-title">💡 Offline Tips</h4>
            <ul className="offline-capabilities__tips-list">
              <li>Your changes are saved locally and will sync when online</li>
              <li>Search works on all your cached content</li>
              <li>Export features work with local data</li>
              <li>Analytics show data from your local cache</li>
            </ul>
          </div>
        )}
      </div>

      {/* Capabilities by Category */}
      <div className="offline-capabilities__categories">
        {Object.entries(categorizedCapabilities).map(([categoryKey, categoryCapabilities]) => {
          const categoryInfo = getCategoryInfo(categoryKey);
          const availableCount = categoryCapabilities.filter(cap => 
            getOfflineCapability(cap.id)
          ).length;
          const totalCount = categoryCapabilities.length;

          return (
            <div key={categoryKey} className="offline-capabilities__category">
              {/* Category Header */}
              <div className="offline-capabilities__category-header">
                <div className="offline-capabilities__category-info">
                  <span className="offline-capabilities__category-icon">
                    {categoryInfo.icon}
                  </span>
                  <div className="offline-capabilities__category-text">
                    <div className="offline-capabilities__category-name">
                      {categoryInfo.name}
                    </div>
                    <div className="offline-capabilities__category-description">
                      {categoryInfo.description}
                    </div>
                  </div>
                </div>
                
                <div className="offline-capabilities__category-stats">
                  <span className="offline-capabilities__category-count">
                    {availableCount}/{totalCount}
                  </span>
                  <div className="offline-capabilities__category-bar">
                    <div 
                      className="offline-capabilities__category-fill"
                      style={{
                        width: `${(availableCount / totalCount) * 100}%`,
                        backgroundColor: availableCount === totalCount ? '#10b981' : 
                                       availableCount > totalCount / 2 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Category Capabilities */}
              <div className="offline-capabilities__capabilities-list">
                {categoryCapabilities.map(capability => {
                  const isAvailable = getOfflineCapability(capability.id);
                  
                  return (
                    <div 
                      key={capability.id}
                      className={`offline-capabilities__capability ${
                        isAvailable ? 'available' : 'unavailable'
                      }`}
                    >
                      <div className="offline-capabilities__capability-info">
                        <span className="offline-capabilities__capability-icon">
                          {capability.icon}
                        </span>
                        <div className="offline-capabilities__capability-text">
                          <div className="offline-capabilities__capability-name">
                            {capability.name}
                          </div>
                          <div className="offline-capabilities__capability-description">
                            {capability.description}
                          </div>
                        </div>
                      </div>

                      <div className="offline-capabilities__capability-status">
                        <span className="offline-capabilities__capability-indicator">
                          {isAvailable ? '✅' : '❌'}
                        </span>
                        <span className="offline-capabilities__capability-label">
                          {isAvailable ? 'Available' : 'Requires Internet'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Recommendations */}
      {!networkStatus.isOnline && (
        <div className="offline-capabilities__recommendations">
          <h4 className="offline-capabilities__recommendations-title">
            🚀 Maximize Your Offline Experience
          </h4>
          
          <div className="offline-capabilities__recommendations-list">
            <div className="offline-capabilities__recommendation">
              <div className="offline-capabilities__recommendation-icon">💾</div>
              <div className="offline-capabilities__recommendation-content">
                <div className="offline-capabilities__recommendation-title">
                  Keep Working Seamlessly
                </div>
                <div className="offline-capabilities__recommendation-description">
                  All your edits are automatically saved locally and will sync when you're back online.
                </div>
              </div>
            </div>

            <div className="offline-capabilities__recommendation">
              <div className="offline-capabilities__recommendation-icon">🔍</div>
              <div className="offline-capabilities__recommendation-content">
                <div className="offline-capabilities__recommendation-title">
                  Search Your Content
                </div>
                <div className="offline-capabilities__recommendation-description">
                  Use the search feature to quickly find any notebooks, tasks, or projects in your local cache.
                </div>
              </div>
            </div>

            <div className="offline-capabilities__recommendation">
              <div className="offline-capabilities__recommendation-icon">📊</div>
              <div className="offline-capabilities__recommendation-content">
                <div className="offline-capabilities__recommendation-title">
                  Review Your Analytics
                </div>
                <div className="offline-capabilities__recommendation-description">
                  Check your productivity insights and patterns using locally stored data.
                </div>
              </div>
            </div>

            <div className="offline-capabilities__recommendation">
              <div className="offline-capabilities__recommendation-icon">📤</div>
              <div className="offline-capabilities__recommendation-content">
                <div className="offline-capabilities__recommendation-title">
                  Export Your Data
                </div>
                <div className="offline-capabilities__recommendation-description">
                  Create backups by exporting your data in various formats (JSON, CSV, Excel, Markdown).
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .offline-capabilities {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .offline-capabilities__header {
          padding: 20px;
          background: ${networkStatus.isOnline ? '#f0fdf4' : '#fef3c7'};
          border-bottom: 1px solid ${networkStatus.isOnline ? '#bbf7d0' : '#fbbf24'};
        }

        .offline-capabilities__status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: ${!networkStatus.isOnline ? '20px' : '0'};
        }

        .offline-capabilities__connection-status {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .offline-capabilities__status-icon {
          font-size: 2rem;
        }

        .offline-capabilities__status-label {
          font-size: 1.125rem;
          font-weight: 700;
          color: ${networkStatus.isOnline ? '#166534' : '#92400e'};
          margin-bottom: 4px;
        }

        .offline-capabilities__status-description {
          font-size: 0.875rem;
          color: ${networkStatus.isOnline ? '#15803d' : '#b45309'};
        }

        .offline-capabilities__score {
          display: flex;
          align-items: center;
        }

        .offline-capabilities__score-circle {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: conic-gradient(
            ${offlineScore >= 80 ? '#10b981' : offlineScore >= 60 ? '#f59e0b' : '#ef4444'} ${offlineScore}%, 
            #e5e7eb 0%
          );
          position: relative;
        }

        .offline-capabilities__score-circle::before {
          content: '';
          position: absolute;
          width: 60px;
          height: 60px;
          background: ${networkStatus.isOnline ? '#f0fdf4' : '#fef3c7'};
          border-radius: 50%;
        }

        .offline-capabilities__score-value {
          font-size: 1rem;
          font-weight: 700;
          color: ${offlineScore >= 80 ? '#10b981' : offlineScore >= 60 ? '#f59e0b' : '#ef4444'};
          z-index: 1;
        }

        .offline-capabilities__score-label {
          font-size: 0.6875rem;
          color: #64748b;
          z-index: 1;
        }

        .offline-capabilities__tips {
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid #fbbf24;
          border-radius: 6px;
          padding: 16px;
        }

        .offline-capabilities__tips-title {
          margin: 0 0 8px 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: #92400e;
        }

        .offline-capabilities__tips-list {
          margin: 0;
          padding-left: 16px;
        }

        .offline-capabilities__tips-list li {
          font-size: 0.75rem;
          color: #b45309;
          line-height: 1.4;
          margin-bottom: 4px;
        }

        .offline-capabilities__categories {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: #f1f5f9;
        }

        .offline-capabilities__category {
          background: white;
          padding: 20px;
        }

        .offline-capabilities__category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .offline-capabilities__category-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .offline-capabilities__category-icon {
          font-size: 1.5rem;
        }

        .offline-capabilities__category-name {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 2px;
        }

        .offline-capabilities__category-description {
          font-size: 0.75rem;
          color: #64748b;
        }

        .offline-capabilities__category-stats {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .offline-capabilities__category-count {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          font-family: monospace;
        }

        .offline-capabilities__category-bar {
          width: 60px;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
        }

        .offline-capabilities__category-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .offline-capabilities__capabilities-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .offline-capabilities__capability {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .offline-capabilities__capability.available {
          background: #f0fdf4;
          border-color: #bbf7d0;
        }

        .offline-capabilities__capability.unavailable {
          background: #fef2f2;
          border-color: #fecaca;
          opacity: 0.7;
        }

        .offline-capabilities__capability-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .offline-capabilities__capability-icon {
          font-size: 1.25rem;
        }

        .offline-capabilities__capability-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 2px;
        }

        .offline-capabilities__capability-description {
          font-size: 0.75rem;
          color: #64748b;
          line-height: 1.3;
        }

        .offline-capabilities__capability-status {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .offline-capabilities__capability-indicator {
          font-size: 0.875rem;
        }

        .offline-capabilities__capability-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #374151;
        }

        .offline-capabilities__capability.available .offline-capabilities__capability-label {
          color: #166534;
        }

        .offline-capabilities__capability.unavailable .offline-capabilities__capability-label {
          color: #dc2626;
        }

        .offline-capabilities__recommendations {
          padding: 20px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }

        .offline-capabilities__recommendations-title {
          margin: 0 0 16px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .offline-capabilities__recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .offline-capabilities__recommendation {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .offline-capabilities__recommendation-icon {
          font-size: 1.5rem;
          margin-top: 2px;
        }

        .offline-capabilities__recommendation-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .offline-capabilities__recommendation-description {
          font-size: 0.75rem;
          color: #64748b;
          line-height: 1.4;
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          .offline-capabilities {
            background: #1e293b;
            border-color: #334155;
          }

          .offline-capabilities__header {
            background: ${networkStatus.isOnline ? '#064e3b' : '#451a03'};
            border-color: ${networkStatus.isOnline ? '#059669' : '#92400e'};
          }

          .offline-capabilities__status-label {
            color: ${networkStatus.isOnline ? '#6ee7b7' : '#fbbf24'};
          }

          .offline-capabilities__status-description {
            color: ${networkStatus.isOnline ? '#34d399' : '#d97706'};
          }

          .offline-capabilities__score-circle::before {
            background: ${networkStatus.isOnline ? '#064e3b' : '#451a03'};
          }

          .offline-capabilities__score-label {
            color: #94a3b8;
          }

          .offline-capabilities__tips {
            background: rgba(146, 64, 14, 0.2);
          }

          .offline-capabilities__tips-title {
            color: #fbbf24;
          }

          .offline-capabilities__tips-list li {
            color: #d97706;
          }

          .offline-capabilities__categories {
            background: #334155;
          }

          .offline-capabilities__category {
            background: #1e293b;
          }

          .offline-capabilities__category-name {
            color: #f1f5f9;
          }

          .offline-capabilities__category-description {
            color: #94a3b8;
          }

          .offline-capabilities__category-count {
            color: #e2e8f0;
          }

          .offline-capabilities__category-bar {
            background: #374151;
          }

          .offline-capabilities__capability {
            border-color: #374151;
          }

          .offline-capabilities__capability.available {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.3);
          }

          .offline-capabilities__capability.unavailable {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.3);
          }

          .offline-capabilities__capability-name {
            color: #f1f5f9;
          }

          .offline-capabilities__capability-description {
            color: #94a3b8;
          }

          .offline-capabilities__capability-label {
            color: #e2e8f0;
          }

          .offline-capabilities__capability.available .offline-capabilities__capability-label {
            color: #6ee7b7;
          }

          .offline-capabilities__capability.unavailable .offline-capabilities__capability-label {
            color: #fca5a5;
          }

          .offline-capabilities__recommendations {
            background: #0f172a;
            border-color: #334155;
          }

          .offline-capabilities__recommendations-title {
            color: #f1f5f9;
          }

          .offline-capabilities__recommendation {
            background: #1e293b;
            border-color: #334155;
          }

          .offline-capabilities__recommendation-title {
            color: #f1f5f9;
          }

          .offline-capabilities__recommendation-description {
            color: #94a3b8;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .offline-capabilities__status {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .offline-capabilities__category-header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .offline-capabilities__capability {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .offline-capabilities__capability-status {
            justify-content: center;
          }

          .offline-capabilities__recommendations-list {
            gap: 12px;
          }

          .offline-capabilities__recommendation {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
};
