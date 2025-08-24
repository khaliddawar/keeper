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
 * JSON Import Handler
 * Handles importing data from JSON format
 */
export class JSONImportHandler implements ImportHandler {
  public readonly format = 'json' as const;
  public readonly name = 'JSON';
  public readonly description = 'JavaScript Object Notation - Universal data format';
  public readonly extensions = ['.json'];
  public readonly mimeTypes = ['application/json', 'text/json'];
  public readonly maxFileSize = 100 * 1024 * 1024; // 100MB

  /**
   * Parse JSON file
   */
  async parse(file: File): Promise<any[]> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Handle different JSON structures
      if (this.isThoughtKeeperExport(data)) {
        // Native ThoughtKeeper export format
        return this.parseThoughtKeeperExport(data);
      } else if (Array.isArray(data)) {
        // Array of items
        return data;
      } else if (typeof data === 'object' && data !== null) {
        // Single object or structured data
        return this.flattenStructuredData(data);
      } else {
        throw new Error('Invalid JSON structure for import');
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON file format');
      }
      throw error;
    }
  }

  /**
   * Validate parsed data
   */
  async validate(data: any[], config: ImportConfig): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const result = this.validateItem(item, i, config);
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

    for (const item of data) {
      const transformedItem = this.applyMapping(item, mapping);
      
      if (this.isNotebookItem(transformedItem)) {
        notebooks.push(this.transformToNotebook(transformedItem));
      } else if (this.isTaskItem(transformedItem)) {
        tasks.push(this.transformToTask(transformedItem));
      }
    }

    return {
      metadata: {
        version: '1.0.0',
        format: 'json',
        exportedAt: new Date(),
        source: 'Import',
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
   * Detect columns from JSON data
   */
  async detectColumns(file: File): Promise<string[]> {
    const data = await this.parse(file);
    const columns = new Set<string>();

    // Analyze first few items to detect structure
    const sampleSize = Math.min(10, data.length);
    for (let i = 0; i < sampleSize; i++) {
      const item = data[i];
      if (typeof item === 'object' && item !== null) {
        this.extractKeys(item, '', columns);
      }
    }

    return Array.from(columns).sort();
  }

  /**
   * Generate field mapping based on detected columns
   */
  generateMapping(columns: string[]): ImportFieldMapping[] {
    const mapping: ImportFieldMapping[] = [];

    // Define common field mappings
    const fieldMappings: Record<string, Partial<ImportFieldMapping>> = {
      'id': { targetField: 'id', required: true },
      'title': { targetField: 'title', required: true },
      'name': { targetField: 'title', required: true },
      'description': { targetField: 'description', required: false },
      'content': { targetField: 'content', required: false },
      'notes': { targetField: 'notes', required: false },
      'status': { targetField: 'status', required: false, defaultValue: 'pending' },
      'priority': { targetField: 'priority', required: false, defaultValue: 'medium' },
      'tags': { 
        targetField: 'tags', 
        required: false, 
        defaultValue: [],
        transform: (value) => this.parseTagsField(value)
      },
      'category': { targetField: 'category', required: false, defaultValue: 'personal' },
      'color': { targetField: 'color', required: false },
      'assignee': { targetField: 'assignee', required: false },
      'collaborators': { 
        targetField: 'collaborators', 
        required: false, 
        defaultValue: [],
        transform: (value) => this.parseArrayField(value)
      },
      'dueDate': { 
        targetField: 'dueDate', 
        required: false,
        transform: (value) => this.parseDate(value)
      },
      'completedAt': { 
        targetField: 'completedAt', 
        required: false,
        transform: (value) => this.parseDate(value)
      },
      'createdAt': { 
        targetField: 'createdAt', 
        required: false,
        transform: (value) => this.parseDate(value),
        defaultValue: new Date()
      },
      'updatedAt': { 
        targetField: 'updatedAt', 
        required: false,
        transform: (value) => this.parseDate(value),
        defaultValue: new Date()
      }
    };

    // Map detected columns
    for (const column of columns) {
      const normalizedColumn = column.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Check for exact matches first
      if (fieldMappings[column]) {
        mapping.push({
          sourceField: column,
          ...fieldMappings[column]
        } as ImportFieldMapping);
        continue;
      }

      // Check for partial matches
      let matched = false;
      for (const [key, mappingConfig] of Object.entries(fieldMappings)) {
        if (normalizedColumn.includes(key) || key.includes(normalizedColumn)) {
          mapping.push({
            sourceField: column,
            ...mappingConfig
          } as ImportFieldMapping);
          matched = true;
          break;
        }
      }

      // If no match found, add as custom field
      if (!matched) {
        mapping.push({
          sourceField: column,
          targetField: column,
          required: false
        });
      }
    }

    return mapping;
  }

  /**
   * Check if data is ThoughtKeeper export format
   */
  private isThoughtKeeperExport(data: any): boolean {
    return (
      typeof data === 'object' &&
      data !== null &&
      'metadata' in data &&
      ('notebooks' in data || 'tasks' in data)
    );
  }

  /**
   * Parse ThoughtKeeper export format
   */
  private parseThoughtKeeperExport(data: any): any[] {
    const items = [];
    
    if (data.notebooks && Array.isArray(data.notebooks)) {
      items.push(...data.notebooks.map((nb: any) => ({ ...nb, type: 'notebook' })));
    }
    
    if (data.tasks && Array.isArray(data.tasks)) {
      items.push(...data.tasks.map((task: any) => ({ ...task, type: 'task' })));
    }

    return items;
  }

  /**
   * Flatten structured data into array
   */
  private flattenStructuredData(data: any): any[] {
    const items = [];

    // Look for arrays in the object
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        items.push(...value.map(item => ({ ...item, type: key.slice(0, -1) }))); // Remove 's' from plural
      }
    }

    // If no arrays found, treat the object as a single item
    if (items.length === 0) {
      items.push(data);
    }

    return items;
  }

  /**
   * Validate individual item
   */
  private validateItem(item: any, index: number, config: ImportConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (typeof item !== 'object' || item === null) {
      return {
        isValid: false,
        error: `Item at index ${index} is not a valid object`
      };
    }

    // Check required fields based on mapping
    for (const mapping of config.mapping) {
      if (mapping.required && !item.hasOwnProperty(mapping.sourceField)) {
        if (!mapping.defaultValue) {
          errors.push(`Missing required field: ${mapping.sourceField}`);
        } else {
          warnings.push(`Using default value for missing field: ${mapping.sourceField}`);
        }
      }
    }

    // Validate field values
    if (item.id && typeof item.id !== 'string') {
      errors.push('ID must be a string');
    }

    if (item.title && typeof item.title !== 'string') {
      errors.push('Title must be a string');
    }

    if (item.status && !this.isValidStatus(item.status)) {
      warnings.push(`Invalid status: ${item.status}, will use default`);
    }

    if (item.priority && !this.isValidPriority(item.priority)) {
      warnings.push(`Invalid priority: ${item.priority}, will use default`);
    }

    // Validate dates
    if (item.dueDate && !this.isValidDate(item.dueDate)) {
      warnings.push('Invalid due date format');
    }

    if (item.createdAt && !this.isValidDate(item.createdAt)) {
      warnings.push('Invalid created date format');
    }

    return {
      isValid: errors.length === 0,
      error: errors.length > 0 ? errors.join(', ') : undefined,
      warning: warnings.length > 0 ? warnings.join(', ') : undefined
    };
  }

  /**
   * Apply field mapping to item
   */
  private applyMapping(item: any, mapping: ImportFieldMapping[]): any {
    const mapped: any = {};

    for (const map of mapping) {
      let value = item[map.sourceField];

      // Apply default value if missing
      if (value === undefined || value === null) {
        if (map.defaultValue !== undefined) {
          value = map.defaultValue;
        } else if (map.required) {
          continue; // Skip required fields without defaults
        } else {
          continue; // Skip optional fields without values
        }
      }

      // Apply transformation
      if (map.transform && value !== undefined && value !== null) {
        try {
          value = map.transform(value);
        } catch (error) {
          console.warn(`Transform failed for ${map.sourceField}:`, error);
        }
      }

      // Apply validation
      if (map.validator) {
        const validation = map.validator(value);
        if (!validation.isValid) {
          console.warn(`Validation failed for ${map.sourceField}: ${validation.error}`);
          continue;
        }
      }

      mapped[map.targetField] = value;
    }

    return mapped;
  }

  /**
   * Check if item is a notebook
   */
  private isNotebookItem(item: any): boolean {
    return (
      item.type === 'notebook' ||
      ('content' in item && !('status' in item)) ||
      ('category' in item && !('assignee' in item))
    );
  }

  /**
   * Check if item is a task
   */
  private isTaskItem(item: any): boolean {
    return (
      item.type === 'task' ||
      'status' in item ||
      'priority' in item ||
      'assignee' in item ||
      'dueDate' in item
    );
  }

  /**
   * Transform to notebook format
   */
  private transformToNotebook(item: any): ExportedNotebook {
    return {
      id: item.id || this.generateId('notebook'),
      title: item.title || 'Untitled Notebook',
      description: item.description || '',
      content: item.content || '',
      tags: this.ensureArray(item.tags),
      color: item.color || '',
      category: item.category || 'personal',
      isFavorite: Boolean(item.isFavorite),
      isArchived: Boolean(item.isArchived),
      taskCount: Number(item.taskCount) || 0,
      collaborators: this.ensureArray(item.collaborators),
      createdAt: this.ensureDate(item.createdAt) || new Date(),
      updatedAt: this.ensureDate(item.updatedAt) || new Date(),
      customFields: this.extractCustomFields(item)
    };
  }

  /**
   * Transform to task format
   */
  private transformToTask(item: any): ExportedTask {
    return {
      id: item.id || this.generateId('task'),
      title: item.title || 'Untitled Task',
      description: item.description || '',
      notes: item.notes || '',
      status: this.normalizeStatus(item.status) || 'pending',
      priority: this.normalizePriority(item.priority) || 'medium',
      tags: this.ensureArray(item.tags),
      notebookId: item.notebookId || undefined,
      parentId: item.parentId || undefined,
      assignee: item.assignee || undefined,
      estimatedHours: Number(item.estimatedHours) || undefined,
      actualHours: Number(item.actualHours) || undefined,
      dueDate: this.ensureDate(item.dueDate) || undefined,
      completedAt: this.ensureDate(item.completedAt) || undefined,
      createdAt: this.ensureDate(item.createdAt) || new Date(),
      updatedAt: this.ensureDate(item.updatedAt) || new Date(),
      subtasks: this.parseSubtasks(item.subtasks),
      customFields: this.extractCustomFields(item)
    };
  }

  /**
   * Utility methods
   */
  private extractKeys(obj: any, prefix: string, keys: Set<string>): void {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      keys.add(fullKey);

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.extractKeys(value, fullKey, keys);
      }
    }
  }

  private parseTagsField(value: any): string[] {
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === 'string') return value.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
    return [];
  }

  private parseArrayField(value: any): string[] {
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === 'string') return value.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
    return [];
  }

  private parseDate(value: any): Date | undefined {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
  }

  private parseSubtasks(value: any): any[] {
    if (!Array.isArray(value)) return [];
    return value.map((subtask, index) => ({
      id: subtask.id || `subtask-${index}`,
      title: subtask.title || 'Untitled Subtask',
      completed: Boolean(subtask.completed),
      createdAt: this.ensureDate(subtask.createdAt) || new Date(),
      updatedAt: this.ensureDate(subtask.updatedAt) || new Date()
    }));
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private ensureArray(value: any): string[] {
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === 'string') return [value];
    return [];
  }

  private ensureDate(value: any): Date | undefined {
    if (value instanceof Date) return value;
    if (value) {
      const date = new Date(value);
      return isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
  }

  private isValidStatus(status: any): boolean {
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled', 'blocked'];
    return typeof status === 'string' && validStatuses.includes(status);
  }

  private isValidPriority(priority: any): boolean {
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    return typeof priority === 'string' && validPriorities.includes(priority);
  }

  private isValidDate(date: any): boolean {
    if (!date) return true; // Optional dates are valid when empty
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }

  private normalizeStatus(status: any): string {
    if (!status) return 'pending';
    const normalized = String(status).toLowerCase().replace(/[^a-z]/g, '_');
    
    // Map common variations
    const statusMap: Record<string, string> = {
      'todo': 'pending',
      'doing': 'in_progress',
      'in_progress': 'in_progress',
      'inprogress': 'in_progress',
      'done': 'completed',
      'complete': 'completed',
      'completed': 'completed',
      'finished': 'completed',
      'cancelled': 'cancelled',
      'canceled': 'cancelled',
      'blocked': 'blocked'
    };

    return statusMap[normalized] || 'pending';
  }

  private normalizePriority(priority: any): string {
    if (!priority) return 'medium';
    const normalized = String(priority).toLowerCase();
    
    // Map common variations
    const priorityMap: Record<string, string> = {
      'low': 'low',
      'l': 'low',
      '1': 'low',
      'medium': 'medium',
      'med': 'medium',
      'm': 'medium',
      '2': 'medium',
      'high': 'high',
      'hi': 'high',
      'h': 'high',
      '3': 'high',
      'urgent': 'urgent',
      'critical': 'urgent',
      'crit': 'urgent',
      '4': 'urgent',
      '5': 'urgent'
    };

    return priorityMap[normalized] || 'medium';
  }

  private extractCustomFields(item: any): Record<string, any> | undefined {
    const standardFields = new Set([
      'id', 'title', 'description', 'content', 'notes', 'status', 'priority',
      'tags', 'category', 'color', 'isFavorite', 'isArchived', 'taskCount',
      'collaborators', 'notebookId', 'parentId', 'assignee', 'estimatedHours',
      'actualHours', 'dueDate', 'completedAt', 'createdAt', 'updatedAt',
      'subtasks', 'type'
    ]);

    const customFields: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(item)) {
      if (!standardFields.has(key)) {
        customFields[key] = value;
      }
    }

    return Object.keys(customFields).length > 0 ? customFields : undefined;
  }
}
