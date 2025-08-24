import React, { useState, useEffect } from 'react';
import { PerformanceProvider, usePerformance, useMemoryOptimization, useLazyLoading } from '../PerformanceProvider';
import { PerformanceDashboard } from '../components';
import type { PerformanceConfig } from '../types';

/**
 * Performance Demo Component
 * 
 * Interactive demonstration of the Performance Optimization & Monitoring system,
 * showcasing various performance metrics, memory optimization, lazy loading,
 * bundle analysis, and optimization recommendations.
 */
const PerformanceDemoContent: React.FC = () => {
  const {
    metrics,
    traceData,
    recommendations,
    startProfiling,
    stopProfiling,
    clearProfilingData,
    exportPerformanceReport,
    isProfiling
  } = usePerformance();

  const {
    memoryMetrics,
    memoryPressure,
    optimizeMemory,
    forceGarbageCollection
  } = useMemoryOptimization();

  const {
    loadComponent,
    preloadComponents,
    getLoadingStatus
  } = useLazyLoading();

  const [selectedDemo, setSelectedDemo] = useState<'overview' | 'memory' | 'lazy' | 'bundle'>('overview');
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [heavyTasksRunning, setHeavyTasksRunning] = useState(false);

  // Simulate heavy computational tasks
  const simulateHeavyTasks = () => {
    setHeavyTasksRunning(true);
    
    // Simulate DOM manipulation
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 10000; i++) {
      const div = document.createElement('div');
      div.textContent = `Item ${i}`;
      fragment.appendChild(div);
    }
    
    // Simulate heavy computation
    const start = Date.now();
    let result = 0;
    for (let i = 0; i < 10000000; i++) {
      result += Math.random();
    }
    
    // Simulate memory allocation
    const bigArray = new Array(1000000).fill(null).map((_, i) => ({
      id: i,
      data: `item-${i}`,
      metadata: { created: Date.now(), random: Math.random() }
    }));
    
    setTimeout(() => {
      setHeavyTasksRunning(false);
      console.log(`Heavy tasks completed in ${Date.now() - start}ms`, { result, arrayLength: bigArray.length });
    }, 2000);
  };

  // Simulate component lazy loading
  const testLazyLoading = async () => {
    const components = [
      'heavy-component-1',
      'heavy-component-2',
      'heavy-component-3'
    ];

    for (const component of components) {
      await loadComponent(component, async () => {
        // Simulate component loading delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000));
        return { name: component, loaded: true };
      });
    }
  };

  // Simulate performance monitoring
  const startPerformanceSimulation = () => {
    setSimulationRunning(true);
    startProfiling();

    // Simulate various performance scenarios
    setTimeout(() => simulateHeavyTasks(), 1000);
    setTimeout(() => testLazyLoading(), 3000);
    setTimeout(() => {
      optimizeMemory();
      setSimulationRunning(false);
      stopProfiling();
    }, 8000);
  };

  return (
    <div className="performance-demo">
      <div className="performance-demo__header">
        <div className="performance-demo__header-content">
          <h1 className="performance-demo__title">🚀 Performance Optimization Demo</h1>
          <p className="performance-demo__description">
            Explore comprehensive performance monitoring, memory optimization, and lazy loading capabilities.
          </p>
        </div>

        <div className="performance-demo__header-controls">
          <button
            onClick={startPerformanceSimulation}
            disabled={simulationRunning || isProfiling}
            className={`performance-demo__control-btn ${simulationRunning ? 'loading' : ''}`}
          >
            {simulationRunning ? '🔄 Running Simulation...' : '▶️ Start Performance Test'}
          </button>

          <button
            onClick={simulateHeavyTasks}
            disabled={heavyTasksRunning}
            className="performance-demo__control-btn"
          >
            {heavyTasksRunning ? '⏳ Processing...' : '🏋️ Simulate Heavy Tasks'}
          </button>

          <button
            onClick={optimizeMemory}
            className="performance-demo__control-btn"
          >
            ♻️ Optimize Memory
          </button>

          <button
            onClick={forceGarbageCollection}
            className="performance-demo__control-btn"
          >
            🗑️ Force GC
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="performance-demo__nav">
        {[
          { key: 'overview', label: 'Overview', icon: '📊' },
          { key: 'memory', label: 'Memory Profiler', icon: '💾' },
          { key: 'lazy', label: 'Lazy Loading', icon: '⚡' },
          { key: 'bundle', label: 'Bundle Analyzer', icon: '📦' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedDemo(tab.key as any)}
            className={`performance-demo__nav-btn ${selectedDemo === tab.key ? 'active' : ''}`}
          >
            <span className="performance-demo__nav-icon">{tab.icon}</span>
            <span className="performance-demo__nav-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Status Bar */}
      <div className="performance-demo__status-bar">
        <div className="performance-demo__status-item">
          <span className="performance-demo__status-icon">
            {isProfiling ? '🔴' : '⚫'}
          </span>
          <span className="performance-demo__status-text">
            Profiling: {isProfiling ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="performance-demo__status-item">
          <span className="performance-demo__status-icon">💾</span>
          <span className="performance-demo__status-text">
            Memory: {Math.round(memoryMetrics.memoryUsagePercentage)}% ({memoryPressure})
          </span>
        </div>

        <div className="performance-demo__status-item">
          <span className="performance-demo__status-icon">⚡</span>
          <span className="performance-demo__status-text">
            Load Time: {metrics.pageLoadTime ? `${Math.round(metrics.pageLoadTime)}ms` : 'N/A'}
          </span>
        </div>

        <div className="performance-demo__status-item">
          <span className="performance-demo__status-icon">📈</span>
          <span className="performance-demo__status-text">
            FPS: {metrics.averageFPS ? Math.round(metrics.averageFPS) : 'N/A'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="performance-demo__content">
        {selectedDemo === 'overview' && (
          <div className="performance-demo__section">
            <h2 className="performance-demo__section-title">Performance Overview</h2>
            <PerformanceDashboard 
              showMemoryProfiler={true}
              showBundleAnalyzer={true}
              showOptimizations={true}
            />
          </div>
        )}

        {selectedDemo === 'memory' && (
          <div className="performance-demo__section">
            <h2 className="performance-demo__section-title">Memory Profiler</h2>
            <div className="performance-demo__memory-demo">
              <div className="performance-demo__demo-card">
                <h3 className="performance-demo__card-title">Memory Stress Test</h3>
                <p className="performance-demo__card-description">
                  Test memory allocation, garbage collection, and leak detection.
                </p>
                
                <div className="performance-demo__card-actions">
                  <button
                    onClick={() => {
                      // Create memory pressure
                      const arrays = [];
                      for (let i = 0; i < 1000; i++) {
                        arrays.push(new Array(10000).fill(Math.random()));
                      }
                      setTimeout(() => {
                        arrays.length = 0; // Clear references
                        forceGarbageCollection();
                      }, 5000);
                    }}
                    className="performance-demo__action-btn"
                  >
                    Create Memory Pressure
                  </button>

                  <button
                    onClick={() => {
                      // Simulate memory leak
                      const leakyTimers = [];
                      for (let i = 0; i < 100; i++) {
                        leakyTimers.push(setInterval(() => {
                          console.log('Leaky timer', i);
                        }, 10000));
                      }
                      
                      // Clean up after 10 seconds
                      setTimeout(() => {
                        leakyTimers.forEach(timer => clearInterval(timer));
                      }, 10000);
                    }}
                    className="performance-demo__action-btn"
                  >
                    Simulate Memory Leak
                  </button>
                </div>
              </div>

              <div className="performance-demo__demo-card">
                <h3 className="performance-demo__card-title">Memory Statistics</h3>
                <div className="performance-demo__stats-grid">
                  <div className="performance-demo__stat">
                    <div className="performance-demo__stat-value">
                      {(memoryMetrics.usedJSHeapSize / 1024 / 1024).toFixed(1)} MB
                    </div>
                    <div className="performance-demo__stat-label">Used Memory</div>
                  </div>
                  <div className="performance-demo__stat">
                    <div className="performance-demo__stat-value">
                      {(memoryMetrics.totalJSHeapSize / 1024 / 1024).toFixed(1)} MB
                    </div>
                    <div className="performance-demo__stat-label">Total Heap</div>
                  </div>
                  <div className="performance-demo__stat">
                    <div className="performance-demo__stat-value">
                      {memoryMetrics.domNodeCount?.toLocaleString() || '0'}
                    </div>
                    <div className="performance-demo__stat-label">DOM Nodes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedDemo === 'lazy' && (
          <div className="performance-demo__section">
            <h2 className="performance-demo__section-title">Lazy Loading Demo</h2>
            <div className="performance-demo__lazy-demo">
              <div className="performance-demo__demo-card">
                <h3 className="performance-demo__card-title">Component Lazy Loading</h3>
                <p className="performance-demo__card-description">
                  Test dynamic component loading and preloading strategies.
                </p>
                
                <div className="performance-demo__card-actions">
                  <button
                    onClick={testLazyLoading}
                    className="performance-demo__action-btn"
                  >
                    Load Components
                  </button>

                  <button
                    onClick={() => preloadComponents(['preload-1', 'preload-2'])}
                    className="performance-demo__action-btn"
                  >
                    Preload Components
                  </button>
                </div>

                <div className="performance-demo__loading-status">
                  <h4>Loading Status:</h4>
                  {['heavy-component-1', 'heavy-component-2', 'heavy-component-3'].map(component => {
                    const status = getLoadingStatus(component);
                    return (
                      <div key={component} className="performance-demo__loading-item">
                        <span className="performance-demo__loading-name">{component}</span>
                        <span className={`performance-demo__loading-badge ${status}`}>
                          {status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="performance-demo__demo-card">
                <h3 className="performance-demo__card-title">Image Lazy Loading</h3>
                <p className="performance-demo__card-description">
                  Demonstrate intersection-observer based image lazy loading.
                </p>
                
                <div className="performance-demo__image-grid">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} className="performance-demo__image-placeholder">
                      <div className="performance-demo__image-content">
                        🖼️ Image {i + 1}
                        <div className="performance-demo__image-size">800x600</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedDemo === 'bundle' && (
          <div className="performance-demo__section">
            <h2 className="performance-demo__section-title">Bundle Analysis</h2>
            <div className="performance-demo__bundle-demo">
              <div className="performance-demo__demo-card">
                <h3 className="performance-demo__card-title">Bundle Size Breakdown</h3>
                <p className="performance-demo__card-description">
                  Analyze bundle composition and identify optimization opportunities.
                </p>
                
                <div className="performance-demo__bundle-chart">
                  {[
                    { name: 'Application Code', size: 1200, color: '#3b82f6' },
                    { name: 'React & DOM', size: 800, color: '#10b981' },
                    { name: 'Third-party Libraries', size: 600, color: '#f59e0b' },
                    { name: 'Polyfills', size: 200, color: '#8b5cf6' },
                    { name: 'Assets & Media', size: 400, color: '#ef4444' }
                  ].map(item => (
                    <div key={item.name} className="performance-demo__bundle-item">
                      <div className="performance-demo__bundle-info">
                        <div className="performance-demo__bundle-name">
                          <div 
                            className="performance-demo__bundle-color"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.name}
                        </div>
                        <div className="performance-demo__bundle-size">
                          {item.size} KB
                        </div>
                      </div>
                      <div className="performance-demo__bundle-bar">
                        <div 
                          className="performance-demo__bundle-fill"
                          style={{
                            width: `${(item.size / 3200) * 100}%`,
                            backgroundColor: item.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="performance-demo__demo-card">
                <h3 className="performance-demo__card-title">Optimization Suggestions</h3>
                <div className="performance-demo__suggestions">
                  <div className="performance-demo__suggestion">
                    <div className="performance-demo__suggestion-icon">📦</div>
                    <div className="performance-demo__suggestion-content">
                      <h4>Code Splitting</h4>
                      <p>Split large bundles into smaller chunks for better loading performance.</p>
                    </div>
                  </div>
                  <div className="performance-demo__suggestion">
                    <div className="performance-demo__suggestion-icon">🗜️</div>
                    <div className="performance-demo__suggestion-content">
                      <h4>Tree Shaking</h4>
                      <p>Remove unused code to reduce bundle size by ~15-25%.</p>
                    </div>
                  </div>
                  <div className="performance-demo__suggestion">
                    <div className="performance-demo__suggestion-icon">⚡</div>
                    <div className="performance-demo__suggestion-content">
                      <h4>Lazy Loading</h4>
                      <p>Load components and routes on-demand to improve initial load time.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .performance-demo {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .performance-demo__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 32px;
          color: white;
          flex-wrap: wrap;
          gap: 24px;
        }

        .performance-demo__title {
          margin: 0 0 8px 0;
          font-size: 2rem;
          font-weight: 800;
        }

        .performance-demo__description {
          margin: 0;
          opacity: 0.9;
          font-size: 1rem;
          line-height: 1.5;
        }

        .performance-demo__header-controls {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .performance-demo__control-btn {
          padding: 12px 24px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          color: white;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .performance-demo__control-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .performance-demo__control-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .performance-demo__control-btn.loading {
          background: rgba(16, 185, 129, 0.8);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        .performance-demo__nav {
          display: flex;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 0 32px;
          gap: 8px;
        }

        .performance-demo__nav-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 24px;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 12px 12px 0 0;
        }

        .performance-demo__nav-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .performance-demo__nav-btn.active {
          background: white;
          color: #3b82f6;
        }

        .performance-demo__nav-icon {
          font-size: 1.25rem;
        }

        .performance-demo__nav-label {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .performance-demo__status-bar {
          display: flex;
          gap: 24px;
          padding: 16px 32px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          flex-wrap: wrap;
        }

        .performance-demo__status-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .performance-demo__status-icon {
          font-size: 1rem;
        }

        .performance-demo__status-text {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .performance-demo__content {
          background: white;
          min-height: calc(100vh - 300px);
        }

        .performance-demo__section {
          padding: 32px;
        }

        .performance-demo__section-title {
          margin: 0 0 32px 0;
          font-size: 1.75rem;
          font-weight: 700;
          color: #1e293b;
        }

        .performance-demo__memory-demo,
        .performance-demo__lazy-demo,
        .performance-demo__bundle-demo {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }

        .performance-demo__demo-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .performance-demo__card-title {
          margin: 0 0 8px 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
        }

        .performance-demo__card-description {
          margin: 0 0 20px 0;
          color: #64748b;
          line-height: 1.5;
        }

        .performance-demo__card-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .performance-demo__action-btn {
          padding: 10px 20px;
          background: #3b82f6;
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .performance-demo__action-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .performance-demo__stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .performance-demo__stat {
          text-align: center;
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
        }

        .performance-demo__stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #3b82f6;
          margin-bottom: 4px;
        }

        .performance-demo__stat-label {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .performance-demo__loading-status {
          margin-top: 20px;
        }

        .performance-demo__loading-status h4 {
          margin: 0 0 12px 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .performance-demo__loading-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #f8fafc;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .performance-demo__loading-name {
          font-size: 0.875rem;
          color: #374151;
        }

        .performance-demo__loading-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .performance-demo__loading-badge.idle {
          background: #e5e7eb;
          color: #6b7280;
        }

        .performance-demo__loading-badge.loading {
          background: #dbeafe;
          color: #3b82f6;
        }

        .performance-demo__loading-badge.loaded {
          background: #d1fae5;
          color: #059669;
        }

        .performance-demo__loading-badge.error {
          background: #fee2e2;
          color: #dc2626;
        }

        .performance-demo__image-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          margin-top: 16px;
        }

        .performance-demo__image-placeholder {
          aspect-ratio: 4/3;
          background: #f1f5f9;
          border: 2px dashed #cbd5e1;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .performance-demo__image-content {
          text-align: center;
          color: #64748b;
          font-size: 0.875rem;
        }

        .performance-demo__image-size {
          font-size: 0.75rem;
          opacity: 0.7;
          margin-top: 4px;
        }

        .performance-demo__bundle-chart {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .performance-demo__bundle-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .performance-demo__bundle-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .performance-demo__bundle-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .performance-demo__bundle-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .performance-demo__bundle-size {
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
        }

        .performance-demo__bundle-bar {
          height: 8px;
          background: #f1f5f9;
          border-radius: 4px;
          overflow: hidden;
        }

        .performance-demo__bundle-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .performance-demo__suggestions {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .performance-demo__suggestion {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
        }

        .performance-demo__suggestion-icon {
          font-size: 1.5rem;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .performance-demo__suggestion-content h4 {
          margin: 0 0 4px 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e293b;
        }

        .performance-demo__suggestion-content p {
          margin: 0;
          font-size: 0.875rem;
          color: #64748b;
          line-height: 1.4;
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          .performance-demo__status-bar {
            background: #1e293b;
            border-color: #334155;
          }

          .performance-demo__status-text {
            color: #e2e8f0;
          }

          .performance-demo__content {
            background: #0f172a;
          }

          .performance-demo__section-title {
            color: #f1f5f9;
          }

          .performance-demo__demo-card {
            background: #1e293b;
            border-color: #334155;
          }

          .performance-demo__card-title {
            color: #f1f5f9;
          }

          .performance-demo__card-description {
            color: #94a3b8;
          }

          .performance-demo__loading-item {
            background: #334155;
          }

          .performance-demo__loading-name {
            color: #e2e8f0;
          }

          .performance-demo__stat {
            background: #334155;
          }

          .performance-demo__stat-label {
            color: #94a3b8;
          }

          .performance-demo__image-placeholder {
            background: #334155;
            border-color: #475569;
          }

          .performance-demo__image-content {
            color: #94a3b8;
          }

          .performance-demo__bundle-name {
            color: #e2e8f0;
          }

          .performance-demo__bundle-size {
            color: #94a3b8;
          }

          .performance-demo__bundle-bar {
            background: #334155;
          }

          .performance-demo__suggestion {
            background: #334155;
          }

          .performance-demo__suggestion-content h4 {
            color: #f1f5f9;
          }

          .performance-demo__suggestion-content p {
            color: #94a3b8;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .performance-demo__header {
            flex-direction: column;
          }

          .performance-demo__header-controls {
            justify-content: stretch;
          }

          .performance-demo__control-btn {
            flex: 1;
          }

          .performance-demo__nav {
            flex-wrap: wrap;
            gap: 4px;
          }

          .performance-demo__status-bar {
            flex-direction: column;
            gap: 12px;
          }

          .performance-demo__section {
            padding: 16px;
          }

          .performance-demo__memory-demo,
          .performance-demo__lazy-demo,
          .performance-demo__bundle-demo {
            grid-template-columns: 1fr;
          }

          .performance-demo__stats-grid {
            grid-template-columns: 1fr;
          }

          .performance-demo__image-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Performance Demo with Provider
 * 
 * Wraps the demo content with the PerformanceProvider to provide
 * all performance monitoring and optimization functionality.
 */
export const PerformanceDemo: React.FC = () => {
  const performanceConfig: PerformanceConfig = {
    enableMetrics: true,
    enableMemoryMonitoring: true,
    enableBundleAnalysis: true,
    enableLazyLoading: true,
    enableOptimizationRecommendations: true,
    autoOptimize: false,
    memoryThreshold: 75,
    performanceThreshold: 100,
    trackingInterval: 2000,
    maxDataPoints: 100,
    enableProfiling: true,
    enableTracing: true,
    enableReporting: true,
    reportingInterval: 60000
  };

  return (
    <PerformanceProvider config={performanceConfig}>
      <PerformanceDemoContent />
    </PerformanceProvider>
  );
};
