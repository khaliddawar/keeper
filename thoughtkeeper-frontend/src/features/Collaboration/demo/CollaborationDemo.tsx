import React, { useState, useEffect } from 'react';
import { CollaborationProvider, useCollaboration } from '../CollaborationProvider';
import {
  CollaborationDashboard,
  PresenceIndicator,
  ConflictResolutionPanel,
  ActivityFeed,
  NotificationCenter,
  LiveEditIndicators,
  ConnectionStatus
} from '../components';
import type { CollaboratorUser } from '../types';

/**
 * Collaboration Demo Component
 * 
 * Interactive demonstration of the real-time collaboration system
 * showcasing all collaborative features with simulated user interactions.
 */
export const CollaborationDemo: React.FC = () => {
  return (
    <CollaborationProvider>
      <CollaborationDemoContent />
    </CollaborationProvider>
  );
};

const CollaborationDemoContent: React.FC = () => {
  const {
    currentUser,
    session,
    collaborators,
    liveEdits,
    activeConflicts,
    notifications,
    activityFeed,
    connectionStatus,
    joinSession,
    leaveSession,
    simulation
  } = useCollaboration();

  const [activeDemo, setActiveDemo] = useState<'overview' | 'components' | 'simulation'>('overview');
  const [isInSession, setIsInSession] = useState(false);

  // Auto-join session for demo
  useEffect(() => {
    if (!isInSession) {
      joinSession('project', 'demo-project');
      setIsInSession(true);
    }
  }, [joinSession, isInSession]);

  // Demo actions
  const handleAddUser = () => {
    const newUser = simulation.addSimulatedUser();
    console.log('Added simulated user:', newUser.name);
  };

  const handleRemoveUser = () => {
    const simulatedUsers = collaborators.filter(u => u.id.startsWith('sim_'));
    if (simulatedUsers.length > 0) {
      simulation.removeSimulatedUser(simulatedUsers[0].id);
    }
  };

  const handleSimulateConflict = () => {
    simulation.simulateConflict();
  };

  const handleSimulateActivity = () => {
    const activities = ['created', 'updated', 'completed'] as const;
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    simulation.simulateActivity(randomActivity);
  };

  const handleToggleSimulation = () => {
    simulation.toggleSimulation(false); // Stop for now
    setTimeout(() => simulation.toggleSimulation(true), 2000); // Restart after 2s
  };

  // Get demo stats
  const demoStats = {
    totalCollaborators: collaborators.length,
    activeEdits: liveEdits.length,
    pendingConflicts: activeConflicts.length,
    recentActivity: activityFeed.length,
    unreadNotifications: notifications.filter(n => !n.read?.[currentUser?.id || '']).length
  };

  return (
    <div className="collaboration-demo">
      {/* Header */}
      <div className="collaboration-demo__header">
        <div className="collaboration-demo__title-section">
          <h1 className="collaboration-demo__title">
            🤝 Real-time Collaboration Demo
          </h1>
          <p className="collaboration-demo__subtitle">
            Interactive demonstration of ThoughtKeeper's collaborative features
          </p>
        </div>

        <div className="collaboration-demo__header-controls">
          <ConnectionStatus 
            status={connectionStatus}
            size="medium"
            showDetails={true}
          />
        </div>
      </div>

      {/* Demo Stats */}
      <div className="collaboration-demo__stats">
        <div className="collaboration-demo__stat-card">
          <div className="collaboration-demo__stat-value">{demoStats.totalCollaborators}</div>
          <div className="collaboration-demo__stat-label">Collaborators</div>
        </div>
        <div className="collaboration-demo__stat-card">
          <div className="collaboration-demo__stat-value">{demoStats.activeEdits}</div>
          <div className="collaboration-demo__stat-label">Live Edits</div>
        </div>
        <div className="collaboration-demo__stat-card">
          <div className="collaboration-demo__stat-value">{demoStats.pendingConflicts}</div>
          <div className="collaboration-demo__stat-label">Conflicts</div>
        </div>
        <div className="collaboration-demo__stat-card">
          <div className="collaboration-demo__stat-value">{demoStats.unreadNotifications}</div>
          <div className="collaboration-demo__stat-label">Notifications</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="collaboration-demo__nav">
        <div className="collaboration-demo__tabs">
          {[
            { key: 'overview', label: 'Full Dashboard', icon: '🎛️' },
            { key: 'components', label: 'Individual Components', icon: '🧩' },
            { key: 'simulation', label: 'Simulation Controls', icon: '🎮' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveDemo(tab.key as any)}
              className={`collaboration-demo__tab ${activeDemo === tab.key ? 'active' : ''}`}
            >
              <span className="collaboration-demo__tab-icon">{tab.icon}</span>
              <span className="collaboration-demo__tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="collaboration-demo__content">
        {activeDemo === 'overview' && (
          <div className="collaboration-demo__overview">
            <CollaborationDashboard layout="full" showSimulationControls={true} />
          </div>
        )}

        {activeDemo === 'components' && (
          <div className="collaboration-demo__components">
            <div className="collaboration-demo__component-grid">
              {/* Presence Indicator */}
              <div className="collaboration-demo__component-card">
                <h3 className="collaboration-demo__component-title">👥 Presence Indicator</h3>
                <div className="collaboration-demo__component-content">
                  <PresenceIndicator 
                    collaborators={collaborators}
                    currentUser={currentUser}
                    layout="detailed"
                  />
                </div>
              </div>

              {/* Live Edit Indicators */}
              <div className="collaboration-demo__component-card">
                <h3 className="collaboration-demo__component-title">✏️ Live Edit Indicators</h3>
                <div className="collaboration-demo__component-content">
                  <LiveEditIndicators edits={liveEdits} layout="detailed" />
                </div>
              </div>

              {/* Connection Status */}
              <div className="collaboration-demo__component-card">
                <h3 className="collaboration-demo__component-title">📡 Connection Status</h3>
                <div className="collaboration-demo__component-content">
                  <div className="collaboration-demo__connection-examples">
                    <ConnectionStatus status={connectionStatus} size="small" />
                    <ConnectionStatus status={connectionStatus} size="medium" />
                    <ConnectionStatus status={connectionStatus} size="large" />
                  </div>
                </div>
              </div>

              {/* Conflict Resolution */}
              {activeConflicts.length > 0 && (
                <div className="collaboration-demo__component-card">
                  <h3 className="collaboration-demo__component-title">⚠️ Conflict Resolution</h3>
                  <div className="collaboration-demo__component-content">
                    <ConflictResolutionPanel conflicts={activeConflicts} layout="detailed" />
                  </div>
                </div>
              )}

              {/* Activity Feed */}
              <div className="collaboration-demo__component-card">
                <h3 className="collaboration-demo__component-title">📊 Activity Feed</h3>
                <div className="collaboration-demo__component-content">
                  <ActivityFeed 
                    activities={activityFeed.slice(0, 10)}
                    layout="detailed"
                    maxItems={10}
                  />
                </div>
              </div>

              {/* Notification Center */}
              <div className="collaboration-demo__component-card">
                <h3 className="collaboration-demo__component-title">🔔 Notification Center</h3>
                <div className="collaboration-demo__component-content">
                  <NotificationCenter 
                    notifications={notifications.slice(0, 5)}
                    currentUserId={currentUser?.id || ''}
                    maxItems={5}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeDemo === 'simulation' && (
          <div className="collaboration-demo__simulation">
            <div className="collaboration-demo__simulation-panel">
              <h3 className="collaboration-demo__simulation-title">🎮 Simulation Controls</h3>
              
              <div className="collaboration-demo__simulation-actions">
                <button 
                  onClick={handleAddUser}
                  className="collaboration-demo__simulation-btn"
                >
                  ➕ Add Collaborator
                </button>
                <button 
                  onClick={handleRemoveUser}
                  className="collaboration-demo__simulation-btn"
                >
                  ➖ Remove Collaborator
                </button>
                <button 
                  onClick={handleSimulateConflict}
                  className="collaboration-demo__simulation-btn"
                >
                  ⚡ Create Conflict
                </button>
                <button 
                  onClick={handleSimulateActivity}
                  className="collaboration-demo__simulation-btn"
                >
                  📈 Generate Activity
                </button>
                <button 
                  onClick={handleToggleSimulation}
                  className="collaboration-demo__simulation-btn"
                >
                  🔄 Restart Simulation
                </button>
              </div>

              <div className="collaboration-demo__simulation-info">
                <h4>Current Simulation State:</h4>
                <div className="collaboration-demo__simulation-stats">
                  <div>👥 Active Users: {collaborators.length}</div>
                  <div>✏️ Live Edits: {liveEdits.length}</div>
                  <div>⚠️ Active Conflicts: {activeConflicts.length}</div>
                  <div>📊 Recent Activities: {activityFeed.length}</div>
                  <div>🔔 Total Notifications: {notifications.length}</div>
                </div>
              </div>

              <div className="collaboration-demo__simulation-features">
                <h4>Demonstrated Features:</h4>
                <ul className="collaboration-demo__feature-list">
                  <li>✅ Real-time user presence tracking</li>
                  <li>✅ Live editing indicators with cursors</li>
                  <li>✅ Automatic conflict detection</li>
                  <li>✅ Conflict resolution strategies</li>
                  <li>✅ Activity feed with filtering</li>
                  <li>✅ Smart notification system</li>
                  <li>✅ Connection quality monitoring</li>
                  <li>✅ Collaborative session management</li>
                  <li>✅ Simulated network conditions</li>
                  <li>✅ Multi-user interaction patterns</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .collaboration-demo {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .collaboration-demo__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          gap: 24px;
        }

        .collaboration-demo__title {
          margin: 0 0 8px 0;
          font-size: 2rem;
          font-weight: 700;
          color: #1a202c;
        }

        .collaboration-demo__subtitle {
          margin: 0;
          font-size: 1.125rem;
          color: #4a5568;
          line-height: 1.5;
        }

        .collaboration-demo__stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .collaboration-demo__stat-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          transition: all 0.2s ease;
        }

        .collaboration-demo__stat-card:hover {
          border-color: #cbd5e0;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .collaboration-demo__stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #3b82f6;
          margin-bottom: 8px;
        }

        .collaboration-demo__stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .collaboration-demo__nav {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px;
          margin-bottom: 32px;
        }

        .collaboration-demo__tabs {
          display: flex;
          gap: 4px;
        }

        .collaboration-demo__tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          background: transparent;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .collaboration-demo__tab:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        .collaboration-demo__tab.active {
          background: white;
          color: #3b82f6;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .collaboration-demo__tab-icon {
          font-size: 1rem;
        }

        .collaboration-demo__content {
          min-height: 600px;
        }

        .collaboration-demo__component-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }

        .collaboration-demo__component-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .collaboration-demo__component-title {
          margin: 0;
          padding: 16px 20px;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .collaboration-demo__component-content {
          padding: 20px;
        }

        .collaboration-demo__connection-examples {
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: flex-start;
        }

        .collaboration-demo__simulation {
          display: flex;
          justify-content: center;
        }

        .collaboration-demo__simulation-panel {
          max-width: 800px;
          width: 100%;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 32px;
        }

        .collaboration-demo__simulation-title {
          margin: 0 0 24px 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          text-align: center;
        }

        .collaboration-demo__simulation-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-bottom: 32px;
        }

        .collaboration-demo__simulation-btn {
          padding: 12px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .collaboration-demo__simulation-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .collaboration-demo__simulation-info {
          margin-bottom: 32px;
        }

        .collaboration-demo__simulation-info h4 {
          margin: 0 0 16px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
        }

        .collaboration-demo__simulation-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 8px;
          font-size: 0.875rem;
          color: #4b5563;
        }

        .collaboration-demo__simulation-features h4 {
          margin: 0 0 16px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
        }

        .collaboration-demo__feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 8px;
        }

        .collaboration-demo__feature-list li {
          font-size: 0.875rem;
          color: #4b5563;
          padding: 4px 0;
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          .collaboration-demo__title {
            color: #f7fafc;
          }

          .collaboration-demo__subtitle {
            color: #cbd5e0;
          }

          .collaboration-demo__stat-card {
            background: #1e293b;
            border-color: #334155;
          }

          .collaboration-demo__stat-card:hover {
            border-color: #475569;
          }

          .collaboration-demo__stat-value {
            color: #60a5fa;
          }

          .collaboration-demo__stat-label {
            color: #94a3b8;
          }

          .collaboration-demo__nav {
            background: #0f172a;
            border-color: #334155;
          }

          .collaboration-demo__tab {
            color: #94a3b8;
          }

          .collaboration-demo__tab:hover {
            background: #334155;
            color: #f1f5f9;
          }

          .collaboration-demo__tab.active {
            background: #1e293b;
            color: #60a5fa;
          }

          .collaboration-demo__component-card {
            background: #1e293b;
            border-color: #334155;
          }

          .collaboration-demo__component-title {
            background: #0f172a;
            border-color: #334155;
            color: #f1f5f9;
          }

          .collaboration-demo__simulation-panel {
            background: #1e293b;
            border-color: #334155;
          }

          .collaboration-demo__simulation-title {
            color: #f1f5f9;
          }

          .collaboration-demo__simulation-info h4,
          .collaboration-demo__simulation-features h4 {
            color: #e2e8f0;
          }

          .collaboration-demo__simulation-stats,
          .collaboration-demo__feature-list li {
            color: #cbd5e0;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .collaboration-demo {
            padding: 16px;
          }

          .collaboration-demo__header {
            flex-direction: column;
            gap: 16px;
          }

          .collaboration-demo__title {
            font-size: 1.5rem;
          }

          .collaboration-demo__component-grid {
            grid-template-columns: 1fr;
          }

          .collaboration-demo__simulation-actions {
            grid-template-columns: 1fr;
          }

          .collaboration-demo__simulation-stats,
          .collaboration-demo__feature-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
