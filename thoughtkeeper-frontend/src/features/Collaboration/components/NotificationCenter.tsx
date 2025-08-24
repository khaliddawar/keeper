import React, { useState, useMemo } from 'react';
import { useCollaboration } from '../CollaborationProvider';
import type { CollaborativeNotification, NotificationType } from '../types';

/**
 * Notification Center Component
 * 
 * Displays collaborative notifications with filtering, marking as read,
 * and different priority levels and notification types.
 */
interface NotificationCenterProps {
  notifications: CollaborativeNotification[];
  currentUserId: string;
  maxItems?: number;
  showFilters?: boolean;
  autoMarkAsRead?: boolean;
  layout?: 'compact' | 'detailed';
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications = [],
  currentUserId,
  maxItems = 50,
  showFilters = true,
  autoMarkAsRead = false,
  layout = 'detailed'
}) => {
  const { markNotificationRead, collaborators } = useCollaboration();
  const [filter, setFilter] = useState<NotificationType | 'all' | 'unread'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    // Filter by type
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read?.[currentUserId]);
    } else if (filter !== 'all') {
      filtered = filtered.filter(n => n.type === filter);
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(n => n.priority === priorityFilter);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    return filtered.slice(0, maxItems);
  }, [notifications, filter, priorityFilter, currentUserId, maxItems]);

  // Get user name
  const getUserName = (userId: string) => {
    if (userId === 'system') return 'System';
    const user = collaborators.find(u => u.id === userId);
    return user?.name || 'Unknown User';
  };

  // Get notification icon
  const getNotificationIcon = (type: NotificationType) => {
    const icons: Record<NotificationType, string> = {
      'user_joined': '👋',
      'user_left': '👋',
      'content_changed': '✏️',
      'task_assigned': '📋',
      'conflict_detected': '⚠️',
      'conflict_resolved': '✅',
      'mention': '💬',
      'comment_added': '💭',
      'status_updated': '🔄'
    };
    return icons[type] || '🔔';
  };

  // Get priority color
  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    const colors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981'
    };
    return colors[priority];
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

  // Handle mark as read
  const handleMarkAsRead = (notificationId: string) => {
    markNotificationRead(notificationId);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    const unreadNotifications = notifications.filter(n => !n.read?.[currentUserId]);
    unreadNotifications.forEach(n => markNotificationRead(n.id));
  };

  // Get notification types for filter
  const availableTypes = useMemo(() => {
    const types = new Set(notifications.map(n => n.type));
    return Array.from(types).sort();
  }, [notifications]);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read?.[currentUserId]).length;

  // Compact layout
  if (layout === 'compact') {
    const recentNotifications = filteredNotifications.slice(0, 3);
    
    return (
      <div className="notification-center notification-center--compact">
        {recentNotifications.length === 0 ? (
          <div className="notification-center__empty">
            <span className="notification-center__empty-icon">🔔</span>
            <span>No notifications</span>
          </div>
        ) : (
          <div className="notification-center__items">
            {recentNotifications.map(notification => {
              const isUnread = !notification.read?.[currentUserId];
              
              return (
                <div
                  key={notification.id}
                  className={`notification-center__item ${isUnread ? 'unread' : ''}`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <span className="notification-center__icon">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="notification-center__content">
                    <div className="notification-center__message">
                      {notification.message}
                    </div>
                    <div className="notification-center__time">
                      {formatTime(notification.timestamp)}
                    </div>
                  </div>
                  <div
                    className="notification-center__priority-dot"
                    style={{ backgroundColor: getPriorityColor(notification.priority) }}
                  />
                </div>
              );
            })}
            
            {unreadCount > recentNotifications.length && (
              <div className="notification-center__more">
                +{unreadCount - recentNotifications.length} more unread
              </div>
            )}
          </div>
        )}

        <style jsx>{`
          .notification-center--compact {
            width: 100%;
          }

          .notification-center__empty {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 16px;
            color: #64748b;
            font-size: 0.875rem;
          }

          .notification-center__items {
            display: flex;
            flex-direction: column;
            gap: 1px;
          }

          .notification-center__item {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            padding: 8px;
            cursor: pointer;
            transition: background 0.2s ease;
            position: relative;
            border-radius: 6px;
          }

          .notification-center__item:hover {
            background: rgba(0, 0, 0, 0.02);
          }

          .notification-center__item.unread {
            background: #eff6ff;
            border-left: 3px solid #3b82f6;
          }

          .notification-center__icon {
            font-size: 0.875rem;
            margin-top: 2px;
          }

          .notification-center__content {
            flex: 1;
            min-width: 0;
          }

          .notification-center__message {
            font-size: 0.75rem;
            color: #374151;
            line-height: 1.4;
            margin-bottom: 2px;
          }

          .notification-center__time {
            font-size: 0.6875rem;
            color: #9ca3af;
          }

          .notification-center__priority-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            margin-top: 6px;
          }

          .notification-center__more {
            text-align: center;
            padding: 8px;
            font-size: 0.75rem;
            color: #6b7280;
            font-style: italic;
          }

          /* Dark theme */
          @media (prefers-color-scheme: dark) {
            .notification-center__empty {
              color: #9ca3af;
            }

            .notification-center__item:hover {
              background: rgba(255, 255, 255, 0.05);
            }

            .notification-center__item.unread {
              background: #1e3a8a;
              border-left-color: #60a5fa;
            }

            .notification-center__message {
              color: #d1d5db;
            }

            .notification-center__time {
              color: #6b7280;
            }

            .notification-center__more {
              color: #9ca3af;
            }
          }
        `}</style>
      </div>
    );
  }

  // Detailed layout
  return (
    <div className="notification-center notification-center--detailed">
      {/* Header */}
      <div className="notification-center__header">
        <h3 className="notification-center__title">
          Notifications {unreadCount > 0 && <span className="notification-center__unread-badge">{unreadCount}</span>}
        </h3>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="notification-center__mark-all-read"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="notification-center__filters">
          <div className="notification-center__filter-group">
            <label className="notification-center__filter-label">Show:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="notification-center__filter-select"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              {availableTypes.map(type => (
                <option key={type} value={type}>
                  {getNotificationIcon(type)} {type.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="notification-center__filter-group">
            <label className="notification-center__filter-label">Priority:</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="notification-center__filter-select"
            >
              <option value="all">All Priorities</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="notification-center__content">
        {filteredNotifications.length === 0 ? (
          <div className="notification-center__empty-state">
            <div className="notification-center__empty-icon">🔔</div>
            <h4>No Notifications</h4>
            <p>You're all caught up! No notifications to show.</p>
          </div>
        ) : (
          <div className="notification-center__notifications">
            {filteredNotifications.map(notification => {
              const isUnread = !notification.read?.[currentUserId];
              
              return (
                <div
                  key={notification.id}
                  className={`notification-center__notification ${isUnread ? 'unread' : ''}`}
                >
                  <div className="notification-center__notification-left">
                    <div
                      className="notification-center__notification-icon"
                      style={{ backgroundColor: getPriorityColor(notification.priority) }}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  <div className="notification-center__notification-content">
                    <div className="notification-center__notification-header">
                      <div className="notification-center__notification-type">
                        {notification.type.replace('_', ' ')}
                      </div>
                      <div className="notification-center__notification-time">
                        {formatTime(notification.timestamp)}
                      </div>
                    </div>

                    <div className="notification-center__notification-message">
                      {notification.message}
                    </div>

                    <div className="notification-center__notification-meta">
                      <span className="notification-center__notification-user">
                        From: {getUserName(notification.userId)}
                      </span>
                      <span className="notification-center__notification-entity">
                        {notification.entityType}: {notification.entityId}
                      </span>
                    </div>

                    {notification.metadata && (
                      <div className="notification-center__notification-metadata">
                        {Object.entries(notification.metadata).map(([key, value]) => (
                          <div key={key} className="notification-center__metadata-item">
                            <strong>{key}:</strong> {JSON.stringify(value)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="notification-center__notification-actions">
                    {isUnread && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="notification-center__mark-read-btn"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    
                    <div
                      className="notification-center__priority-indicator"
                      style={{ backgroundColor: getPriorityColor(notification.priority) }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .notification-center--detailed {
          width: 100%;
          background: white;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .notification-center__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .notification-center__title {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .notification-center__unread-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          background: #ef4444;
          color: white;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0 6px;
        }

        .notification-center__mark-all-read {
          padding: 6px 12px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .notification-center__mark-all-read:hover {
          background: #2563eb;
        }

        .notification-center__filters {
          display: flex;
          gap: 20px;
          padding: 16px 24px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .notification-center__filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .notification-center__filter-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .notification-center__filter-select {
          padding: 4px 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.875rem;
          background: white;
          min-width: 140px;
        }

        .notification-center__content {
          max-height: 500px;
          overflow-y: auto;
        }

        .notification-center__empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;
        }

        .notification-center__empty-icon {
          font-size: 3rem;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .notification-center__empty-state h4 {
          margin: 0 0 8px 0;
          color: #374151;
        }

        .notification-center__empty-state p {
          margin: 0;
          color: #6b7280;
        }

        .notification-center__notifications {
          display: flex;
          flex-direction: column;
        }

        .notification-center__notification {
          display: flex;
          gap: 16px;
          padding: 16px 24px;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s ease;
          position: relative;
        }

        .notification-center__notification:hover {
          background: #f8fafc;
        }

        .notification-center__notification.unread {
          background: #eff6ff;
          border-left: 4px solid #3b82f6;
        }

        .notification-center__notification:last-child {
          border-bottom: none;
        }

        .notification-center__notification-left {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .notification-center__notification-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.875rem;
        }

        .notification-center__notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-center__notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .notification-center__notification-type {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: capitalize;
        }

        .notification-center__notification-time {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .notification-center__notification-message {
          color: #1e293b;
          margin-bottom: 8px;
          line-height: 1.5;
        }

        .notification-center__notification-meta {
          display: flex;
          gap: 16px;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .notification-center__notification-user,
        .notification-center__notification-entity {
          display: flex;
          gap: 4px;
        }

        .notification-center__notification-metadata {
          margin-top: 8px;
          padding: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
        }

        .notification-center__metadata-item {
          font-size: 0.75rem;
          color: #64748b;
          margin-bottom: 4px;
        }

        .notification-center__metadata-item:last-child {
          margin-bottom: 0;
        }

        .notification-center__notification-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .notification-center__mark-read-btn {
          width: 24px;
          height: 24px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 0.75rem;
          color: #10b981;
          transition: all 0.2s ease;
        }

        .notification-center__mark-read-btn:hover {
          background: #f0fdf4;
          border-color: #10b981;
        }

        .notification-center__priority-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          .notification-center--detailed {
            background: #1e293b;
            border-color: #334155;
          }

          .notification-center__header {
            background: #0f172a;
            border-color: #334155;
          }

          .notification-center__title {
            color: #f1f5f9;
          }

          .notification-center__filters {
            background: #0f172a;
            border-color: #334155;
          }

          .notification-center__filter-label {
            color: #e2e8f0;
          }

          .notification-center__filter-select {
            background: #1e293b;
            border-color: #334155;
            color: #f1f5f9;
          }

          .notification-center__empty-state h4 {
            color: #f1f5f9;
          }

          .notification-center__empty-state p {
            color: #94a3b8;
          }

          .notification-center__notification {
            border-color: #334155;
          }

          .notification-center__notification:hover {
            background: #334155;
          }

          .notification-center__notification.unread {
            background: #1e3a8a;
            border-left-color: #60a5fa;
          }

          .notification-center__notification-type {
            color: #94a3b8;
          }

          .notification-center__notification-time {
            color: #6b7280;
          }

          .notification-center__notification-message {
            color: #f1f5f9;
          }

          .notification-center__notification-meta {
            color: #94a3b8;
          }

          .notification-center__notification-metadata {
            background: #0f172a;
            border-color: #334155;
          }

          .notification-center__metadata-item {
            color: #cbd5e0;
          }

          .notification-center__mark-read-btn {
            background: #374151;
            border-color: #4b5563;
          }

          .notification-center__mark-read-btn:hover {
            background: #4b5563;
            border-color: #10b981;
          }
        }

        /* Responsive */
        @media (max-width: 640px) {
          .notification-center__header {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .notification-center__filters {
            flex-direction: column;
            gap: 12px;
          }

          .notification-center__filter-group {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .notification-center__notification-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .notification-center__notification-meta {
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
};
