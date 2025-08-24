/**
 * Export/Import System
 * Comprehensive data portability and backup functionality
 */

// Core Components
export { ExportImportProvider, useExportImport } from './ExportImportProvider';

// Types
export type {
  // Core types
  ExportFormat,
  ImportFormat,
  ExportConfig,
  ImportConfig,
  ExportData,
  ImportResult,
  ImportPreview,
  ExportProgress,
  ImportProgress,
  
  // Data structures
  ExportedNotebook,
  ExportedTask,
  ExportedSubtask,
  ExportMetadata,
  
  // Configuration
  ExportTemplate,
  ExportFieldMapping,
  ImportFieldMapping,
  ConflictResolution,
  ValidationConfig,
  ValidationResult,
  
  // Conflicts and errors
  ImportConflict,
  ImportError,
  ImportWarning,
  ImportSummary,
  ImportItemResult,
  
  // Context and hooks
  ExportImportContext,
  
  // UI props
  ExportDialogProps,
  ImportDialogProps,
  ExportProgressProps,
  ImportProgressProps,
  ImportPreviewProps,
  ConflictResolutionProps,
  
  // Handlers
  ExportHandler,
  ImportHandler,
  
  // Advanced features
  BackupConfig,
  RestoreConfig,
  BackupMetadata,
  ExportAnalytics,
  ImportAnalytics,
  DataTransformation,
  TransformationRule,
  SyncConfig,
  
  // Error classes
  ExportError,
  ImportError as ImportErrorType,
  ValidationError
} from './types';

// Handlers
export {
  // Export handlers
  JSONExportHandler,
  CSVExportHandler,
  ExcelExportHandler,
  MarkdownExportHandler,
  
  // Import handlers
  JSONImportHandler,
  CSVImportHandler,
  ExcelImportHandler,
  
  // Registries
  ExportHandlerRegistry,
  ImportHandlerRegistry,
  
  // Utilities
  getAllExportHandlers,
  getAllImportHandlers,
  createExportHandlerRegistry,
  createImportHandlerRegistry,
  HandlerUtils,
  HandlerValidation
} from './handlers';

// Export utilities and constants
export const ExportImportUtils = {
  /**
   * Format file size for display
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Generate filename with timestamp
   */
  generateFilename: (prefix: string, format: string, timestamp?: Date): string => {
    const date = timestamp || new Date();
    const dateStr = date.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    return `${prefix}-${dateStr}.${format}`;
  },

  /**
   * Validate export configuration
   */
  validateExportConfig: (config: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!config.format) {
      errors.push('Export format is required');
    }
    
    if (config.dateRange) {
      if (config.dateRange.start > config.dateRange.end) {
        errors.push('Start date must be before end date');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate import configuration
   */
  validateImportConfig: (config: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!config.format) {
      errors.push('Import format is required');
    }
    
    if (!config.file) {
      errors.push('Import file is required');
    }
    
    if (!config.mapping || config.mapping.length === 0) {
      errors.push('Field mapping is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Get default export configuration
   */
  getDefaultExportConfig: (format: ExportFormat): Partial<ExportConfig> => {
    return {
      format,
      includeMetadata: true,
      includeDeleted: false,
      compression: 'none',
      filters: []
    };
  },

  /**
   * Get default import configuration
   */
  getDefaultImportConfig: (format: ImportFormat, file: File): Partial<ImportConfig> => {
    return {
      format,
      file,
      mapping: [],
      conflictResolution: {
        strategy: 'prompt',
        preserveIds: true,
        updateExisting: false
      },
      validation: {
        strictMode: false,
        allowMissingFields: true,
        maxErrors: 100,
        customValidators: {}
      },
      preview: true,
      dryRun: false
    };
  },

  /**
   * Create export filter
   */
  createExportFilter: (field: string, operator: string, value: any) => ({
    field,
    operator,
    value,
    enabled: true
  }),

  /**
   * Create field mapping
   */
  createFieldMapping: (sourceField: string, targetField: string, options?: any) => ({
    sourceField,
    targetField,
    required: options?.required || false,
    defaultValue: options?.defaultValue,
    transform: options?.transform
  }),

  /**
   * Estimate export size
   */
  estimateExportSize: (data: any, format: string): number => {
    const jsonString = JSON.stringify(data);
    
    switch (format) {
      case 'json':
        return jsonString.length;
      case 'csv':
        return jsonString.length * 0.7; // CSV is typically smaller
      case 'excel':
        return jsonString.length * 1.2; // Excel is typically larger
      case 'markdown':
        return jsonString.length * 0.8; // Markdown is typically smaller
      default:
        return jsonString.length;
    }
  }
};

// Export constants
export const EXPORT_FORMATS = [
  'json',
  'csv', 
  'excel',
  'markdown'
] as const;

export const IMPORT_FORMATS = [
  'json',
  'csv',
  'excel'
] as const;

export const DEFAULT_EXPORT_CONFIG = {
  format: 'json' as ExportFormat,
  includeMetadata: true,
  includeDeleted: false,
  compression: 'none' as const,
  filters: []
};

export const DEFAULT_IMPORT_CONFIG = {
  conflictResolution: {
    strategy: 'prompt' as const,
    preserveIds: true,
    updateExisting: false
  },
  validation: {
    strictMode: false,
    allowMissingFields: true,
    maxErrors: 100,
    customValidators: {}
  },
  preview: true,
  dryRun: false
};

// Export templates
export const EXPORT_TEMPLATES = {
  TASKS_ONLY: {
    id: 'tasks-only',
    name: 'Tasks Only',
    description: 'Export only tasks and subtasks',
    format: 'json' as ExportFormat,
    config: {
      ...DEFAULT_EXPORT_CONFIG,
      filters: [
        { field: 'type', operator: 'equals', value: 'task', enabled: true }
      ]
    },
    fields: [],
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  NOTEBOOKS_ONLY: {
    id: 'notebooks-only',
    name: 'Notebooks Only',
    description: 'Export only notebooks',
    format: 'json' as ExportFormat,
    config: {
      ...DEFAULT_EXPORT_CONFIG,
      filters: [
        { field: 'type', operator: 'equals', value: 'notebook', enabled: true }
      ]
    },
    fields: [],
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  ACTIVE_ITEMS: {
    id: 'active-items',
    name: 'Active Items Only',
    description: 'Export only active (non-archived, non-cancelled) items',
    format: 'json' as ExportFormat,
    config: {
      ...DEFAULT_EXPORT_CONFIG,
      includeDeleted: false,
      filters: [
        { field: 'status', operator: 'not_equals', value: 'cancelled', enabled: true },
        { field: 'isArchived', operator: 'equals', value: false, enabled: true }
      ]
    },
    fields: [],
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  RECENT_ITEMS: {
    id: 'recent-items',
    name: 'Recent Items (30 days)',
    description: 'Export items updated in the last 30 days',
    format: 'json' as ExportFormat,
    config: {
      ...DEFAULT_EXPORT_CONFIG,
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      }
    },
    fields: [],
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

// Feature configuration
export const EXPORT_IMPORT_CONFIG = {
  maxFileSize: {
    json: 100 * 1024 * 1024,     // 100MB
    csv: 50 * 1024 * 1024,      // 50MB
    excel: 100 * 1024 * 1024,   // 100MB
    markdown: 10 * 1024 * 1024   // 10MB
  },
  
  supportedFormats: {
    export: EXPORT_FORMATS,
    import: IMPORT_FORMATS
  },
  
  compression: {
    supported: ['none', 'zip', 'gzip'],
    default: 'none'
  },
  
  validation: {
    maxErrors: 100,
    timeoutMs: 30000
  },
  
  performance: {
    batchSize: 1000,
    progressUpdateInterval: 100
  }
};

// Development utilities
if (process.env.NODE_ENV === 'development') {
  (window as any).ExportImport = {
    utils: ExportImportUtils,
    templates: EXPORT_TEMPLATES,
    config: EXPORT_IMPORT_CONFIG,
    formats: {
      export: EXPORT_FORMATS,
      import: IMPORT_FORMATS
    }
  };
  
  console.log('📤📥 Export/Import system loaded');
  console.log('  Export formats:', EXPORT_FORMATS);
  console.log('  Import formats:', IMPORT_FORMATS);
  console.log('  Templates:', Object.keys(EXPORT_TEMPLATES));
  console.log('  🛠️  System available at window.ExportImport');
}
