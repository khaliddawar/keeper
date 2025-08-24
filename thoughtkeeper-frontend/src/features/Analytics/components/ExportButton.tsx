import React, { useState, useRef } from 'react';
import type { ExportFormat } from '../types';

/**
 * Export Button Component
 * Handles exporting analytics data in various formats
 */
interface ExportButtonProps {
  onExport: (format: ExportFormat) => Promise<Blob>;
  formats?: ExportFormat[];
  disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  formats = ['json', 'csv', 'xlsx'],
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formatLabels: Record<ExportFormat, string> = {
    json: '📄 JSON',
    csv: '📊 CSV',
    xlsx: '📈 Excel',
    pdf: '📕 PDF',
    png: '🖼️ PNG',
    svg: '🎨 SVG'
  };

  const formatDescriptions: Record<ExportFormat, string> = {
    json: 'Complete data with structure',
    csv: 'Spreadsheet compatible format',
    xlsx: 'Excel workbook with charts',
    pdf: 'Report with visualizations',
    png: 'Dashboard screenshot',
    svg: 'Vector graphics export'
  };

  const handleExport = async (format: ExportFormat) => {
    if (exporting || disabled) return;

    setExporting(format);
    try {
      const blob = await onExport(format);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `thoughtkeeper-analytics.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Single format - direct export button
  if (formats.length === 1) {
    return (
      <button
        onClick={() => handleExport(formats[0])}
        disabled={disabled || exporting !== null}
        className="export-button export-button--single"
      >
        {exporting ? (
          <>🔄 Exporting...</>
        ) : (
          <>📤 Export {formatLabels[formats[0]].split(' ')[1]}</>
        )}

        <style jsx>{`
          .export-button--single {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .export-button--single:hover:not(:disabled) {
            background: #059669;
            transform: translateY(-1px);
          }

          .export-button--single:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
          }

          /* Dark theme support */
          @media (prefers-color-scheme: dark) {
            .export-button--single {
              background: #059669;
            }

            .export-button--single:hover:not(:disabled) {
              background: #047857;
            }
          }

          /* Reduced motion */
          @media (prefers-reduced-motion: reduce) {
            .export-button--single {
              transition: none;
            }

            .export-button--single:hover:not(:disabled) {
              transform: none;
            }
          }
        `}</style>
      </button>
    );
  }

  // Multiple formats - dropdown button
  return (
    <div className="export-dropdown" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || exporting !== null}
        className="export-button export-button--dropdown"
      >
        {exporting ? (
          <>🔄 Exporting...</>
        ) : (
          <>📤 Export {isOpen ? '▲' : '▼'}</>
        )}
      </button>

      {isOpen && (
        <div className="export-dropdown__menu">
          <div className="export-dropdown__header">
            <span className="export-dropdown__title">Export Format</span>
          </div>
          
          <div className="export-dropdown__options">
            {formats.map(format => (
              <button
                key={format}
                onClick={() => handleExport(format)}
                disabled={exporting !== null}
                className={`export-dropdown__option ${exporting === format ? 'export-dropdown__option--loading' : ''}`}
              >
                <div className="export-dropdown__option-content">
                  <div className="export-dropdown__option-header">
                    <span className="export-dropdown__option-label">
                      {formatLabels[format]}
                    </span>
                    {exporting === format && (
                      <span className="export-dropdown__option-loading">🔄</span>
                    )}
                  </div>
                  <span className="export-dropdown__option-description">
                    {formatDescriptions[format]}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="export-dropdown__footer">
            <p className="export-dropdown__info">
              💡 Exports include your analytics data from the selected time period
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        .export-dropdown {
          position: relative;
          display: inline-block;
        }

        .export-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          color: #374151;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .export-button:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .export-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .export-dropdown__menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 280px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          z-index: 1000;
          overflow: hidden;
        }

        .export-dropdown__header {
          padding: 12px 16px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .export-dropdown__title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1a202c;
        }

        .export-dropdown__options {
          max-height: 300px;
          overflow-y: auto;
        }

        .export-dropdown__option {
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: white;
          text-align: left;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .export-dropdown__option:hover:not(:disabled) {
          background: #f8fafc;
        }

        .export-dropdown__option:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .export-dropdown__option--loading {
          background: #fef3c7;
        }

        .export-dropdown__option-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .export-dropdown__option-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .export-dropdown__option-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #1a202c;
        }

        .export-dropdown__option-loading {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .export-dropdown__option-description {
          font-size: 0.75rem;
          color: #64748b;
          line-height: 1.3;
        }

        .export-dropdown__footer {
          padding: 12px 16px;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .export-dropdown__info {
          margin: 0;
          font-size: 0.75rem;
          color: #64748b;
          line-height: 1.4;
        }

        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
          .export-button {
            background: #374151;
            border-color: #4b5563;
            color: #f9fafb;
          }

          .export-button:hover:not(:disabled) {
            background: #4b5563;
            border-color: #6b7280;
          }

          .export-dropdown__menu {
            background: #1e293b;
            border-color: #334155;
          }

          .export-dropdown__header,
          .export-dropdown__footer {
            background: #0f172a;
            border-color: #334155;
          }

          .export-dropdown__title {
            color: #f1f5f9;
          }

          .export-dropdown__option {
            background: #1e293b;
            color: #f1f5f9;
          }

          .export-dropdown__option:hover:not(:disabled) {
            background: #334155;
          }

          .export-dropdown__option--loading {
            background: #451a03;
          }

          .export-dropdown__option-label {
            color: #f1f5f9;
          }

          .export-dropdown__option-description,
          .export-dropdown__info {
            color: #94a3b8;
          }
        }

        /* Responsive design */
        @media (max-width: 640px) {
          .export-dropdown__menu {
            right: -50%;
            left: -50%;
            min-width: auto;
            width: 300px;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .export-dropdown__menu {
            border-width: 2px;
          }

          .export-dropdown__option {
            border-bottom: 1px solid currentColor;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .export-button,
          .export-dropdown__option {
            transition: none;
          }

          .export-dropdown__option-loading {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};
