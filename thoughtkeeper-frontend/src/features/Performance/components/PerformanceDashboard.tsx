import React, { useState, useMemo } from 'react';
import { usePerformanceDashboard, usePerformanceAlerts } from '../PerformanceProvider';
import type { PerformanceDashboardProps } from '../types';

/**
 * Performance Dashboard Component
 * 
 * Comprehensive dashboard for monitoring performance metrics, memory usage,
 * Core Web Vitals, runtime performance, and optimization recommendations.
 */
export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  layout = 'full',
  showRecommendations = true,
  showTimeline = true,
  refreshInterval = 5000
}) => {
  const {
    dashboardData,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    optimizeMemory,
    optimizeBundles,
    applyRecommendations
  } = usePerformanceDashboard();

  const {
    unacknowledgedAlerts,
    acknowledgeAlert,
    clearAlerts
  } = usePerformanceAlerts();

  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'memory' | 'recommendations' | 'alerts'>('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('1h');

  // Get performance score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981'; // green
    if (score >= 70) return '#f59e0b'; // yellow
    if (score >= 50) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  // Get metric status
  const getMetricStatus = (value: number, thresholds: { good: number; needsImprovement: number; poor: number }) => {
    if (value <= thresholds.good) return { status: 'good', color: '#10b981' };
    if (value <= thresholds.needsImprovement) return { status: 'needs-improvement', color: '#f59e0b' };
    return { status: 'poor', color: '#ef4444' };
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Format duration
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Overall performance score
  const overallScore = dashboardData.optimizationStatus?.overallScore || 0;

  // Critical alerts count
  const criticalAlerts = unacknowledgedAlerts.filter(alert => alert.severity === 'critical').length;

  if (layout === 'compact') {
    return (
      <div className="performance-dashboard performance-dashboard--compact">
        <div className="performance-dashboard__header">
          <div className="performance-dashboard__title">Performance</div>
          <div className="performance-dashboard__score">
            <div 
              className="performance-dashboard__score-circle"
              style={{ 
                background: `conic-gradient(${getScoreColor(overallScore)} ${overallScore}%, #e5e7eb 0%)`
              }}
            >
              <div className="performance-dashboard__score-value">{overallScore}</div>
            </div>
          </div>
        </div>

        <div className="performance-dashboard__metrics">
          <div className="performance-dashboard__metric">
            <div className="performance-dashboard__metric-label">Memory</div>
            <div className="performance-dashboard__metric-value">
              {Math.round(dashboardData.memoryMetrics?.memoryUsagePercentage || 0)}%
            </div>
          </div>
          <div className="performance-dashboard__metric">
            <div className="performance-dashboard__metric-label">FPS</div>
            <div className="performance-dashboard__metric-value">
              {dashboardData.runtimeMetrics?.fps || 0}
            </div>
          </div>
          <div className="performance-dashboard__metric">
            <div className="performance-dashboard__metric-label">LCP</div>
            <div className="performance-dashboard__metric-value">
              {formatDuration(dashboardData.coreVitals?.lcp?.value || 0)}
            </div>
          </div>
        </div>

        {criticalAlerts > 0 && (
          <div className="performance-dashboard__alerts">
            <span className="performance-dashboard__alert-icon">⚠️</span>
            <span className="performance-dashboard__alert-text">
              {criticalAlerts} critical alert{criticalAlerts !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        <style jsx>{`
          .performance-dashboard--compact {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            max-width: 300px;
          }

          .performance-dashboard__header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }

          .performance-dashboard__title {
            font-size: 1rem;
            font-weight: 600;
            color: #1e293b;
          }

          .performance-dashboard__score-circle {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          }

          .performance-dashboard__score-circle::before {
            content: '';
            position: absolute;
            width: 36px;
            height: 36px;
            background: white;
            border-radius: 50%;
          }

          .performance-dashboard__score-value {
            font-size: 0.875rem;
            font-weight: 700;
            color: ${getScoreColor(overallScore)};
            z-index: 1;
          }

          .performance-dashboard__metrics {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 12px;
          }

          .performance-dashboard__metric {
            text-align: center;
          }

          .performance-dashboard__metric-label {
            font-size: 0.75rem;
            color: #64748b;
            margin-bottom: 4px;
          }

          .performance-dashboard__metric-value {
            font-size: 1rem;
            font-weight: 600;
            color: #1e293b;
          }

          .performance-dashboard__alerts {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
          }

          .performance-dashboard__alert-icon {
            font-size: 1rem;
          }

          .performance-dashboard__alert-text {
            font-size: 0.75rem;
            color: #dc2626;
            font-weight: 500;
          }

          /* Dark theme */
          @media (prefers-color-scheme: dark) {
            .performance-dashboard--compact {
              background: #1e293b;
              border-color: #334155;
            }

            .performance-dashboard__title,
            .performance-dashboard__metric-value {
              color: #f1f5f9;
            }

            .performance-dashboard__metric-label {
              color: #94a3b8;
            }

            .performance-dashboard__score-circle::before {
              background: #1e293b;
            }

            .performance-dashboard__alerts {
              background: rgba(220, 38, 38, 0.1);
              border-color: rgba(220, 38, 38, 0.3);
            }

            .performance-dashboard__alert-text {
              color: #fca5a5;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="performance-dashboard performance-dashboard--full">
      {/* Header */}
      <div className="performance-dashboard__header">
        <div className="performance-dashboard__header-content">
          <h2 className="performance-dashboard__title">
            🚀 Performance Dashboard
          </h2>
          <p className="performance-dashboard__subtitle">
            Monitor and optimize your app's performance with real-time metrics and actionable insights.
          </p>
        </div>

        <div className="performance-dashboard__header-controls">
          <div className="performance-dashboard__score-display">
            <div 
              className="performance-dashboard__score-circle"
              style={{ 
                background: `conic-gradient(${getScoreColor(overallScore)} ${overallScore}%, #e5e7eb 0%)`
              }}
            >
              <div className="performance-dashboard__score-value">{overallScore}</div>
              <div className="performance-dashboard__score-label">Score</div>
            </div>
          </div>

          <div className="performance-dashboard__monitoring-controls">
            <button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              className={`performance-dashboard__control-btn ${isMonitoring ? 'active' : ''}`}
            >
              {isMonitoring ? '⏸️ Pause' : '▶️ Start'} Monitoring
            </button>
            
            <button
              onClick={optimizeMemory}
              className="performance-dashboard__control-btn"
              disabled={dashboardData.memoryMetrics?.memoryPressure === 'low'}
            >
              ♻️ Optimize Memory
            </button>

            <button
              onClick={optimizeBundles}
              className="performance-dashboard__control-btn"
            >
              📦 Optimize Bundles
            </button>
          </div>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {criticalAlerts > 0 && (
        <div className="performance-dashboard__alert-banner">
          <div className="performance-dashboard__alert-content">
            <span className="performance-dashboard__alert-icon">🚨</span>
            <div className="performance-dashboard__alert-info">
              <strong>{criticalAlerts} Critical Performance Issue{criticalAlerts !== 1 ? 's' : ''} Detected</strong>
              <p>Immediate attention recommended to maintain optimal performance.</p>
            </div>
          </div>
          <div className="performance-dashboard__alert-actions">
            <button
              onClick={() => setActiveTab('alerts')}
              className="performance-dashboard__alert-btn"
            >
              View Alerts
            </button>
            <button
              onClick={clearAlerts}
              className="performance-dashboard__alert-btn performance-dashboard__alert-btn--secondary"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="performance-dashboard__nav">
        <div className="performance-dashboard__nav-tabs">
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'metrics', label: 'Core Web Vitals', icon: '⚡' },
            { key: 'memory', label: 'Memory & Runtime', icon: '💾' },
            { key: 'recommendations', label: 'Recommendations', icon: '💡' },
            { key: 'alerts', label: 'Alerts', icon: '🚨', badge: unacknowledgedAlerts.length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`performance-dashboard__nav-tab ${activeTab === tab.key ? 'active' : ''}`}
            >
              <span className="performance-dashboard__nav-tab-icon">{tab.icon}</span>
              <span className="performance-dashboard__nav-tab-label">{tab.label}</span>
              {tab.badge && tab.badge > 0 && (
                <span className="performance-dashboard__nav-tab-badge">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {showTimeline && (
          <div className="performance-dashboard__time-range">
            {['1h', '24h', '7d', '30d'].map(range => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range as any)}
                className={`performance-dashboard__time-btn ${selectedTimeRange === range ? 'active' : ''}`}
              >
                {range}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dashboard Content */}
      <div className="performance-dashboard__content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="performance-dashboard__overview">
            {/* Key Metrics Grid */}
            <div className="performance-dashboard__metrics-grid">
              <div className="performance-dashboard__metric-card">
                <div className="performance-dashboard__metric-header">
                  <span className="performance-dashboard__metric-icon">⚡</span>
                  <span className="performance-dashboard__metric-name">Core Web Vitals Score</span>
                </div>
                <div className="performance-dashboard__metric-value-large">
                  {Math.round((
                    (dashboardData.coreVitals?.lcp?.value <= 2500 ? 100 : Math.max(0, 100 - (dashboardData.coreVitals?.lcp?.value - 2500) / 20)) +
                    (dashboardData.coreVitals?.fid?.value <= 100 ? 100 : Math.max(0, 100 - (dashboardData.coreVitals?.fid?.value - 100) / 2)) +
                    (dashboardData.coreVitals?.cls?.value <= 0.1 ? 100 : Math.max(0, 100 - (dashboardData.coreVitals?.cls?.value - 0.1) * 500))
                  ) / 3)}
                </div>
                <div className="performance-dashboard__metric-subtitle">Average across LCP, FID, CLS</div>
              </div>

              <div className="performance-dashboard__metric-card">
                <div className="performance-dashboard__metric-header">
                  <span className="performance-dashboard__metric-icon">💾</span>
                  <span className="performance-dashboard__metric-name">Memory Usage</span>
                </div>
                <div className="performance-dashboard__metric-value-large">
                  {Math.round(dashboardData.memoryMetrics?.memoryUsagePercentage || 0)}%
                </div>
                <div className="performance-dashboard__metric-subtitle">
                  {formatFileSize(dashboardData.memoryMetrics?.usedJSHeapSize || 0)} / {formatFileSize(dashboardData.memoryMetrics?.jsHeapSizeLimit || 0)}
                </div>
              </div>

              <div className="performance-dashboard__metric-card">
                <div className="performance-dashboard__metric-header">
                  <span className="performance-dashboard__metric-icon">🎮</span>
                  <span className="performance-dashboard__metric-name">Frame Rate</span>
                </div>
                <div className="performance-dashboard__metric-value-large">
                  {dashboardData.runtimeMetrics?.fps || 0} FPS
                </div>
                <div className="performance-dashboard__metric-subtitle">
                  {dashboardData.runtimeMetrics?.frameDrops || 0} dropped frames
                </div>
              </div>

              <div className="performance-dashboard__metric-card">
                <div className="performance-dashboard__metric-header">
                  <span className="performance-dashboard__metric-icon">📦</span>
                  <span className="performance-dashboard__metric-name">Bundle Size</span>
                </div>
                <div className="performance-dashboard__metric-value-large">
                  {formatFileSize(dashboardData.bundleAnalysis?.totalSize || 0)}
                </div>
                <div className="performance-dashboard__metric-subtitle">
                  {formatFileSize(dashboardData.bundleAnalysis?.gzippedSize || 0)} gzipped
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="performance-dashboard__quick-actions">
              <h3 className="performance-dashboard__section-title">Quick Optimizations</h3>
              <div className="performance-dashboard__action-grid">
                <button 
                  className="performance-dashboard__action-card"
                  onClick={optimizeMemory}
                  disabled={dashboardData.memoryMetrics?.memoryPressure === 'low'}
                >
                  <span className="performance-dashboard__action-icon">♻️</span>
                  <div className="performance-dashboard__action-content">
                    <div className="performance-dashboard__action-title">Optimize Memory</div>
                    <div className="performance-dashboard__action-description">
                      Clear caches and free up memory
                    </div>
                  </div>
                </button>

                <button 
                  className="performance-dashboard__action-card"
                  onClick={optimizeBundles}
                >
                  <span className="performance-dashboard__action-icon">📦</span>
                  <div className="performance-dashboard__action-content">
                    <div className="performance-dashboard__action-title">Analyze Bundles</div>
                    <div className="performance-dashboard__action-description">
                      Find optimization opportunities
                    </div>
                  </div>
                </button>

                <button 
                  className="performance-dashboard__action-card"
                  onClick={() => applyRecommendations(dashboardData.recommendations || [])}
                  disabled={!dashboardData.recommendations?.length}
                >
                  <span className="performance-dashboard__action-icon">🔧</span>
                  <div className="performance-dashboard__action-content">
                    <div className="performance-dashboard__action-title">Apply Recommendations</div>
                    <div className="performance-dashboard__action-description">
                      Auto-apply performance fixes
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Core Web Vitals Tab */}
        {activeTab === 'metrics' && (
          <div className="performance-dashboard__vitals">
            <div className="performance-dashboard__vitals-grid">
              {dashboardData.coreVitals && Object.entries(dashboardData.coreVitals).map(([key, vital]) => {
                if (!vital || typeof vital.value === 'undefined') return null;
                
                const thresholds = {
                  lcp: { good: 2500, needsImprovement: 4000, poor: 4000 },
                  fid: { good: 100, needsImprovement: 300, poor: 300 },
                  cls: { good: 0.1, needsImprovement: 0.25, poor: 0.25 },
                  fcp: { good: 1800, needsImprovement: 3000, poor: 3000 },
                  tti: { good: 3800, needsImprovement: 7300, poor: 7300 },
                  tbt: { good: 200, needsImprovement: 600, poor: 600 }
                }[key as keyof typeof dashboardData.coreVitals];

                if (!thresholds) return null;

                const status = getMetricStatus(vital.value, thresholds);
                
                return (
                  <div key={key} className="performance-dashboard__vital-card">
                    <div className="performance-dashboard__vital-header">
                      <div className="performance-dashboard__vital-name">{vital.name}</div>
                      <div 
                        className="performance-dashboard__vital-status"
                        style={{ backgroundColor: status.color }}
                      >
                        {status.status}
                      </div>
                    </div>
                    
                    <div className="performance-dashboard__vital-value">
                      {key === 'cls' ? vital.value.toFixed(3) : formatDuration(vital.value)}
                    </div>
                    
                    <div className="performance-dashboard__vital-thresholds">
                      <div className="performance-dashboard__threshold">
                        <span className="performance-dashboard__threshold-label">Good:</span>
                        <span className="performance-dashboard__threshold-value">
                          {key === 'cls' ? `< ${thresholds.good}` : `< ${formatDuration(thresholds.good)}`}
                        </span>
                      </div>
                      <div className="performance-dashboard__threshold">
                        <span className="performance-dashboard__threshold-label">Poor:</span>
                        <span className="performance-dashboard__threshold-value">
                          {key === 'cls' ? `> ${thresholds.poor}` : `> ${formatDuration(thresholds.poor)}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Memory & Runtime Tab */}
        {activeTab === 'memory' && (
          <div className="performance-dashboard__memory">
            <div className="performance-dashboard__memory-grid">
              {/* Memory Usage */}
              <div className="performance-dashboard__memory-card">
                <h4 className="performance-dashboard__card-title">Memory Usage</h4>
                <div className="performance-dashboard__memory-chart">
                  <div 
                    className="performance-dashboard__memory-bar"
                    style={{
                      background: `linear-gradient(to right, 
                        ${dashboardData.memoryMetrics?.memoryPressure === 'critical' ? '#ef4444' : 
                          dashboardData.memoryMetrics?.memoryPressure === 'high' ? '#f97316' : 
                          dashboardData.memoryMetrics?.memoryPressure === 'medium' ? '#f59e0b' : '#10b981'} 
                        ${dashboardData.memoryMetrics?.memoryUsagePercentage || 0}%, 
                        #e5e7eb 0%)`
                    }}
                  >
                    <div className="performance-dashboard__memory-percentage">
                      {Math.round(dashboardData.memoryMetrics?.memoryUsagePercentage || 0)}%
                    </div>
                  </div>
                </div>
                <div className="performance-dashboard__memory-details">
                  <div>Used: {formatFileSize(dashboardData.memoryMetrics?.usedJSHeapSize || 0)}</div>
                  <div>Limit: {formatFileSize(dashboardData.memoryMetrics?.jsHeapSizeLimit || 0)}</div>
                  <div>DOM Nodes: {dashboardData.memoryMetrics?.domNodeCount?.toLocaleString() || 0}</div>
                </div>
              </div>

              {/* Runtime Performance */}
              <div className="performance-dashboard__runtime-card">
                <h4 className="performance-dashboard__card-title">Runtime Performance</h4>
                <div className="performance-dashboard__runtime-metrics">
                  <div className="performance-dashboard__runtime-metric">
                    <div className="performance-dashboard__runtime-label">Frame Rate</div>
                    <div className="performance-dashboard__runtime-value">
                      {dashboardData.runtimeMetrics?.fps || 0} FPS
                    </div>
                  </div>
                  <div className="performance-dashboard__runtime-metric">
                    <div className="performance-dashboard__runtime-label">Frame Time</div>
                    <div className="performance-dashboard__runtime-value">
                      {dashboardData.runtimeMetrics?.frameTime || 0}ms
                    </div>
                  </div>
                  <div className="performance-dashboard__runtime-metric">
                    <div className="performance-dashboard__runtime-label">Input Latency</div>
                    <div className="performance-dashboard__runtime-value">
                      {dashboardData.runtimeMetrics?.inputLatency || 0}ms
                    </div>
                  </div>
                  <div className="performance-dashboard__runtime-metric">
                    <div className="performance-dashboard__runtime-label">Long Tasks</div>
                    <div className="performance-dashboard__runtime-value">
                      {dashboardData.runtimeMetrics?.longTasks?.length || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && showRecommendations && (
          <div className="performance-dashboard__recommendations">
            {dashboardData.recommendations && dashboardData.recommendations.length > 0 ? (
              <div className="performance-dashboard__recommendations-list">
                {dashboardData.recommendations.map((recommendation, index) => (
                  <div 
                    key={index}
                    className={`performance-dashboard__recommendation ${recommendation.priority}`}
                  >
                    <div className="performance-dashboard__recommendation-header">
                      <div className="performance-dashboard__recommendation-title">
                        <span className="performance-dashboard__recommendation-icon">
                          {recommendation.type === 'code' ? '💻' : 
                           recommendation.type === 'configuration' ? '⚙️' : 
                           recommendation.type === 'architecture' ? '🏗️' : '🌐'}
                        </span>
                        {recommendation.title}
                      </div>
                      <div className={`performance-dashboard__recommendation-priority ${recommendation.priority}`}>
                        {recommendation.priority}
                      </div>
                    </div>
                    
                    <div className="performance-dashboard__recommendation-content">
                      <p className="performance-dashboard__recommendation-description">
                        {recommendation.description}
                      </p>
                      <p className="performance-dashboard__recommendation-implementation">
                        <strong>Implementation:</strong> {recommendation.implementation}
                      </p>
                      <div className="performance-dashboard__recommendation-stats">
                        <span>Estimated improvement: {recommendation.estimatedImprovement}%</span>
                        <span>Effort: {recommendation.effort}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="performance-dashboard__empty-state">
                <span className="performance-dashboard__empty-icon">✨</span>
                <h3>No Recommendations Available</h3>
                <p>Your app is performing well! Check back later for optimization suggestions.</p>
              </div>
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="performance-dashboard__alerts-list">
            {unacknowledgedAlerts.length > 0 ? (
              unacknowledgedAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`performance-dashboard__alert-item ${alert.severity}`}
                >
                  <div className="performance-dashboard__alert-header">
                    <span className="performance-dashboard__alert-icon">
                      {alert.severity === 'critical' ? '🚨' : 
                       alert.severity === 'high' ? '⚠️' : 
                       alert.severity === 'medium' ? '📢' : 'ℹ️'}
                    </span>
                    <div className="performance-dashboard__alert-content">
                      <div className="performance-dashboard__alert-message">{alert.message}</div>
                      <div className="performance-dashboard__alert-time">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="performance-dashboard__alert-acknowledge"
                    >
                      ✓ Acknowledge
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="performance-dashboard__empty-state">
                <span className="performance-dashboard__empty-icon">✅</span>
                <h3>No Active Alerts</h3>
                <p>All performance metrics are within acceptable ranges.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .performance-dashboard--full {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          max-width: 1400px;
          margin: 0 auto;
        }

        .performance-dashboard__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .performance-dashboard__title {
          margin: 0 0 8px 0;
          font-size: 1.5rem;
          font-weight: 800;
        }

        .performance-dashboard__subtitle {
          margin: 0;
          opacity: 0.9;
          font-size: 0.875rem;
        }

        .performance-dashboard__header-controls {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .performance-dashboard__score-display {
          text-align: center;
        }

        .performance-dashboard__score-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          margin-bottom: 8px;
        }

        .performance-dashboard__score-circle::before {
          content: '';
          position: absolute;
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 50%;
        }

        .performance-dashboard__score-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: ${getScoreColor(overallScore)};
          z-index: 1;
        }

        .performance-dashboard__score-label {
          font-size: 0.75rem;
          color: #64748b;
          z-index: 1;
        }

        .performance-dashboard__monitoring-controls {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .performance-dashboard__control-btn {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          color: white;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .performance-dashboard__control-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
        }

        .performance-dashboard__control-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .performance-dashboard__control-btn.active {
          background: rgba(16, 185, 129, 0.8);
          border-color: #10b981;
        }

        .performance-dashboard__alert-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: #fef2f2;
          border-bottom: 1px solid #fecaca;
        }

        .performance-dashboard__alert-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .performance-dashboard__alert-icon {
          font-size: 1.5rem;
        }

        .performance-dashboard__alert-info strong {
          display: block;
          color: #dc2626;
          margin-bottom: 4px;
        }

        .performance-dashboard__alert-info p {
          margin: 0;
          color: #7f1d1d;
          font-size: 0.875rem;
        }

        .performance-dashboard__alert-actions {
          display: flex;
          gap: 8px;
        }

        .performance-dashboard__alert-btn {
          padding: 6px 12px;
          border: 1px solid #dc2626;
          border-radius: 4px;
          background: #dc2626;
          color: white;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .performance-dashboard__alert-btn--secondary {
          background: transparent;
          color: #dc2626;
        }

        .performance-dashboard__alert-btn:hover {
          background: #b91c1c;
          border-color: #b91c1c;
        }

        .performance-dashboard__alert-btn--secondary:hover {
          background: #fef2f2;
        }

        .performance-dashboard__nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .performance-dashboard__nav-tabs {
          display: flex;
          gap: 2px;
        }

        .performance-dashboard__nav-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border: none;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 8px 8px 0 0;
          position: relative;
        }

        .performance-dashboard__nav-tab:hover {
          background: rgba(100, 116, 139, 0.1);
          color: #1e293b;
        }

        .performance-dashboard__nav-tab.active {
          background: white;
          color: #3b82f6;
          border-bottom: 2px solid #3b82f6;
        }

        .performance-dashboard__nav-tab-icon {
          font-size: 1rem;
        }

        .performance-dashboard__nav-tab-label {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .performance-dashboard__nav-tab-badge {
          background: #ef4444;
          color: white;
          font-size: 0.75rem;
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: 4px;
        }

        .performance-dashboard__time-range {
          display: flex;
          gap: 4px;
        }

        .performance-dashboard__time-btn {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          background: white;
          color: #6b7280;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .performance-dashboard__time-btn:first-child {
          border-radius: 6px 0 0 6px;
        }

        .performance-dashboard__time-btn:last-child {
          border-radius: 0 6px 6px 0;
        }

        .performance-dashboard__time-btn:hover {
          background: #f3f4f6;
        }

        .performance-dashboard__time-btn.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .performance-dashboard__content {
          padding: 24px;
        }

        .performance-dashboard__metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .performance-dashboard__metric-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.2s ease;
        }

        .performance-dashboard__metric-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .performance-dashboard__metric-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .performance-dashboard__metric-icon {
          font-size: 1.25rem;
        }

        .performance-dashboard__metric-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
        }

        .performance-dashboard__metric-value-large {
          font-size: 2rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .performance-dashboard__metric-subtitle {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .performance-dashboard__section-title {
          margin: 0 0 20px 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
        }

        .performance-dashboard__action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .performance-dashboard__action-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .performance-dashboard__action-card:hover:not(:disabled) {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .performance-dashboard__action-card:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .performance-dashboard__action-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .performance-dashboard__action-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .performance-dashboard__action-description {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .performance-dashboard__vitals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .performance-dashboard__vital-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
        }

        .performance-dashboard__vital-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .performance-dashboard__vital-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e293b;
        }

        .performance-dashboard__vital-status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          color: white;
          text-transform: capitalize;
        }

        .performance-dashboard__vital-value {
          font-size: 2rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 16px;
        }

        .performance-dashboard__vital-thresholds {
          display: flex;
          justify-content: space-between;
        }

        .performance-dashboard__threshold {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .performance-dashboard__threshold-label {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .performance-dashboard__threshold-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e293b;
        }

        .performance-dashboard__memory-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }

        .performance-dashboard__memory-card,
        .performance-dashboard__runtime-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
        }

        .performance-dashboard__card-title {
          margin: 0 0 16px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .performance-dashboard__memory-chart {
          margin-bottom: 16px;
        }

        .performance-dashboard__memory-bar {
          height: 20px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .performance-dashboard__memory-percentage {
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .performance-dashboard__memory-details {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .performance-dashboard__runtime-metrics {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .performance-dashboard__runtime-metric {
          text-align: center;
        }

        .performance-dashboard__runtime-label {
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 8px;
        }

        .performance-dashboard__runtime-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
        }

        .performance-dashboard__recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .performance-dashboard__recommendation {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          border-left-width: 4px;
        }

        .performance-dashboard__recommendation.critical {
          border-left-color: #ef4444;
        }

        .performance-dashboard__recommendation.high {
          border-left-color: #f97316;
        }

        .performance-dashboard__recommendation.medium {
          border-left-color: #f59e0b;
        }

        .performance-dashboard__recommendation.low {
          border-left-color: #10b981;
        }

        .performance-dashboard__recommendation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .performance-dashboard__recommendation-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .performance-dashboard__recommendation-icon {
          font-size: 1.25rem;
        }

        .performance-dashboard__recommendation-priority {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          color: white;
        }

        .performance-dashboard__recommendation-priority.critical {
          background: #ef4444;
        }

        .performance-dashboard__recommendation-priority.high {
          background: #f97316;
        }

        .performance-dashboard__recommendation-priority.medium {
          background: #f59e0b;
        }

        .performance-dashboard__recommendation-priority.low {
          background: #10b981;
        }

        .performance-dashboard__recommendation-description {
          margin: 0 0 12px 0;
          color: #374151;
          line-height: 1.5;
        }

        .performance-dashboard__recommendation-implementation {
          margin: 0 0 16px 0;
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.4;
        }

        .performance-dashboard__recommendation-stats {
          display: flex;
          gap: 24px;
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .performance-dashboard__alerts-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .performance-dashboard__alert-item {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          border-left-width: 4px;
        }

        .performance-dashboard__alert-item.critical {
          border-left-color: #ef4444;
          background: #fef2f2;
        }

        .performance-dashboard__alert-item.high {
          border-left-color: #f97316;
          background: #fff7ed;
        }

        .performance-dashboard__alert-item.medium {
          border-left-color: #f59e0b;
          background: #fffbeb;
        }

        .performance-dashboard__alert-item.low {
          border-left-color: #10b981;
          background: #f0fdf4;
        }

        .performance-dashboard__alert-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .performance-dashboard__alert-content {
          flex: 1;
        }

        .performance-dashboard__alert-message {
          font-size: 0.875rem;
          font-weight: 500;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .performance-dashboard__alert-time {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .performance-dashboard__alert-acknowledge {
          padding: 6px 12px;
          background: #10b981;
          border: none;
          border-radius: 4px;
          color: white;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .performance-dashboard__alert-acknowledge:hover {
          background: #059669;
        }

        .performance-dashboard__empty-state {
          text-align: center;
          padding: 48px 24px;
          color: #6b7280;
        }

        .performance-dashboard__empty-icon {
          font-size: 3rem;
          margin-bottom: 16px;
          display: block;
        }

        .performance-dashboard__empty-state h3 {
          margin: 0 0 8px 0;
          color: #1e293b;
          font-size: 1.25rem;
        }

        .performance-dashboard__empty-state p {
          margin: 0;
          font-size: 0.875rem;
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          .performance-dashboard--full {
            background: #1e293b;
            border-color: #334155;
          }

          .performance-dashboard__nav {
            background: #0f172a;
            border-color: #334155;
          }

          .performance-dashboard__nav-tab {
            color: #94a3b8;
          }

          .performance-dashboard__nav-tab:hover {
            background: rgba(148, 163, 184, 0.1);
            color: #f1f5f9;
          }

          .performance-dashboard__nav-tab.active {
            background: #1e293b;
            color: #60a5fa;
          }

          .performance-dashboard__time-btn {
            background: #1e293b;
            border-color: #374151;
            color: #d1d5db;
          }

          .performance-dashboard__time-btn:hover {
            background: #334155;
          }

          .performance-dashboard__metric-card,
          .performance-dashboard__action-card,
          .performance-dashboard__vital-card,
          .performance-dashboard__memory-card,
          .performance-dashboard__runtime-card,
          .performance-dashboard__recommendation,
          .performance-dashboard__alert-item {
            background: #1e293b;
            border-color: #334155;
          }

          .performance-dashboard__metric-value-large,
          .performance-dashboard__vital-value,
          .performance-dashboard__runtime-value,
          .performance-dashboard__vital-name,
          .performance-dashboard__card-title,
          .performance-dashboard__section-title,
          .performance-dashboard__action-title,
          .performance-dashboard__recommendation-title,
          .performance-dashboard__alert-message,
          .performance-dashboard__threshold-value {
            color: #f1f5f9;
          }

          .performance-dashboard__metric-name,
          .performance-dashboard__metric-subtitle,
          .performance-dashboard__action-description,
          .performance-dashboard__threshold-label,
          .performance-dashboard__memory-details,
          .performance-dashboard__runtime-label,
          .performance-dashboard__recommendation-description,
          .performance-dashboard__recommendation-implementation,
          .performance-dashboard__recommendation-stats,
            .performance-dashboard__alert-time,
          .performance-dashboard__empty-state p {
            color: #94a3b8;
          }

          .performance-dashboard__alert-item.critical {
            background: rgba(239, 68, 68, 0.1);
          }

          .performance-dashboard__alert-item.high {
            background: rgba(249, 115, 22, 0.1);
          }

          .performance-dashboard__alert-item.medium {
            background: rgba(245, 158, 11, 0.1);
          }

          .performance-dashboard__alert-item.low {
            background: rgba(16, 185, 129, 0.1);
          }

          .performance-dashboard__empty-state h3 {
            color: #f1f5f9;
          }

          .performance-dashboard__action-card:hover:not(:disabled) {
            border-color: #60a5fa;
            background: rgba(96, 165, 250, 0.1);
          }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .performance-dashboard__header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .performance-dashboard__nav {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .performance-dashboard__nav-tabs {
            overflow-x: auto;
            padding-bottom: 8px;
          }

          .performance-dashboard__metrics-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }

          .performance-dashboard__action-grid {
            grid-template-columns: 1fr;
          }

          .performance-dashboard__vitals-grid {
            grid-template-columns: 1fr;
          }

          .performance-dashboard__memory-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .performance-dashboard__content {
            padding: 16px;
          }

          .performance-dashboard__header {
            padding: 16px;
          }

          .performance-dashboard__nav {
            padding: 0 16px;
          }

          .performance-dashboard__monitoring-controls {
            flex-direction: row;
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};
