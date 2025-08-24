import React, { useState, useMemo, useEffect } from 'react';
import { useBundleAnalysis } from '../PerformanceProvider';
import type { BundleAnalyzerProps, BundleChunk, BundleRecommendation } from '../types';

/**
 * Bundle Analyzer Component
 * 
 * Visualizes bundle composition, analyzes chunk sizes, identifies optimization
 * opportunities, and provides actionable recommendations for bundle optimization.
 */
export const BundleAnalyzer: React.FC<BundleAnalyzerProps> = ({
  showTreemap = true,
  showRecommendations = true,
  autoAnalyze = false
}) => {
  const {
    bundleAnalysis,
    isAnalyzing,
    analyzeBundles,
    getRecommendations,
    estimateSavings
  } = useBundleAnalysis();

  const [selectedChunk, setSelectedChunk] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'chunks' | 'treemap' | 'recommendations'>('overview');
  const [sortBy, setSortBy] = useState<'size' | 'name' | 'gzipped'>('size');

  // Auto-analyze on mount if enabled
  useEffect(() => {
    if (autoAnalyze && !bundleAnalysis && !isAnalyzing) {
      analyzeBundles();
    }
  }, [autoAnalyze, bundleAnalysis, isAnalyzing, analyzeBundles]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Get size color based on chunk size
  const getSizeColor = (size: number, maxSize: number): string => {
    const percentage = (size / maxSize) * 100;
    if (percentage > 80) return '#ef4444';
    if (percentage > 60) return '#f97316';
    if (percentage > 40) return '#f59e0b';
    return '#10b981';
  };

  // Sort chunks
  const sortedChunks = useMemo(() => {
    if (!bundleAnalysis?.chunks) return [];
    
    return [...bundleAnalysis.chunks].sort((a, b) => {
      switch (sortBy) {
        case 'size':
          return b.size - a.size;
        case 'gzipped':
          return b.gzippedSize - a.gzippedSize;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [bundleAnalysis?.chunks, sortBy]);

  // Calculate compression ratio
  const getCompressionRatio = (original: number, compressed: number): number => {
    return original > 0 ? Math.round(((original - compressed) / original) * 100) : 0;
  };

  // Get recommendation priority color
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Calculate total potential savings
  const totalPotentialSavings = useMemo(() => {
    if (!bundleAnalysis?.recommendations) return 0;
    return bundleAnalysis.recommendations.reduce((total, rec) => total + rec.estimatedSavings, 0);
  }, [bundleAnalysis?.recommendations]);

  if (isAnalyzing) {
    return (
      <div className="bundle-analyzer">
        <div className="bundle-analyzer__loading">
          <div className="bundle-analyzer__loading-spinner">🔄</div>
          <h3 className="bundle-analyzer__loading-title">Analyzing Bundles...</h3>
          <p className="bundle-analyzer__loading-text">
            Examining bundle composition, calculating sizes, and identifying optimization opportunities.
          </p>
        </div>

        <style>{`
          .bundle-analyzer {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 48px 24px;
            text-align: center;
          }

          .bundle-analyzer__loading-spinner {
            font-size: 3rem;
            margin-bottom: 16px;
            animation: spin 1s linear infinite;
          }

          .bundle-analyzer__loading-title {
            margin: 0 0 8px 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: #1e293b;
          }

          .bundle-analyzer__loading-text {
            margin: 0;
            color: #64748b;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          /* Dark theme */
          @media (prefers-color-scheme: dark) {
            .bundle-analyzer {
              background: #1e293b;
              border-color: #334155;
            }

            .bundle-analyzer__loading-title {
              color: #f1f5f9;
            }

            .bundle-analyzer__loading-text {
              color: #94a3b8;
            }
          }
        `}</style>
      </div>
    );
  }

  if (!bundleAnalysis) {
    return (
      <div className="bundle-analyzer">
        <div className="bundle-analyzer__empty">
          <div className="bundle-analyzer__empty-icon">📦</div>
          <h3 className="bundle-analyzer__empty-title">Bundle Analysis Not Available</h3>
          <p className="bundle-analyzer__empty-text">
            Run bundle analysis to see detailed information about your app's JavaScript bundles.
          </p>
          <button
            onClick={analyzeBundles}
            className="bundle-analyzer__analyze-btn"
          >
            🔍 Analyze Bundles
          </button>
        </div>

        <style>{`
          .bundle-analyzer {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 48px 24px;
            text-align: center;
          }

          .bundle-analyzer__empty-icon {
            font-size: 3rem;
            margin-bottom: 16px;
            display: block;
          }

          .bundle-analyzer__empty-title {
            margin: 0 0 8px 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: #1e293b;
          }

          .bundle-analyzer__empty-text {
            margin: 0 0 24px 0;
            color: #64748b;
          }

          .bundle-analyzer__analyze-btn {
            padding: 12px 24px;
            background: #3b82f6;
            border: none;
            border-radius: 6px;
            color: white;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .bundle-analyzer__analyze-btn:hover {
            background: #2563eb;
            transform: translateY(-1px);
          }

          /* Dark theme */
          @media (prefers-color-scheme: dark) {
            .bundle-analyzer {
              background: #1e293b;
              border-color: #334155;
            }

            .bundle-analyzer__empty-title {
              color: #f1f5f9;
            }

            .bundle-analyzer__empty-text {
              color: #94a3b8;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="bundle-analyzer">
      {/* Header */}
      <div className="bundle-analyzer__header">
        <div className="bundle-analyzer__header-content">
          <h2 className="bundle-analyzer__title">📦 Bundle Analyzer</h2>
          <p className="bundle-analyzer__subtitle">
            Analyze bundle composition and optimize your app's JavaScript delivery.
          </p>
        </div>

        <div className="bundle-analyzer__header-actions">
          <button
            onClick={analyzeBundles}
            className="bundle-analyzer__refresh-btn"
            disabled={isAnalyzing}
          >
            🔄 Refresh Analysis
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bundle-analyzer__summary">
        <div className="bundle-analyzer__stat">
          <div className="bundle-analyzer__stat-label">Total Size</div>
          <div className="bundle-analyzer__stat-value">{formatFileSize(bundleAnalysis.totalSize)}</div>
        </div>
        <div className="bundle-analyzer__stat">
          <div className="bundle-analyzer__stat-label">Gzipped</div>
          <div className="bundle-analyzer__stat-value">{formatFileSize(bundleAnalysis.gzippedSize)}</div>
        </div>
        <div className="bundle-analyzer__stat">
          <div className="bundle-analyzer__stat-label">Compression</div>
          <div className="bundle-analyzer__stat-value">
            {getCompressionRatio(bundleAnalysis.totalSize, bundleAnalysis.gzippedSize)}%
          </div>
        </div>
        <div className="bundle-analyzer__stat">
          <div className="bundle-analyzer__stat-label">Tree Shaking</div>
          <div className="bundle-analyzer__stat-value">
            {bundleAnalysis.treeShakingStats.effectiveness}%
          </div>
        </div>
        {totalPotentialSavings > 0 && (
          <div className="bundle-analyzer__stat bundle-analyzer__stat--savings">
            <div className="bundle-analyzer__stat-label">Potential Savings</div>
            <div className="bundle-analyzer__stat-value">{formatFileSize(totalPotentialSavings)}</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="bundle-analyzer__nav">
        {[
          { key: 'overview', label: 'Overview', icon: '📊' },
          { key: 'chunks', label: 'Chunks', icon: '📦' },
          showTreemap && { key: 'treemap', label: 'Treemap', icon: '🗂️' },
          showRecommendations && { key: 'recommendations', label: 'Recommendations', icon: '💡' }
        ].filter(Boolean).map(tab => tab && (
          <button
            key={tab.key}
            onClick={() => setViewMode(tab.key as any)}
            className={`bundle-analyzer__nav-btn ${viewMode === tab.key ? 'active' : ''}`}
          >
            <span className="bundle-analyzer__nav-icon">{tab.icon}</span>
            <span className="bundle-analyzer__nav-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bundle-analyzer__content">
        {/* Overview */}
        {viewMode === 'overview' && (
          <div className="bundle-analyzer__overview">
            <div className="bundle-analyzer__overview-grid">
              {/* Main vs Vendor Split */}
              <div className="bundle-analyzer__overview-card">
                <h3 className="bundle-analyzer__card-title">Bundle Split</h3>
                <div className="bundle-analyzer__split-chart">
                  <div 
                    className="bundle-analyzer__split-main"
                    style={{
                      width: `${(bundleAnalysis.mainChunkSize / bundleAnalysis.totalSize) * 100}%`,
                      backgroundColor: '#3b82f6'
                    }}
                  >
                    <span className="bundle-analyzer__split-label">
                      Main ({formatFileSize(bundleAnalysis.mainChunkSize)})
                    </span>
                  </div>
                  <div 
                    className="bundle-analyzer__split-vendor"
                    style={{
                      width: `${(bundleAnalysis.vendorChunkSize / bundleAnalysis.totalSize) * 100}%`,
                      backgroundColor: '#10b981'
                    }}
                  >
                    <span className="bundle-analyzer__split-label">
                      Vendor ({formatFileSize(bundleAnalysis.vendorChunkSize)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Tree Shaking Effectiveness */}
              <div className="bundle-analyzer__overview-card">
                <h3 className="bundle-analyzer__card-title">Tree Shaking</h3>
                <div className="bundle-analyzer__treeshaking-stats">
                  <div className="bundle-analyzer__treeshaking-stat">
                    <div className="bundle-analyzer__treeshaking-value">
                      {bundleAnalysis.treeShakingStats.effectiveness}%
                    </div>
                    <div className="bundle-analyzer__treeshaking-label">Effectiveness</div>
                  </div>
                  <div className="bundle-analyzer__treeshaking-stat">
                    <div className="bundle-analyzer__treeshaking-value">
                      {formatFileSize(bundleAnalysis.treeShakingStats.eliminatedCode)}
                    </div>
                    <div className="bundle-analyzer__treeshaking-label">Eliminated</div>
                  </div>
                </div>
              </div>

              {/* Unused Imports */}
              {bundleAnalysis.unusedImports.length > 0 && (
                <div className="bundle-analyzer__overview-card">
                  <h3 className="bundle-analyzer__card-title">Unused Imports</h3>
                  <div className="bundle-analyzer__unused-list">
                    {bundleAnalysis.unusedImports.slice(0, 3).map((unused, index) => (
                      <div key={index} className="bundle-analyzer__unused-item">
                        <div className="bundle-analyzer__unused-module">{unused.module}</div>
                        <div className="bundle-analyzer__unused-savings">
                          -{formatFileSize(unused.estimatedSavings)}
                        </div>
                      </div>
                    ))}
                    {bundleAnalysis.unusedImports.length > 3 && (
                      <div className="bundle-analyzer__unused-more">
                        +{bundleAnalysis.unusedImports.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chunks View */}
        {viewMode === 'chunks' && (
          <div className="bundle-analyzer__chunks">
            <div className="bundle-analyzer__chunks-header">
              <h3 className="bundle-analyzer__section-title">Bundle Chunks</h3>
              <div className="bundle-analyzer__chunks-controls">
                <label className="bundle-analyzer__sort-label">
                  Sort by:
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bundle-analyzer__sort-select"
                  >
                    <option value="size">Size</option>
                    <option value="gzipped">Gzipped Size</option>
                    <option value="name">Name</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="bundle-analyzer__chunks-list">
              {sortedChunks.map((chunk, index) => {
                const maxSize = Math.max(...sortedChunks.map(c => c.size));
                const compressionRatio = getCompressionRatio(chunk.size, chunk.gzippedSize);
                
                return (
                  <div 
                    key={chunk.name}
                    className={`bundle-analyzer__chunk ${selectedChunk === chunk.name ? 'selected' : ''}`}
                    onClick={() => setSelectedChunk(selectedChunk === chunk.name ? null : chunk.name)}
                  >
                    <div className="bundle-analyzer__chunk-header">
                      <div className="bundle-analyzer__chunk-info">
                        <div className="bundle-analyzer__chunk-name">
                          <span className="bundle-analyzer__chunk-icon">
                            {chunk.isEntry ? '🚀' : chunk.isAsync ? '⚡' : '📦'}
                          </span>
                          {chunk.name}
                        </div>
                        <div className="bundle-analyzer__chunk-type">
                          {chunk.isEntry ? 'Entry' : chunk.isAsync ? 'Async' : 'Chunk'}
                        </div>
                      </div>

                      <div className="bundle-analyzer__chunk-sizes">
                        <div className="bundle-analyzer__chunk-size">
                          {formatFileSize(chunk.size)}
                        </div>
                        <div className="bundle-analyzer__chunk-gzipped">
                          {formatFileSize(chunk.gzippedSize)} gzip ({compressionRatio}%)
                        </div>
                      </div>
                    </div>

                    <div className="bundle-analyzer__chunk-bar">
                      <div 
                        className="bundle-analyzer__chunk-fill"
                        style={{
                          width: `${(chunk.size / maxSize) * 100}%`,
                          backgroundColor: getSizeColor(chunk.size, maxSize)
                        }}
                      />
                    </div>

                    {selectedChunk === chunk.name && (
                      <div className="bundle-analyzer__chunk-details">
                        <h4 className="bundle-analyzer__chunk-details-title">Modules ({chunk.modules.length})</h4>
                        <div className="bundle-analyzer__chunk-modules">
                          {chunk.modules.map((module, idx) => (
                            <span key={idx} className="bundle-analyzer__chunk-module">
                              {module}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Treemap View */}
        {viewMode === 'treemap' && showTreemap && (
          <div className="bundle-analyzer__treemap">
            <h3 className="bundle-analyzer__section-title">Bundle Treemap</h3>
            <div className="bundle-analyzer__treemap-container">
              {/* Simplified treemap visualization */}
              <div className="bundle-analyzer__treemap-grid">
                {sortedChunks.map((chunk, index) => {
                  const percentage = (chunk.size / bundleAnalysis.totalSize) * 100;
                  const minSize = Math.max(percentage, 5); // Minimum 5% for visibility
                  
                  return (
                    <div
                      key={chunk.name}
                      className="bundle-analyzer__treemap-item"
                      style={{
                        width: `${minSize}%`,
                        backgroundColor: getSizeColor(chunk.size, Math.max(...sortedChunks.map(c => c.size))),
                        opacity: percentage < 5 ? 0.7 : 1
                      }}
                      title={`${chunk.name}: ${formatFileSize(chunk.size)}`}
                    >
                      <div className="bundle-analyzer__treemap-label">
                        <div className="bundle-analyzer__treemap-name">{chunk.name}</div>
                        <div className="bundle-analyzer__treemap-size">{formatFileSize(chunk.size)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {viewMode === 'recommendations' && showRecommendations && (
          <div className="bundle-analyzer__recommendations">
            <div className="bundle-analyzer__recommendations-header">
              <h3 className="bundle-analyzer__section-title">Optimization Recommendations</h3>
              {totalPotentialSavings > 0 && (
                <div className="bundle-analyzer__total-savings">
                  Total potential savings: <strong>{formatFileSize(totalPotentialSavings)}</strong>
                </div>
              )}
            </div>

            {bundleAnalysis.recommendations.length > 0 ? (
              <div className="bundle-analyzer__recommendations-list">
                {bundleAnalysis.recommendations.map((recommendation, index) => (
                  <div 
                    key={index}
                    className="bundle-analyzer__recommendation"
                    style={{ borderLeftColor: getPriorityColor(recommendation.priority) }}
                  >
                    <div className="bundle-analyzer__recommendation-header">
                      <div className="bundle-analyzer__recommendation-title">
                        <span className="bundle-analyzer__recommendation-icon">
                          {recommendation.type === 'remove-unused' ? '🗑️' :
                           recommendation.type === 'lazy-load' ? '⚡' :
                           recommendation.type === 'code-split' ? '✂️' :
                           recommendation.type === 'optimize-images' ? '🖼️' : '📦'}
                        </span>
                        {recommendation.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                      <div 
                        className="bundle-analyzer__recommendation-priority"
                        style={{ backgroundColor: getPriorityColor(recommendation.priority) }}
                      >
                        {recommendation.priority}
                      </div>
                    </div>

                    <div className="bundle-analyzer__recommendation-content">
                      <p className="bundle-analyzer__recommendation-description">
                        {recommendation.description}
                      </p>
                      <p className="bundle-analyzer__recommendation-implementation">
                        <strong>Implementation:</strong> {recommendation.implementation}
                      </p>
                      <div className="bundle-analyzer__recommendation-savings">
                        💾 Potential savings: <strong>{formatFileSize(recommendation.estimatedSavings)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bundle-analyzer__no-recommendations">
                <span className="bundle-analyzer__no-recommendations-icon">✨</span>
                <h4>No Recommendations</h4>
                <p>Your bundle is already well-optimized!</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .bundle-analyzer {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }

        .bundle-analyzer__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .bundle-analyzer__title {
          margin: 0 0 8px 0;
          font-size: 1.5rem;
          font-weight: 800;
        }

        .bundle-analyzer__subtitle {
          margin: 0;
          opacity: 0.9;
          font-size: 0.875rem;
        }

        .bundle-analyzer__refresh-btn {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          color: white;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .bundle-analyzer__refresh-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
        }

        .bundle-analyzer__refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .bundle-analyzer__summary {
          display: flex;
          padding: 20px 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .bundle-analyzer__stat {
          flex: 1;
          text-align: center;
          padding: 0 12px;
          border-right: 1px solid #e5e7eb;
        }

        .bundle-analyzer__stat:last-child {
          border-right: none;
        }

        .bundle-analyzer__stat--savings {
          background: #fef3c7;
          margin: -20px 0;
          padding: 20px 12px;
          border-radius: 8px;
          border: 1px solid #fbbf24;
        }

        .bundle-analyzer__stat-label {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 4px;
        }

        .bundle-analyzer__stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
        }

        .bundle-analyzer__nav {
          display: flex;
          padding: 0 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .bundle-analyzer__nav-btn {
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
        }

        .bundle-analyzer__nav-btn:hover {
          background: rgba(100, 116, 139, 0.1);
          color: #1e293b;
        }

        .bundle-analyzer__nav-btn.active {
          background: white;
          color: #3b82f6;
          border-bottom: 2px solid #3b82f6;
        }

        .bundle-analyzer__nav-icon {
          font-size: 1rem;
        }

        .bundle-analyzer__nav-label {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .bundle-analyzer__content {
          padding: 24px;
        }

        .bundle-analyzer__overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .bundle-analyzer__overview-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
        }

        .bundle-analyzer__card-title {
          margin: 0 0 16px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .bundle-analyzer__split-chart {
          display: flex;
          height: 40px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }

        .bundle-analyzer__split-main,
        .bundle-analyzer__split-vendor {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 20%;
        }

        .bundle-analyzer__split-label {
          color: white;
          font-size: 0.75rem;
          font-weight: 500;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .bundle-analyzer__treeshaking-stats {
          display: flex;
          justify-content: space-around;
        }

        .bundle-analyzer__treeshaking-stat {
          text-align: center;
        }

        .bundle-analyzer__treeshaking-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #10b981;
          margin-bottom: 4px;
        }

        .bundle-analyzer__treeshaking-label {
          font-size: 0.75rem;
          color: #64748b;
        }

        .bundle-analyzer__unused-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .bundle-analyzer__unused-item {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 4px;
        }

        .bundle-analyzer__unused-module {
          font-size: 0.875rem;
          color: #1e293b;
          font-weight: 500;
        }

        .bundle-analyzer__unused-savings {
          font-size: 0.875rem;
          color: #dc2626;
          font-weight: 600;
        }

        .bundle-analyzer__unused-more {
          text-align: center;
          font-size: 0.75rem;
          color: #64748b;
          padding: 4px;
        }

        .bundle-analyzer__chunks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .bundle-analyzer__section-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
        }

        .bundle-analyzer__sort-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          color: #64748b;
        }

        .bundle-analyzer__sort-select {
          padding: 4px 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .bundle-analyzer__chunks-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .bundle-analyzer__chunk {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .bundle-analyzer__chunk:hover {
          border-color: #3b82f6;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .bundle-analyzer__chunk.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .bundle-analyzer__chunk-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .bundle-analyzer__chunk-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .bundle-analyzer__chunk-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .bundle-analyzer__chunk-icon {
          font-size: 1.25rem;
        }

        .bundle-analyzer__chunk-type {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
        }

        .bundle-analyzer__chunk-sizes {
          text-align: right;
        }

        .bundle-analyzer__chunk-size {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 2px;
        }

        .bundle-analyzer__chunk-gzipped {
          font-size: 0.75rem;
          color: #64748b;
        }

        .bundle-analyzer__chunk-bar {
          height: 6px;
          background: #f1f5f9;
          border-radius: 3px;
          overflow: hidden;
        }

        .bundle-analyzer__chunk-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .bundle-analyzer__chunk-details {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }

        .bundle-analyzer__chunk-details-title {
          margin: 0 0 12px 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e293b;
        }

        .bundle-analyzer__chunk-modules {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .bundle-analyzer__chunk-module {
          padding: 4px 8px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 0.75rem;
          color: #374151;
          font-family: monospace;
        }

        .bundle-analyzer__treemap-container {
          margin-top: 16px;
        }

        .bundle-analyzer__treemap-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          min-height: 300px;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f8fafc;
        }

        .bundle-analyzer__treemap-item {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 60px;
          border-radius: 4px;
          color: white;
          text-align: center;
          position: relative;
          cursor: pointer;
        }

        .bundle-analyzer__treemap-label {
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .bundle-analyzer__treemap-name {
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .bundle-analyzer__treemap-size {
          font-size: 0.625rem;
        }

        .bundle-analyzer__recommendations-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .bundle-analyzer__total-savings {
          padding: 8px 12px;
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 6px;
          font-size: 0.875rem;
          color: #92400e;
        }

        .bundle-analyzer__recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .bundle-analyzer__recommendation {
          background: white;
          border: 1px solid #e5e7eb;
          border-left-width: 4px;
          border-radius: 8px;
          padding: 20px;
        }

        .bundle-analyzer__recommendation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .bundle-analyzer__recommendation-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .bundle-analyzer__recommendation-icon {
          font-size: 1.25rem;
        }

        .bundle-analyzer__recommendation-priority {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          color: white;
        }

        .bundle-analyzer__recommendation-description {
          margin: 0 0 12px 0;
          color: #374151;
          line-height: 1.5;
        }

        .bundle-analyzer__recommendation-implementation {
          margin: 0 0 16px 0;
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.4;
        }

        .bundle-analyzer__recommendation-savings {
          font-size: 0.875rem;
          color: #059669;
          font-weight: 600;
        }

        .bundle-analyzer__no-recommendations {
          text-align: center;
          padding: 48px 24px;
          color: #6b7280;
        }

        .bundle-analyzer__no-recommendations-icon {
          font-size: 3rem;
          margin-bottom: 16px;
          display: block;
        }

        .bundle-analyzer__no-recommendations h4 {
          margin: 0 0 8px 0;
          color: #1e293b;
          font-size: 1.125rem;
        }

        .bundle-analyzer__no-recommendations p {
          margin: 0;
          font-size: 0.875rem;
        }

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          .bundle-analyzer {
            background: #1e293b;
            border-color: #334155;
          }

          .bundle-analyzer__summary,
          .bundle-analyzer__nav {
            background: #0f172a;
            border-color: #334155;
          }

          .bundle-analyzer__stat-label,
          .bundle-analyzer__nav-btn {
            color: #94a3b8;
          }

          .bundle-analyzer__stat-value,
          .bundle-analyzer__section-title,
          .bundle-analyzer__card-title,
          .bundle-analyzer__chunk-name,
          .bundle-analyzer__chunk-size,
          .bundle-analyzer__treeshaking-value,
          .bundle-analyzer__recommendation-title {
            color: #f1f5f9;
          }

          .bundle-analyzer__nav-btn:hover {
            color: #f1f5f9;
          }

          .bundle-analyzer__nav-btn.active {
            background: #1e293b;
            color: #60a5fa;
          }

          .bundle-analyzer__overview-card,
          .bundle-analyzer__chunk,
          .bundle-analyzer__recommendation {
            background: #1e293b;
            border-color: #334155;
          }

          .bundle-analyzer__chunk.selected {
            background: rgba(96, 165, 250, 0.1);
          }

          .bundle-analyzer__chunk-module {
            background: #334155;
            border-color: #475569;
            color: #cbd5e0;
          }

          .bundle-analyzer__treemap-grid {
            background: #0f172a;
            border-color: #334155;
          }

          .bundle-analyzer__unused-item {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.3);
          }

          .bundle-analyzer__stat--savings {
            background: rgba(251, 191, 36, 0.1);
            border-color: rgba(251, 191, 36, 0.3);
          }

          .bundle-analyzer__total-savings {
            background: rgba(251, 191, 36, 0.1);
            border-color: rgba(251, 191, 36, 0.3);
            color: #fbbf24;
          }

          .bundle-analyzer__no-recommendations h4 {
            color: #f1f5f9;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .bundle-analyzer__header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .bundle-analyzer__summary {
            flex-direction: column;
            gap: 16px;
          }

          .bundle-analyzer__stat {
            border-right: none;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 16px;
          }

          .bundle-analyzer__stat:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }

          .bundle-analyzer__nav {
            flex-wrap: wrap;
            gap: 4px;
          }

          .bundle-analyzer__content {
            padding: 16px;
          }

          .bundle-analyzer__overview-grid {
            grid-template-columns: 1fr;
          }

          .bundle-analyzer__chunks-header {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .bundle-analyzer__chunk-header {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .bundle-analyzer__chunk-sizes {
            text-align: left;
          }

          .bundle-analyzer__recommendations-header {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};
