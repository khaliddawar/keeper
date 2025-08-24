import React, { useState } from 'react';
import type { CollaboratorUser } from '../types';

/**
 * Presence Indicator Component
 * 
 * Displays active collaborators with their status, location, and activity.
 * Supports both compact and detailed layouts.
 */
interface PresenceIndicatorProps {
  collaborators: CollaboratorUser[];
  currentUser: CollaboratorUser | null;
  layout?: 'compact' | 'detailed';
  maxVisible?: number;
  showTooltips?: boolean;
  onClick?: (user: CollaboratorUser) => void;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  collaborators,
  currentUser,
  layout = 'detailed',
  maxVisible = 8,
  showTooltips = true,
  onClick
}) => {
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);

  // Sort collaborators: current user first, then by status
  const sortedCollaborators = [...collaborators].sort((a, b) => {
    if (currentUser && a.id === currentUser.id) return -1;
    if (currentUser && b.id === currentUser.id) return 1;
    
    // Sort by status priority
    const statusPriority = { online: 0, away: 1, offline: 2 };
    const aPriority = statusPriority[a.status] || 3;
    const bPriority = statusPriority[b.status] || 3;
    
    if (aPriority !== bPriority) return aPriority - bPriority;
    
    // Then by last seen (most recent first)
    return b.lastSeen - a.lastSeen;
  });

  const visibleUsers = sortedCollaborators.slice(0, maxVisible);
  const hiddenCount = Math.max(0, collaborators.length - maxVisible);

  const getStatusIcon = (status: CollaboratorUser['status']) => {
    switch (status) {
      case 'online': return '🟢';
      case 'away': return '🟡';
      case 'offline': return '⚫';
      default: return '⚪';
    }
  };

  const getLocationText = (user: CollaboratorUser) => {
    if (!user.location) return 'Dashboard';
    
    const { type, id, section } = user.location;
    let text = type.charAt(0).toUpperCase() + type.slice(1);
    
    if (id) text += ` (${id})`;
    if (section) text += ` - ${section}`;
    
    return text;
  };

  const getRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Compact layout for sidebars
  if (layout === 'compact') {
    return (
      <div className="presence-indicator presence-indicator--compact">
        <div className="presence-indicator__avatars">
          {visibleUsers.map((user) => (
            <div
              key={user.id}
              className={`presence-indicator__avatar ${currentUser?.id === user.id ? 'current' : ''}`}
              style={{ backgroundColor: user.color }}
              onClick={() => onClick?.(user)}
              onMouseEnter={() => setHoveredUser(user.id)}
              onMouseLeave={() => setHoveredUser(null)}
            >
              <span className="presence-indicator__avatar-initial">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="presence-indicator__status-dot" data-status={user.status}>
                {getStatusIcon(user.status)}
              </span>
              
              {showTooltips && hoveredUser === user.id && (
                <div className="presence-indicator__tooltip">
                  <div className="presence-indicator__tooltip-header">
                    <strong>{user.name}</strong>
                    <span className="presence-indicator__tooltip-status">{user.status}</span>
                  </div>
                  <div className="presence-indicator__tooltip-location">
                    📍 {getLocationText(user)}
                  </div>
                  <div className="presence-indicator__tooltip-time">
                    ⏰ {getRelativeTime(user.lastSeen)}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {hiddenCount > 0 && (
            <div className="presence-indicator__overflow">
              +{hiddenCount}
            </div>
          )}
        </div>

        <style jsx>{`
          .presence-indicator--compact {
            display: flex;
            align-items: center;
          }

          .presence-indicator__avatars {
            display: flex;
            align-items: center;
            gap: -8px; /* Overlap avatars */
          }

          .presence-indicator__avatar {
            position: relative;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 2px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
            color: white;
            cursor: pointer;
            transition: transform 0.2s ease;
            z-index: 1;
          }

          .presence-indicator__avatar:hover {
            transform: scale(1.1);
            z-index: 2;
          }

          .presence-indicator__avatar.current {
            border-color: #3b82f6;
            border-width: 3px;
          }

          .presence-indicator__status-dot {
            position: absolute;
            bottom: -2px;
            right: -2px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 2px solid white;
            font-size: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .presence-indicator__overflow {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #6b7280;
            border: 2px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 600;
            color: white;
          }

          .presence-indicator__tooltip {
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #1f2937;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            margin-bottom: 8px;
          }

          .presence-indicator__tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 4px solid transparent;
            border-top-color: #1f2937;
          }

          .presence-indicator__tooltip-header {
            display: flex;
            justify-content: space-between;
            gap: 8px;
            margin-bottom: 4px;
          }

          .presence-indicator__tooltip-status {
            font-size: 10px;
            opacity: 0.8;
          }

          .presence-indicator__tooltip-location,
          .presence-indicator__tooltip-time {
            font-size: 10px;
            opacity: 0.9;
            margin: 2px 0;
          }

          /* Dark theme */
          @media (prefers-color-scheme: dark) {
            .presence-indicator__avatar {
              border-color: #374151;
            }

            .presence-indicator__status-dot {
              border-color: #374151;
            }

            .presence-indicator__overflow {
              border-color: #374151;
            }

            .presence-indicator__tooltip {
              background: #0f172a;
              border: 1px solid #334155;
            }

            .presence-indicator__tooltip::after {
              border-top-color: #0f172a;
            }
          }
        `}</style>
      </div>
    );
  }

  // Detailed layout for full dashboard
  return (
    <div className="presence-indicator presence-indicator--detailed">
      {visibleUsers.length === 0 ? (
        <div className="presence-indicator__empty">
          <div className="presence-indicator__empty-icon">👤</div>
          <p>No active collaborators</p>
        </div>
      ) : (
        <div className="presence-indicator__users">
          {visibleUsers.map((user) => (
            <div
              key={user.id}
              className={`presence-indicator__user ${currentUser?.id === user.id ? 'current' : ''}`}
              onClick={() => onClick?.(user)}
            >
              <div 
                className="presence-indicator__user-avatar"
                style={{ backgroundColor: user.color }}
              >
                <span className="presence-indicator__user-initial">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="presence-indicator__user-status" data-status={user.status}>
                  {getStatusIcon(user.status)}
                </span>
              </div>

              <div className="presence-indicator__user-info">
                <div className="presence-indicator__user-header">
                  <span className="presence-indicator__user-name">
                    {user.name}
                    {currentUser?.id === user.id && (
                      <span className="presence-indicator__you-badge">(You)</span>
                    )}
                  </span>
                  <span className="presence-indicator__user-role">{user.role}</span>
                </div>
                
                <div className="presence-indicator__user-details">
                  <div className="presence-indicator__user-location">
                    📍 {getLocationText(user)}
                  </div>
                  <div className="presence-indicator__user-time">
                    ⏰ {getRelativeTime(user.lastSeen)}
                  </div>
                </div>
              </div>

              <div className="presence-indicator__user-actions">
                <button 
                  className="presence-indicator__action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle action (e.g., message, follow)
                  }}
                >
                  💬
                </button>
              </div>
            </div>
          ))}

          {hiddenCount > 0 && (
            <div className="presence-indicator__more">
              <span>and {hiddenCount} more collaborator{hiddenCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .presence-indicator--detailed {
          width: 100%;
        }

        .presence-indicator__empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          text-align: center;
          color: #64748b;
        }

        .presence-indicator__empty-icon {
          font-size: 2rem;
          margin-bottom: 8px;
        }

        .presence-indicator__empty p {
          margin: 0;
          font-size: 0.875rem;
        }

        .presence-indicator__users {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .presence-indicator__user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .presence-indicator__user:hover {
          background: #f8fafc;
          border-color: #cbd5e0;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .presence-indicator__user.current {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .presence-indicator__user-avatar {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .presence-indicator__user-status {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid white;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .presence-indicator__user-info {
          flex: 1;
          min-width: 0;
        }

        .presence-indicator__user-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .presence-indicator__user-name {
          font-weight: 600;
          color: #1e293b;
          font-size: 0.875rem;
        }

        .presence-indicator__you-badge {
          margin-left: 8px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #3b82f6;
        }

        .presence-indicator__user-role {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: capitalize;
        }

        .presence-indicator__user-details {
          display: flex;
          gap: 16px;
        }

        .presence-indicator__user-location,
        .presence-indicator__user-time {
          font-size: 0.75rem;
          color: #64748b;
        }

        .presence-indicator__user-actions {
          display: flex;
          gap: 4px;
        }

        .presence-indicator__action-btn {
          width: 28px;
          height: 28px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.75rem;
        }

        .presence-indicator__action-btn:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .presence-indicator__more {
          text-align: center;
          padding: 8px;
          font-size: 0.75rem;
          color: #64748b;
          font-style: italic;
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          .presence-indicator__empty {
            color: #94a3b8;
          }

          .presence-indicator__user {
            background: #1e293b;
            border-color: #334155;
          }

          .presence-indicator__user:hover {
            background: #334155;
            border-color: #475569;
          }

          .presence-indicator__user.current {
            border-color: #60a5fa;
            background: #1e3a8a;
          }

          .presence-indicator__user-status {
            border-color: #1e293b;
          }

          .presence-indicator__user-name {
            color: #f1f5f9;
          }

          .presence-indicator__user-role,
          .presence-indicator__user-location,
          .presence-indicator__user-time {
            color: #94a3b8;
          }

          .presence-indicator__action-btn {
            background: #374151;
            border-color: #4b5563;
          }

          .presence-indicator__action-btn:hover {
            background: #4b5563;
            border-color: #6b7280;
          }

          .presence-indicator__more {
            color: #94a3b8;
          }
        }

        /* Responsive */
        @media (max-width: 640px) {
          .presence-indicator__user-details {
            flex-direction: column;
            gap: 4px;
          }

          .presence-indicator__user-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 2px;
          }
        }
      `}</style>
    </div>
  );
};
