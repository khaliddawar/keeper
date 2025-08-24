/**
 * Export/Import Handlers
 * Collection of format handlers for data export and import
 */

// Export Handlers
export { JSONExportHandler } from './JSONExportHandler';
export { CSVExportHandler } from './CSVExportHandler';
export { ExcelExportHandler } from './ExcelExportHandler';
export { MarkdownExportHandler } from './MarkdownExportHandler';

// Import Handlers
export { JSONImportHandler } from './JSONImportHandler';
export { CSVImportHandler } from './CSVImportHandler';
export { ExcelImportHandler } from './ExcelImportHandler';

// Handler Registries
export { ExportHandlerRegistry } from './ExportHandlerRegistry';
export { ImportHandlerRegistry } from './ImportHandlerRegistry';

// Handler Types (re-export from types)
export type { 
  ExportHandler, 
  ImportHandler 
} from '../types';

/**
 * Get all available export handlers
 */
export function getAllExportHandlers() {
  return [
    new JSONExportHandler(),
    new CSVExportHandler(),
    new ExcelExportHandler(),
    new MarkdownExportHandler()
  ];
}

/**
 * Get all available import handlers
 */
export function getAllImportHandlers() {
  return [
    new JSONImportHandler(),
    new CSVImportHandler(),
    new ExcelImportHandler()
  ];
}

/**
 * Create default export handler registry
 */
export function createExportHandlerRegistry() {
  const registry = new ExportHandlerRegistry();
  // Handlers are auto-registered in the registry constructor
  return registry;
}

/**
 * Create default import handler registry
 */
export function createImportHandlerRegistry() {
  const registry = new ImportHandlerRegistry();
  // Handlers are auto-registered in the registry constructor
  return registry;
}

/**
 * Handler utilities
 */
export const HandlerUtils = {
  /**
   * Get handler by file extension
   */
  getExportHandlerByExtension: (extension: string) => {
    const handlers = getAllExportHandlers();
    return handlers.find(h => h.extensions.includes(extension));
  },

  /**
   * Get handler by MIME type
   */
  getExportHandlerByMimeType: (mimeType: string) => {
    const handlers = getAllExportHandlers();
    return handlers.find(h => h.mimeType === mimeType);
  },

  /**
   * Get import handler by file extension
   */
  getImportHandlerByExtension: (extension: string) => {
    const handlers = getAllImportHandlers();
    return handlers.find(h => h.extensions.includes(extension));
  },

  /**
   * Get import handler by MIME type
   */
  getImportHandlerByMimeType: (mimeType: string) => {
    const handlers = getAllImportHandlers();
    return handlers.find(h => h.mimeTypes.includes(mimeType));
  },

  /**
   * Auto-detect import format from file
   */
  detectImportFormat: (file: File) => {
    // Check by MIME type first
    let handler = HandlerUtils.getImportHandlerByMimeType(file.type);
    if (handler) return handler.format;

    // Check by extension
    const extension = `.${file.name.split('.').pop()?.toLowerCase() || ''}`;
    handler = HandlerUtils.getImportHandlerByExtension(extension);
    if (handler) return handler.format;

    return null;
  },

  /**
   * Get supported file extensions for export
   */
  getSupportedExportExtensions: () => {
    const handlers = getAllExportHandlers();
    return handlers.flatMap(h => h.extensions);
  },

  /**
   * Get supported file extensions for import
   */
  getSupportedImportExtensions: () => {
    const handlers = getAllImportHandlers();
    return handlers.flatMap(h => h.extensions);
  },

  /**
   * Get supported MIME types for import
   */
  getSupportedImportMimeTypes: () => {
    const handlers = getAllImportHandlers();
    return handlers.flatMap(h => h.mimeTypes);
  }
};

/**
 * Handler validation utilities
 */
export const HandlerValidation = {
  /**
   * Validate file for import
   */
  validateFileForImport: (file: File) => {
    const supportedExtensions = HandlerUtils.getSupportedImportExtensions();
    const supportedMimeTypes = HandlerUtils.getSupportedImportMimeTypes();
    
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase() || ''}`;
    
    const isValidExtension = supportedExtensions.includes(fileExtension);
    const isValidMimeType = supportedMimeTypes.includes(file.type);
    
    return {
      isValid: isValidExtension || isValidMimeType,
      extension: fileExtension,
      mimeType: file.type,
      supportedExtensions,
      supportedMimeTypes
    };
  },

  /**
   * Get file size limit for format
   */
  getFileSizeLimit: (format: string, type: 'export' | 'import') => {
    if (type === 'export') {
      const handler = getAllExportHandlers().find(h => h.format === format);
      return handler?.maxFileSize;
    } else {
      const handler = getAllImportHandlers().find(h => h.format === format);
      return handler?.maxFileSize;
    }
  }
};

/**
 * Development utilities
 */
if (process.env.NODE_ENV === 'development') {
  (window as any).ExportImportHandlers = {
    export: getAllExportHandlers(),
    import: getAllImportHandlers(),
    utils: HandlerUtils,
    validation: HandlerValidation
  };
  
  console.log('📤📥 Export/Import handlers loaded');
  console.log('  Export formats:', getAllExportHandlers().map(h => h.format));
  console.log('  Import formats:', getAllImportHandlers().map(h => h.format));
  console.log('  🛠️  Handlers available at window.ExportImportHandlers');
}
