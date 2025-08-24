import React, { useState } from 'react';
import { useOfflineSupport } from '../OfflineSupportProvider';
import type { DataConflict, ConflictResolutionStrategy } from '../types';

/**
 * Conflict Resolution Panel Component
 * 
 * Displays data conflicts that occur during synchronization and provides
 * UI for users to resolve conflicts using various strategies.
 */
interface ConflictResolutionPanelProps {
  conflicts: DataConflict[];
}

export const ConflictResolutionPanel: React.FC<ConflictResolutionPanelProps> = ({
  conflicts
}) => {
  const { resolveConflict } = useOfflineSupport();
  const [selectedConflict, setSelectedConflict] = useState<string | null>(null);
  const [customData, setCustomData] = useState<any>(null);
  const [isResolving, setIsResolving] = useState<Set<string>>(new Set());

  // Handle conflict resolution
  const handleResolveConflict = async (
    conflictId: string,
    strategy: ConflictResolutionStrategy,
    data?: any
  ) => {
    setIsResolving(prev => new Set(prev).add(conflictId));
    
    try {
      await resolveConflict(conflictId, strategy, data);
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    } finally {
      setIsResolving(prev => {
        const newSet = new Set(prev);
        newSet.delete(conflictId);
        return newSet;
      });
      setSelectedConflict(null);
      setCustomData(null);
    }
  };

  // Get conflict type info
  const getConflictTypeInfo = (type: string) => {
    switch (type) {
      case 'version_mismatch':
        return {
          icon: '🔄',
          label: 'Version Mismatch',
          description: 'Data was modified both locally and remotely',
          color: '#f59e0b'
        };
      case 'concurrent_edit':
        return {
          icon: '✏️',
          label: 'Concurrent Edit',
          description: 'Multiple users edited the same data simultaneously',
          color: '#3b82f6'
        };
      case 'delete_conflict':
        return {
          icon: '🗑️',
          label: 'Delete Conflict',
          description: 'Data was deleted locally but modified remotely',
          color: '#ef4444'
        };
      case 'schema_conflict':
        return {
          icon: '🏗️',
          label: 'Schema Conflict',
          description: 'Data structure changes conflict',
          color: '#8b5cf6'
        };
      default:
        return {
          icon: '⚠️',
          label: 'Unknown Conflict',
          description: 'An unrecognized conflict occurred',
          color: '#6b7280'
        };
    }
  };

  // Format data for display
  const formatDataPreview = (data: any): string => {
    if (!data) return 'No data';
    
    try {
      const preview = JSON.stringify(data, null, 2);
      return preview.length > 200 ? preview.slice(0, 200) + '...' : preview;
    } catch {
      return String(data).slice(0, 200);
    }
  };

  // Get entity type display name
  const getEntityTypeName = (type: string) => {
    const names = {
      'notebook': 'Notebook',
      'task': 'Task',
      'project': 'Project'
    };
    return names[type] || type;
  };

  // Format time
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${hours}h ago`;
  };

  if (conflicts.length === 0) {
    return (
      <div className="conflict-resolution-panel__empty">
        <div className="conflict-resolution-panel__empty-icon">✅</div>
        <h3>No Conflicts Detected</h3>
        <p>All your data is synchronized without any conflicts.</p>
      </div>
    );
  }

  return (
    <div className="conflict-resolution-panel">
      {/* Header */}
      <div className="conflict-resolution-panel__header">
        <h2 className="conflict-resolution-panel__title">
          ⚠️ Data Conflicts ({conflicts.length})
        </h2>
        <p className="conflict-resolution-panel__description">
          Resolve these conflicts to ensure your data stays synchronized.
        </p>
      </div>

      {/* Conflicts List */}
      <div className="conflict-resolution-panel__conflicts">
        {conflicts.map(conflict => {
          const typeInfo = getConflictTypeInfo(conflict.conflictType);
          const isSelected = selectedConflict === conflict.id;
          const isResolving_ = isResolving.has(conflict.id);

          return (
            <div 
              key={conflict.id}
              className={`conflict-resolution-panel__conflict ${isSelected ? 'expanded' : ''}`}
            >
              {/* Conflict Header */}
              <div className="conflict-resolution-panel__conflict-header">
                <div className="conflict-resolution-panel__conflict-info">
                  <div className="conflict-resolution-panel__conflict-type">
                    <span className="conflict-resolution-panel__conflict-icon">
                      {typeInfo.icon}
                    </span>
                    <div className="conflict-resolution-panel__conflict-details">
                      <div className="conflict-resolution-panel__conflict-title">
                        {typeInfo.label} - {getEntityTypeName(conflict.entityType)}
                      </div>
                      <div className="conflict-resolution-panel__conflict-subtitle">
                        {conflict.entityId} • {formatTime(conflict.detectedAt)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="conflict-resolution-panel__conflict-actions">
                  <button
                    onClick={() => setSelectedConflict(isSelected ? null : conflict.id)}
                    className="conflict-resolution-panel__expand-btn"
                    disabled={isResolving_}
                  >
                    {isResolving_ ? '🔄' : isSelected ? '▼' : '▶'}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isSelected && (
                <div className="conflict-resolution-panel__conflict-content">
                  {/* Conflict Description */}
                  <div className="conflict-resolution-panel__conflict-description">
                    <p>{typeInfo.description}</p>
                    <div className="conflict-resolution-panel__conflict-meta">
                      <span>Detected: {new Date(conflict.detectedAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Data Comparison */}
                  <div className="conflict-resolution-panel__data-comparison">
                    <div className="conflict-resolution-panel__data-section">
                      <h4 className="conflict-resolution-panel__data-title">
                        📱 Your Local Changes
                      </h4>
                      <pre className="conflict-resolution-panel__data-content">
                        {formatDataPreview(conflict.localData)}
                      </pre>
                    </div>

                    <div className="conflict-resolution-panel__data-section">
                      <h4 className="conflict-resolution-panel__data-title">
                        🌐 Remote Changes
                      </h4>
                      <pre className="conflict-resolution-panel__data-content">
                        {formatDataPreview(conflict.remoteData)}
                      </pre>
                    </div>
                  </div>

                  {/* Resolution Strategies */}
                  <div className="conflict-resolution-panel__resolution-strategies">
                    <h4 className="conflict-resolution-panel__strategies-title">
                      Choose Resolution Strategy:
                    </h4>

                    <div className="conflict-resolution-panel__strategy-buttons">
                      <button
                        onClick={() => handleResolveConflict(conflict.id, 'use_local')}
                        disabled={isResolving_}
                        className="conflict-resolution-panel__strategy-btn conflict-resolution-panel__strategy-btn--local"
                      >
                        <div className="conflict-resolution-panel__strategy-icon">📱</div>
                        <div className="conflict-resolution-panel__strategy-info">
                          <div className="conflict-resolution-panel__strategy-name">Use Local</div>
                          <div className="conflict-resolution-panel__strategy-desc">Keep your changes</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleResolveConflict(conflict.id, 'use_remote')}
                        disabled={isResolving_}
                        className="conflict-resolution-panel__strategy-btn conflict-resolution-panel__strategy-btn--remote"
                      >
                        <div className="conflict-resolution-panel__strategy-icon">🌐</div>
                        <div className="conflict-resolution-panel__strategy-info">
                          <div className="conflict-resolution-panel__strategy-name">Use Remote</div>
                          <div className="conflict-resolution-panel__strategy-desc">Accept remote changes</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleResolveConflict(conflict.id, 'merge_data')}
                        disabled={isResolving_}
                        className="conflict-resolution-panel__strategy-btn conflict-resolution-panel__strategy-btn--merge"
                      >
                        <div className="conflict-resolution-panel__strategy-icon">🔀</div>
                        <div className="conflict-resolution-panel__strategy-info">
                          <div className="conflict-resolution-panel__strategy-name">Auto Merge</div>
                          <div className="conflict-resolution-panel__strategy-desc">Combine both versions</div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleResolveConflict(conflict.id, 'create_copy')}
                        disabled={isResolving_}
                        className="conflict-resolution-panel__strategy-btn conflict-resolution-panel__strategy-btn--copy"
                      >
                        <div className="conflict-resolution-panel__strategy-icon">📄</div>
                        <div className="conflict-resolution-panel__strategy-info">
                          <div className="conflict-resolution-panel__strategy-name">Create Copy</div>
                          <div className="conflict-resolution-panel__strategy-desc">Keep both as separate items</div>
                        </div>
                      </button>
                    </div>

                    {/* Custom Resolution */}
                    <div className="conflict-resolution-panel__custom-resolution">
                      <details className="conflict-resolution-panel__custom-details">
                        <summary className="conflict-resolution-panel__custom-summary">
                          🛠️ Advanced: Custom Resolution
                        </summary>
                        
                        <div className="conflict-resolution-panel__custom-content">
                          <p>Manually edit the data to resolve the conflict:</p>
                          <textarea
                            value={customData ? JSON.stringify(customData, null, 2) : JSON.stringify(conflict.localData, null, 2)}
                            onChange={(e) => {
                              try {
                                setCustomData(JSON.parse(e.target.value));
                              } catch {
                                // Invalid JSON, don't update
                              }
                            }}
                            className="conflict-resolution-panel__custom-editor"
                            rows={8}
                            placeholder="Edit the JSON data to your desired state..."
                          />
                          
                          <button
                            onClick={() => handleResolveConflict(conflict.id, 'user_choice', customData || conflict.localData)}
                            disabled={isResolving_}
                            className="conflict-resolution-panel__custom-btn"
                          >
                            Apply Custom Resolution
                          </button>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bulk Actions */}
      {conflicts.length > 1 && (
        <div className="conflict-resolution-panel__bulk-actions">
          <h4 className="conflict-resolution-panel__bulk-title">Bulk Resolution:</h4>
          <div className="conflict-resolution-panel__bulk-buttons">
            <button
              onClick={() => {
                conflicts.forEach(conflict => {
                  if (!isResolving.has(conflict.id)) {
                    handleResolveConflict(conflict.id, 'use_local');
                  }
                });
              }}
              className="conflict-resolution-panel__bulk-btn"
              disabled={isResolving.size > 0}
            >
              📱 Use All Local
            </button>
            <button
              onClick={() => {
                conflicts.forEach(conflict => {
                  if (!isResolving.has(conflict.id)) {
                    handleResolveConflict(conflict.id, 'use_remote');
                  }
                });
              }}
              className="conflict-resolution-panel__bulk-btn"
              disabled={isResolving.size > 0}
            >
              🌐 Use All Remote
            </button>
            <button
              onClick={() => {
                conflicts.forEach(conflict => {
                  if (!isResolving.has(conflict.id)) {
                    handleResolveConflict(conflict.id, 'merge_data');
                  }
                });
              }}
              className="conflict-resolution-panel__bulk-btn"
              disabled={isResolving.size > 0}
            >
              🔀 Auto Merge All
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .conflict-resolution-panel {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .conflict-resolution-panel__header {
          padding: 20px;
          border-bottom: 1px solid #f1f5f9;
          background: #fef2f2;
        }

        .conflict-resolution-panel__title {
          margin: 0 0 8px 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #dc2626;
        }

        .conflict-resolution-panel__description {
          margin: 0;
          font-size: 0.875rem;
          color: #7f1d1d;
        }

        .conflict-resolution-panel__conflicts {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: #f1f5f9;
        }

        .conflict-resolution-panel__conflict {
          background: white;
          transition: all 0.2s ease;
        }

        .conflict-resolution-panel__conflict.expanded {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .conflict-resolution-panel__conflict-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          cursor: pointer;
        }

        .conflict-resolution-panel__conflict-header:hover {
          background: #f8fafc;
        }

        .conflict-resolution-panel__conflict-type {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .conflict-resolution-panel__conflict-icon {
          font-size: 1.5rem;
        }

        .conflict-resolution-panel__conflict-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 2px;
        }

        .conflict-resolution-panel__conflict-subtitle {
          font-size: 0.75rem;
          color: #64748b;
        }

        .conflict-resolution-panel__expand-btn {
          padding: 4px 8px;
          background: none;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: monospace;
        }

        .conflict-resolution-panel__expand-btn:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .conflict-resolution-panel__expand-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .conflict-resolution-panel__conflict-content {
          border-top: 1px solid #f1f5f9;
          padding: 20px;
          background: #fafafa;
        }

        .conflict-resolution-panel__conflict-description {
          margin-bottom: 20px;
          padding: 12px;
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 6px;
        }

        .conflict-resolution-panel__conflict-description p {
          margin: 0 0 8px 0;
          color: #92400e;
          font-size: 0.875rem;
        }

        .conflict-resolution-panel__conflict-meta {
          font-size: 0.75rem;
          color: #b45309;
        }

        .conflict-resolution-panel__data-comparison {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .conflict-resolution-panel__data-section {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .conflict-resolution-panel__data-title {
          margin: 0;
          padding: 12px 16px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          background: #f8fafc;
          border-bottom: 1px solid #e5e7eb;
        }

        .conflict-resolution-panel__data-content {
          padding: 16px;
          margin: 0;
          font-size: 0.75rem;
          font-family: monospace;
          color: #1f2937;
          background: white;
          max-height: 200px;
          overflow-y: auto;
          line-height: 1.4;
        }

        .conflict-resolution-panel__resolution-strategies {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
        }

        .conflict-resolution-panel__strategies-title {
          margin: 0 0 16px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .conflict-resolution-panel__strategy-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        .conflict-resolution-panel__strategy-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .conflict-resolution-panel__strategy-btn:hover:not(:disabled) {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .conflict-resolution-panel__strategy-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .conflict-resolution-panel__strategy-btn--local:hover:not(:disabled) {
          border-color: #10b981;
          background: #f0fdf4;
        }

        .conflict-resolution-panel__strategy-btn--remote:hover:not(:disabled) {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .conflict-resolution-panel__strategy-btn--merge:hover:not(:disabled) {
          border-color: #8b5cf6;
          background: #f5f3ff;
        }

        .conflict-resolution-panel__strategy-btn--copy:hover:not(:disabled) {
          border-color: #f59e0b;
          background: #fffbeb;
        }

        .conflict-resolution-panel__strategy-icon {
          font-size: 1.5rem;
        }

        .conflict-resolution-panel__strategy-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 2px;
        }

        .conflict-resolution-panel__strategy-desc {
          font-size: 0.75rem;
          color: #64748b;
        }

        .conflict-resolution-panel__custom-resolution {
          border-top: 1px solid #e5e7eb;
          padding-top: 16px;
        }

        .conflict-resolution-panel__custom-details {
          border: 1px solid #d1d5db;
          border-radius: 6px;
        }

        .conflict-resolution-panel__custom-summary {
          padding: 12px 16px;
          background: #f8fafc;
          cursor: pointer;
          font-weight: 500;
          color: #374151;
        }

        .conflict-resolution-panel__custom-summary:hover {
          background: #f1f5f9;
        }

        .conflict-resolution-panel__custom-content {
          padding: 16px;
          border-top: 1px solid #e5e7eb;
        }

        .conflict-resolution-panel__custom-content p {
          margin: 0 0 12px 0;
          font-size: 0.875rem;
          color: #374151;
        }

        .conflict-resolution-panel__custom-editor {
          width: 100%;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-family: monospace;
          font-size: 0.75rem;
          line-height: 1.4;
          resize: vertical;
          margin-bottom: 12px;
        }

        .conflict-resolution-panel__custom-btn {
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .conflict-resolution-panel__custom-btn:hover:not(:disabled) {
          background: #2563eb;
        }

        .conflict-resolution-panel__custom-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .conflict-resolution-panel__bulk-actions {
          padding: 20px;
          border-top: 1px solid #e5e7eb;
          background: #f8fafc;
        }

        .conflict-resolution-panel__bulk-title {
          margin: 0 0 12px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .conflict-resolution-panel__bulk-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .conflict-resolution-panel__bulk-btn {
          padding: 8px 16px;
          background: #6b7280;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .conflict-resolution-panel__bulk-btn:hover:not(:disabled) {
          background: #4b5563;
        }

        .conflict-resolution-panel__bulk-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .conflict-resolution-panel__empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;
          color: #64748b;
        }

        .conflict-resolution-panel__empty-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .conflict-resolution-panel__empty h3 {
          margin: 0 0 8px 0;
          color: #1e293b;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .conflict-resolution-panel__empty p {
          margin: 0;
          color: #64748b;
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          .conflict-resolution-panel {
            background: #1e293b;
            border-color: #334155;
          }

          .conflict-resolution-panel__header {
            background: #450a0a;
            border-color: #7f1d1d;
          }

          .conflict-resolution-panel__title {
            color: #fca5a5;
          }

          .conflict-resolution-panel__description {
            color: #fbbf24;
          }

          .conflict-resolution-panel__conflicts {
            background: #334155;
          }

          .conflict-resolution-panel__conflict {
            background: #1e293b;
          }

          .conflict-resolution-panel__conflict-header:hover {
            background: #334155;
          }

          .conflict-resolution-panel__conflict-title {
            color: #f1f5f9;
          }

          .conflict-resolution-panel__conflict-subtitle {
            color: #94a3b8;
          }

          .conflict-resolution-panel__expand-btn {
            background: #374151;
            border-color: #4b5563;
            color: #d1d5db;
          }

          .conflict-resolution-panel__expand-btn:hover:not(:disabled) {
            background: #4b5563;
            border-color: #6b7280;
          }

          .conflict-resolution-panel__conflict-content {
            background: #0f172a;
            border-color: #334155;
          }

          .conflict-resolution-panel__conflict-description {
            background: #451a03;
            border-color: #92400e;
          }

          .conflict-resolution-panel__conflict-description p {
            color: #fbbf24;
          }

          .conflict-resolution-panel__conflict-meta {
            color: #d97706;
          }

          .conflict-resolution-panel__data-section {
            background: #1e293b;
            border-color: #334155;
          }

          .conflict-resolution-panel__data-title {
            background: #0f172a;
            color: #f1f5f9;
            border-color: #334155;
          }

          .conflict-resolution-panel__data-content {
            background: #1e293b;
            color: #cbd5e0;
          }

          .conflict-resolution-panel__resolution-strategies {
            background: #1e293b;
            border-color: #334155;
          }

          .conflict-resolution-panel__strategies-title {
            color: #f1f5f9;
          }

          .conflict-resolution-panel__strategy-btn {
            background: #1e293b;
            border-color: #334155;
          }

          .conflict-resolution-panel__strategy-name {
            color: #f1f5f9;
          }

          .conflict-resolution-panel__strategy-desc {
            color: #94a3b8;
          }

          .conflict-resolution-panel__custom-details {
            border-color: #4b5563;
          }

          .conflict-resolution-panel__custom-summary {
            background: #0f172a;
            color: #e2e8f0;
          }

          .conflict-resolution-panel__custom-summary:hover {
            background: #1e293b;
          }

          .conflict-resolution-panel__custom-content {
            border-color: #334155;
          }

          .conflict-resolution-panel__custom-content p {
            color: #e2e8f0;
          }

          .conflict-resolution-panel__custom-editor {
            background: #1e293b;
            border-color: #4b5563;
            color: #f1f5f9;
          }

          .conflict-resolution-panel__bulk-actions {
            background: #0f172a;
            border-color: #334155;
          }

          .conflict-resolution-panel__bulk-title {
            color: #f1f5f9;
          }

          .conflict-resolution-panel__empty h3 {
            color: #f1f5f9;
          }

          .conflict-resolution-panel__empty p {
            color: #94a3b8;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .conflict-resolution-panel__data-comparison {
            grid-template-columns: 1fr;
          }

          .conflict-resolution-panel__strategy-buttons {
            grid-template-columns: 1fr;
          }

          .conflict-resolution-panel__bulk-buttons {
            flex-direction: column;
          }

          .conflict-resolution-panel__bulk-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
