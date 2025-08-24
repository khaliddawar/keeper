import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../AnalyticsProvider';
import { MetricCard } from './MetricCard';
import { InsightCard } from './InsightCard';
import { GoalTracker } from './GoalTracker';
import { ProductivityChart } from './ProductivityChart';
import { PatternsList } from './PatternsList';
import { ExportButton } from './ExportButton';
import type { AnalyticsDashboardProps, TimePeriod } from '../types';

/**
 * Main Analytics Dashboard Component
 * Displays comprehensive productivity insights and metrics
 */
export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  dashboard,
  editable = false,
  onDashboardChange,
  fullscreen = false
}) => {
  const {
    events,
    metrics,
    insights,
    patterns,
    goals,
    loading,
    refreshData,
    generateInsights,
    exportData,
    config
  } = useAnalytics();

  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Auto-refresh data
  useEffect(() => {
    if (config.dashboard.autoRefresh) {
      const interval = setInterval(() => {
        handleRefresh();
      }, config.dashboard.refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [config.dashboard.autoRefresh, config.dashboard.refreshInterval]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleGenerateInsights = async () => {
    try {
      await generateInsights();
    } catch (error) {
      console.error('Failed to generate insights:', error);
    }
  };

  // Calculate current metrics
  const currentMetrics = metrics[0];
  const previousMetrics = metrics[1];

  const calculateTrend = (current: number, previous: number) => {
    if (!previous || previous === 0) return { direction: 'stable' as const, percentage: 0 };
    const change = ((current - previous) / previous) * 100;
    return {
      direction: change > 5 ? 'increasing' as const : change < -5 ? 'decreasing' as const : 'stable' as const,
      percentage: Math.abs(change)
    };
  };

  // Active insights (not dismissed)
  const activeInsights = insights.filter(insight => !insight.dismissed);

  // Active goals
  const activeGoals = goals.filter(goal => goal.status === 'active');

  // Recent patterns
  const recentPatterns = patterns.slice(0, 5);

  return (
    <div className={`analytics-dashboard ${fullscreen ? 'analytics-dashboard--fullscreen' : ''}`}>
      {/* Dashboard Header */}
      <div className="analytics-dashboard__header">
        <div className="analytics-dashboard__title">
          <h1>📊 Analytics Dashboard</h1>
          {lastUpdated && (
            <p className="analytics-dashboard__last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="analytics-dashboard__actions">
          {/* Period Selector */}
          <div className="analytics-dashboard__period-selector">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'day' | 'week' | 'month')}
              className="analytics-dashboard__select"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading.metrics}
            className="analytics-dashboard__button analytics-dashboard__button--primary"
          >
            {refreshing ? '🔄' : '↻'} Refresh
          </button>

          <button
            onClick={handleGenerateInsights}
            disabled={loading.insights}
            className="analytics-dashboard__button"
          >
            ✨ Generate Insights
          </button>

          <ExportButton onExport={exportData} />
        </div>
      </div>

      {/* Main Content */}
      <div className="analytics-dashboard__content">
        {/* Metrics Overview */}
        <section className="analytics-dashboard__section">
          <h2 className="analytics-dashboard__section-title">Productivity Overview</h2>
          
          <div className="analytics-dashboard__metrics-grid">
            <MetricCard
              label="Tasks Completed"
              value={currentMetrics?.tasksCompleted || 0}
              unit="tasks"
              trend={currentMetrics && previousMetrics ? 
                calculateTrend(currentMetrics.tasksCompleted, previousMetrics.tasksCompleted) : 
                undefined
              }
              format="number"
            />

            <MetricCard
              label="Completion Rate"
              value={currentMetrics ? 
                Math.round((currentMetrics.tasksCompleted / Math.max(currentMetrics.tasksCreated, 1)) * 100) : 0
              }
              unit="%"
              format="percentage"
            />

            <MetricCard
              label="Active Time"
              value={currentMetrics?.activeTime || 0}
              unit="min"
              trend={currentMetrics && previousMetrics ? 
                calculateTrend(currentMetrics.activeTime, previousMetrics.activeTime) : 
                undefined
              }
              format="duration"
            />

            <MetricCard
              label="Features Used"
              value={currentMetrics?.featuresUsed.length || 0}
              unit="features"
              format="number"
            />

            <MetricCard
              label="Shortcuts Used"
              value={currentMetrics?.shortcutsUsed || 0}
              unit="shortcuts"
              trend={currentMetrics && previousMetrics ? 
                calculateTrend(currentMetrics.shortcutsUsed, previousMetrics.shortcutsUsed) : 
                undefined
              }
              format="number"
            />

            <MetricCard
              label="Efficiency Score"
              value={currentMetrics ? Math.round(
                (currentMetrics.shortcutsUsed * 2 + 
                 currentMetrics.bulkOperations * 3 + 
                 currentMetrics.featuresUsed.length * 1.5) / 10
              ) : 0}
              unit="pts"
              format="number"
            />
          </div>
        </section>

        {/* Charts Section */}
        <section className="analytics-dashboard__section">
          <h2 className="analytics-dashboard__section-title">Productivity Trends</h2>
          
          <div className="analytics-dashboard__charts">
            <ProductivityChart 
              data={metrics}
              period={selectedPeriod}
              loading={loading.metrics}
            />
          </div>
        </section>

        {/* Two-Column Layout */}
        <div className="analytics-dashboard__columns">
          {/* Left Column - Insights & Patterns */}
          <div className="analytics-dashboard__column">
            {/* Insights Section */}
            <section className="analytics-dashboard__section">
              <h2 className="analytics-dashboard__section-title">
                💡 Insights ({activeInsights.length})
              </h2>
              
              {loading.insights ? (
                <div className="analytics-dashboard__loading">
                  <span>🔄 Loading insights...</span>
                </div>
              ) : activeInsights.length > 0 ? (
                <div className="analytics-dashboard__insights">
                  {activeInsights.slice(0, 3).map(insight => (
                    <InsightCard 
                      key={insight.id} 
                      insight={insight}
                      compact={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="analytics-dashboard__empty">
                  <p>No insights available. Click "Generate Insights" to analyze your data.</p>
                </div>
              )}
            </section>

            {/* Patterns Section */}
            <section className="analytics-dashboard__section">
              <h2 className="analytics-dashboard__section-title">
                🔍 Behavior Patterns
              </h2>
              
              {loading.patterns ? (
                <div className="analytics-dashboard__loading">
                  <span>🔄 Loading patterns...</span>
                </div>
              ) : (
                <PatternsList 
                  patterns={recentPatterns}
                  compact={true}
                />
              )}
            </section>
          </div>

          {/* Right Column - Goals */}
          <div className="analytics-dashboard__column">
            {/* Goals Section */}
            <section className="analytics-dashboard__section">
              <h2 className="analytics-dashboard__section-title">
                🎯 Active Goals ({activeGoals.length})
              </h2>
              
              {loading.goals ? (
                <div className="analytics-dashboard__loading">
                  <span>🔄 Loading goals...</span>
                </div>
              ) : activeGoals.length > 0 ? (
                <div className="analytics-dashboard__goals">
                  {activeGoals.map(goal => (
                    <GoalTracker 
                      key={goal.id} 
                      goal={goal}
                      showProgress={true}
                      showMilestones={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="analytics-dashboard__empty">
                  <p>No active goals. Create your first productivity goal to start tracking progress.</p>
                  <button className="analytics-dashboard__button analytics-dashboard__button--primary">
                    + Create Goal
                  </button>
                </div>
              )}
            </section>

            {/* Quick Stats */}
            <section className="analytics-dashboard__section">
              <h2 className="analytics-dashboard__section-title">Quick Stats</h2>
              
              <div className="analytics-dashboard__quick-stats">
                <div className="analytics-dashboard__stat">
                  <span className="analytics-dashboard__stat-label">Total Events</span>
                  <span className="analytics-dashboard__stat-value">{events.length}</span>
                </div>
                
                <div className="analytics-dashboard__stat">
                  <span className="analytics-dashboard__stat-label">Session Length</span>
                  <span className="analytics-dashboard__stat-value">
                    {currentMetrics ? Math.round(currentMetrics.timeSpent) : 0}m
                  </span>
                </div>
                
                <div className="analytics-dashboard__stat">
                  <span className="analytics-dashboard__stat-label">Patterns Detected</span>
                  <span className="analytics-dashboard__stat-value">{patterns.length}</span>
                </div>
                
                <div className="analytics-dashboard__stat">
                  <span className="analytics-dashboard__stat-label">Insights Generated</span>
                  <span className="analytics-dashboard__stat-value">{insights.length}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <style jsx>{`
        .analytics-dashboard {
          padding: 24px;
          background: #f8fafc;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .analytics-dashboard--fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          background: white;
        }

        .analytics-dashboard__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .analytics-dashboard__title h1 {
          margin: 0;
          font-size: 2rem;
          font-weight: 700;
          color: #1a202c;
        }

        .analytics-dashboard__last-updated {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 0.875rem;
        }

        .analytics-dashboard__actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .analytics-dashboard__select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          font-size: 14px;
          cursor: pointer;
        }

        .analytics-dashboard__button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          color: #374151;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .analytics-dashboard__button:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .analytics-dashboard__button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .analytics-dashboard__button--primary {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .analytics-dashboard__button--primary:hover:not(:disabled) {
          background: #2563eb;
          border-color: #2563eb;
        }

        .analytics-dashboard__content {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .analytics-dashboard__section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .analytics-dashboard__section-title {
          margin: 0 0 20px;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a202c;
        }

        .analytics-dashboard__metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .analytics-dashboard__charts {
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .analytics-dashboard__columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        .analytics-dashboard__column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .analytics-dashboard__insights {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .analytics-dashboard__goals {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .analytics-dashboard__loading {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: #64748b;
          font-size: 14px;
        }

        .analytics-dashboard__empty {
          text-align: center;
          padding: 40px 20px;
          color: #64748b;
        }

        .analytics-dashboard__empty p {
          margin: 0 0 16px;
        }

        .analytics-dashboard__quick-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .analytics-dashboard__stat {
          display: flex;
          flex-direction: column;
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
          text-align: center;
        }

        .analytics-dashboard__stat-label {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }

        .analytics-dashboard__stat-value {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a202c;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .analytics-dashboard__columns {
            grid-template-columns: 1fr;
          }

          .analytics-dashboard__header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .analytics-dashboard__actions {
            width: 100%;
            justify-content: flex-start;
            flex-wrap: wrap;
          }
        }

        @media (max-width: 768px) {
          .analytics-dashboard {
            padding: 16px;
          }

          .analytics-dashboard__metrics-grid {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .analytics-dashboard__quick-stats {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .analytics-dashboard__metrics-grid {
            grid-template-columns: 1fr;
          }

          .analytics-dashboard__actions {
            flex-direction: column;
            align-items: stretch;
          }

          .analytics-dashboard__button {
            justify-content: center;
          }
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .analytics-dashboard {
            background: #0f172a;
            color: #f1f5f9;
          }

          .analytics-dashboard__section {
            background: #1e293b;
            border: 1px solid #334155;
          }

          .analytics-dashboard__title h1,
          .analytics-dashboard__section-title,
          .analytics-dashboard__stat-value {
            color: #f1f5f9;
          }

          .analytics-dashboard__select,
          .analytics-dashboard__button {
            background: #334155;
            border-color: #475569;
            color: #f1f5f9;
          }

          .analytics-dashboard__button:hover:not(:disabled) {
            background: #475569;
          }

          .analytics-dashboard__stat {
            background: #334155;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .analytics-dashboard__section {
            border: 2px solid currentColor;
          }

          .analytics-dashboard__button {
            border-width: 2px;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .analytics-dashboard__button {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};
