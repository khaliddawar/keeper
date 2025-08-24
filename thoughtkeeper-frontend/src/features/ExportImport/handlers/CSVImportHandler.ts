import type { 
  ImportHandler, 
  ImportConfig, 
  ValidationResult, 
  ImportFieldMapping, 
  ExportData,
  ExportedNotebook,
  ExportedTask
} from '../types';

/**
 * CSV Import Handler
 * Handles importing data from CSV format
 */
export class CSVImportHandler implements ImportHandler {
  public readonly format = 'csv' as const;
  public readonly name = 'CSV';
  public readonly description = 'Comma Separated Values - Universal spreadsheet format';
  public readonly extensions = ['.csv'];
  public readonly mimeTypes = ['text/csv', 'application/csv', 'text/plain'];
  public readonly maxFileSize = 50 * 1024 * 1024; // 50MB

  /**
   * Parse CSV file
   */
  async parse(file: File): Promise<any[]> {
    try {
      const text = await file.text();
      return this.parseCSV(text);
    } catch (error) {
      throw new Error(`CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate parsed data
   */
  async validate(data: any[], config: ImportConfig): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const result = this.validateRow(item, i, config);
      results.push(result);
    }

    return results;
  }

  /**
   * Transform data to ExportData format
   */
  async transform(data: any[], mapping: ImportFieldMapping[]): Promise<ExportData> {
    const notebooks: ExportedNotebook[] = [];
    const tasks: ExportedTask[] = [];

    for (const row of data) {
      const transformedRow = this.applyMapping(row, mapping);
      
      if (this.isNotebookRow(transformedRow, mapping)) {
        notebooks.push(this.transformToNotebook(transformedRow));
      } else {
        tasks.push(this.transformToTask(transformedRow));
      }
    }

    return {
      metadata: {
        version: '1.0.0',
        format: 'csv',
        exportedAt: new Date(),
        source: 'CSV Import',
        itemCounts: {
          notebooks: notebooks.length,
          tasks: tasks.length,
          subtasks: tasks.reduce((sum, task) => sum + task.subtasks.length, 0)
        },
        filters: []
      },
      notebooks,
      tasks
    };
  }

  /**
   * Detect columns from CSV file
   */
  async detectColumns(file: File): Promise<string[]> {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Parse first line as headers
    const headers = this.parseLine(lines[0]);
    return headers.map(header => header.trim()).filter(header => header.length > 0);
  }

  /**
   * Generate field mapping based on detected columns
   */
  generateMapping(columns: string[]): ImportFieldMapping[] {
    const mapping: ImportFieldMapping[] = [];

    // Define common CSV field patterns and their mappings
    const fieldPatterns: Array<{
      pattern: RegExp;
      mapping: Partial<ImportFieldMapping>;
    }> = [
      {
        pattern: /^(id|identifier|key)$/i,
        mapping: { targetField: 'id', required: true }
      },
      {
        pattern: /^(title|name|subject|task|notebook)$/i,
        mapping: { targetField: 'title', required: true }
      },
      {
        pattern: /^(description|desc|details|note)$/i,
        mapping: { targetField: 'description', required: false }
      },
      {
        pattern: /^(content|body|text)$/i,
        mapping: { targetField: 'content', required: false }
      },
      {
        pattern: /^(notes|comments)$/i,
        mapping: { targetField: 'notes', required: false }
      },
      {
        pattern: /^(status|state|condition)$/i,
        mapping: { 
          targetField: 'status', 
          required: false, 
          defaultValue: 'pending',
          transform: (value) => this.normalizeStatus(value)
        }
      },
      {
        pattern: /^(priority|importance|urgency)$/i,
        mapping: { 
          targetField: 'priority', 
          required: false, 
          defaultValue: 'medium',
          transform: (value) => this.normalizePriority(value)
        }
      },
      {
        pattern: /^(tags|labels|categories)$/i,
        mapping: { 
          targetField: 'tags', 
          required: false, 
          defaultValue: [],
          transform: (value) => this.parseDelimitedField(value)
        }
      },
      {
        pattern: /^(category|type|group)$/i,
        mapping: { targetField: 'category', required: false, defaultValue: 'personal' }
      },
      {
        pattern: /^(color|colour)$/i,
        mapping: { targetField: 'color', required: false }
      },
      {
        pattern: /^(assignee|assigned|owner)$/i,
        mapping: { targetField: 'assignee', required: false }
      },
      {
        pattern: /^(collaborators|team|members)$/i,
        mapping: { 
          targetField: 'collaborators', 
          required: false, 
          defaultValue: [],
          transform: (value) => this.parseDelimitedField(value)
        }
      },
      {
        pattern: /^(due|duedate|deadline)$/i,
        mapping: { 
          targetField: 'dueDate', 
          required: false,
          transform: (value) => this.parseDate(value)
        }
      },
      {
        pattern: /^(completed|completeddate|finishdate)$/i,
        mapping: { 
          targetField: 'completedAt', 
          required: false,
          transform: (value) => this.parseDate(value)
        }
      },
      {
        pattern: /^(created|createddate|createdon)$/i,
        mapping: { 
          targetField: 'createdAt', 
          required: false,
          transform: (value) => this.parseDate(value),
          defaultValue: new Date()
        }
      },
      {
        pattern: /^(updated|updateddate|modifieddate)$/i,
        mapping: { 
          targetField: 'updatedAt', 
          required: false,
          transform: (value) => this.parseDate(value),
          defaultValue: new Date()
        }
      },
      {
        pattern: /^(estimated|estimatedhours|estimate)$/i,
        mapping: { 
          targetField: 'estimatedHours', 
          required: false,
          transform: (value) => this.parseNumber(value)
        }
      },
      {
        pattern: /^(actual|actualhours|spent)$/i,
        mapping: { 
          targetField: 'actualHours', 
          required: false,
          transform: (value) => this.parseNumber(value)
        }
      },
      {
        pattern: /^(favorite|favourite|starred)$/i,
        mapping: { 
          targetField: 'isFavorite', 
          required: false, 
          defaultValue: false,
          transform: (value) => this.parseBoolean(value)
        }
      },
      {
        pattern: /^(archived|deleted|hidden)$/i,
        mapping: { 
          targetField: 'isArchived', 
          required: false, 
          defaultValue: false,
          transform: (value) => this.parseBoolean(value)
        }
      }
    ];

    // Map each column
    for (const column of columns) {
      let mapped = false;

      // Try to match with patterns
      for (const { pattern, mapping: patternMapping } of fieldPatterns) {
        if (pattern.test(column)) {
          mapping.push({
            sourceField: column,
            ...patternMapping
          } as ImportFieldMapping);
          mapped = true;
          break;
        }
      }

      // If no pattern matched, add as custom field
      if (!mapped) {
        mapping.push({
          sourceField: column,
          targetField: this.sanitizeFieldName(column),
          required: false
        });
      }
    }

    return mapping;
  }

  /**
   * Parse CSV text into array of objects
   */
  private parseCSV(text: string): any[] {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }

    const headers = this.parseLine(lines[0]);
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseLine(lines[i]);
      
      // Skip empty rows
      if (values.every(value => !value || value.trim() === '')) {
        continue;
      }

      const row: any = {};
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j]?.trim();
        const value = values[j]?.trim() || '';
        
        if (header) {
          row[header] = value;
        }
      }

      data.push(row);
    }

    return data;
  }

  /**
   * Parse a single CSV line handling quotes and commas
   */
  private parseLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current);
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }

    // Add the last field
    result.push(current);

    return result;
  }

  /**
   * Validate individual row
   */
  private validateRow(row: any, index: number, config: ImportConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (typeof row !== 'object' || row === null) {
      return {
        isValid: false,
        error: `Row ${index + 1} is not a valid object`
      };
    }

    // Check required fields
    for (const mapping of config.mapping) {
      if (mapping.required) {
        const value = row[mapping.sourceField];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          if (mapping.defaultValue === undefined) {
            errors.push(`Row ${index + 1}: Missing required field '${mapping.sourceField}'`);
          } else {
            warnings.push(`Row ${index + 1}: Using default value for '${mapping.sourceField}'`);
          }
        }
      }
    }

    // Validate specific field formats
    if (row.id && typeof row.id !== 'string') {
      errors.push(`Row ${index + 1}: ID must be text`);
    }

    if (row.title && typeof row.title !== 'string') {
      errors.push(`Row ${index + 1}: Title must be text`);
    }

    // Validate dates
    const dateFields = ['dueDate', 'completedAt', 'createdAt', 'updatedAt'];
    for (const field of dateFields) {
      if (row[field] && !this.isValidDate(row[field])) {
        warnings.push(`Row ${index + 1}: Invalid date format in '${field}'`);
      }
    }

    // Validate numbers
    const numberFields = ['estimatedHours', 'actualHours', 'taskCount'];
    for (const field of numberFields) {
      if (row[field] && isNaN(Number(row[field]))) {
        warnings.push(`Row ${index + 1}: Invalid number format in '${field}'`);
      }
    }

    return {
      isValid: errors.length === 0,
      error: errors.length > 0 ? errors.join('; ') : undefined,
      warning: warnings.length > 0 ? warnings.join('; ') : undefined
    };
  }

  /**
   * Apply field mapping to row
   */
  private applyMapping(row: any, mapping: ImportFieldMapping[]): any {
    const mapped: any = {};

    for (const map of mapping) {
      let value = row[map.sourceField];

      // Handle empty values
      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        if (map.defaultValue !== undefined) {
          value = typeof map.defaultValue === 'function' ? map.defaultValue() : map.defaultValue;
        } else {
          continue;
        }
      }

      // Apply transformation
      if (map.transform && value !== undefined && value !== null) {
        try {
          value = map.transform(value);
        } catch (error) {
          console.warn(`Transform failed for ${map.sourceField}:`, error);
          continue;
        }
      }

      mapped[map.targetField] = value;
    }

    return mapped;
  }

  /**
   * Determine if row represents a notebook
   */
  private isNotebookRow(row: any, mapping: ImportFieldMapping[]): boolean {
    // Check for notebook-specific fields
    const notebookFields = ['content', 'category', 'collaborators'];
    const taskFields = ['status', 'priority', 'assignee', 'dueDate'];

    const hasNotebookFields = notebookFields.some(field => row[field] !== undefined);
    const hasTaskFields = taskFields.some(field => row[field] !== undefined);

    // If has notebook fields but not task fields, it's a notebook
    if (hasNotebookFields && !hasTaskFields) {
      return true;
    }

    // If has task fields, it's a task
    if (hasTaskFields) {
      return false;
    }

    // Default to task if uncertain
    return false;
  }

  /**
   * Transform to notebook
   */
  private transformToNotebook(row: any): ExportedNotebook {
    return {
      id: row.id || this.generateId('notebook'),
      title: row.title || 'Untitled Notebook',
      description: row.description || '',
      content: row.content || '',
      tags: this.ensureArray(row.tags),
      color: row.color || '',
      category: row.category || 'personal',
      isFavorite: Boolean(row.isFavorite),
      isArchived: Boolean(row.isArchived),
      taskCount: Number(row.taskCount) || 0,
      collaborators: this.ensureArray(row.collaborators),
      createdAt: this.ensureDate(row.createdAt) || new Date(),
      updatedAt: this.ensureDate(row.updatedAt) || new Date()
    };
  }

  /**
   * Transform to task
   */
  private transformToTask(row: any): ExportedTask {
    return {
      id: row.id || this.generateId('task'),
      title: row.title || 'Untitled Task',
      description: row.description || '',
      notes: row.notes || '',
      status: this.normalizeStatus(row.status) || 'pending',
      priority: this.normalizePriority(row.priority) || 'medium',
      tags: this.ensureArray(row.tags),
      notebookId: row.notebookId || undefined,
      parentId: row.parentId || undefined,
      assignee: row.assignee || undefined,
      estimatedHours: this.parseNumber(row.estimatedHours) || undefined,
      actualHours: this.parseNumber(row.actualHours) || undefined,
      dueDate: this.ensureDate(row.dueDate) || undefined,
      completedAt: this.ensureDate(row.completedAt) || undefined,
      createdAt: this.ensureDate(row.createdAt) || new Date(),
      updatedAt: this.ensureDate(row.updatedAt) || new Date(),
      subtasks: []
    };
  }

  /**
   * Utility methods
   */
  private parseDelimitedField(value: any): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(String);
    
    const str = String(value);
    // Split by common delimiters: comma, semicolon, pipe, or newline
    return str.split(/[,;|\n]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  private parseDate(value: any): Date | undefined {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    
    const str = String(value).trim();
    if (!str) return undefined;

    // Try parsing common date formats
    const date = new Date(str);
    return isNaN(date.getTime()) ? undefined : date;
  }

  private parseNumber(value: any): number | undefined {
    if (!value) return undefined;
    if (typeof value === 'number') return value;
    
    const num = Number(String(value).replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? undefined : num;
  }

  private parseBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    
    const str = String(value).toLowerCase().trim();
    return ['true', 'yes', '1', 'on', 'checked', 'active'].includes(str);
  }

  private normalizeStatus(value: any): string {
    if (!value) return 'pending';
    const str = String(value).toLowerCase().trim();
    
    const statusMap: Record<string, string> = {
      'todo': 'pending',
      'pending': 'pending',
      'new': 'pending',
      'open': 'pending',
      'doing': 'in_progress',
      'in progress': 'in_progress',
      'in_progress': 'in_progress',
      'working': 'in_progress',
      'active': 'in_progress',
      'done': 'completed',
      'complete': 'completed',
      'completed': 'completed',
      'finished': 'completed',
      'closed': 'completed',
      'cancelled': 'cancelled',
      'canceled': 'cancelled',
      'rejected': 'cancelled',
      'blocked': 'blocked',
      'on hold': 'blocked',
      'waiting': 'blocked'
    };

    return statusMap[str] || 'pending';
  }

  private normalizePriority(value: any): string {
    if (!value) return 'medium';
    const str = String(value).toLowerCase().trim();
    
    const priorityMap: Record<string, string> = {
      'low': 'low',
      'l': 'low',
      'minor': 'low',
      '1': 'low',
      'medium': 'medium',
      'med': 'medium',
      'm': 'medium',
      'normal': 'medium',
      '2': 'medium',
      'high': 'high',
      'h': 'high',
      'major': 'high',
      '3': 'high',
      'urgent': 'urgent',
      'critical': 'urgent',
      'crit': 'urgent',
      'emergency': 'urgent',
      '4': 'urgent',
      '5': 'urgent'
    };

    return priorityMap[str] || 'medium';
  }

  private isValidDate(value: any): boolean {
    if (!value) return true;
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  private sanitizeFieldName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private ensureArray(value: any): string[] {
    if (Array.isArray(value)) return value.map(String);
    if (!value) return [];
    return [String(value)];
  }

  private ensureDate(value: any): Date | undefined {
    if (value instanceof Date) return value;
    if (value) {
      const date = new Date(value);
      return isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
  }
}
