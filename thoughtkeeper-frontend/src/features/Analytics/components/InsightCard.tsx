import React, { useState } from 'react';
import { useAnalytics } from '../AnalyticsProvider';
import type { InsightCardProps } from '../types';

/**
 * Insight Card Component
 * Displays analytics insights with actionable recommendations
 */
export const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  onDismiss,
  onImplement,
  onLearnMore,
  compact = false
}) => {
  const { dismissInsight, implementInsight } = useAnalytics();
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [loading, setLoading] = useState(false);

  const handleDismiss = async () => {
    setLoading(true);
    try {
      await dismissInsight(insight.id);
      onDismiss?.();
    } catch (error) {
      console.error('Failed to dismiss insight:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImplement = async () => {
    setLoading(true);
    try {
      await implementInsight(insight.id);
      onImplement?.();
    } catch (error) {
      console.error('Failed to implement insight:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = () => {
    switch (insight.type) {
      case 'productivity':
        return '⚡';
      case 'efficiency':
        return '🚀';
      case 'usage_pattern':
        return '🔍';
      case 'feature_opportunity':
        return '💡';
      case 'performance':
        return '📈';
      case 'optimization':
        return '⚙️';
      case 'trend':
        return '📊';
      case 'goal_progress':
        return '🎯';
      case 'comparison':
        return '⚖️';
      default:
        return '💡';
    }
  };

  const getImpactColor = () => {
    switch (insight.impact) {
      case 'high':
        return '#dc2626'; // red-600
      case 'medium':
        return '#ea580c'; // orange-600
      case 'low':
        return '#16a34a'; // green-600
      default:
        return '#64748b'; // gray-500
    }
  };

  const getTrendIcon = () => {
    switch (insight.trend) {
      case 'increasing':
        return '↗️';
      case 'decreasing':
        return '↘️';
      case 'stable':
        return '➡️';
      case 'volatile':
        return '📊';
      default:
        return '';
    }
  };

  return (
    <div className={`insight-card ${compact ? 'insight-card--compact' : ''}`}>
      <div className="insight-card__header">
        <div className="insight-card__title-section">
          <span className="insight-card__icon">{getInsightIcon()}</span>
          <h3 className="insight-card__title">{insight.title}</h3>
          {insight.trend !== 'stable' && (
            <span className="insight-card__trend">{getTrendIcon()}</span>
          )}
        </div>
        
        <div className="insight-card__meta">
          <span 
            className="insight-card__impact"
            style={{ color: getImpactColor() }}
          >
            {insight.impact.toUpperCase()}
          </span>
          <span className="insight-card__confidence">
            {Math.round(insight.confidence * 100)}%
          </span>
        </div>
      </div>

      <div className="insight-card__content">
        <p className="insight-card__description">
          {insight.description}
        </p>

        {!compact && (
          <>
            {/* Data Points */}
            {insight.dataPoints.length > 0 && (
              <div className="insight-card__data-points">
                <h4 className="insight-card__data-title">Key Metrics</h4>
                <div className="insight-card__data-grid">
                  {insight.dataPoints.map((point, index) => (
                    <div key={index} className="insight-card__data-point">
                      <span className="insight-card__data-label">{point.label}</span>
                      <span className="insight-card__data-value">
                        {typeof point.value === 'number' ? 
                          point.value.toLocaleString() : 
                          point.value
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {insight.recommendations.length > 0 && (
              <div className="insight-card__recommendations">
                <h4 className="insight-card__recommendations-title">
                  💡 Recommendations
                </h4>
                <div className="insight-card__recommendations-list">
                  {insight.recommendations.slice(0, 3).map(rec => (
                    <div key={rec.id} className="insight-card__recommendation">
                      <div className="insight-card__recommendation-header">
                        <span className="insight-card__recommendation-title">
                          {rec.title}
                        </span>
                        <span className="insight-card__recommendation-priority">
                          P{rec.priority}
                        </span>
                      </div>
                      <p className="insight-card__recommendation-description">
                        {rec.description}
                      </p>
                      {rec.estimatedImpact && (
                        <div className="insight-card__recommendation-impact">
                          <strong>Impact:</strong> {rec.estimatedImpact}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {compact && insight.recommendations.length > 0 && (
          <div className="insight-card__compact-recommendations">
            <strong>{insight.recommendations.length} recommendations available</strong>
          </div>
        )}
      </div>

      <div className="insight-card__actions">
        {compact && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="insight-card__button insight-card__button--secondary"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        )}

        {insight.actionable && (
          <>
            <button
              onClick={handleImplement}
              disabled={loading || insight.implemented}
              className="insight-card__button insight-card__button--primary"
            >
              {insight.implemented ? '✓ Implemented' : '🚀 Implement'}
            </button>
            
            {onLearnMore && (
              <button
                onClick={onLearnMore}
                className="insight-card__button insight-card__button--secondary"
              >
                📖 Learn More
              </button>
            )}
          </>
        )}

        <button
          onClick={handleDismiss}
          disabled={loading || insight.dismissed}
          className="insight-card__button insight-card__button--ghost"
        >
          {insight.dismissed ? '✓ Dismissed' : '✕ Dismiss'}
        </button>
      </div>

      {/* Expanded Content (for compact mode) */}
      {compact && isExpanded && (
        <div className="insight-card__expanded-content">
          {insight.dataPoints.length > 0 && (
            <div className="insight-card__data-points">
              <h4 className="insight-card__data-title">Key Metrics</h4>
              <div className="insight-card__data-grid">
                {insight.dataPoints.map((point, index) => (
                  <div key={index} className="insight-card__data-point">
                    <span className="insight-card__data-label">{point.label}</span>
                    <span className="insight-card__data-value">
                      {typeof point.value === 'number' ? 
                        point.value.toLocaleString() : 
                        point.value
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insight.recommendations.length > 0 && (
            <div className="insight-card__recommendations">
              <h4 className="insight-card__recommendations-title">
                💡 Recommendations
              </h4>
              <div className="insight-card__recommendations-list">
                {insight.recommendations.slice(0, 2).map(rec => (
                  <div key={rec.id} className="insight-card__recommendation">
                    <div className="insight-card__recommendation-header">
                      <span className="insight-card__recommendation-title">
                        {rec.title}
                      </span>
                      <span className="insight-card__recommendation-priority">
                        P{rec.priority}
                      </span>
                    </div>
                    <p className="insight-card__recommendation-description">
                      {rec.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .insight-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .insight-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border-color: #cbd5e1;
        }

        .insight-card--compact {
          padding: 16px;
        }

        .insight-card__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .insight-card__title-section {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .insight-card__icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .insight-card__title {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1a202c;
          line-height: 1.3;
        }

        .insight-card__trend {
          font-size: 1rem;
        }

        .insight-card__meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .insight-card__impact {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .insight-card__confidence {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }

        .insight-card__description {
          margin: 0 0 16px;
          color: #374151;
          line-height: 1.5;
        }

        .insight-card__data-points {
          margin-bottom: 20px;
        }

        .insight-card__data-title {
          margin: 0 0 12px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #1a202c;
        }

        .insight-card__data-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 8px;
        }

        .insight-card__data-point {
          display: flex;
          flex-direction: column;
          padding: 8px 12px;
          background: #f8fafc;
          border-radius: 6px;
        }

        .insight-card__data-label {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          font-weight: 500;
        }

        .insight-card__data-value {
          font-size: 1rem;
          font-weight: 600;
          color: #1a202c;
        }

        .insight-card__recommendations {
          margin-bottom: 20px;
        }

        .insight-card__recommendations-title {
          margin: 0 0 12px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #1a202c;
        }

        .insight-card__recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .insight-card__recommendation {
          padding: 12px;
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 8px;
        }

        .insight-card__recommendation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .insight-card__recommendation-title {
          font-weight: 600;
          color: #92400e;
          font-size: 0.875rem;
        }

        .insight-card__recommendation-priority {
          font-size: 0.75rem;
          color: #92400e;
          background: #fbbf24;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }

        .insight-card__recommendation-description {
          margin: 0 0 8px;
          font-size: 0.875rem;
          color: #92400e;
          line-height: 1.4;
        }

        .insight-card__recommendation-impact {
          font-size: 0.75rem;
          color: #92400e;
        }

        .insight-card__compact-recommendations {
          margin-bottom: 16px;
          font-size: 0.875rem;
          color: #64748b;
        }

        .insight-card__actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .insight-card__button {
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

        .insight-card__button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .insight-card__button--primary {
          background: #3b82f6;
          color: white;
        }

        .insight-card__button--primary:hover:not(:disabled) {
          background: #2563eb;
        }

        .insight-card__button--secondary {
          background: #f8fafc;
          color: #374151;
          border-color: #d1d5db;
        }

        .insight-card__button--secondary:hover:not(:disabled) {
          background: #f1f5f9;
          border-color: #9ca3af;
        }

        .insight-card__button--ghost {
          background: transparent;
          color: #64748b;
        }

        .insight-card__button--ghost:hover:not(:disabled) {
          background: #f8fafc;
          color: #374151;
        }

        .insight-card__expanded-content {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .insight-card {
            background: #1e293b;
            border-color: #334155;
            color: #f1f5f9;
          }

          .insight-card:hover {
            border-color: #475569;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
          }

          .insight-card__title,
          .insight-card__data-title,
          .insight-card__recommendations-title,
          .insight-card__data-value {
            color: #f1f5f9;
          }

          .insight-card__description {
            color: #cbd5e1;
          }

          .insight-card__data-point {
            background: #334155;
          }

          .insight-card__recommendation {
            background: #451a03;
            border-color: #92400e;
          }

          .insight-card__recommendation-title,
          .insight-card__recommendation-description {
            color: #fbbf24;
          }

          .insight-card__button--secondary {
            background: #334155;
            color: #cbd5e1;
            border-color: #475569;
          }

          .insight-card__button--secondary:hover:not(:disabled) {
            background: #475569;
            border-color: #64748b;
          }

          .insight-card__button--ghost {
            color: #94a3b8;
          }

          .insight-card__button--ghost:hover:not(:disabled) {
            background: #334155;
            color: #cbd5e1;
          }

          .insight-card__expanded-content {
            border-top-color: #334155;
          }
        }

        /* Responsive design */
        @media (max-width: 640px) {
          .insight-card__header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .insight-card__meta {
            flex-direction: row;
            align-self: flex-end;
          }

          .insight-card__actions {
            flex-direction: column;
          }

          .insight-card__button {
            justify-content: center;
          }

          .insight-card__data-grid {
            grid-template-columns: 1fr;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .insight-card {
            border-width: 2px;
          }

          .insight-card__recommendation {
            border-width: 2px;
          }

          .insight-card__button {
            border-width: 2px;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .insight-card,
          .insight-card__button {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};
