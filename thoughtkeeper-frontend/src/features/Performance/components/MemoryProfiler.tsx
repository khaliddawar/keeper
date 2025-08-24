import React, { useState, useEffect, useMemo } from 'react';
import { useMemoryOptimization } from '../PerformanceProvider';
import type { MemoryMonitorProps, MemoryMetrics } from '../types';

/**
 * Memory Profiler Component
 * 
 * Advanced memory monitoring and profiling component that tracks memory usage,
 * detects memory leaks, provides optimization suggestions, and visualizes
 * memory consumption patterns over time.
 */
export const MemoryProfiler: React.FC<MemoryMonitorProps> = ({
  showChart = true,
  showBreakdown = true,
  alertThreshold = 75
}) => {
  const {
    memoryMetrics,
    memoryPressure,
    optimizeMemory,
    forceGarbageCollection,
    cleanupEventListeners,
    setMemoryThreshold,
    enableAutoOptimization
  } = useMemoryOptimization();

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [viewMode, setViewMode] = useState<'overview' | 'timeline' | 'breakdown' | 'leaks'>('overview');
  const [memoryHistory, setMemoryHistory] = useState<Array<{
    timestamp: number;
    used: number;
    total: number;
    percentage: number;
  }>>([]);

  // Simulate memory monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const newPoint = {
        timestamp: Date.now(),
        used: memoryMetrics.usedJSHeapSize,
        total: memoryMetrics.totalJSHeapSize,
        percentage: memoryMetrics.memoryUsagePercentage
      };

      setMemoryHistory(prev => {
        const updated = [...prev, newPoint];
        // Keep last 50 points
        return updated.slice(-50);
      });
    }, 2000); // Every 2 seconds

    return () => clearInterval(interval);
  }, [isMonitoring, memoryMetrics]);

  // Auto-optimization
  useEffect(() => {
    if (autoOptimize && memoryMetrics.memoryUsagePercentage > alertThreshold) {
      console.log('🔧 Auto-optimizing memory due to high usage');
      optimizeMemory();
    }
  }, [autoOptimize, memoryMetrics.memoryUsagePercentage, alertThreshold, optimizeMemory]);

  // Format memory size
  const formatMemorySize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Get memory pressure color
  const getMemoryPressureColor = (pressure: string): string => {
    switch (pressure) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Get memory usage color based on percentage
  const getMemoryUsageColor = (percentage: number): string => {
    if (percentage >= 90) return '#ef4444';
    if (percentage >= 75) return '#f97316';
    if (percentage >= 50) return '#f59e0b';
    return '#10b981';
  };

  // Detect potential memory leaks (simplified)
  const detectMemoryLeaks = useMemo(() => {
    if (memoryHistory.length < 10) return [];

    const leaks = [];
    const recentPoints = memoryHistory.slice(-10);
    const trend = recentPoints[recentPoints.length - 1].used - recentPoints[0].used;
    const averageIncrease = trend / recentPoints.length;

    // If memory is consistently increasing
    if (averageIncrease > 1024 * 1024) { // 1MB per sample
      leaks.push({
        type: 'Memory Leak Suspected',
        severity: 'high',
        description: `Memory usage increasing by ~${formatMemorySize(averageIncrease)} per sample`,
        suggestion: 'Check for event listeners, timers, or retained object references'
      });
    }

    // Check DOM node count
    if (memoryMetrics.domNodeCount > 10000) {
      leaks.push({
        type: 'High DOM Node Count',
        severity: memoryMetrics.domNodeCount > 20000 ? 'critical' : 'medium',
        description: `${memoryMetrics.domNodeCount.toLocaleString()} DOM nodes detected`,
        suggestion: 'Consider virtualizing lists or cleaning up unused DOM elements'
      });
    }

    // Check event listener count
    if (memoryMetrics.eventListenerCount > 1000) {
      leaks.push({
        type: 'High Event Listener Count',
        severity: memoryMetrics.eventListenerCount > 2000 ? 'high' : 'medium',
        description: `${memoryMetrics.eventListenerCount} event listeners registered`,
        suggestion: 'Remove unused event listeners and use event delegation'
      });
    }

    return leaks;
  }, [memoryHistory, memoryMetrics]);

  // Memory breakdown data
  const memoryBreakdown = useMemo(() => {
    const total = memoryMetrics.usedJSHeapSize;
    if (total === 0) return [];

    // Simulated breakdown (in real implementation, this would come from detailed profiling)
    return [
      { name: 'Components', size: total * 0.35, color: '#3b82f6' },
      { name: 'Application Data', size: total * 0.25, color: '#10b981' },
      { name: 'Framework Overhead', size: total * 0.15, color: '#f59e0b' },
      { name: 'DOM References', size: total * 0.12, color: '#8b5cf6' },
      { name: 'Event Listeners', size: total * 0.08, color: '#ef4444' },
      { name: 'Other', size: total * 0.05, color: '#6b7280' }
    ];
  }, [memoryMetrics.usedJSHeapSize]);

  return (
    <div className="memory-profiler">
      {/* Header */}
      <div className="memory-profiler__header">
        <div className="memory-profiler__header-content">
          <h2 className="memory-profiler__title">💾 Memory Profiler</h2>
          <p className="memory-profiler__subtitle">
            Monitor memory usage, detect leaks, and optimize memory consumption.
          </p>
        </div>

        <div className="memory-profiler__header-controls">
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`memory-profiler__control-btn ${isMonitoring ? 'active' : ''}`}
          >
            {isMonitoring ? '⏸️ Pause' : '▶️ Start'} Monitoring
          </button>
          
          <button
            onClick={optimizeMemory}
            className="memory-profiler__control-btn"
            disabled={memoryPressure === 'low'}
          >
            ♻️ Optimize Memory
          </button>

          <button
            onClick={forceGarbageCollection}
            className="memory-profiler__control-btn"
          >
            🗑️ Force GC
          </button>
        </div>
      </div>

      {/* Memory Status Banner */}
      <div 
        className={`memory-profiler__status ${memoryPressure}`}
        style={{ borderColor: getMemoryPressureColor(memoryPressure) }}
      >
        <div className="memory-profiler__status-content">
          <div className="memory-profiler__status-info">
            <span className="memory-profiler__status-icon">
              {memoryPressure === 'critical' ? '🚨' : 
               memoryPressure === 'high' ? '⚠️' : 
               memoryPressure === 'medium' ? '📢' : '✅'}
            </span>
            <div className="memory-profiler__status-text">
              <div className="memory-profiler__status-label">
                Memory Pressure: {memoryPressure.charAt(0).toUpperCase() + memoryPressure.slice(1)}
              </div>
              <div className="memory-profiler__status-details">
                {formatMemorySize(memoryMetrics.usedJSHeapSize)} / {formatMemorySize(memoryMetrics.jsHeapSizeLimit)} 
                ({Math.round(memoryMetrics.memoryUsagePercentage)}%)
              </div>
            </div>
          </div>

          <div className="memory-profiler__status-actions">
            <label className="memory-profiler__auto-optimize">
              <input
                type="checkbox"
                checked={autoOptimize}
                onChange={(e) => setAutoOptimize(e.target.checked)}
              />
              Auto-optimize
            </label>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="memory-profiler__nav">
        {[
          { key: 'overview', label: 'Overview', icon: '📊' },
          { key: 'timeline', label: 'Timeline', icon: '📈' },
          showBreakdown && { key: 'breakdown', label: 'Breakdown', icon: '🥧' },
          { key: 'leaks', label: 'Leak Detection', icon: '🔍', badge: detectMemoryLeaks.length }
        ].filter(Boolean).map(tab => tab && (
          <button
            key={tab.key}
            onClick={() => setViewMode(tab.key as any)}
            className={`memory-profiler__nav-btn ${viewMode === tab.key ? 'active' : ''}`}
          >
            <span className="memory-profiler__nav-icon">{tab.icon}</span>
            <span className="memory-profiler__nav-label">{tab.label}</span>
            {tab.badge && tab.badge > 0 && (
              <span className="memory-profiler__nav-badge">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="memory-profiler__content">
        {/* Overview */}
        {viewMode === 'overview' && (
          <div className="memory-profiler__overview">
            <div className="memory-profiler__overview-grid">
              {/* Memory Usage */}
              <div className="memory-profiler__overview-card">
                <h3 className="memory-profiler__card-title">Memory Usage</h3>
                <div className="memory-profiler__usage-chart">
                  <div 
                    className="memory-profiler__usage-bar"
                    style={{
                      background: `linear-gradient(to right, 
                        ${getMemoryUsageColor(memoryMetrics.memoryUsagePercentage)} ${memoryMetrics.memoryUsagePercentage}%, 
                        #e5e7eb 0%)`
                    }}
                  >
                    <div className="memory-profiler__usage-percentage">
                      {Math.round(memoryMetrics.memoryUsagePercentage)}%
                    </div>
                  </div>
                </div>
                <div className="memory-profiler__usage-details">
                  <div>Used: {formatMemorySize(memoryMetrics.usedJSHeapSize)}</div>
                  <div>Total: {formatMemorySize(memoryMetrics.totalJSHeapSize)}</div>
                  <div>Limit: {formatMemorySize(memoryMetrics.jsHeapSizeLimit)}</div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="memory-profiler__overview-card">
                <h3 className="memory-profiler__card-title">Key Metrics</h3>
                <div className="memory-profiler__metrics-grid">
                  <div className="memory-profiler__metric">
                    <div className="memory-profiler__metric-value">
                      {memoryMetrics.domNodeCount?.toLocaleString() || '0'}
                    </div>
                    <div className="memory-profiler__metric-label">DOM Nodes</div>
                  </div>
                  <div className="memory-profiler__metric">
                    <div className="memory-profiler__metric-value">
                      {memoryMetrics.eventListenerCount?.toLocaleString() || '0'}
                    </div>
                    <div className="memory-profiler__metric-label">Event Listeners</div>
                  </div>
                  <div className="memory-profiler__metric">
                    <div className="memory-profiler__metric-value">
                      {memoryMetrics.componentMountCount || '0'}
                    </div>
                    <div className="memory-profiler__metric-label">Components</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="memory-profiler__overview-card">
                <h3 className="memory-profiler__card-title">Quick Actions</h3>
                <div className="memory-profiler__actions-grid">
                  <button
                    onClick={optimizeMemory}
                    className="memory-profiler__action-btn"
                    disabled={memoryPressure === 'low'}
                  >
                    <span className="memory-profiler__action-icon">♻️</span>
                    <div className="memory-profiler__action-text">
                      <div className="memory-profiler__action-title">Optimize Memory</div>
                      <div className="memory-profiler__action-desc">Clear caches and free memory</div>
                    </div>
                  </button>

                  <button
                    onClick={cleanupEventListeners}
                    className="memory-profiler__action-btn"
                  >
                    <span className="memory-profiler__action-icon">🧹</span>
                    <div className="memory-profiler__action-text">
                      <div className="memory-profiler__action-title">Cleanup Listeners</div>
                      <div className="memory-profiler__action-desc">Remove unused event listeners</div>
                    </div>
                  </button>

                  <button
                    onClick={forceGarbageCollection}
                    className="memory-profiler__action-btn"
                  >
                    <span className="memory-profiler__action-icon">🗑️</span>
                    <div className="memory-profiler__action-text">
                      <div className="memory-profiler__action-title">Force GC</div>
                      <div className="memory-profiler__action-desc">Trigger garbage collection</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        {viewMode === 'timeline' && (
          <div className="memory-profiler__timeline">
            <div className="memory-profiler__timeline-controls">
              <h3 className="memory-profiler__section-title">Memory Timeline</h3>
              <div className="memory-profiler__timeline-info">
                {isMonitoring ? (
                  <span className="memory-profiler__monitoring-status">🔴 Recording</span>
                ) : (
                  <span className="memory-profiler__monitoring-status">⏸️ Paused</span>
                )}
                <span className="memory-profiler__timeline-points">
                  {memoryHistory.length} data points
                </span>
              </div>
            </div>

            {showChart && memoryHistory.length > 1 ? (
              <div className="memory-profiler__chart-container">
                <div className="memory-profiler__chart">
                  <svg width="100%" height="200" className="memory-profiler__chart-svg">
                    {/* Chart grid lines */}
                    {[0, 25, 50, 75, 100].map(y => (
                      <line
                        key={y}
                        x1="0"
                        y1={`${y}%`}
                        x2="100%"
                        y2={`${y}%`}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                      />
                    ))}
                    
                    {/* Memory usage line */}
                    <polyline
                      points={memoryHistory.map((point, index) => {
                        const x = (index / (memoryHistory.length - 1)) * 100;
                        const y = 100 - point.percentage;
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                    />
                    
                    {/* Alert threshold line */}
                    <line
                      x1="0"
                      y1={`${100 - alertThreshold}%`}
                      x2="100%"
                      y2={`${100 - alertThreshold}%`}
                      stroke="#ef4444"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                    />
                  </svg>
                </div>
                
                <div className="memory-profiler__chart-legend">
                  <div className="memory-profiler__legend-item">
                    <div className="memory-profiler__legend-color" style={{ backgroundColor: '#3b82f6' }} />
                    <span>Memory Usage</span>
                  </div>
                  <div className="memory-profiler__legend-item">
                    <div className="memory-profiler__legend-color memory-profiler__legend-color--dashed" style={{ backgroundColor: '#ef4444' }} />
                    <span>Alert Threshold ({alertThreshold}%)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="memory-profiler__no-data">
                <span className="memory-profiler__no-data-icon">📈</span>
                <h4>No Timeline Data</h4>
                <p>Start monitoring to see memory usage over time.</p>
              </div>
            )}
          </div>
        )}

        {/* Breakdown */}
        {viewMode === 'breakdown' && showBreakdown && (
          <div className="memory-profiler__breakdown">
            <h3 className="memory-profiler__section-title">Memory Breakdown</h3>
            
            <div className="memory-profiler__breakdown-chart">
              <div className="memory-profiler__breakdown-bars">
                {memoryBreakdown.map((item, index) => (
                  <div key={item.name} className="memory-profiler__breakdown-bar">
                    <div className="memory-profiler__breakdown-info">
                      <div className="memory-profiler__breakdown-name">
                        <div 
                          className="memory-profiler__breakdown-color"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.name}
                      </div>
                      <div className="memory-profiler__breakdown-size">
                        {formatMemorySize(item.size)}
                      </div>
                    </div>
                    <div className="memory-profiler__breakdown-progress">
                      <div 
                        className="memory-profiler__breakdown-fill"
                        style={{
                          width: `${(item.size / memoryMetrics.usedJSHeapSize) * 100}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Leak Detection */}
        {viewMode === 'leaks' && (
          <div className="memory-profiler__leaks">
            <div className="memory-profiler__leaks-header">
              <h3 className="memory-profiler__section-title">Memory Leak Detection</h3>
              <div className="memory-profiler__leaks-status">
                {detectMemoryLeaks.length === 0 ? (
                  <span className="memory-profiler__leaks-status--good">✅ No Issues Detected</span>
                ) : (
                  <span className="memory-profiler__leaks-status--warning">
                    ⚠️ {detectMemoryLeaks.length} Potential Issue{detectMemoryLeaks.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {detectMemoryLeaks.length > 0 ? (
              <div className="memory-profiler__leaks-list">
                {detectMemoryLeaks.map((leak, index) => (
                  <div 
                    key={index}
                    className={`memory-profiler__leak-item ${leak.severity}`}
                  >
                    <div className="memory-profiler__leak-header">
                      <div className="memory-profiler__leak-type">
                        <span className="memory-profiler__leak-icon">
                          {leak.severity === 'critical' ? '🚨' : 
                           leak.severity === 'high' ? '⚠️' : '📢'}
                        </span>
                        {leak.type}
                      </div>
                      <div className={`memory-profiler__leak-severity ${leak.severity}`}>
                        {leak.severity}
                      </div>
                    </div>
                    
                    <div className="memory-profiler__leak-content">
                      <p className="memory-profiler__leak-description">{leak.description}</p>
                      <p className="memory-profiler__leak-suggestion">
                        <strong>Suggestion:</strong> {leak.suggestion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="memory-profiler__no-leaks">
                <span className="memory-profiler__no-leaks-icon">🎉</span>
                <h4>No Memory Leaks Detected</h4>
                <p>Your application appears to be managing memory efficiently.</p>
                <div className="memory-profiler__leak-tips">
                  <h5>Prevention Tips:</h5>
                  <ul>
                    <li>Remove event listeners when components unmount</li>
                    <li>Clear timers and intervals</li>
                    <li>Avoid circular references</li>
                    <li>Use weak references when appropriate</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .memory-profiler {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }

        .memory-profiler__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .memory-profiler__title {
          margin: 0 0 8px 0;
          font-size: 1.5rem;
          font-weight: 800;
        }

        .memory-profiler__subtitle {
          margin: 0;
          opacity: 0.9;
          font-size: 0.875rem;
        }

        .memory-profiler__header-controls {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .memory-profiler__control-btn {
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

        .memory-profiler__control-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
        }

        .memory-profiler__control-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .memory-profiler__control-btn.active {
          background: rgba(16, 185, 129, 0.8);
          border-color: #10b981;
        }

        .memory-profiler__status {
          padding: 16px 24px;
          border-bottom: 1px solid #e2e8f0;
          border-left-width: 4px;
          border-left-style: solid;
        }

        .memory-profiler__status.critical {
          background: #fef2f2;
        }

        .memory-profiler__status.high {
          background: #fff7ed;
        }

        .memory-profiler__status.medium {
          background: #fffbeb;
        }

        .memory-profiler__status.low {
          background: #f0fdf4;
        }

        .memory-profiler__status-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .memory-profiler__status-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .memory-profiler__status-icon {
          font-size: 1.5rem;
        }

        .memory-profiler__status-label {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .memory-profiler__status-details {
          font-size: 0.875rem;
          color: #64748b;
        }

        .memory-profiler__auto-optimize {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          color: #374151;
        }

        .memory-profiler__nav {
          display: flex;
          padding: 0 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .memory-profiler__nav-btn {
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

        .memory-profiler__nav-btn:hover {
          background: rgba(100, 116, 139, 0.1);
          color: #1e293b;
        }

        .memory-profiler__nav-btn.active {
          background: white;
          color: #3b82f6;
          border-bottom: 2px solid #3b82f6;
        }

        .memory-profiler__nav-icon {
          font-size: 1rem;
        }

        .memory-profiler__nav-label {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .memory-profiler__nav-badge {
          background: #ef4444;
          color: white;
          font-size: 0.75rem;
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: 4px;
        }

        .memory-profiler__content {
          padding: 24px;
        }

        .memory-profiler__overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 24px;
        }

        .memory-profiler__overview-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
        }

        .memory-profiler__card-title {
          margin: 0 0 16px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .memory-profiler__usage-chart {
          margin-bottom: 16px;
        }

        .memory-profiler__usage-bar {
          height: 24px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .memory-profiler__usage-percentage {
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .memory-profiler__usage-details {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .memory-profiler__metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .memory-profiler__metric {
          text-align: center;
        }

        .memory-profiler__metric-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .memory-profiler__metric-label {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .memory-profiler__actions-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .memory-profiler__action-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .memory-profiler__action-btn:hover:not(:disabled) {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .memory-profiler__action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .memory-profiler__action-icon {
          font-size: 1.25rem;
        }

        .memory-profiler__action-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 2px;
        }

        .memory-profiler__action-desc {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .memory-profiler__section-title {
          margin: 0 0 20px 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
        }

        .memory-profiler__timeline-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .memory-profiler__timeline-info {
          display: flex;
          gap: 16px;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .memory-profiler__monitoring-status {
          font-weight: 500;
        }

        .memory-profiler__chart-container {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
        }

        .memory-profiler__chart {
          width: 100%;
          height: 200px;
          margin-bottom: 16px;
        }

        .memory-profiler__chart-svg {
          border: 1px solid #f1f5f9;
          border-radius: 4px;
        }

        .memory-profiler__chart-legend {
          display: flex;
          gap: 24px;
          font-size: 0.875rem;
        }

        .memory-profiler__legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .memory-profiler__legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .memory-profiler__legend-color--dashed {
          background-image: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            currentColor 2px,
            currentColor 4px
          );
        }

        .memory-profiler__no-data {
          text-align: center;
          padding: 48px 24px;
          color: #6b7280;
        }

        .memory-profiler__no-data-icon {
          font-size: 3rem;
          margin-bottom: 16px;
          display: block;
        }

        .memory-profiler__no-data h4 {
          margin: 0 0 8px 0;
          color: #1e293b;
          font-size: 1.125rem;
        }

        .memory-profiler__no-data p {
          margin: 0;
          font-size: 0.875rem;
        }

        .memory-profiler__breakdown-chart {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
        }

        .memory-profiler__breakdown-bars {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .memory-profiler__breakdown-bar {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .memory-profiler__breakdown-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .memory-profiler__breakdown-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #1e293b;
        }

        .memory-profiler__breakdown-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .memory-profiler__breakdown-size {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .memory-profiler__breakdown-progress {
          height: 8px;
          background: #f1f5f9;
          border-radius: 4px;
          overflow: hidden;
        }

        .memory-profiler__breakdown-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .memory-profiler__leaks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .memory-profiler__leaks-status--good {
          color: #059669;
          font-weight: 500;
        }

        .memory-profiler__leaks-status--warning {
          color: #d97706;
          font-weight: 500;
        }

        .memory-profiler__leaks-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .memory-profiler__leak-item {
          background: white;
          border: 1px solid #e5e7eb;
          border-left-width: 4px;
          border-radius: 8px;
          padding: 20px;
        }

        .memory-profiler__leak-item.critical {
          border-left-color: #ef4444;
          background: #fef2f2;
        }

        .memory-profiler__leak-item.high {
          border-left-color: #f97316;
          background: #fff7ed;
        }

        .memory-profiler__leak-item.medium {
          border-left-color: #f59e0b;
          background: #fffbeb;
        }

        .memory-profiler__leak-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .memory-profiler__leak-type {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .memory-profiler__leak-icon {
          font-size: 1.25rem;
        }

        .memory-profiler__leak-severity {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          color: white;
        }

        .memory-profiler__leak-severity.critical {
          background: #ef4444;
        }

        .memory-profiler__leak-severity.high {
          background: #f97316;
        }

        .memory-profiler__leak-severity.medium {
          background: #f59e0b;
        }

        .memory-profiler__leak-description {
          margin: 0 0 12px 0;
          color: #374151;
          line-height: 1.5;
        }

        .memory-profiler__leak-suggestion {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.4;
        }

        .memory-profiler__no-leaks {
          text-align: center;
          padding: 48px 24px;
          color: #6b7280;
        }

        .memory-profiler__no-leaks-icon {
          font-size: 3rem;
          margin-bottom: 16px;
          display: block;
        }

        .memory-profiler__no-leaks h4 {
          margin: 0 0 8px 0;
          color: #1e293b;
          font-size: 1.125rem;
        }

        .memory-profiler__no-leaks p {
          margin: 0 0 24px 0;
          font-size: 0.875rem;
        }

        .memory-profiler__leak-tips {
          text-align: left;
          max-width: 400px;
          margin: 0 auto;
        }

        .memory-profiler__leak-tips h5 {
          margin: 0 0 12px 0;
          color: #1e293b;
          font-size: 0.875rem;
        }

        .memory-profiler__leak-tips ul {
          margin: 0;
          padding-left: 20px;
        }

        .memory-profiler__leak-tips li {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 4px;
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          .memory-profiler {
            background: #1e293b;
            border-color: #334155;
          }

          .memory-profiler__nav {
            background: #0f172a;
            border-color: #334155;
          }

          .memory-profiler__nav-btn {
            color: #94a3b8;
          }

          .memory-profiler__nav-btn:hover {
            color: #f1f5f9;
          }

          .memory-profiler__nav-btn.active {
            background: #1e293b;
            color: #60a5fa;
          }

          .memory-profiler__overview-card,
          .memory-profiler__chart-container,
          .memory-profiler__breakdown-chart,
          .memory-profiler__leak-item {
            background: #1e293b;
            border-color: #334155;
          }

          .memory-profiler__card-title,
          .memory-profiler__section-title,
          .memory-profiler__status-label,
          .memory-profiler__metric-value,
          .memory-profiler__action-title,
          .memory-profiler__breakdown-name,
          .memory-profiler__breakdown-size,
          .memory-profiler__leak-type {
            color: #f1f5f9;
          }

          .memory-profiler__status-details,
          .memory-profiler__usage-details,
          .memory-profiler__metric-label,
          .memory-profiler__action-desc,
          .memory-profiler__timeline-info,
          .memory-profiler__leak-description,
          .memory-profiler__leak-suggestion {
            color: #94a3b8;
          }

          .memory-profiler__status.critical {
            background: rgba(239, 68, 68, 0.1);
          }

          .memory-profiler__status.high {
            background: rgba(249, 115, 22, 0.1);
          }

          .memory-profiler__status.medium {
            background: rgba(245, 158, 11, 0.1);
          }

          .memory-profiler__status.low {
            background: rgba(16, 185, 129, 0.1);
          }

          .memory-profiler__leak-item.critical {
            background: rgba(239, 68, 68, 0.1);
          }

          .memory-profiler__leak-item.high {
            background: rgba(249, 115, 22, 0.1);
          }

          .memory-profiler__leak-item.medium {
            background: rgba(245, 158, 11, 0.1);
          }

          .memory-profiler__action-btn:hover:not(:disabled) {
            border-color: #60a5fa;
            background: rgba(96, 165, 250, 0.1);
          }

          .memory-profiler__no-data h4,
          .memory-profiler__no-leaks h4 {
            color: #f1f5f9;
          }

          .memory-profiler__leak-tips h5 {
            color: #f1f5f9;
          }

          .memory-profiler__leak-tips li {
            color: #94a3b8;
          }

          .memory-profiler__breakdown-progress {
            background: #374151;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .memory-profiler__header {
            flex-direction: column;
            gap: 16px;
          }

          .memory-profiler__header-controls {
            justify-content: stretch;
          }

          .memory-profiler__control-btn {
            flex: 1;
          }

          .memory-profiler__status-content {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .memory-profiler__nav {
            flex-wrap: wrap;
            gap: 4px;
          }

          .memory-profiler__content {
            padding: 16px;
          }

          .memory-profiler__overview-grid {
            grid-template-columns: 1fr;
          }

          .memory-profiler__metrics-grid {
            grid-template-columns: 1fr;
          }

          .memory-profiler__timeline-controls {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .memory-profiler__leaks-header {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};
