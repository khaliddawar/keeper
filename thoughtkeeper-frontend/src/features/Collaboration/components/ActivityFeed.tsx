import React, { useState, useMemo } from 'react';
import type { ActivityEvent, ActivityType } from '../types';
import { useCollaboration } from '../CollaborationProvider';

/**
 * Activity Feed Component
 * 
 * Displays a chronological feed of collaborative activities with filtering,
 * grouping, and real-time updates.
 */
interface ActivityFeedProps {
  activities: ActivityEvent[];
  layout?: 'compact' | 'detailed';
  maxItems?: number;
  showFilters?: boolean;
  groupByTime?: boolean;
  autoRefresh?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities = [],
  layout = 'detailed',
  maxItems = 50,
  showFilters = true,
  groupByTime = true,
  autoRefresh = true
}) => {
  const { collaborators } = useCollaboration();
  const [filter, setFilter] = useState<ActivityType | 'all'>('all');
  const [timeFilter, setTimeFilter] = useState<'hour' | 'day' | 'week' | 'all'>('day');
  const [showUserFilter, setShowUserFilter] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Get user name by ID
  const getUserName = (userId: string) => {
    const user = collaborators.find(u => u.id === userId);
    return user?.name || 'Unknown User';
  };

  // Get user color by ID
  const getUserColor = (userId: string) => {
    const user = collaborators.find(u => u.id === userId);
    return user?.color || '#6B7280';
  };

  // Filter activities
  const filteredActivities = useMemo(() => {
    let filtered = [...activities];

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(activity => activity.type === filter);
    }

    // Filter by time
    const now = Date.now();
    const timeFilters = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      all: Infinity
    };
    
    if (timeFilter !== 'all') {
      const cutoff = now - timeFilters[timeFilter];
      filtered = filtered.filter(activity => activity.timestamp > cutoff);
    }

    // Filter by selected users
    if (selectedUsers.size > 0) {
      filtered = filtered.filter(activity => selectedUsers.has(activity.userId));
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    // Limit results
    return filtered.slice(0, maxItems);
  }, [activities, filter, timeFilter, selectedUsers, maxItems]);

  // Group activities by time periods
  const groupedActivities = useMemo(() => {
    if (!groupByTime) {
      return [{ period: 'all', activities: filteredActivities }];
    }

    const groups: Record<string, ActivityEvent[]> = {};
    const now = Date.now();

    filteredActivities.forEach(activity => {
      const diff = now - activity.timestamp;
      let period: string;

      if (diff < 60 * 60 * 1000) {
        period = 'Last hour';
      } else if (diff < 24 * 60 * 60 * 1000) {
        period = 'Today';
      } else if (diff < 7 * 24 * 60 * 60 * 1000) {
        period = 'This week';
      } else {
        period = 'Earlier';
      }

      if (!groups[period]) {
        groups[period] = [];
      }
      groups[period].push(activity);
    });

    return Object.entries(groups).map(([period, activities]) => ({
      period,
      activities
    }));
  }, [filteredActivities, groupByTime]);

  // Get activity icon
  const getActivityIcon = (type: ActivityType) => {
    const icons: Record<ActivityType, string> = {
      'created': '➕',
      'updated': '✏️',
      'deleted': '🗑️',
      'completed': '✅',
      'assigned': '👤',
      'moved': '📦',
      'renamed': '🏷️',
      'shared': '🔗',
      'collaborated': '🤝'
    };
    return icons[type] || '📝';
  };

  // Get activity color
  const getActivityColor = (type: ActivityType) => {
    const colors: Record<ActivityType, string> = {
      'created': '#10b981',
      'updated': '#3b82f6',
      'deleted': '#ef4444',
      'completed': '#059669',
      'assigned': '#8b5cf6',
      'moved': '#f59e0b',
      'renamed': '#06b6d4',
      'shared': '#ec4899',
      'collaborated': '#6366f1'
    };
    return colors[type] || '#6b7280';
  };

  // Format relative time
  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Format absolute time
  const formatAbsoluteTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get activity types for filter
  const availableTypes = useMemo(() => {
    const types = new Set(activities.map(a => a.type));
    return Array.from(types).sort();
  }, [activities]);

  // Compact layout
  if (layout === 'compact') {
    return (
      <div className="activity-feed activity-feed--compact">
        {filteredActivities.length === 0 ? (
          <div className="activity-feed__empty">
            <span className="activity-feed__empty-icon">📋</span>
            <span>No recent activity</span>
          </div>
        ) : (
          <div className="activity-feed__items">
            {filteredActivities.slice(0, 5).map(activity => (
              <div key={activity.id} className="activity-feed__item">
                <span 
                  className="activity-feed__icon"
                  style={{ color: getActivityColor(activity.type) }}
                >
                  {getActivityIcon(activity.type)}
                </span>
                <div className="activity-feed__content">
                  <div className="activity-feed__description">
                    {activity.description}
                  </div>
                  <div className="activity-feed__time">
                    {formatRelativeTime(activity.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <style jsx>{`
          .activity-feed--compact {
            width: 100%;
          }

          .activity-feed__empty {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 16px;
            text-align: center;
            color: #64748b;
            font-size: 0.875rem;
          }

          .activity-feed__empty-icon {
            font-size: 1.25rem;
          }

          .activity-feed__items {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .activity-feed__item {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            padding: 8px;
            border-radius: 6px;
            transition: background 0.2s ease;
          }

          .activity-feed__item:hover {
            background: rgba(0, 0, 0, 0.02);
          }

          .activity-feed__icon {
            font-size: 0.875rem;
            margin-top: 2px;
          }

          .activity-feed__content {
            flex: 1;
            min-width: 0;
          }

          .activity-feed__description {
            font-size: 0.75rem;
            color: #374151;
            line-height: 1.4;
            margin-bottom: 2px;
          }

          .activity-feed__time {
            font-size: 0.6875rem;
            color: #9ca3af;
          }

          /* Dark theme */
          @media (prefers-color-scheme: dark) {
            .activity-feed__empty {
              color: #9ca3af;
            }

            .activity-feed__item:hover {
              background: rgba(255, 255, 255, 0.05);
            }

            .activity-feed__description {
              color: #d1d5db;
            }

            .activity-feed__time {
              color: #6b7280;
            }
          }
        `}</style>
      </div>
    );
  }

  // Detailed layout
  return (
    <div className="activity-feed activity-feed--detailed">
      {/* Filters */}
      {showFilters && (
        <div className="activity-feed__filters">
          <div className="activity-feed__filter-group">
            <label className="activity-feed__filter-label">Type:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as ActivityType | 'all')}
              className="activity-feed__filter-select"
            >
              <option value="all">All Activities</option>
              {availableTypes.map(type => (
                <option key={type} value={type}>
                  {getActivityIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="activity-feed__filter-group">
            <label className="activity-feed__filter-label">Time:</label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="activity-feed__filter-select"
            >
              <option value="hour">Last Hour</option>
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {collaborators.length > 1 && (
            <div className="activity-feed__filter-group">
              <button
                onClick={() => setShowUserFilter(!showUserFilter)}
                className="activity-feed__filter-toggle"
              >
                👥 Users {selectedUsers.size > 0 && `(${selectedUsers.size})`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* User Filter */}
      {showUserFilter && (
        <div className="activity-feed__user-filter">
          <div className="activity-feed__user-options">
            {collaborators.map(user => (
              <label key={user.id} className="activity-feed__user-option">
                <input
                  type="checkbox"
                  checked={selectedUsers.has(user.id)}
                  onChange={(e) => {
                    const newSelected = new Set(selectedUsers);
                    if (e.target.checked) {
                      newSelected.add(user.id);
                    } else {
                      newSelected.delete(user.id);
                    }
                    setSelectedUsers(newSelected);
                  }}
                />
                <span 
                  className="activity-feed__user-avatar"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name.charAt(0)}
                </span>
                <span className="activity-feed__user-name">{user.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Activity Groups */}
      <div className="activity-feed__content">
        {groupedActivities.length === 0 ? (
          <div className="activity-feed__empty-state">
            <div className="activity-feed__empty-icon">📋</div>
            <h3>No Activity Found</h3>
            <p>No activities match your current filters.</p>
          </div>
        ) : (
          groupedActivities.map(group => (
            <div key={group.period} className="activity-feed__group">
              {groupByTime && (
                <h4 className="activity-feed__group-title">{group.period}</h4>
              )}
              
              <div className="activity-feed__group-items">
                {group.activities.map(activity => (
                  <div key={activity.id} className="activity-feed__activity">
                    <div className="activity-feed__activity-left">
                      <div 
                        className="activity-feed__activity-icon"
                        style={{ backgroundColor: getActivityColor(activity.type) }}
                      >
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="activity-feed__activity-line" />
                    </div>

                    <div className="activity-feed__activity-content">
                      <div className="activity-feed__activity-header">
                        <span className="activity-feed__activity-user">
                          {getUserName(activity.userId)}
                        </span>
                        <span className="activity-feed__activity-type">
                          {activity.type}
                        </span>
                        <span 
                          className="activity-feed__activity-time"
                          title={formatAbsoluteTime(activity.timestamp)}
                        >
                          {formatRelativeTime(activity.timestamp)}
                        </span>
                      </div>

                      <div className="activity-feed__activity-description">
                        {activity.description}
                      </div>

                      <div className="activity-feed__activity-entity">
                        {activity.entityType}: <strong>{activity.entityName}</strong>
                      </div>

                      {activity.metadata && (
                        <div className="activity-feed__activity-metadata">
                          {activity.metadata.duration && (
                            <span className="activity-feed__metadata-item">
                              ⏱️ Duration: {Math.round(activity.metadata.duration / 1000)}s
                            </span>
                          )}
                          {activity.metadata.collaborators && (
                            <span className="activity-feed__metadata-item">
                              👥 {activity.metadata.collaborators.length} collaborators
                            </span>
                          )}
                          {activity.metadata.oldValue && activity.metadata.newValue && (
                            <div className="activity-feed__change-details">
                              <div className="activity-feed__change">
                                <span className="activity-feed__change-label">From:</span>
                                <span className="activity-feed__change-value">
                                  {JSON.stringify(activity.metadata.oldValue)}
                                </span>
                              </div>
                              <div className="activity-feed__change">
                                <span className="activity-feed__change-label">To:</span>
                                <span className="activity-feed__change-value">
                                  {JSON.stringify(activity.metadata.newValue)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .activity-feed--detailed {
          width: 100%;
        }

        .activity-feed__filters {
          display: flex;
          gap: 16px;
          padding: 16px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
          border-radius: 8px 8px 0 0;
          flex-wrap: wrap;
        }

        .activity-feed__filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .activity-feed__filter-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .activity-feed__filter-select {
          padding: 4px 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.875rem;
          background: white;
          min-width: 120px;
        }

        .activity-feed__filter-toggle {
          padding: 6px 12px;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .activity-feed__filter-toggle:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .activity-feed__user-filter {
          padding: 16px;
          border-bottom: 1px solid #e2e8f0;
          background: #f0f9ff;
        }

        .activity-feed__user-options {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .activity-feed__user-option {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 6px 8px;
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .activity-feed__user-option:hover {
          background: rgba(59, 130, 246, 0.1);
        }

        .activity-feed__user-avatar {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .activity-feed__user-name {
          font-size: 0.875rem;
          color: #374151;
        }

        .activity-feed__content {
          max-height: 500px;
          overflow-y: auto;
        }

        .activity-feed__empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;
        }

        .activity-feed__empty-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .activity-feed__empty-state h3 {
          margin: 0 0 8px 0;
          color: #374151;
        }

        .activity-feed__empty-state p {
          margin: 0;
          color: #6b7280;
        }

        .activity-feed__group {
          padding: 20px;
        }

        .activity-feed__group:not(:last-child) {
          border-bottom: 1px solid #f1f5f9;
        }

        .activity-feed__group-title {
          margin: 0 0 16px 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .activity-feed__group-items {
          position: relative;
        }

        .activity-feed__activity {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
          position: relative;
        }

        .activity-feed__activity:last-child .activity-feed__activity-line {
          display: none;
        }

        .activity-feed__activity-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .activity-feed__activity-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.875rem;
          z-index: 1;
        }

        .activity-feed__activity-line {
          width: 2px;
          height: 100%;
          background: #e2e8f0;
          position: absolute;
          top: 32px;
          left: 15px;
        }

        .activity-feed__activity-content {
          flex: 1;
          min-width: 0;
        }

        .activity-feed__activity-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }

        .activity-feed__activity-user {
          font-weight: 600;
          color: #1e293b;
        }

        .activity-feed__activity-type {
          background: #f1f5f9;
          color: #64748b;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          text-transform: capitalize;
        }

        .activity-feed__activity-time {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-left: auto;
        }

        .activity-feed__activity-description {
          color: #374151;
          margin-bottom: 8px;
          line-height: 1.5;
        }

        .activity-feed__activity-entity {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 8px;
        }

        .activity-feed__activity-metadata {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 8px;
          font-size: 0.75rem;
          color: #64748b;
        }

        .activity-feed__metadata-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .activity-feed__change-details {
          width: 100%;
          margin-top: 8px;
          padding: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
        }

        .activity-feed__change {
          display: flex;
          gap: 8px;
          margin-bottom: 4px;
          font-size: 0.75rem;
        }

        .activity-feed__change:last-child {
          margin-bottom: 0;
        }

        .activity-feed__change-label {
          font-weight: 600;
          color: #374151;
          min-width: 40px;
        }

        .activity-feed__change-value {
          color: #6b7280;
          font-family: monospace;
          word-break: break-all;
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          .activity-feed__filters {
            background: #0f172a;
            border-color: #334155;
          }

          .activity-feed__filter-label {
            color: #e2e8f0;
          }

          .activity-feed__filter-select,
          .activity-feed__filter-toggle {
            background: #1e293b;
            border-color: #334155;
            color: #f1f5f9;
          }

          .activity-feed__filter-toggle:hover {
            background: #334155;
            border-color: #475569;
          }

          .activity-feed__user-filter {
            background: #1e3a8a;
            border-color: #334155;
          }

          .activity-feed__user-name {
            color: #e2e8f0;
          }

          .activity-feed__empty-state h3 {
            color: #f1f5f9;
          }

          .activity-feed__empty-state p {
            color: #94a3b8;
          }

          .activity-feed__group {
            border-color: #334155;
          }

          .activity-feed__group-title {
            color: #94a3b8;
          }

          .activity-feed__activity-line {
            background: #334155;
          }

          .activity-feed__activity-user {
            color: #f1f5f9;
          }

          .activity-feed__activity-type {
            background: #334155;
            color: #94a3b8;
          }

          .activity-feed__activity-time {
            color: #6b7280;
          }

          .activity-feed__activity-description {
            color: #cbd5e0;
          }

          .activity-feed__activity-entity {
            color: #94a3b8;
          }

          .activity-feed__activity-metadata {
            color: #94a3b8;
          }

          .activity-feed__change-details {
            background: #1e293b;
            border-color: #334155;
          }

          .activity-feed__change-label {
            color: #e2e8f0;
          }

          .activity-feed__change-value {
            color: #94a3b8;
          }
        }

        /* Responsive */
        @media (max-width: 640px) {
          .activity-feed__filters {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .activity-feed__filter-group {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .activity-feed__activity-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .activity-feed__activity-time {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
};
