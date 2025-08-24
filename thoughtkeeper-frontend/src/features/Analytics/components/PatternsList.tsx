import React from 'react';
import type { UserBehaviorPattern } from '../types';

/**
 * Patterns List Component
 * Displays user behavior patterns with insights
 */
interface PatternsListProps {
  patterns: UserBehaviorPattern[];
  compact?: boolean;
  showInsights?: boolean;
  showRecommendations?: boolean;
}

export const PatternsList: React.FC<PatternsListProps> = ({
  patterns,
  compact = false,
  showInsights = true,
  showRecommendations = false
}) => {
  const getPatternIcon = (pattern: string) => {
    switch (pattern) {
      case 'high_productivity':
        return '⚡';
      case 'task_batching':
        return '📦';
      case 'notebook_organizing':
        return '📁';
      case 'search_heavy':
        return '🔍';
      case 'keyboard_power_user':
        return '⌨️';
      case 'drag_drop_preferred':
        return '🖱️';
      case 'bulk_operations':
        return '📋';
      case 'morning_planner':
        return '🌅';
      case 'evening_reviewer':
        return '🌆';
      case 'weekend_organizer':
        return '📅';
      case 'feature_explorer':
        return '🧭';
      case 'efficiency_focused':
        return '🎯';
      default:
        return '📊';
    }
  };

  const getPatternName = (pattern: string) => {
    return pattern.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#10b981'; // green
    if (confidence >= 0.6) return '#3b82f6'; // blue
    if (confidence >= 0.4) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const formatTimeOfDay = (hours: number[]) => {
    if (hours.length === 0) return 'Anytime';
    
    const periods = hours.map(hour => {
      if (hour < 6) return 'Early Morning';
      if (hour < 12) return 'Morning';
      if (hour < 18) return 'Afternoon';
      if (hour < 22) return 'Evening';
      return 'Late Night';
    });

    return [...new Set(periods)].join(', ');
  };

  if (patterns.length === 0) {
    return (
      <div className="patterns-list-empty">
        <div className="patterns-list-empty__content">
          <span className="patterns-list-empty__icon">🔍</span>
          <p className="patterns-list-empty__message">
            No behavior patterns detected yet
          </p>
          <p className="patterns-list-empty__submessage">
            Use the app more to discover your productivity patterns
          </p>
        </div>

        <style jsx>{`
          .patterns-list-empty {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            text-align: center;
          }

          .patterns-list-empty__icon {
            font-size: 2rem;
            display: block;
            margin-bottom: 12px;
          }

          .patterns-list-empty__message {
            margin: 0 0 8px;
            font-weight: 500;
            color: #374151;
          }

          .patterns-list-empty__submessage {
            margin: 0;
            color: #64748b;
            font-size: 0.875rem;
          }

          /* Dark theme support */
          @media (prefers-color-scheme: dark) {
            .patterns-list-empty__message {
              color: #cbd5e1;
            }

            .patterns-list-empty__submessage {
              color: #94a3b8;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`patterns-list ${compact ? 'patterns-list--compact' : ''}`}>
      {patterns.map(pattern => (
        <div key={pattern.id} className="pattern-item">
          <div className="pattern-item__header">
            <div className="pattern-item__title-section">
              <span className="pattern-item__icon">
                {getPatternIcon(pattern.pattern)}
              </span>
              <div className="pattern-item__title-content">
                <h4 className="pattern-item__title">
                  {getPatternName(pattern.pattern)}
                </h4>
                {!compact && (
                  <div className="pattern-item__meta">
                    <span className="pattern-item__frequency">
                      {pattern.frequency} times
                    </span>
                    <span className="pattern-item__separator">•</span>
                    <span className="pattern-item__time">
                      {formatTimeOfDay(pattern.timeOfDay)}
                    </span>
                    {pattern.duration > 0 && (
                      <>
                        <span className="pattern-item__separator">•</span>
                        <span className="pattern-item__duration">
                          ~{pattern.duration}min
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pattern-item__confidence">
              <div 
                className="pattern-item__confidence-bar"
                style={{ backgroundColor: getConfidenceColor(pattern.confidence) }}
              >
                <span className="pattern-item__confidence-text">
                  {Math.round(pattern.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>

          {!compact && showInsights && pattern.insights.length > 0 && (
            <div className="pattern-item__insights">
              <h5 className="pattern-item__insights-title">💡 Insights</h5>
              <ul className="pattern-item__insights-list">
                {pattern.insights.slice(0, 2).map((insight, index) => (
                  <li key={index} className="pattern-item__insight">
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!compact && showRecommendations && pattern.recommendations.length > 0 && (
            <div className="pattern-item__recommendations">
              <h5 className="pattern-item__recommendations-title">🎯 Recommendations</h5>
              <ul className="pattern-item__recommendations-list">
                {pattern.recommendations.slice(0, 2).map((recommendation, index) => (
                  <li key={index} className="pattern-item__recommendation">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {compact && (pattern.insights.length > 0 || pattern.recommendations.length > 0) && (
            <div className="pattern-item__compact-info">
              {pattern.insights.length > 0 && (
                <span className="pattern-item__compact-insights">
                  {pattern.insights.length} insight{pattern.insights.length !== 1 ? 's' : ''}
                </span>
              )}
              {pattern.recommendations.length > 0 && (
                <span className="pattern-item__compact-recommendations">
                  {pattern.recommendations.length} tip{pattern.recommendations.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>
      ))}

      <style jsx>{`
        .patterns-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .patterns-list--compact {
          gap: 12px;
        }

        .pattern-item {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          transition: all 0.2s ease;
        }

        .pattern-item:hover {
          box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
          border-color: #cbd5e1;
        }

        .patterns-list--compact .pattern-item {
          padding: 12px;
        }

        .pattern-item__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .patterns-list--compact .pattern-item__header {
          margin-bottom: 8px;
        }

        .pattern-item__title-section {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          flex: 1;
        }

        .pattern-item__icon {
          font-size: 1.25rem;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .patterns-list--compact .pattern-item__icon {
          font-size: 1rem;
        }

        .pattern-item__title-content {
          flex: 1;
        }

        .pattern-item__title {
          margin: 0 0 4px;
          font-size: 1rem;
          font-weight: 600;
          color: #1a202c;
          line-height: 1.3;
        }

        .patterns-list--compact .pattern-item__title {
          font-size: 0.875rem;
          margin-bottom: 2px;
        }

        .pattern-item__meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: #64748b;
        }

        .pattern-item__frequency,
        .pattern-item__time,
        .pattern-item__duration {
          font-weight: 500;
        }

        .pattern-item__separator {
          color: #9ca3af;
        }

        .pattern-item__confidence {
          flex-shrink: 0;
        }

        .pattern-item__confidence-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px 8px;
          border-radius: 12px;
          min-width: 50px;
        }

        .patterns-list--compact .pattern-item__confidence-bar {
          padding: 2px 6px;
          min-width: 40px;
        }

        .pattern-item__confidence-text {
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .patterns-list--compact .pattern-item__confidence-text {
          font-size: 0.625rem;
        }

        .pattern-item__insights,
        .pattern-item__recommendations {
          margin-bottom: 12px;
        }

        .pattern-item__insights:last-child,
        .pattern-item__recommendations:last-child {
          margin-bottom: 0;
        }

        .pattern-item__insights-title,
        .pattern-item__recommendations-title {
          margin: 0 0 8px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #1a202c;
        }

        .pattern-item__insights-list,
        .pattern-item__recommendations-list {
          margin: 0;
          padding-left: 16px;
          color: #374151;
        }

        .pattern-item__insight,
        .pattern-item__recommendation {
          font-size: 0.875rem;
          line-height: 1.4;
          margin-bottom: 4px;
        }

        .pattern-item__insight:last-child,
        .pattern-item__recommendation:last-child {
          margin-bottom: 0;
        }

        .pattern-item__compact-info {
          display: flex;
          gap: 12px;
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }

        .pattern-item__compact-insights,
        .pattern-item__compact-recommendations {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .pattern-item__compact-insights::before {
          content: "💡";
        }

        .pattern-item__compact-recommendations::before {
          content: "🎯";
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .pattern-item {
            background: #1e293b;
            border-color: #334155;
          }

          .pattern-item:hover {
            border-color: #475569;
            box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.3);
          }

          .pattern-item__title,
          .pattern-item__insights-title,
          .pattern-item__recommendations-title {
            color: #f1f5f9;
          }

          .pattern-item__meta,
          .pattern-item__compact-info {
            color: #94a3b8;
          }

          .pattern-item__separator {
            color: #64748b;
          }

          .pattern-item__insights-list,
          .pattern-item__recommendations-list {
            color: #cbd5e1;
          }
        }

        /* Responsive design */
        @media (max-width: 640px) {
          .pattern-item__header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .pattern-item__confidence {
            align-self: flex-end;
          }

          .pattern-item__meta {
            flex-wrap: wrap;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .pattern-item {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};
