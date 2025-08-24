import React, { useState } from 'react';
import { useCollaboration } from '../CollaborationProvider';
import type { ConflictResolution, ConflictStrategy, CollaborativeUpdate } from '../types';

/**
 * Conflict Resolution Panel Component
 * 
 * Displays active conflicts and provides interfaces for resolving them
 * with different strategies and preview capabilities.
 */
interface ConflictResolutionPanelProps {
  conflicts: ConflictResolution[];
  layout?: 'compact' | 'detailed';
  onConflictResolved?: (conflict: ConflictResolution) => void;
}

export const ConflictResolutionPanel: React.FC<ConflictResolutionPanelProps> = ({
  conflicts,
  layout = 'detailed',
  onConflictResolved
}) => {
  const { resolveConflict, collaborators } = useCollaboration();
  const [expandedConflict, setExpandedConflict] = useState<string | null>(null);
  const [previewStrategy, setPreviewStrategy] = useState<Record<string, ConflictStrategy>>({});
  const [customResolutions, setCustomResolutions] = useState<Record<string, string>>({});

  // Get user name by ID
  const getUserName = (userId: string) => {
    const user = collaborators.find(u => u.id === userId);
    return user?.name || 'Unknown User';
  };

  // Get strategy display names
  const getStrategyLabel = (strategy: ConflictStrategy) => {
    const labels: Record<ConflictStrategy, string> = {
      'last_writer_wins': 'Keep Latest Change',
      'first_writer_wins': 'Keep First Change',
      'merge_changes': 'Merge Changes',
      'user_choice': 'Manual Selection',
      'custom_resolution': 'Custom Solution'
    };
    return labels[strategy] || strategy;
  };

  // Get strategy description
  const getStrategyDescription = (strategy: ConflictStrategy) => {
    const descriptions: Record<ConflictStrategy, string> = {
      'last_writer_wins': 'Accept the most recent change and discard others',
      'first_writer_wins': 'Keep the first change and discard later ones',
      'merge_changes': 'Automatically combine non-conflicting changes',
      'user_choice': 'Let you choose which version to keep',
      'custom_resolution': 'Create a custom solution'
    };
    return descriptions[strategy] || 'Unknown strategy';
  };

  // Handle conflict resolution
  const handleResolveConflict = (conflictId: string, strategy: ConflictStrategy, customData?: any) => {
    resolveConflict(conflictId, strategy, customData);
    
    const resolvedConflict = conflicts.find(c => c.id === conflictId);
    if (resolvedConflict) {
      onConflictResolved?.(resolvedConflict);
    }
    
    // Close expanded view
    if (expandedConflict === conflictId) {
      setExpandedConflict(null);
    }
  };

  // Preview resolution result
  const previewResolution = (conflict: ConflictResolution, strategy: ConflictStrategy): any => {
    switch (strategy) {
      case 'last_writer_wins':
        return conflict.updates.reduce((latest, current) => 
          current.timestamp > latest.timestamp ? current : latest
        ).operation.value;
      
      case 'first_writer_wins':
        return conflict.updates.reduce((earliest, current) => 
          current.timestamp < earliest.timestamp ? current : earliest
        ).operation.value;
      
      case 'merge_changes':
        return conflict.updates.reduce((result, update) => {
          if (typeof result === 'object' && typeof update.operation.value === 'object') {
            return { ...result, ...update.operation.value };
          }
          return update.operation.value;
        }, {});
      
      default:
        return conflict.updates[0]?.operation.value;
    }
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Get conflict severity
  const getConflictSeverity = (conflict: ConflictResolution): 'low' | 'medium' | 'high' => {
    const age = Date.now() - Math.min(...conflict.updates.map(u => u.timestamp));
    const userCount = new Set(conflict.updates.map(u => u.userId)).size;
    
    if (age > 300000 || userCount > 2) return 'high'; // > 5 minutes or > 2 users
    if (age > 60000 || userCount > 1) return 'medium'; // > 1 minute or > 1 user
    return 'low';
  };

  if (conflicts.length === 0) {
    return null;
  }

  // Compact layout for sidebars
  if (layout === 'compact') {
    return (
      <div className="conflict-panel conflict-panel--compact">
        {conflicts.slice(0, 3).map(conflict => {
          const severity = getConflictSeverity(conflict);
          const userCount = new Set(conflict.updates.map(u => u.userId)).size;
          
          return (
            <div key={conflict.id} className={`conflict-panel__item conflict-panel__item--${severity}`}>
              <div className="conflict-panel__header">
                <span className="conflict-panel__icon">⚠️</span>
                <div className="conflict-panel__info">
                  <div className="conflict-panel__entity">
                    {conflict.updates[0].entityType} conflict
                  </div>
                  <div className="conflict-panel__users">
                    {userCount} user{userCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              
              <div className="conflict-panel__actions">
                <button
                  onClick={() => handleResolveConflict(conflict.id, 'last_writer_wins')}
                  className="conflict-panel__quick-resolve"
                  title="Accept latest change"
                >
                  ✅
                </button>
              </div>
            </div>
          );
        })}

        <style jsx>{`
          .conflict-panel--compact {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .conflict-panel__item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            border-radius: 6px;
            border-left: 3px solid;
          }

          .conflict-panel__item--low {
            background: #fef3c7;
            border-left-color: #f59e0b;
          }

          .conflict-panel__item--medium {
            background: #fed7aa;
            border-left-color: #ea580c;
          }

          .conflict-panel__item--high {
            background: #fecaca;
            border-left-color: #dc2626;
          }

          .conflict-panel__header {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .conflict-panel__icon {
            font-size: 0.875rem;
          }

          .conflict-panel__info {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .conflict-panel__entity {
            font-size: 0.75rem;
            font-weight: 600;
            color: #92400e;
          }

          .conflict-panel__users {
            font-size: 0.6875rem;
            color: #b45309;
          }

          .conflict-panel__quick-resolve {
            padding: 4px;
            background: none;
            border: none;
            font-size: 0.75rem;
            cursor: pointer;
            border-radius: 3px;
            transition: background 0.2s ease;
          }

          .conflict-panel__quick-resolve:hover {
            background: rgba(0, 0, 0, 0.1);
          }

          /* Dark theme */
          @media (prefers-color-scheme: dark) {
            .conflict-panel__item--low {
              background: #451a03;
              border-left-color: #d97706;
            }

            .conflict-panel__item--medium {
              background: #431407;
              border-left-color: #ea580c;
            }

            .conflict-panel__item--high {
              background: #450a0a;
              border-left-color: #dc2626;
            }

            .conflict-panel__entity {
              color: #fbbf24;
            }

            .conflict-panel__users {
              color: #d97706;
            }
          }
        `}</style>
      </div>
    );
  }

  // Detailed layout for full dashboard
  return (
    <div className="conflict-panel conflict-panel--detailed">
      {conflicts.map(conflict => {
        const isExpanded = expandedConflict === conflict.id;
        const severity = getConflictSeverity(conflict);
        const involvedUsers = [...new Set(conflict.updates.map(u => u.userId))];
        
        return (
          <div key={conflict.id} className={`conflict-panel__conflict conflict-panel__conflict--${severity}`}>
            {/* Conflict Header */}
            <div 
              className="conflict-panel__conflict-header"
              onClick={() => setExpandedConflict(isExpanded ? null : conflict.id)}
            >
              <div className="conflict-panel__conflict-info">
                <div className="conflict-panel__conflict-title">
                  <span className="conflict-panel__severity-indicator">
                    {severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '🟢'}
                  </span>
                  Conflict in {conflict.updates[0].entityType} "{conflict.updates[0].entityId}"
                </div>
                <div className="conflict-panel__conflict-details">
                  {involvedUsers.length} users • {conflict.updates.length} changes • {getStrategyLabel(conflict.resolutionStrategy)}
                </div>
              </div>
              
              <div className="conflict-panel__conflict-actions">
                <button 
                  className="conflict-panel__expand-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedConflict(isExpanded ? null : conflict.id);
                  }}
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
              </div>
            </div>

            {/* Expanded Conflict Details */}
            {isExpanded && (
              <div className="conflict-panel__conflict-details-panel">
                {/* Updates List */}
                <div className="conflict-panel__updates">
                  <h4 className="conflict-panel__section-title">Conflicting Changes</h4>
                  <div className="conflict-panel__updates-list">
                    {conflict.updates.map((update, index) => (
                      <div key={`${update.id}-${index}`} className="conflict-panel__update">
                        <div className="conflict-panel__update-header">
                          <span className="conflict-panel__update-user">
                            {getUserName(update.userId)}
                          </span>
                          <span className="conflict-panel__update-time">
                            {formatTime(update.timestamp)}
                          </span>
                        </div>
                        <div className="conflict-panel__update-change">
                          <strong>{update.type}:</strong> {update.operation.path || 'content'}
                        </div>
                        <div className="conflict-panel__update-value">
                          <div className="conflict-panel__value-label">New value:</div>
                          <div className="conflict-panel__value-content">
                            {typeof update.operation.value === 'string' 
                              ? update.operation.value 
                              : JSON.stringify(update.operation.value, null, 2)
                            }
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resolution Strategies */}
                <div className="conflict-panel__resolution">
                  <h4 className="conflict-panel__section-title">Resolution Options</h4>
                  
                  <div className="conflict-panel__strategies">
                    {(['last_writer_wins', 'first_writer_wins', 'merge_changes', 'user_choice'] as ConflictStrategy[]).map(strategy => (
                      <div key={strategy} className="conflict-panel__strategy">
                        <div className="conflict-panel__strategy-header">
                          <input
                            type="radio"
                            id={`${conflict.id}-${strategy}`}
                            name={`conflict-${conflict.id}`}
                            value={strategy}
                            checked={previewStrategy[conflict.id] === strategy}
                            onChange={() => setPreviewStrategy(prev => ({ ...prev, [conflict.id]: strategy }))}
                          />
                          <label htmlFor={`${conflict.id}-${strategy}`} className="conflict-panel__strategy-label">
                            {getStrategyLabel(strategy)}
                          </label>
                        </div>
                        <div className="conflict-panel__strategy-description">
                          {getStrategyDescription(strategy)}
                        </div>
                        
                        {previewStrategy[conflict.id] === strategy && (
                          <div className="conflict-panel__preview">
                            <div className="conflict-panel__preview-label">Preview:</div>
                            <div className="conflict-panel__preview-content">
                              {strategy === 'user_choice' ? (
                                <div className="conflict-panel__user-choice">
                                  {conflict.updates.map((update, index) => (
                                    <label key={index} className="conflict-panel__choice-option">
                                      <input
                                        type="radio"
                                        name={`choice-${conflict.id}`}
                                        value={index}
                                        onChange={() => {
                                          setCustomResolutions(prev => ({
                                            ...prev,
                                            [conflict.id]: JSON.stringify(update.operation.value)
                                          }));
                                        }}
                                      />
                                      <span>
                                        {getUserName(update.userId)}'s change: {typeof update.operation.value === 'string' 
                                          ? update.operation.value 
                                          : JSON.stringify(update.operation.value)
                                        }
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              ) : (
                                <div className="conflict-panel__preview-value">
                                  {typeof previewResolution(conflict, strategy) === 'string'
                                    ? previewResolution(conflict, strategy)
                                    : JSON.stringify(previewResolution(conflict, strategy), null, 2)
                                  }
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Resolution Actions */}
                  <div className="conflict-panel__resolution-actions">
                    <button
                      onClick={() => {
                        const strategy = previewStrategy[conflict.id] || 'last_writer_wins';
                        const customData = strategy === 'user_choice' 
                          ? { chosenValue: customResolutions[conflict.id] }
                          : undefined;
                        handleResolveConflict(conflict.id, strategy, customData);
                      }}
                      className="conflict-panel__resolve-btn"
                      disabled={previewStrategy[conflict.id] === 'user_choice' && !customResolutions[conflict.id]}
                    >
                      Resolve Conflict
                    </button>
                    
                    <button
                      onClick={() => setExpandedConflict(null)}
                      className="conflict-panel__cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <style jsx>{`
        .conflict-panel--detailed {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .conflict-panel__conflict {
          border-radius: 8px;
          border: 1px solid;
          overflow: hidden;
          background: white;
        }

        .conflict-panel__conflict--low {
          border-color: #f59e0b;
          background: #fffbeb;
        }

        .conflict-panel__conflict--medium {
          border-color: #ea580c;
          background: #fff7ed;
        }

        .conflict-panel__conflict--high {
          border-color: #dc2626;
          background: #fef2f2;
        }

        .conflict-panel__conflict-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .conflict-panel__conflict-header:hover {
          background: rgba(0, 0, 0, 0.02);
        }

        .conflict-panel__conflict-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .conflict-panel__conflict-details {
          font-size: 0.875rem;
          color: #64748b;
        }

        .conflict-panel__expand-btn {
          padding: 8px;
          background: none;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: monospace;
        }

        .conflict-panel__expand-btn:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .conflict-panel__conflict-details-panel {
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          background: rgba(0, 0, 0, 0.02);
        }

        .conflict-panel__section-title {
          margin: 0 0 12px 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .conflict-panel__updates {
          padding: 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .conflict-panel__updates-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .conflict-panel__update {
          padding: 12px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }

        .conflict-panel__update-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .conflict-panel__update-user {
          font-weight: 600;
          color: #1e293b;
          font-size: 0.875rem;
        }

        .conflict-panel__update-time {
          font-size: 0.75rem;
          color: #64748b;
        }

        .conflict-panel__update-change {
          font-size: 0.875rem;
          color: #374151;
          margin-bottom: 8px;
        }

        .conflict-panel__update-value {
          font-size: 0.75rem;
        }

        .conflict-panel__value-label {
          color: #64748b;
          margin-bottom: 4px;
        }

        .conflict-panel__value-content {
          padding: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-family: monospace;
          white-space: pre-wrap;
          word-break: break-all;
          max-height: 100px;
          overflow-y: auto;
        }

        .conflict-panel__resolution {
          padding: 20px;
        }

        .conflict-panel__strategies {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
        }

        .conflict-panel__strategy {
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: white;
        }

        .conflict-panel__strategy-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .conflict-panel__strategy-label {
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
        }

        .conflict-panel__strategy-description {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 8px;
        }

        .conflict-panel__preview {
          margin-top: 12px;
          padding: 12px;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 4px;
        }

        .conflict-panel__preview-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #0c4a6e;
          margin-bottom: 8px;
        }

        .conflict-panel__preview-content {
          font-size: 0.875rem;
          color: #1e293b;
        }

        .conflict-panel__preview-value {
          padding: 8px;
          background: white;
          border: 1px solid #e0e7ff;
          border-radius: 4px;
          font-family: monospace;
          white-space: pre-wrap;
        }

        .conflict-panel__user-choice {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .conflict-panel__choice-option {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .conflict-panel__choice-option:hover {
          background: rgba(59, 130, 246, 0.05);
        }

        .conflict-panel__resolution-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .conflict-panel__resolve-btn {
          padding: 10px 20px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .conflict-panel__resolve-btn:hover:not(:disabled) {
          background: #2563eb;
        }

        .conflict-panel__resolve-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .conflict-panel__cancel-btn {
          padding: 10px 20px;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .conflict-panel__cancel-btn:hover {
          background: #e5e7eb;
          border-color: #9ca3af;
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          .conflict-panel__conflict {
            background: #1e293b;
          }

          .conflict-panel__conflict--low {
            border-color: #d97706;
            background: #451a03;
          }

          .conflict-panel__conflict--medium {
            border-color: #ea580c;
            background: #431407;
          }

          .conflict-panel__conflict--high {
            border-color: #dc2626;
            background: #450a0a;
          }

          .conflict-panel__conflict-header:hover {
            background: rgba(255, 255, 255, 0.05);
          }

          .conflict-panel__conflict-title {
            color: #f1f5f9;
          }

          .conflict-panel__conflict-details {
            color: #cbd5e0;
          }

          .conflict-panel__expand-btn {
            background: #374151;
            border-color: #4b5563;
            color: #f9fafb;
          }

          .conflict-panel__expand-btn:hover {
            background: #4b5563;
            border-color: #6b7280;
          }

          .conflict-panel__conflict-details-panel {
            background: rgba(255, 255, 255, 0.05);
          }

          .conflict-panel__section-title {
            color: #e2e8f0;
          }

          .conflict-panel__update {
            background: #0f172a;
            border-color: #334155;
          }

          .conflict-panel__update-user {
            color: #f1f5f9;
          }

          .conflict-panel__update-time {
            color: #94a3b8;
          }

          .conflict-panel__update-change {
            color: #cbd5e0;
          }

          .conflict-panel__value-content {
            background: #1e293b;
            border-color: #334155;
            color: #e2e8f0;
          }

          .conflict-panel__strategy {
            background: #0f172a;
            border-color: #334155;
          }

          .conflict-panel__strategy-label {
            color: #f1f5f9;
          }

          .conflict-panel__strategy-description {
            color: #94a3b8;
          }

          .conflict-panel__preview {
            background: #1e3a8a;
            border-color: #3b82f6;
          }

          .conflict-panel__preview-label {
            color: #93c5fd;
          }

          .conflict-panel__preview-value {
            background: #1e293b;
            border-color: #475569;
            color: #f1f5f9;
          }

          .conflict-panel__cancel-btn {
            background: #374151;
            border-color: #4b5563;
            color: #f9fafb;
          }

          .conflict-panel__cancel-btn:hover {
            background: #4b5563;
            border-color: #6b7280;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .conflict-panel__resolution-actions {
            flex-direction: column;
          }

          .conflict-panel__resolve-btn,
          .conflict-panel__cancel-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
