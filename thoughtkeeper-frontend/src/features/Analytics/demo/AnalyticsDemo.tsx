import React, { useState, useEffect } from 'react';
import { AnalyticsProvider, useAnalytics } from '../AnalyticsProvider';
import {
  AnalyticsDashboard,
  MetricCard,
  InsightCard,
  GoalTracker,
  ProductivityChart,
  PatternsList,
  ExportButton
} from '../components';
import type { TimeRange, AnalyticsEvent } from '../types';

/**
 * Analytics Demo Component
 * Showcases the full analytics system with interactive features
 */
export const AnalyticsDemo: React.FC = () => {
  return (
    <AnalyticsProvider>
      <AnalyticsDemoContent />
    </AnalyticsProvider>
  );
};

const AnalyticsDemoContent: React.FC = () => {
  const { trackEvent, getMetrics, getInsights, exportData } = useAnalytics();
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('week');
  const [isGeneratingData, setIsGeneratingData] = useState(false);

  // Generate sample data for demonstration
  const generateSampleData = async () => {
    if (isGeneratingData) return;
    
    setIsGeneratingData(true);
    
    // Generate various sample events
    const sampleEvents: AnalyticsEvent[] = [
      { type: 'task_created', timestamp: Date.now() - 86400000, metadata: { priority: 'high' } },
      { type: 'task_completed', timestamp: Date.now() - 43200000, metadata: { duration: 3600 } },
      { type: 'notebook_created', timestamp: Date.now() - 21600000, metadata: { name: 'Project Notes' } },
      { type: 'search_performed', timestamp: Date.now() - 10800000, metadata: { query: 'productivity' } },
      { type: 'export_completed', timestamp: Date.now() - 5400000, metadata: { format: 'json' } }
    ];

    // Track each sample event with a delay for demonstration
    for (const event of sampleEvents) {
      await new Promise(resolve => setTimeout(resolve, 200));
      trackEvent(event);
    }
    
    setIsGeneratingData(false);
  };

  // Auto-generate sample data on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      generateSampleData();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle export functionality
  const handleExport = async (format: 'json' | 'csv' | 'xlsx' | 'pdf' | 'png' | 'svg') => {
    const data = await exportData(format, { 
      timeRange: selectedTimeRange,
      includeCharts: ['json', 'xlsx', 'pdf'].includes(format)
    });
    return data;
  };

  // Get current metrics for display
  const currentMetrics = getMetrics(selectedTimeRange);
  const currentInsights = getInsights(selectedTimeRange);

  return (
    <div className="analytics-demo">
      {/* Header */}
      <div className="analytics-demo__header">
        <div className="analytics-demo__title-section">
          <h1 className="analytics-demo__title">
            📊 Analytics Dashboard Demo
          </h1>
          <p className="analytics-demo__subtitle">
            Interactive demonstration of ThoughtKeeper's productivity analytics
          </p>
        </div>

        <div className="analytics-demo__controls">
          {/* Time Range Selector */}
          <div className="analytics-demo__control-group">
            <label className="analytics-demo__label">Time Range:</label>
            <select 
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as TimeRange)}
              className="analytics-demo__select"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>

          {/* Generate Data Button */}
          <button
            onClick={generateSampleData}
            disabled={isGeneratingData}
            className="analytics-demo__generate-btn"
          >
            {isGeneratingData ? '🔄 Generating...' : '🎲 Generate Sample Data'}
          </button>

          {/* Export Button */}
          <ExportButton
            onExport={handleExport}
            formats={['json', 'csv', 'xlsx']}
          />
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="analytics-demo__dashboard">
        <AnalyticsDashboard timeRange={selectedTimeRange} />
      </div>

      {/* Individual Component Examples */}
      <div className="analytics-demo__examples">
        <h2 className="analytics-demo__examples-title">Individual Components</h2>
        
        <div className="analytics-demo__examples-grid">
          {/* Metric Cards Examples */}
          <div className="analytics-demo__example-section">
            <h3>📈 Metric Cards</h3>
            <div className="analytics-demo__metric-cards">
              {currentMetrics.slice(0, 3).map((metric, index) => (
                <MetricCard key={index} metric={metric} />
              ))}
            </div>
          </div>

          {/* Insight Cards Examples */}
          <div className="analytics-demo__example-section">
            <h3>💡 Insights</h3>
            <div className="analytics-demo__insight-cards">
              {currentInsights.slice(0, 2).map((insight, index) => (
                <InsightCard key={index} insight={insight} />
              ))}
            </div>
          </div>

          {/* Goal Tracker Example */}
          <div className="analytics-demo__example-section">
            <h3>🎯 Goal Tracking</h3>
            <GoalTracker />
          </div>

          {/* Chart Example */}
          <div className="analytics-demo__example-section">
            <h3>📊 Productivity Chart</h3>
            <ProductivityChart 
              data={currentMetrics}
              timeRange={selectedTimeRange}
            />
          </div>

          {/* Patterns List Example */}
          <div className="analytics-demo__example-section">
            <h3>🔍 Patterns</h3>
            <PatternsList timeRange={selectedTimeRange} />
          </div>
        </div>
      </div>

      {/* Feature Information */}
      <div className="analytics-demo__info">
        <h2 className="analytics-demo__info-title">✨ Analytics Features</h2>
        <div className="analytics-demo__feature-grid">
          <div className="analytics-demo__feature-card">
            <h4>📊 Real-time Metrics</h4>
            <p>Track productivity metrics in real-time with automatic data collection.</p>
          </div>
          <div className="analytics-demo__feature-card">
            <h4>💡 Smart Insights</h4>
            <p>AI-powered insights help you understand your productivity patterns.</p>
          </div>
          <div className="analytics-demo__feature-card">
            <h4>🎯 Goal Tracking</h4>
            <p>Set and monitor personal productivity goals with visual progress tracking.</p>
          </div>
          <div className="analytics-demo__feature-card">
            <h4>📈 Trend Analysis</h4>
            <p>Visualize productivity trends over different time periods.</p>
          </div>
          <div className="analytics-demo__feature-card">
            <h4>🔍 Pattern Detection</h4>
            <p>Automatically identify work patterns and habits.</p>
          </div>
          <div className="analytics-demo__feature-card">
            <h4>📤 Data Export</h4>
            <p>Export analytics data in multiple formats for external analysis.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .analytics-demo {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .analytics-demo__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          gap: 24px;
        }

        .analytics-demo__title-section {
          flex: 1;
        }

        .analytics-demo__title {
          margin: 0 0 8px 0;
          font-size: 2rem;
          font-weight: 700;
          color: #1a202c;
        }

        .analytics-demo__subtitle {
          margin: 0;
          font-size: 1.125rem;
          color: #4a5568;
          line-height: 1.5;
        }

        .analytics-demo__controls {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .analytics-demo__control-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .analytics-demo__label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #2d3748;
        }

        .analytics-demo__select {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          background: white;
          color: #374151;
          cursor: pointer;
        }

        .analytics-demo__select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .analytics-demo__generate-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .analytics-demo__generate-btn:hover:not(:disabled) {
          background: #2563eb;
        }

        .analytics-demo__generate-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .analytics-demo__dashboard {
          margin-bottom: 48px;
        }

        .analytics-demo__examples {
          margin-bottom: 48px;
        }

        .analytics-demo__examples-title {
          margin: 0 0 24px 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a202c;
        }

        .analytics-demo__examples-grid {
          display: grid;
          gap: 32px;
        }

        .analytics-demo__example-section h3 {
          margin: 0 0 16px 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #2d3748;
        }

        .analytics-demo__metric-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .analytics-demo__insight-cards {
          display: grid;
          gap: 16px;
        }

        .analytics-demo__info {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 32px;
        }

        .analytics-demo__info-title {
          margin: 0 0 24px 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a202c;
          text-align: center;
        }

        .analytics-demo__feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .analytics-demo__feature-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .analytics-demo__feature-card h4 {
          margin: 0 0 12px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1a202c;
        }

        .analytics-demo__feature-card p {
          margin: 0;
          font-size: 0.875rem;
          color: #4a5568;
          line-height: 1.5;
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .analytics-demo__title,
          .analytics-demo__examples-title,
          .analytics-demo__info-title {
            color: #f7fafc;
          }

          .analytics-demo__subtitle {
            color: #cbd5e0;
          }

          .analytics-demo__label {
            color: #e2e8f0;
          }

          .analytics-demo__select {
            background: #2d3748;
            border-color: #4a5568;
            color: #f7fafc;
          }

          .analytics-demo__example-section h3 {
            color: #e2e8f0;
          }

          .analytics-demo__info {
            background: #1a202c;
            border-color: #2d3748;
          }

          .analytics-demo__feature-card {
            background: #2d3748;
          }

          .analytics-demo__feature-card h4 {
            color: #f7fafc;
          }

          .analytics-demo__feature-card p {
            color: #cbd5e0;
          }
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .analytics-demo {
            padding: 16px;
          }

          .analytics-demo__header {
            flex-direction: column;
            align-items: stretch;
          }

          .analytics-demo__controls {
            justify-content: flex-start;
          }

          .analytics-demo__title {
            font-size: 1.5rem;
          }

          .analytics-demo__feature-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .analytics-demo__generate-btn {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};
