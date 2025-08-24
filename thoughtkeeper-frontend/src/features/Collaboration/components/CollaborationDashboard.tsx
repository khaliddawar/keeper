import React, { useState, useEffect } from 'react';
import { useCollaboration } from '../CollaborationProvider';
import { PresenceIndicator } from './PresenceIndicator';
import { ConflictResolutionPanel } from './ConflictResolutionPanel';
import { ActivityFeed } from './ActivityFeed';
import { NotificationCenter } from './NotificationCenter';
import { LiveEditIndicators } from './LiveEditIndicators';
import { ConnectionStatus } from './ConnectionStatus';

/**
 * Collaboration Dashboard
 * 
 * Main interface showing all collaborative features including presence,
 * conflicts, activity, notifications, and connection status.
 */
interface CollaborationDashboardProps {
  layout?: 'compact' | 'full' | 'sidebar';
  showSimulationControls?: boolean;
}

export const CollaborationDashboard: React.FC<CollaborationDashboardProps> = ({
  layout = 'full',
  showSimulationControls = true
}) => {
  const {
    currentUser,
    session,
    collaborators,
    activeConflicts,
    notifications,
    activityFeed,
    connectionStatus,
    liveEdits,
    simulation
  } = useCollaboration();

  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'conflicts' | 'notifications'>('overview');
  const [simulationEnabled, setSimulationEnabled] = useState(true);

  // Get unread notification count
  const unreadCount = notifications.filter(n => !n.read?.[currentUser?.id || '']).length;

  // Handle simulation controls
  const handleAddUser = () => {
    simulation.addSimulatedUser();
  };

  const handleRemoveUser = (userId: string) => {
    simulation.removeSimulatedUser(userId);
  };

  const handleSimulateConflict = () => {
    simulation.simulateConflict();
  };

  const handleToggleSimulation = (enabled: boolean) => {
    setSimulationEnabled(enabled);
    simulation.toggleSimulation(enabled);
  };

  // Compact layout for sidebars
  if (layout === 'compact') {
    return (
      <div className="collaboration-dashboard collaboration-dashboard--compact">
        <div className="collaboration-dashboard__header">
          <h3 className="collaboration-dashboard__title">👥 Collaboration</h3>
          <ConnectionStatus status={connectionStatus} size="small" />
        </div>

        <div className="collaboration-dashboard__content">
          <PresenceIndicator 
            collaborators={collaborators}
            currentUser={currentUser}
            layout="compact"
          />
          
          {activeConflicts.length > 0 && (
            <div className="collaboration-dashboard__conflicts">
              <div className="collaboration-dashboard__section-header">
                <span>⚠️ Conflicts ({activeConflicts.length})</span>
              </div>
              <ConflictResolutionPanel 
                conflicts={activeConflicts.slice(0, 2)}
                layout="compact"
              />
            </div>
          )}

          {liveEdits.length > 0 && (
            <LiveEditIndicators edits={liveEdits} layout="compact" />
          )}

          {unreadCount > 0 && (
            <div className="collaboration-dashboard__notifications">
              <span className="collaboration-dashboard__notification-badge">
                🔔 {unreadCount} new
              </span>
            </div>
          )}
        </div>

        <style jsx>{`
          .collaboration-dashboard--compact {
            width: 300px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
          }

          .collaboration-dashboard__header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            border-bottom: 1px solid #e2e8f0;
            background: #f8fafc;
          }

          .collaboration-dashboard__title {
            margin: 0;
            font-size: 0.875rem;
            font-weight: 600;
            color: #1a202c;
          }

          .collaboration-dashboard__content {
            padding: 16px;
            max-height: 400px;
            overflow-y: auto;
          }

          .collaboration-dashboard__conflicts {
            margin-top: 16px;
          }

          .collaboration-dashboard__section-header {
            font-size: 0.75rem;
            font-weight: 600;
            color: #4a5568;
            margin-bottom: 8px;
          }

          .collaboration-dashboard__notifications {
            margin-top: 16px;
          }

          .collaboration-dashboard__notification-badge {
            display: inline-flex;
            align-items: center;
            padding: 4px 8px;
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 4px;
            font-size: 0.75rem;
            color: #92400e;
          }

          /* Dark theme */
          @media (prefers-color-scheme: dark) {
            .collaboration-dashboard--compact {
              background: #1e293b;
              border-color: #334155;
            }

            .collaboration-dashboard__header {
              background: #0f172a;
              border-color: #334155;
            }

            .collaboration-dashboard__title {
              color: #f1f5f9;
            }

            .collaboration-dashboard__section-header {
              color: #cbd5e0;
            }

            .collaboration-dashboard__notification-badge {
              background: #451a03;
              border-color: #92400e;
              color: #fbbf24;
            }
          }
        `}</style>
      </div>
    );
  }

  // Full dashboard layout
  return (
    <div className="collaboration-dashboard">
      {/* Header */}
      <div className="collaboration-dashboard__header">
        <div className="collaboration-dashboard__title-section">
          <h1 className="collaboration-dashboard__title">
            👥 Real-time Collaboration Dashboard
          </h1>
          <p className="collaboration-dashboard__subtitle">
            {session ? `Collaborating on ${session.entityType} "${session.entityId}"` : 'Not in an active session'}
          </p>
        </div>

        <div className="collaboration-dashboard__header-actions">
          <ConnectionStatus status={connectionStatus} />
          
          {showSimulationControls && (
            <div className="collaboration-dashboard__simulation-controls">
              <button
                onClick={() => handleToggleSimulation(!simulationEnabled)}
                className={`collaboration-dashboard__sim-toggle ${simulationEnabled ? 'active' : ''}`}
              >
                {simulationEnabled ? '⏸️' : '▶️'} Simulation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="collaboration-dashboard__nav">
        <div className="collaboration-dashboard__tabs">
          {[
            { key: 'overview', label: 'Overview', icon: '👀' },
            { key: 'activity', label: 'Activity', icon: '📊' },
            { key: 'conflicts', label: 'Conflicts', icon: '⚠️', badge: activeConflicts.length },
            { key: 'notifications', label: 'Notifications', icon: '🔔', badge: unreadCount }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`collaboration-dashboard__tab ${activeTab === tab.key ? 'active' : ''}`}
            >
              <span className="collaboration-dashboard__tab-icon">{tab.icon}</span>
              <span className="collaboration-dashboard__tab-label">{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="collaboration-dashboard__tab-badge">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="collaboration-dashboard__content">
        {activeTab === 'overview' && (
          <div className="collaboration-dashboard__overview">
            <div className="collaboration-dashboard__grid">
              {/* Presence */}
              <div className="collaboration-dashboard__card">
                <h3 className="collaboration-dashboard__card-title">
                  👥 Active Collaborators ({collaborators.length})
                </h3>
                <PresenceIndicator 
                  collaborators={collaborators}
                  currentUser={currentUser}
                  layout="detailed"
                />
              </div>

              {/* Live Edits */}
              <div className="collaboration-dashboard__card">
                <h3 className="collaboration-dashboard__card-title">
                  ✏️ Live Edits ({liveEdits.length})
                </h3>
                <LiveEditIndicators edits={liveEdits} layout="detailed" />
              </div>

              {/* Recent Activity */}
              <div className="collaboration-dashboard__card">
                <h3 className="collaboration-dashboard__card-title">
                  📈 Recent Activity
                </h3>
                <ActivityFeed 
                  activities={activityFeed.slice(0, 5)}
                  layout="compact"
                />
              </div>

              {/* Simulation Controls */}
              {showSimulationControls && (
                <div className="collaboration-dashboard__card">
                  <h3 className="collaboration-dashboard__card-title">
                    🎮 Simulation Controls
                  </h3>
                  <div className="collaboration-dashboard__simulation-panel">
                    <div className="collaboration-dashboard__sim-actions">
                      <button 
                        onClick={handleAddUser}
                        className="collaboration-dashboard__sim-btn"
                      >
                        ➕ Add User
                      </button>
                      <button 
                        onClick={handleSimulateConflict}
                        className="collaboration-dashboard__sim-btn"
                      >
                        ⚡ Create Conflict
                      </button>
                    </div>
                    
                    <div className="collaboration-dashboard__sim-users">
                      {collaborators.filter(u => u.id.startsWith('sim_')).map(user => (
                        <div key={user.id} className="collaboration-dashboard__sim-user">
                          <span>{user.name}</span>
                          <button 
                            onClick={() => handleRemoveUser(user.id)}
                            className="collaboration-dashboard__sim-remove"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="collaboration-dashboard__activity">
            <ActivityFeed activities={activityFeed} layout="detailed" />
          </div>
        )}

        {activeTab === 'conflicts' && (
          <div className="collaboration-dashboard__conflicts">
            {activeConflicts.length > 0 ? (
              <ConflictResolutionPanel conflicts={activeConflicts} layout="detailed" />
            ) : (
              <div className="collaboration-dashboard__empty-state">
                <div className="collaboration-dashboard__empty-icon">✅</div>
                <h3>No Active Conflicts</h3>
                <p>All changes have been synchronized successfully.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="collaboration-dashboard__notifications">
            <NotificationCenter 
              notifications={notifications}
              currentUserId={currentUser?.id || ''}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .collaboration-dashboard {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .collaboration-dashboard__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px 32px;
          border-bottom: 1px solid #e2e8f0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .collaboration-dashboard__title {
          margin: 0 0 8px 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .collaboration-dashboard__subtitle {
          margin: 0;
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .collaboration-dashboard__header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .collaboration-dashboard__sim-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          color: white;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .collaboration-dashboard__sim-toggle:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .collaboration-dashboard__sim-toggle.active {
          background: rgba(16, 185, 129, 0.8);
          border-color: rgba(16, 185, 129, 1);
        }

        .collaboration-dashboard__nav {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .collaboration-dashboard__tabs {
          display: flex;
          gap: 0;
        }

        .collaboration-dashboard__tab {
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

        .collaboration-dashboard__tab:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        .collaboration-dashboard__tab.active {
          background: white;
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }

        .collaboration-dashboard__tab-badge {
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

        .collaboration-dashboard__content {
          padding: 32px;
          min-height: 400px;
        }

        .collaboration-dashboard__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .collaboration-dashboard__card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
        }

        .collaboration-dashboard__card-title {
          margin: 0 0 16px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .collaboration-dashboard__simulation-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .collaboration-dashboard__sim-actions {
          display: flex;
          gap: 8px;
        }

        .collaboration-dashboard__sim-btn {
          flex: 1;
          padding: 8px 12px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .collaboration-dashboard__sim-btn:hover {
          background: #2563eb;
        }

        .collaboration-dashboard__sim-users {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .collaboration-dashboard__sim-user {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.75rem;
        }

        .collaboration-dashboard__sim-remove {
          padding: 2px 6px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 2px;
          font-size: 0.625rem;
          cursor: pointer;
        }

        .collaboration-dashboard__empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;
        }

        .collaboration-dashboard__empty-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .collaboration-dashboard__empty-state h3 {
          margin: 0 0 8px 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
        }

        .collaboration-dashboard__empty-state p {
          margin: 0;
          color: #64748b;
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          .collaboration-dashboard {
            background: #1e293b;
          }

          .collaboration-dashboard__header {
            border-color: #334155;
          }

          .collaboration-dashboard__nav {
            background: #0f172a;
            border-color: #334155;
          }

          .collaboration-dashboard__tab {
            color: #94a3b8;
          }

          .collaboration-dashboard__tab:hover {
            background: #334155;
            color: #f1f5f9;
          }

          .collaboration-dashboard__tab.active {
            background: #1e293b;
            color: #60a5fa;
          }

          .collaboration-dashboard__card {
            background: #0f172a;
            border-color: #334155;
          }

          .collaboration-dashboard__card-title {
            color: #f1f5f9;
          }

          .collaboration-dashboard__sim-user {
            background: #1e293b;
            border-color: #334155;
            color: #f1f5f9;
          }

          .collaboration-dashboard__empty-state h3 {
            color: #f1f5f9;
          }

          .collaboration-dashboard__empty-state p {
            color: #94a3b8;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .collaboration-dashboard__header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .collaboration-dashboard__content {
            padding: 16px;
          }

          .collaboration-dashboard__grid {
            grid-template-columns: 1fr;
          }

          .collaboration-dashboard__tabs {
            flex-wrap: wrap;
          }

          .collaboration-dashboard__tab {
            min-width: 120px;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};
