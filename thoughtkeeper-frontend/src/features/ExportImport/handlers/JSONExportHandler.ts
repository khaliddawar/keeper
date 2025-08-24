import type { ExportHandler, ExportData, ExportConfig, ValidationResult, ExportFieldMapping } from '../types';

/**
 * JSON Export Handler
 * Handles exporting data to JSON format
 */
export class JSONExportHandler implements ExportHandler {
  public readonly format = 'json' as const;
  public readonly name = 'JSON';
  public readonly description = 'JavaScript Object Notation - Universal data interchange format';
  public readonly extensions = ['.json'];
  public readonly mimeType = 'application/json';
  public readonly maxFileSize = 100 * 1024 * 1024; // 100MB

  /**
   * Export data to JSON format
   */
  async export(data: ExportData, config: ExportConfig): Promise<Blob> {
    try {
      // Apply configuration options
      let processedData = { ...data };

      // Remove metadata if not included
      if (!config.includeMetadata) {
        // Make sure metadata is optional in processed type
        delete (processedData as Partial<typeof processedData>).metadata;
      }

      // Apply date range filter if specified
      if (config.dateRange) {
        processedData = this.applyDateRangeFilter(processedData, config.dateRange);
      }

      // Apply custom filters
      if (config.filters.length > 0) {
        processedData = this.applyFilters(processedData, config.filters);
      }

      // Remove deleted items if not included
      if (!config.includeDeleted) {
        processedData.notebooks = processedData.notebooks.filter(nb => !nb.isArchived);
        processedData.tasks = processedData.tasks.filter(task => task.status !== 'cancelled');
      }

      // Serialize to JSON with proper formatting
      const jsonString = JSON.stringify(processedData, this.jsonReplacer, 2);
      
      // Create blob
      return new Blob([jsonString], { type: this.mimeType });
    } catch (error) {
      throw new Error(`JSON export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate export configuration
   */
  validate(config: ExportConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if filename has correct extension
    if (config.filename && !config.filename.endsWith('.json')) {
      warnings.push('Filename should have .json extension');
    }

    // Check date range
    if (config.dateRange) {
      if (config.dateRange.start > config.dateRange.end) {
        errors.push('Start date must be before end date');
      }
    }

    // Check filters
    for (const filter of config.filters) {
      if (!filter.field || filter.value === undefined) {
        errors.push(`Invalid filter: ${filter.field}`);
      }
    }

    return {
      isValid: errors.length === 0,
      error: errors.length > 0 ? errors.join(', ') : undefined,
      warning: warnings.length > 0 ? warnings.join(', ') : undefined
    };
  }

  /**
   * Get default configuration for JSON export
   */
  getDefaultConfig(): Partial<ExportConfig> {
    return {
      format: 'json',
      includeMetadata: true,
      includeDeleted: false,
      compression: 'none',
      filters: []
    };
  }

  /**
   * Get field mappings for JSON export
   */
  getFieldMappings(): ExportFieldMapping[] {
    return [
      // Notebook mappings
      { sourceField: 'notebooks.id', targetField: 'id', required: true },
      { sourceField: 'notebooks.title', targetField: 'title', required: true },
      { sourceField: 'notebooks.description', targetField: 'description', required: false },
      { sourceField: 'notebooks.content', targetField: 'content', required: false },
      { sourceField: 'notebooks.tags', targetField: 'tags', required: false, defaultValue: [] },
      { sourceField: 'notebooks.color', targetField: 'color', required: false },
      { sourceField: 'notebooks.category', targetField: 'category', required: false, defaultValue: 'personal' },
      { sourceField: 'notebooks.isFavorite', targetField: 'isFavorite', required: false, defaultValue: false },
      { sourceField: 'notebooks.isArchived', targetField: 'isArchived', required: false, defaultValue: false },
      { sourceField: 'notebooks.collaborators', targetField: 'collaborators', required: false, defaultValue: [] },
      { sourceField: 'notebooks.createdAt', targetField: 'createdAt', required: true },
      { sourceField: 'notebooks.updatedAt', targetField: 'updatedAt', required: true },

      // Task mappings
      { sourceField: 'tasks.id', targetField: 'id', required: true },
      { sourceField: 'tasks.title', targetField: 'title', required: true },
      { sourceField: 'tasks.description', targetField: 'description', required: false },
      { sourceField: 'tasks.notes', targetField: 'notes', required: false },
      { sourceField: 'tasks.status', targetField: 'status', required: true, defaultValue: 'pending' },
      { sourceField: 'tasks.priority', targetField: 'priority', required: true, defaultValue: 'medium' },
      { sourceField: 'tasks.tags', targetField: 'tags', required: false, defaultValue: [] },
      { sourceField: 'tasks.notebookId', targetField: 'notebookId', required: false },
      { sourceField: 'tasks.parentId', targetField: 'parentId', required: false },
      { sourceField: 'tasks.assignee', targetField: 'assignee', required: false },
      { sourceField: 'tasks.dueDate', targetField: 'dueDate', required: false },
      { sourceField: 'tasks.completedAt', targetField: 'completedAt', required: false },
      { sourceField: 'tasks.createdAt', targetField: 'createdAt', required: true },
      { sourceField: 'tasks.updatedAt', targetField: 'updatedAt', required: true },
      { sourceField: 'tasks.subtasks', targetField: 'subtasks', required: false, defaultValue: [] }
    ];
  }

  /**
   * Apply date range filter
   */
  private applyDateRangeFilter(data: ExportData, dateRange: { start: Date; end: Date }): ExportData {
    return {
      ...data,
      notebooks: data.notebooks.filter(nb => {
        const created = new Date(nb.createdAt);
        return created >= dateRange.start && created <= dateRange.end;
      }),
      tasks: data.tasks.filter(task => {
        const created = new Date(task.createdAt);
        return created >= dateRange.start && created <= dateRange.end;
      })
    };
  }

  /**
   * Apply custom filters
   */
  private applyFilters(data: ExportData, filters: any[]): ExportData {
    let filteredData = { ...data };

    for (const filter of filters) {
      if (!filter.enabled) continue;

      // Apply notebook filters
      if (filter.field.startsWith('notebooks.')) {
        const field = filter.field.replace('notebooks.', '');
        filteredData.notebooks = filteredData.notebooks.filter(nb => 
          this.evaluateFilter(nb, field, filter.operator, filter.value)
        );
      }

      // Apply task filters
      if (filter.field.startsWith('tasks.')) {
        const field = filter.field.replace('tasks.', '');
        filteredData.tasks = filteredData.tasks.filter(task => 
          this.evaluateFilter(task, field, filter.operator, filter.value)
        );
      }
    }

    return filteredData;
  }

  /**
   * Evaluate a filter condition
   */
  private evaluateFilter(item: any, field: string, operator: string, value: any): boolean {
    const fieldValue = this.getNestedValue(item, field);

    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
      case 'startsWith':
        return String(fieldValue).toLowerCase().startsWith(String(value).toLowerCase());
      case 'in':
        return Array.isArray(value) ? value.includes(fieldValue) : false;
      case 'between':
        if (Array.isArray(value) && value.length === 2) {
          return fieldValue >= value[0] && fieldValue <= value[1];
        }
        return false;
      default:
        return true;
    }
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * JSON replacer function for serialization
   */
  private jsonReplacer(key: string, value: any): any {
    // Convert dates to ISO strings
    if (value instanceof Date) {
      return value.toISOString();
    }

    // Handle undefined values
    if (value === undefined) {
      return null;
    }

    // Handle functions (should not be present in export data)
    if (typeof value === 'function') {
      return '[Function]';
    }

    return value;
  }

  /**
   * Estimate export size
   */
  estimateSize(data: ExportData): number {
    // Rough estimation based on JSON string length
    const jsonString = JSON.stringify(data);
    return jsonString.length * 1.1; // Add 10% buffer
  }

  /**
   * Check if data exceeds size limits
   */
  checkSizeLimits(data: ExportData): { withinLimits: boolean; estimatedSize: number; maxSize: number } {
    const estimatedSize = this.estimateSize(data);
    return {
      withinLimits: estimatedSize <= this.maxFileSize,
      estimatedSize,
      maxSize: this.maxFileSize
    };
  }

  /**
   * Optimize data for export (remove unnecessary fields, compress)
   */
  optimizeForExport(data: ExportData, aggressive = false): ExportData {
    const optimized = { ...data };

    if (aggressive) {
      // Remove empty fields
      optimized.notebooks = optimized.notebooks.map(nb => this.removeEmptyFields(nb));
      optimized.tasks = optimized.tasks.map(task => ({
        ...this.removeEmptyFields(task),
        subtasks: task.subtasks.map(st => this.removeEmptyFields(st))
      }));

      // Remove redundant metadata
      if (optimized.metadata) {
        delete optimized.metadata.checksum;
      }
    }

    return optimized;
  }

  /**
   * Remove empty/null fields from object
   */
  private removeEmptyFields(obj: any): any {
    const cleaned: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined && value !== '' && 
          !(Array.isArray(value) && value.length === 0) &&
          !(typeof value === 'object' && Object.keys(value).length === 0)) {
        cleaned[key] = value;
      }
    }
    
    return cleaned;
  }
}
