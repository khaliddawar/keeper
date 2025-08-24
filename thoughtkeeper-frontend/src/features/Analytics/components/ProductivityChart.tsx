import React from 'react';
import type { ProductivityMetrics } from '../types';

/**
 * Productivity Chart Component
 * Visualizes productivity trends over time
 */
interface ProductivityChartProps {
  data: ProductivityMetrics[];
  period: 'day' | 'week' | 'month';
  loading?: boolean;
}

export const ProductivityChart: React.FC<ProductivityChartProps> = ({
  data,
  period,
  loading = false
}) => {
  if (loading) {
    return <ProductivityChartSkeleton />;
  }

  if (data.length === 0) {
    return (
      <div className="productivity-chart-empty">
        <div className="productivity-chart-empty__content">
          <span className="productivity-chart-empty__icon">📊</span>
          <p className="productivity-chart-empty__message">
            No data available for the selected period
          </p>
          <p className="productivity-chart-empty__submessage">
            Complete some tasks to see your productivity trends
          </p>
        </div>

        <style jsx>{`
          .productivity-chart-empty {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 300px;
            background: #f8fafc;
            border: 2px dashed #d1d5db;
            border-radius: 12px;
          }

          .productivity-chart-empty__content {
            text-align: center;
          }

          .productivity-chart-empty__icon {
            font-size: 3rem;
            display: block;
            margin-bottom: 16px;
          }

          .productivity-chart-empty__message {
            margin: 0 0 8px;
            font-size: 1.125rem;
            font-weight: 600;
            color: #374151;
          }

          .productivity-chart-empty__submessage {
            margin: 0;
            color: #64748b;
            font-size: 0.875rem;
          }

          /* Dark theme support */
          @media (prefers-color-scheme: dark) {
            .productivity-chart-empty {
              background: #1e293b;
              border-color: #475569;
            }

            .productivity-chart-empty__message {
              color: #cbd5e1;
            }

            .productivity-chart-empty__submessage {
              color: #94a3b8;
            }
          }
        `}</style>
      </div>
    );
  }

  // Simple bar chart visualization
  const maxValue = Math.max(...data.map(d => d.tasksCompleted));
  const chartData = data.slice(-7); // Show last 7 data points

  return (
    <div className="productivity-chart">
      <div className="productivity-chart__header">
        <h3 className="productivity-chart__title">Tasks Completed</h3>
        <div className="productivity-chart__legend">
          <div className="productivity-chart__legend-item">
            <span className="productivity-chart__legend-color productivity-chart__legend-color--primary"></span>
            <span className="productivity-chart__legend-label">Tasks Completed</span>
          </div>
        </div>
      </div>

      <div className="productivity-chart__container">
        <div className="productivity-chart__y-axis">
          {[maxValue, Math.round(maxValue * 0.75), Math.round(maxValue * 0.5), Math.round(maxValue * 0.25), 0].map((value, index) => (
            <div key={index} className="productivity-chart__y-label">
              {value}
            </div>
          ))}
        </div>

        <div className="productivity-chart__chart">
          <div className="productivity-chart__bars">
            {chartData.map((metric, index) => {
              const height = maxValue > 0 ? (metric.tasksCompleted / maxValue) * 100 : 0;
              return (
                <div key={index} className="productivity-chart__bar-container">
                  <div 
                    className="productivity-chart__bar"
                    style={{ height: `${height}%` }}
                    title={`${metric.tasksCompleted} tasks completed`}
                  >
                    <span className="productivity-chart__bar-value">
                      {metric.tasksCompleted}
                    </span>
                  </div>
                  <div className="productivity-chart__x-label">
                    {metric.date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="productivity-chart__summary">
        <div className="productivity-chart__stat">
          <span className="productivity-chart__stat-label">Average</span>
          <span className="productivity-chart__stat-value">
            {Math.round(data.reduce((sum, d) => sum + d.tasksCompleted, 0) / data.length) || 0}
          </span>
        </div>
        <div className="productivity-chart__stat">
          <span className="productivity-chart__stat-label">Peak</span>
          <span className="productivity-chart__stat-value">
            {Math.max(...data.map(d => d.tasksCompleted))}
          </span>
        </div>
        <div className="productivity-chart__stat">
          <span className="productivity-chart__stat-label">Total</span>
          <span className="productivity-chart__stat-value">
            {data.reduce((sum, d) => sum + d.tasksCompleted, 0)}
          </span>
        </div>
      </div>

      <style jsx>{`
        .productivity-chart {
          background: white;
          border-radius: 12px;
          padding: 20px;
          height: 300px;
          display: flex;
          flex-direction: column;
        }

        .productivity-chart__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .productivity-chart__title {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1a202c;
        }

        .productivity-chart__legend {
          display: flex;
          gap: 16px;
        }

        .productivity-chart__legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .productivity-chart__legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .productivity-chart__legend-color--primary {
          background: #3b82f6;
        }

        .productivity-chart__legend-label {
          font-size: 0.875rem;
          color: #64748b;
        }

        .productivity-chart__container {
          display: flex;
          flex: 1;
          gap: 12px;
        }

        .productivity-chart__y-axis {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-end;
          width: 40px;
          padding-right: 8px;
        }

        .productivity-chart__y-label {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }

        .productivity-chart__chart {
          flex: 1;
          position: relative;
        }

        .productivity-chart__bars {
          display: flex;
          align-items: flex-end;
          height: 180px;
          gap: 8px;
          padding-bottom: 30px;
        }

        .productivity-chart__bar-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }

        .productivity-chart__bar {
          background: #3b82f6;
          border-radius: 4px 4px 0 0;
          width: 100%;
          min-height: 4px;
          position: relative;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 4px;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .productivity-chart__bar:hover {
          background: #2563eb;
          transform: translateY(-2px);
        }

        .productivity-chart__bar-value {
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .productivity-chart__x-label {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 8px;
          text-align: center;
          font-weight: 500;
        }

        .productivity-chart__summary {
          display: flex;
          justify-content: space-around;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }

        .productivity-chart__stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .productivity-chart__stat-label {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          font-weight: 500;
        }

        .productivity-chart__stat-value {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1a202c;
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .productivity-chart {
            background: #1e293b;
            color: #f1f5f9;
          }

          .productivity-chart__title,
          .productivity-chart__stat-value {
            color: #f1f5f9;
          }

          .productivity-chart__legend-label,
          .productivity-chart__y-label,
          .productivity-chart__x-label,
          .productivity-chart__stat-label {
            color: #94a3b8;
          }

          .productivity-chart__summary {
            border-top-color: #334155;
          }
        }

        /* Responsive design */
        @media (max-width: 640px) {
          .productivity-chart__header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .productivity-chart__y-axis {
            width: 30px;
          }

          .productivity-chart__bars {
            gap: 4px;
          }

          .productivity-chart__summary {
            flex-direction: column;
            gap: 12px;
          }

          .productivity-chart__stat {
            flex-direction: row;
            justify-content: space-between;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .productivity-chart__bar {
            transition: none;
          }

          .productivity-chart__bar:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Productivity Chart Skeleton Loader
 */
const ProductivityChartSkeleton: React.FC = () => {
  return (
    <div className="productivity-chart-skeleton">
      <div className="productivity-chart-skeleton__header">
        <div className="productivity-chart-skeleton__title"></div>
        <div className="productivity-chart-skeleton__legend"></div>
      </div>

      <div className="productivity-chart-skeleton__chart">
        <div className="productivity-chart-skeleton__bars">
          {[60, 80, 40, 90, 70, 50, 75].map((height, index) => (
            <div 
              key={index} 
              className="productivity-chart-skeleton__bar"
              style={{ height: `${height}%` }}
            ></div>
          ))}
        </div>
      </div>

      <div className="productivity-chart-skeleton__summary">
        <div className="productivity-chart-skeleton__stat"></div>
        <div className="productivity-chart-skeleton__stat"></div>
        <div className="productivity-chart-skeleton__stat"></div>
      </div>

      <style jsx>{`
        .productivity-chart-skeleton {
          background: white;
          border-radius: 12px;
          padding: 20px;
          height: 300px;
          display: flex;
          flex-direction: column;
          animation: pulse 2s infinite ease-in-out;
        }

        .productivity-chart-skeleton__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .productivity-chart-skeleton__title {
          width: 120px;
          height: 20px;
          background: #e2e8f0;
          border-radius: 4px;
        }

        .productivity-chart-skeleton__legend {
          width: 80px;
          height: 16px;
          background: #e2e8f0;
          border-radius: 4px;
        }

        .productivity-chart-skeleton__chart {
          flex: 1;
          display: flex;
          align-items: flex-end;
          padding-bottom: 40px;
        }

        .productivity-chart-skeleton__bars {
          display: flex;
          align-items: flex-end;
          height: 100%;
          width: 100%;
          gap: 8px;
        }

        .productivity-chart-skeleton__bar {
          flex: 1;
          background: #e2e8f0;
          border-radius: 4px 4px 0 0;
          min-height: 20px;
        }

        .productivity-chart-skeleton__summary {
          display: flex;
          justify-content: space-around;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }

        .productivity-chart-skeleton__stat {
          width: 60px;
          height: 40px;
          background: #e2e8f0;
          border-radius: 4px;
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
          .productivity-chart-skeleton {
            background: #1e293b;
          }

          .productivity-chart-skeleton__title,
          .productivity-chart-skeleton__legend,
          .productivity-chart-skeleton__bar,
          .productivity-chart-skeleton__stat {
            background: #334155;
          }

          .productivity-chart-skeleton__summary {
            border-top-color: #334155;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .productivity-chart-skeleton {
            animation: none;
          }

          .productivity-chart-skeleton__title,
          .productivity-chart-skeleton__legend,
          .productivity-chart-skeleton__bar,
          .productivity-chart-skeleton__stat {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};
