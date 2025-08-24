import React, { useState } from 'react';
import { useAnalytics } from '../AnalyticsProvider';
import type { GoalTrackerProps } from '../types';

/**
 * Goal Tracker Component
 * Displays productivity goal progress with milestones
 */
export const GoalTracker: React.FC<GoalTrackerProps> = ({
  goal,
  onGoalUpdate,
  showProgress = true,
  showMilestones = true
}) => {
  const { updateGoal } = useAnalytics();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdateProgress = async (newCurrent: number) => {
    if (newCurrent === goal.current) return;

    setLoading(true);
    try {
      const progress = Math.min((newCurrent / goal.target) * 100, 100);
      const status = progress >= 100 ? 'completed' : goal.status;
      const completedAt = progress >= 100 && !goal.completedAt ? new Date() : goal.completedAt;

      await updateGoal(goal.id, {
        current: newCurrent,
        progress,
        status,
        completedAt
      });

      onGoalUpdate?.({ ...goal, current: newCurrent, progress, status, completedAt });
    } catch (error) {
      console.error('Failed to update goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGoalIcon = () => {
    switch (goal.category) {
      case 'productivity':
        return '⚡';
      case 'efficiency':
        return '🚀';
      case 'learning':
        return '📚';
      case 'organization':
        return '📁';
      case 'collaboration':
        return '👥';
      case 'personal':
        return '👤';
      case 'team':
        return '👥';
      case 'system':
        return '⚙️';
      default:
        return '🎯';
    }
  };

  const getStatusColor = () => {
    switch (goal.status) {
      case 'active':
        return '#3b82f6'; // blue
      case 'completed':
        return '#10b981'; // green
      case 'paused':
        return '#f59e0b'; // amber
      case 'failed':
        return '#ef4444'; // red
      case 'archived':
        return '#6b7280'; // gray
      default:
        return '#64748b';
    }
  };

  const getPriorityColor = () => {
    switch (goal.priority) {
      case 'high':
        return '#dc2626'; // red
      case 'medium':
        return '#ea580c'; // orange
      case 'low':
        return '#16a34a'; // green
      default:
        return '#64748b';
    }
  };

  const formatMetricValue = (value: number) => {
    switch (goal.metric) {
      case 'time_saved':
        return `${value}h`;
      case 'consistency_days':
        return `${value} days`;
      case 'efficiency_score':
        return `${value}%`;
      default:
        return value.toString();
    }
  };

  const daysRemaining = () => {
    const now = new Date();
    const end = new Date(goal.timeframe.end);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const getProgressBarColor = () => {
    if (goal.progress >= 100) return '#10b981'; // green
    if (goal.progress >= 75) return '#3b82f6'; // blue
    if (goal.progress >= 50) return '#f59e0b'; // amber
    if (goal.progress >= 25) return '#ea580c'; // orange
    return '#ef4444'; // red
  };

  return (
    <div className="goal-tracker">
      <div className="goal-tracker__header">
        <div className="goal-tracker__title-section">
          <span className="goal-tracker__icon">{getGoalIcon()}</span>
          <div className="goal-tracker__title-content">
            <h3 className="goal-tracker__title">{goal.title}</h3>
            {goal.description && (
              <p className="goal-tracker__description">{goal.description}</p>
            )}
          </div>
        </div>

        <div className="goal-tracker__meta">
          <span 
            className="goal-tracker__status"
            style={{ color: getStatusColor() }}
          >
            {goal.status.toUpperCase()}
          </span>
          <span 
            className="goal-tracker__priority"
            style={{ color: getPriorityColor() }}
          >
            {goal.priority.toUpperCase()}
          </span>
        </div>
      </div>

      {showProgress && (
        <div className="goal-tracker__progress-section">
          <div className="goal-tracker__progress-info">
            <div className="goal-tracker__progress-values">
              <span className="goal-tracker__current">
                {formatMetricValue(goal.current)}
              </span>
              <span className="goal-tracker__separator">/</span>
              <span className="goal-tracker__target">
                {formatMetricValue(goal.target)} {goal.unit}
              </span>
            </div>
            <div className="goal-tracker__progress-percentage">
              {Math.round(goal.progress)}%
            </div>
          </div>

          <div className="goal-tracker__progress-bar">
            <div 
              className="goal-tracker__progress-fill"
              style={{ 
                width: `${Math.min(goal.progress, 100)}%`,
                backgroundColor: getProgressBarColor()
              }}
            >
              {goal.progress >= 100 && (
                <span className="goal-tracker__completion-icon">✓</span>
              )}
            </div>
          </div>

          <div className="goal-tracker__time-info">
            <span className="goal-tracker__timeframe">
              {goal.timeframe.type.charAt(0).toUpperCase() + goal.timeframe.type.slice(1)}
            </span>
            {goal.status !== 'completed' && daysRemaining() > 0 && (
              <span className="goal-tracker__days-remaining">
                {daysRemaining()} days left
              </span>
            )}
            {goal.status === 'completed' && goal.completedAt && (
              <span className="goal-tracker__completed-date">
                Completed {goal.completedAt.toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}

      {showMilestones && goal.milestones.length > 0 && (
        <div className="goal-tracker__milestones">
          <h4 className="goal-tracker__milestones-title">Milestones</h4>
          <div className="goal-tracker__milestones-list">
            {goal.milestones.map(milestone => (
              <div 
                key={milestone.id}
                className={`goal-tracker__milestone ${milestone.completed ? 'goal-tracker__milestone--completed' : ''}`}
              >
                <div className="goal-tracker__milestone-indicator">
                  {milestone.completed ? '✓' : '○'}
                </div>
                <div className="goal-tracker__milestone-content">
                  <span className="goal-tracker__milestone-title">
                    {milestone.title}
                  </span>
                  <span className="goal-tracker__milestone-target">
                    {formatMetricValue(milestone.target)}
                  </span>
                  {milestone.completed && milestone.completedAt && (
                    <span className="goal-tracker__milestone-date">
                      {milestone.completedAt.toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isEditing && (
        <div className="goal-tracker__editor">
          <div className="goal-tracker__input-group">
            <label className="goal-tracker__label">Current Progress</label>
            <input
              type="number"
              min="0"
              max={goal.target}
              defaultValue={goal.current}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                handleUpdateProgress(value);
              }}
              className="goal-tracker__input"
              disabled={loading}
            />
          </div>
          
          <div className="goal-tracker__editor-actions">
            <button
              onClick={() => setIsEditing(false)}
              className="goal-tracker__button goal-tracker__button--secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="goal-tracker__actions">
        {!isEditing && goal.status === 'active' && (
          <button
            onClick={() => setIsEditing(true)}
            className="goal-tracker__button goal-tracker__button--primary"
          >
            📝 Update Progress
          </button>
        )}
        
        {goal.status === 'completed' && (
          <div className="goal-tracker__completion-badge">
            🎉 Goal Completed!
          </div>
        )}

        {goal.status === 'paused' && (
          <button
            onClick={() => updateGoal(goal.id, { status: 'active' })}
            className="goal-tracker__button goal-tracker__button--primary"
          >
            ▶️ Resume
          </button>
        )}

        {goal.status === 'active' && (
          <button
            onClick={() => updateGoal(goal.id, { status: 'paused' })}
            className="goal-tracker__button goal-tracker__button--secondary"
          >
            ⏸️ Pause
          </button>
        )}
      </div>

      <style jsx>{`
        .goal-tracker {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .goal-tracker:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border-color: #cbd5e1;
        }

        .goal-tracker__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .goal-tracker__title-section {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
        }

        .goal-tracker__icon {
          font-size: 1.5rem;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .goal-tracker__title-content {
          flex: 1;
        }

        .goal-tracker__title {
          margin: 0 0 4px;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1a202c;
          line-height: 1.3;
        }

        .goal-tracker__description {
          margin: 0;
          color: #64748b;
          font-size: 0.875rem;
          line-height: 1.4;
        }

        .goal-tracker__meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .goal-tracker__status,
        .goal-tracker__priority {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .goal-tracker__progress-section {
          margin-bottom: 16px;
        }

        .goal-tracker__progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .goal-tracker__progress-values {
          display: flex;
          align-items: baseline;
          gap: 4px;
          font-weight: 600;
        }

        .goal-tracker__current {
          font-size: 1.25rem;
          color: #1a202c;
        }

        .goal-tracker__separator {
          color: #64748b;
        }

        .goal-tracker__target {
          color: #64748b;
        }

        .goal-tracker__progress-percentage {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1a202c;
        }

        .goal-tracker__progress-bar {
          width: 100%;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .goal-tracker__progress-fill {
          height: 100%;
          border-radius: 4px;
          position: relative;
          transition: width 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 4px;
        }

        .goal-tracker__completion-icon {
          color: white;
          font-size: 0.75rem;
          font-weight: bold;
        }

        .goal-tracker__time-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: #64748b;
        }

        .goal-tracker__timeframe {
          font-weight: 500;
        }

        .goal-tracker__days-remaining,
        .goal-tracker__completed-date {
          font-weight: 500;
        }

        .goal-tracker__milestones {
          margin-bottom: 16px;
        }

        .goal-tracker__milestones-title {
          margin: 0 0 12px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #1a202c;
        }

        .goal-tracker__milestones-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .goal-tracker__milestone {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
        }

        .goal-tracker__milestone--completed {
          opacity: 0.7;
        }

        .goal-tracker__milestone-indicator {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: bold;
          flex-shrink: 0;
        }

        .goal-tracker__milestone--completed .goal-tracker__milestone-indicator {
          background: #10b981;
          color: white;
        }

        .goal-tracker__milestone:not(.goal-tracker__milestone--completed) .goal-tracker__milestone-indicator {
          background: #e2e8f0;
          color: #64748b;
        }

        .goal-tracker__milestone-content {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .goal-tracker__milestone-title {
          font-size: 0.875rem;
          color: #374151;
        }

        .goal-tracker__milestone-target {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }

        .goal-tracker__milestone-date {
          font-size: 0.75rem;
          color: #10b981;
          font-weight: 500;
          margin-left: auto;
        }

        .goal-tracker__editor {
          margin-bottom: 16px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
        }

        .goal-tracker__input-group {
          margin-bottom: 12px;
        }

        .goal-tracker__label {
          display: block;
          margin-bottom: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .goal-tracker__input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .goal-tracker__input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .goal-tracker__editor-actions {
          display: flex;
          gap: 8px;
        }

        .goal-tracker__actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        .goal-tracker__button {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .goal-tracker__button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .goal-tracker__button--primary {
          background: #3b82f6;
          color: white;
        }

        .goal-tracker__button--primary:hover:not(:disabled) {
          background: #2563eb;
        }

        .goal-tracker__button--secondary {
          background: #f8fafc;
          color: #374151;
          border-color: #d1d5db;
        }

        .goal-tracker__button--secondary:hover:not(:disabled) {
          background: #f1f5f9;
          border-color: #9ca3af;
        }

        .goal-tracker__completion-badge {
          padding: 6px 12px;
          background: #dcfce7;
          color: #15803d;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .goal-tracker {
            background: #1e293b;
            border-color: #334155;
            color: #f1f5f9;
          }

          .goal-tracker:hover {
            border-color: #475569;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
          }

          .goal-tracker__title,
          .goal-tracker__milestones-title,
          .goal-tracker__current,
          .goal-tracker__progress-percentage {
            color: #f1f5f9;
          }

          .goal-tracker__description,
          .goal-tracker__target,
          .goal-tracker__separator,
          .goal-tracker__time-info {
            color: #94a3b8;
          }

          .goal-tracker__progress-bar {
            background: #334155;
          }

          .goal-tracker__editor {
            background: #334155;
          }

          .goal-tracker__label {
            color: #cbd5e1;
          }

          .goal-tracker__input {
            background: #475569;
            border-color: #64748b;
            color: #f1f5f9;
          }

          .goal-tracker__button--secondary {
            background: #334155;
            color: #cbd5e1;
            border-color: #475569;
          }

          .goal-tracker__button--secondary:hover:not(:disabled) {
            background: #475569;
            border-color: #64748b;
          }

          .goal-tracker__completion-badge {
            background: #064e3b;
            color: #6ee7b7;
          }
        }

        /* Responsive design */
        @media (max-width: 640px) {
          .goal-tracker__header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .goal-tracker__meta {
            flex-direction: row;
            align-self: flex-end;
            gap: 8px;
          }

          .goal-tracker__progress-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .goal-tracker__actions {
            flex-direction: column;
            align-items: stretch;
          }

          .goal-tracker__button {
            justify-content: center;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .goal-tracker,
          .goal-tracker__button,
          .goal-tracker__progress-fill {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};
