import React, { useState, useEffect } from 'react';
import { useCollaboration } from '../CollaborationProvider';
import type { LiveEdit } from '../types';

/**
 * Live Edit Indicators Component
 * 
 * Shows real-time editing indicators including who is editing what,
 * live cursors, selection ranges, and typing indicators.
 */
interface LiveEditIndicatorsProps {
  edits: LiveEdit[];
  layout?: 'compact' | 'detailed' | 'overlay';
  showCursors?: boolean;
  showTypingIndicators?: boolean;
  maxVisible?: number;
}

export const LiveEditIndicators: React.FC<LiveEditIndicatorsProps> = ({
  edits = [],
  layout = 'detailed',
  showCursors = true,
  showTypingIndicators = true,
  maxVisible = 10
}) => {
  const { collaborators, currentUser } = useCollaboration();
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [pulsingEdits, setPulsingEdits] = useState<Set<string>>(new Set());

  // Get user info
  const getUserInfo = (userId: string) => {
    const user = collaborators.find(u => u.id === userId);
    return user ? {
      name: user.name,
      color: user.color,
      avatar: user.avatar
    } : {
      name: 'Unknown User',
      color: '#6B7280',
      avatar: undefined
    };
  };

  // Filter out current user's edits for some layouts
  const visibleEdits = edits
    .filter(edit => layout !== 'overlay' || edit.userId !== currentUser?.id)
    .slice(0, maxVisible);

  // Simulate typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      const activeEditors = new Set(edits.map(edit => edit.userId));
      
      // Add random typing indicator
      if (Math.random() > 0.7 && activeEditors.size > 0) {
        const randomEditor = Array.from(activeEditors)[Math.floor(Math.random() * activeEditors.size)];
        setTypingUsers(prev => new Set([...prev, randomEditor]));
        
        // Remove after 3 seconds
        setTimeout(() => {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(randomEditor);
            return newSet;
          });
        }, 3000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [edits]);

  // Pulse effect for new edits
  useEffect(() => {
    const newEditIds = edits.map(edit => edit.id);
    setPulsingEdits(new Set(newEditIds));
    
    const timer = setTimeout(() => {
      setPulsingEdits(new Set());
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [edits.length]);

  // Get editing duration
  const getEditingDuration = (startTime: number) => {
    const duration = Date.now() - startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  // Compact layout
  if (layout === 'compact') {
    if (visibleEdits.length === 0) return null;

    return (
      <div className="live-edit-indicators live-edit-indicators--compact">
        <div className="live-edit-indicators__header">
          <span className="live-edit-indicators__title">✏️ Live Edits ({visibleEdits.length})</span>
        </div>
        
        <div className="live-edit-indicators__list">
          {visibleEdits.map(edit => {
            const user = getUserInfo(edit.userId);
            const isTyping = typingUsers.has(edit.userId);
            
            return (
              <div key={edit.id} className="live-edit-indicators__edit">
                <div
                  className="live-edit-indicators__user-dot"
                  style={{ backgroundColor: user.color }}
                />
                <div className="live-edit-indicators__edit-info">
                  <span className="live-edit-indicators__user-name">{user.name}</span>
                  <span className="live-edit-indicators__edit-location">
                    {edit.entityType} • {edit.field}
                  </span>
                  {isTyping && (
                    <span className="live-edit-indicators__typing">
                      typing<span className="live-edit-indicators__typing-dots">...</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <style jsx>{`
          .live-edit-indicators--compact {
            width: 100%;
          }

          .live-edit-indicators__header {
            margin-bottom: 12px;
          }

          .live-edit-indicators__title {
            font-size: 0.75rem;
            font-weight: 600;
            color: #4a5568;
          }

          .live-edit-indicators__list {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .live-edit-indicators__edit {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 8px;
            border-radius: 4px;
            background: rgba(0, 0, 0, 0.02);
            transition: all 0.2s ease;
          }

          .live-edit-indicators__edit:hover {
            background: rgba(0, 0, 0, 0.05);
          }

          .live-edit-indicators__user-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            flex-shrink: 0;
            animation: pulse 2s infinite;
          }

          .live-edit-indicators__edit-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
            min-width: 0;
            flex: 1;
          }

          .live-edit-indicators__user-name {
            font-size: 0.75rem;
            font-weight: 500;
            color: #1e293b;
          }

          .live-edit-indicators__edit-location {
            font-size: 0.6875rem;
            color: #64748b;
          }

          .live-edit-indicators__typing {
            font-size: 0.6875rem;
            color: #10b981;
            font-style: italic;
          }

          .live-edit-indicators__typing-dots {
            animation: dots 1.5s infinite;
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }

          @keyframes dots {
            0%, 20% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
          }

          /* Dark theme */
          @media (prefers-color-scheme: dark) {
            .live-edit-indicators__title {
              color: #cbd5e0;
            }

            .live-edit-indicators__edit {
              background: rgba(255, 255, 255, 0.05);
            }

            .live-edit-indicators__edit:hover {
              background: rgba(255, 255, 255, 0.1);
            }

            .live-edit-indicators__user-name {
              color: #f1f5f9;
            }

            .live-edit-indicators__edit-location {
              color: #94a3b8;
            }
          }
        `}</style>
      </div>
    );
  }

  // Overlay layout for floating indicators
  if (layout === 'overlay') {
    if (visibleEdits.length === 0) return null;

    return (
      <div className="live-edit-indicators live-edit-indicators--overlay">
        {visibleEdits.map((edit, index) => {
          const user = getUserInfo(edit.userId);
          const isTyping = typingUsers.has(edit.userId);
          const isPulsing = pulsingEdits.has(edit.id);
          
          return (
            <div
              key={edit.id}
              className={`live-edit-indicators__floating-indicator ${isPulsing ? 'pulsing' : ''}`}
              style={{
                '--user-color': user.color,
                '--index': index,
              } as React.CSSProperties}
            >
              <div className="live-edit-indicators__floating-content">
                <div className="live-edit-indicators__floating-avatar">
                  {user.name.charAt(0)}
                </div>
                <div className="live-edit-indicators__floating-info">
                  <div className="live-edit-indicators__floating-user">{user.name}</div>
                  <div className="live-edit-indicators__floating-action">
                    editing {edit.field}
                    {isTyping && <span className="live-edit-indicators__typing-indicator">...</span>}
                  </div>
                </div>
                {showCursors && edit.cursor && (
                  <div className="live-edit-indicators__cursor-preview">
                    <div className="live-edit-indicators__cursor-line">{edit.cursor.line}:{edit.cursor.column}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <style jsx>{`
          .live-edit-indicators--overlay {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 8px;
            max-width: 300px;
          }

          .live-edit-indicators__floating-indicator {
            background: white;
            border: 1px solid #e2e8f0;
            border-left: 4px solid var(--user-color);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            padding: 12px;
            animation: slideIn 0.3s ease-out;
            animation-delay: calc(var(--index) * 0.1s);
            animation-fill-mode: both;
          }

          .live-edit-indicators__floating-indicator.pulsing {
            animation: slideIn 0.3s ease-out, pulse 1s ease-in-out;
          }

          .live-edit-indicators__floating-content {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .live-edit-indicators__floating-avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: var(--user-color);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 600;
          }

          .live-edit-indicators__floating-info {
            flex: 1;
            min-width: 0;
          }

          .live-edit-indicators__floating-user {
            font-size: 0.875rem;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 2px;
          }

          .live-edit-indicators__floating-action {
            font-size: 0.75rem;
            color: #64748b;
          }

          .live-edit-indicators__typing-indicator {
            color: #10b981;
            animation: dots 1.5s infinite;
          }

          .live-edit-indicators__cursor-preview {
            font-size: 0.6875rem;
            color: #9ca3af;
            font-family: monospace;
          }

          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }

          /* Dark theme */
          @media (prefers-color-scheme: dark) {
            .live-edit-indicators__floating-indicator {
              background: #1e293b;
              border-color: #334155;
            }

            .live-edit-indicators__floating-user {
              color: #f1f5f9;
            }

            .live-edit-indicators__floating-action {
              color: #94a3b8;
            }

            .live-edit-indicators__cursor-preview {
              color: #6b7280;
            }
          }

          /* Responsive */
          @media (max-width: 640px) {
            .live-edit-indicators--overlay {
              right: 10px;
              top: 10px;
              max-width: 250px;
            }
          }
        `}</style>
      </div>
    );
  }

  // Detailed layout
  return (
    <div className="live-edit-indicators live-edit-indicators--detailed">
      {visibleEdits.length === 0 ? (
        <div className="live-edit-indicators__empty">
          <div className="live-edit-indicators__empty-icon">✏️</div>
          <p>No active edits</p>
        </div>
      ) : (
        <div className="live-edit-indicators__edits">
          {visibleEdits.map(edit => {
            const user = getUserInfo(edit.userId);
            const isTyping = typingUsers.has(edit.userId);
            const duration = getEditingDuration(edit.startTime);
            const isPulsing = pulsingEdits.has(edit.id);
            
            return (
              <div key={edit.id} className={`live-edit-indicators__edit-card ${isPulsing ? 'pulsing' : ''}`}>
                <div className="live-edit-indicators__edit-header">
                  <div className="live-edit-indicators__user-info">
                    <div
                      className="live-edit-indicators__user-avatar"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <div className="live-edit-indicators__user-details">
                      <div className="live-edit-indicators__user-name">{user.name}</div>
                      <div className="live-edit-indicators__edit-duration">
                        editing for {duration}
                      </div>
                    </div>
                  </div>
                  <div className="live-edit-indicators__status-indicator">
                    {isTyping ? (
                      <span className="live-edit-indicators__typing-badge">
                        typing<span className="live-edit-indicators__typing-animation">...</span>
                      </span>
                    ) : (
                      <span className="live-edit-indicators__active-badge">active</span>
                    )}
                  </div>
                </div>

                <div className="live-edit-indicators__edit-details">
                  <div className="live-edit-indicators__edit-location">
                    <span className="live-edit-indicators__entity-type">{edit.entityType}</span>
                    <span className="live-edit-indicators__entity-id">"{edit.entityId}"</span>
                    <span className="live-edit-indicators__field-name">• {edit.field}</span>
                  </div>

                  {showCursors && edit.cursor && (
                    <div className="live-edit-indicators__cursor-info">
                      <div className="live-edit-indicators__cursor-position">
                        Line {edit.cursor.line}, Column {edit.cursor.column}
                      </div>
                      {edit.cursor.selection && (
                        <div className="live-edit-indicators__selection-info">
                          Selection: {edit.cursor.selection.start.line}:{edit.cursor.selection.start.column} → {edit.cursor.selection.end.line}:{edit.cursor.selection.end.column}
                        </div>
                      )}
                    </div>
                  )}

                  {edit.content && (
                    <div className="live-edit-indicators__content-preview">
                      <div className="live-edit-indicators__content-label">Current draft:</div>
                      <div className="live-edit-indicators__content-text">
                        {edit.content.length > 100 
                          ? edit.content.substring(0, 100) + '...' 
                          : edit.content
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .live-edit-indicators--detailed {
          width: 100%;
        }

        .live-edit-indicators__empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          text-align: center;
          color: #64748b;
        }

        .live-edit-indicators__empty-icon {
          font-size: 2rem;
          margin-bottom: 8px;
        }

        .live-edit-indicators__empty p {
          margin: 0;
          font-size: 0.875rem;
        }

        .live-edit-indicators__edits {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .live-edit-indicators__edit-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          transition: all 0.2s ease;
        }

        .live-edit-indicators__edit-card:hover {
          border-color: #cbd5e0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .live-edit-indicators__edit-card.pulsing {
          animation: cardPulse 1s ease-in-out;
          border-color: #3b82f6;
        }

        .live-edit-indicators__edit-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .live-edit-indicators__user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .live-edit-indicators__user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .live-edit-indicators__user-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .live-edit-indicators__user-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e293b;
        }

        .live-edit-indicators__edit-duration {
          font-size: 0.75rem;
          color: #64748b;
        }

        .live-edit-indicators__status-indicator {
          display: flex;
          align-items: center;
        }

        .live-edit-indicators__typing-badge {
          background: #dcfce7;
          color: #15803d;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .live-edit-indicators__typing-animation {
          animation: dots 1.5s infinite;
        }

        .live-edit-indicators__active-badge {
          background: #dbeafe;
          color: #1d4ed8;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .live-edit-indicators__edit-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .live-edit-indicators__edit-location {
          font-size: 0.875rem;
          color: #374151;
        }

        .live-edit-indicators__entity-type {
          font-weight: 600;
          text-transform: capitalize;
        }

        .live-edit-indicators__entity-id {
          color: #6b7280;
        }

        .live-edit-indicators__field-name {
          color: #9ca3af;
        }

        .live-edit-indicators__cursor-info {
          font-size: 0.75rem;
          color: #64748b;
          font-family: monospace;
          background: #f8fafc;
          padding: 6px 8px;
          border-radius: 4px;
          border-left: 3px solid #e2e8f0;
        }

        .live-edit-indicators__cursor-position {
          margin-bottom: 2px;
        }

        .live-edit-indicators__selection-info {
          color: #9ca3af;
        }

        .live-edit-indicators__content-preview {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 8px;
        }

        .live-edit-indicators__content-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #4b5563;
          margin-bottom: 4px;
        }

        .live-edit-indicators__content-text {
          font-size: 0.875rem;
          color: #374151;
          line-height: 1.4;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace;
          white-space: pre-wrap;
          word-break: break-word;
        }

        @keyframes cardPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        @keyframes dots {
          0%, 20% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          .live-edit-indicators__empty {
            color: #9ca3af;
          }

          .live-edit-indicators__edit-card {
            background: #1e293b;
            border-color: #334155;
          }

          .live-edit-indicators__edit-card:hover {
            border-color: #475569;
          }

          .live-edit-indicators__user-name {
            color: #f1f5f9;
          }

          .live-edit-indicators__edit-duration {
            color: #94a3b8;
          }

          .live-edit-indicators__typing-badge {
            background: #064e3b;
            color: #34d399;
          }

          .live-edit-indicators__active-badge {
            background: #1e3a8a;
            color: #93c5fd;
          }

          .live-edit-indicators__edit-location {
            color: #cbd5e0;
          }

          .live-edit-indicators__entity-id {
            color: #94a3b8;
          }

          .live-edit-indicators__field-name {
            color: #6b7280;
          }

          .live-edit-indicators__cursor-info {
            background: #0f172a;
            color: #94a3b8;
            border-left-color: #334155;
          }

          .live-edit-indicators__selection-info {
            color: #6b7280;
          }

          .live-edit-indicators__content-preview {
            background: #0f172a;
            border-color: #334155;
          }

          .live-edit-indicators__content-label {
            color: #cbd5e0;
          }

          .live-edit-indicators__content-text {
            color: #e2e8f0;
          }
        }

        /* Responsive */
        @media (max-width: 640px) {
          .live-edit-indicators__edit-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .live-edit-indicators__user-info {
            gap: 8px;
          }

          .live-edit-indicators__user-avatar {
            width: 28px;
            height: 28px;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};
