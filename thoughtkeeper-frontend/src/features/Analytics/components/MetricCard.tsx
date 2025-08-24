import React from 'react';
import type { MetricDisplayProps } from '../types';

/**
 * Metric Display Card Component
 * Shows a single metric with trend indicators and formatting
 */
export const MetricCard: React.FC<MetricDisplayProps> = ({
  label,
  value,
  unit,
  trend,
  comparison,
  format = 'number'
}) => {
  const formatValue = (val: number | string, fmt: typeof format): string => {
    if (typeof val === 'string') return val;
    
    switch (fmt) {
      case 'percentage':
        return `${val}%`;
      case 'duration':
        if (val < 60) return `${val}m`;
        const hours = Math.floor(val / 60);
        const mins = val % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(val);
      case 'number':
      default:
        return val.toLocaleString();
    }
  };

  const getTrendIcon = (direction: 'increasing' | 'decreasing' | 'stable') => {
    switch (direction) {
      case 'increasing':
        return '📈';
      case 'decreasing':
        return '📉';
      case 'stable':
      default:
        return '➡️';
    }
  };

  const getTrendColor = (direction: 'increasing' | 'decreasing' | 'stable') => {
    switch (direction) {
      case 'increasing':
        return '#10b981'; // green
      case 'decreasing':
        return '#ef4444'; // red
      case 'stable':
      default:
        return '#64748b'; // gray
    }
  };

  return (
    <div className="metric-card">
      <div className="metric-card__header">
        <span className="metric-card__label">{label}</span>
        {trend && (
          <div 
            className="metric-card__trend"
            style={{ color: getTrendColor(trend.direction) }}
          >
            <span className="metric-card__trend-icon">
              {getTrendIcon(trend.direction)}
            </span>
            <span className="metric-card__trend-text">
              {trend.percentage.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <div className="metric-card__value">
        <span className="metric-card__number">
          {formatValue(value, format)}
        </span>
        {unit && unit !== '%' && (
          <span className="metric-card__unit">{unit}</span>
        )}
      </div>

      {comparison && (
        <div className="metric-card__comparison">
          <span className="metric-card__comparison-text">
            vs {comparison.period}: 
          </span>
          <span className="metric-card__comparison-value">
            {formatValue(comparison.value, format)}
          </span>
        </div>
      )}

      <style jsx>{`
        .metric-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.2s ease;
          cursor: default;
        }

        .metric-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border-color: #cbd5e1;
        }

        .metric-card__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .metric-card__label {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .metric-card__trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .metric-card__trend-icon {
          font-size: 1rem;
        }

        .metric-card__value {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 8px;
        }

        .metric-card__number {
          font-size: 2rem;
          font-weight: 700;
          color: #1a202c;
          line-height: 1;
        }

        .metric-card__unit {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 500;
        }

        .metric-card__comparison {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: #64748b;
        }

        .metric-card__comparison-value {
          font-weight: 600;
          color: #374151;
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .metric-card {
            background: #1e293b;
            border-color: #334155;
          }

          .metric-card:hover {
            border-color: #475569;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
          }

          .metric-card__number {
            color: #f1f5f9;
          }

          .metric-card__label,
          .metric-card__unit,
          .metric-card__comparison {
            color: #94a3b8;
          }

          .metric-card__comparison-value {
            color: #e2e8f0;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .metric-card {
            border-width: 2px;
          }

          .metric-card__number {
            font-weight: 900;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .metric-card {
            transition: none;
          }
        }

        /* Responsive design */
        @media (max-width: 640px) {
          .metric-card {
            padding: 16px;
          }

          .metric-card__header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .metric-card__number {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Metric Card Grid Component
 * Container for multiple metric cards with responsive layout
 */
export const MetricCardGrid: React.FC<{
  children: React.ReactNode;
  columns?: number;
}> = ({ children, columns = 3 }) => {
  return (
    <div className="metric-card-grid" style={{ '--columns': columns } as React.CSSProperties}>
      {children}

      <style jsx>{`
        .metric-card-grid {
          display: grid;
          grid-template-columns: repeat(var(--columns), 1fr);
          gap: 16px;
        }

        @media (max-width: 1024px) {
          .metric-card-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .metric-card-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Loading Metric Card Component
 * Skeleton loader for metric cards
 */
export const MetricCardSkeleton: React.FC = () => {
  return (
    <div className="metric-card-skeleton">
      <div className="metric-card-skeleton__header">
        <div className="metric-card-skeleton__label"></div>
        <div className="metric-card-skeleton__trend"></div>
      </div>
      
      <div className="metric-card-skeleton__value">
        <div className="metric-card-skeleton__number"></div>
        <div className="metric-card-skeleton__unit"></div>
      </div>
      
      <div className="metric-card-skeleton__comparison"></div>

      <style jsx>{`
        .metric-card-skeleton {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          animation: pulse 2s infinite ease-in-out;
        }

        .metric-card-skeleton__header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .metric-card-skeleton__label {
          width: 80px;
          height: 12px;
          background: #e2e8f0;
          border-radius: 6px;
        }

        .metric-card-skeleton__trend {
          width: 40px;
          height: 12px;
          background: #e2e8f0;
          border-radius: 6px;
        }

        .metric-card-skeleton__value {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 8px;
        }

        .metric-card-skeleton__number {
          width: 60px;
          height: 28px;
          background: #e2e8f0;
          border-radius: 6px;
        }

        .metric-card-skeleton__unit {
          width: 24px;
          height: 12px;
          background: #e2e8f0;
          border-radius: 6px;
        }

        .metric-card-skeleton__comparison {
          width: 100px;
          height: 10px;
          background: #e2e8f0;
          border-radius: 5px;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .metric-card-skeleton {
            background: #1e293b;
            border-color: #334155;
          }

          .metric-card-skeleton__label,
          .metric-card-skeleton__trend,
          .metric-card-skeleton__number,
          .metric-card-skeleton__unit,
          .metric-card-skeleton__comparison {
            background: #334155;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .metric-card-skeleton {
            animation: none;
          }

          .metric-card-skeleton__label,
          .metric-card-skeleton__trend,
          .metric-card-skeleton__number,
          .metric-card-skeleton__unit,
          .metric-card-skeleton__comparison {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};
