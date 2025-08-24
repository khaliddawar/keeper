import type { ImportHandler, ImportFormat } from '../types';
import { JSONImportHandler } from './JSONImportHandler';
import { CSVImportHandler } from './CSVImportHandler';
import { ExcelImportHandler } from './ExcelImportHandler';

/**
 * Import Handler Registry
 * Manages registration and access to import format handlers
 */
export class ImportHandlerRegistry {
  private handlers = new Map<ImportFormat, ImportHandler>();

  constructor() {
    this.registerDefaultHandlers();
  }

  /**
   * Register default import handlers
   */
  private registerDefaultHandlers(): void {
    this.register(new JSONImportHandler());
    this.register(new CSVImportHandler());
    this.register(new ExcelImportHandler());
  }

  /**
   * Register an import handler
   */
  register(handler: ImportHandler): void {
    this.handlers.set(handler.format, handler);
    console.log(`Registered import handler for format: ${handler.format}`);
  }

  /**
   * Unregister an import handler
   */
  unregister(format: ImportFormat): boolean {
    const success = this.handlers.delete(format);
    if (success) {
      console.log(`Unregistered import handler for format: ${format}`);
    }
    return success;
  }

  /**
   * Get import handler for format
   */
  getHandler(format: ImportFormat): ImportHandler | null {
    return this.handlers.get(format) || null;
  }

  /**
   * Get all registered handlers
   */
  getAllHandlers(): ImportHandler[] {
    return Array.from(this.handlers.values());
  }

  /**
   * Get available formats
   */
  getAvailableFormats(): ImportFormat[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Check if format is supported
   */
  isSupported(format: ImportFormat): boolean {
    return this.handlers.has(format);
  }

  /**
   * Get handler by file extension
   */
  getHandlerByExtension(extension: string): ImportHandler | null {
    for (const handler of this.handlers.values()) {
      if (handler.extensions.includes(extension)) {
        return handler;
      }
    }
    return null;
  }

  /**
   * Get handler by MIME type
   */
  getHandlerByMimeType(mimeType: string): ImportHandler | null {
    for (const handler of this.handlers.values()) {
      if (handler.mimeTypes.includes(mimeType)) {
        return handler;
      }
    }
    return null;
  }

  /**
   * Auto-detect format from file
   */
  detectFormat(file: File): ImportFormat | null {
    // Check by MIME type first
    const handlerByMime = this.getHandlerByMimeType(file.type);
    if (handlerByMime) {
      return handlerByMime.format;
    }

    // Check by file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension) {
      const handlerByExt = this.getHandlerByExtension(`.${extension}`);
      if (handlerByExt) {
        return handlerByExt.format;
      }
    }

    return null;
  }

  /**
   * Get import statistics
   */
  getStats(): Array<{
    format: ImportFormat;
    name: string;
    extensions: string[];
    mimeTypes: string[];
    maxFileSize?: number;
  }> {
    return Array.from(this.handlers.values()).map(handler => ({
      format: handler.format,
      name: handler.name,
      extensions: handler.extensions,
      mimeTypes: handler.mimeTypes,
      maxFileSize: handler.maxFileSize
    }));
  }
}
