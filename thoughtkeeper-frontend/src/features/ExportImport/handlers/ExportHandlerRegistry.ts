import type { ExportHandler, ExportFormat } from '../types';
import { JSONExportHandler } from './JSONExportHandler';
import { CSVExportHandler } from './CSVExportHandler';
import { ExcelExportHandler } from './ExcelExportHandler';
import { MarkdownExportHandler } from './MarkdownExportHandler';

/**
 * Export Handler Registry
 * Manages registration and access to export format handlers
 */
export class ExportHandlerRegistry {
  private handlers = new Map<ExportFormat, ExportHandler>();

  constructor() {
    this.registerDefaultHandlers();
  }

  /**
   * Register default export handlers
   */
  private registerDefaultHandlers(): void {
    this.register(new JSONExportHandler());
    this.register(new CSVExportHandler());
    this.register(new ExcelExportHandler());
    this.register(new MarkdownExportHandler());
  }

  /**
   * Register an export handler
   */
  register(handler: ExportHandler): void {
    this.handlers.set(handler.format, handler);
    console.log(`Registered export handler for format: ${handler.format}`);
  }

  /**
   * Unregister an export handler
   */
  unregister(format: ExportFormat): boolean {
    const success = this.handlers.delete(format);
    if (success) {
      console.log(`Unregistered export handler for format: ${format}`);
    }
    return success;
  }

  /**
   * Get export handler for format
   */
  getHandler(format: ExportFormat): ExportHandler | null {
    return this.handlers.get(format) || null;
  }

  /**
   * Get all registered handlers
   */
  getAllHandlers(): ExportHandler[] {
    return Array.from(this.handlers.values());
  }

  /**
   * Get available formats
   */
  getAvailableFormats(): ExportFormat[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Check if format is supported
   */
  isSupported(format: ExportFormat): boolean {
    return this.handlers.has(format);
  }

  /**
   * Get handler by file extension
   */
  getHandlerByExtension(extension: string): ExportHandler | null {
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
  getHandlerByMimeType(mimeType: string): ExportHandler | null {
    for (const handler of this.handlers.values()) {
      if (handler.mimeType === mimeType) {
        return handler;
      }
    }
    return null;
  }

  /**
   * Get export statistics
   */
  getStats(): Array<{
    format: ExportFormat;
    name: string;
    extensions: string[];
    maxFileSize?: number;
  }> {
    return Array.from(this.handlers.values()).map(handler => ({
      format: handler.format,
      name: handler.name,
      extensions: handler.extensions,
      maxFileSize: handler.maxFileSize
    }));
  }
}
