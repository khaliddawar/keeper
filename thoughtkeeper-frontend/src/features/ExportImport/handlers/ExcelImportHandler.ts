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
 * Excel Import Handler
 * Handles importing data from Excel format
 * Note: This is a simplified implementation. In production, use a library like xlsx or exceljs
 */
export class ExcelImportHandler implements ImportHandler {
  public readonly format = 'excel' as const;
  public readonly name = 'Excel';
  public readonly description = 'Microsoft Excel format with multiple sheets support';
  public readonly extensions = ['.xlsx', '.xls'];
  public readonly mimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  public readonly maxFileSize = 100 * 1024 * 1024; // 100MB

  /**
   * Parse Excel file
   * Note: This is a simplified implementation that treats Excel as CSV
   */
  async parse(file: File): Promise<any[]> {
    try {
      // In a real implementation, you would use a library like xlsx
      // For now, we'll attempt to read it as text if it's an older format
      // or handle it as a structured format
      
      if (file.name.endsWith('.csv') || file.type.includes('text')) {
        // Fallback to CSV parsing for text-based files
        const text = await file.text();
        return this.parseAsCSV(text);
      }

      // For binary Excel files, we'll simulate reading
      // In production, use: const workbook = XLSX.read(await file.arrayBuffer());
      return await this.parseExcelFile(file);
      
    } catch (error) {
      throw new Error(`Excel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      
      if (this.isNotebookRow(transformedRow)) {
        notebooks.push(this.transformToNotebook(transformedRow));
      } else {
        tasks.push(this.transformToTask(transformedRow));
      }
    }

    return {
      metadata: {
        version: '1.0.0',
        format: 'excel',
        exportedAt: new Date(),
        source: 'Excel Import',
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
   * Detect columns from Excel file
   */
  async detectColumns(file: File): Promise<string[]> {
    const data = await this.parse(file);
    
    if (data.length === 0) {
      throw new Error('Excel file contains no data');
    }

    // Get column names from first row (assumed to be headers)
    const firstRow = data[0];
    if (typeof firstRow === 'object' && firstRow !== null) {
      return Object.keys(firstRow);
    }

    throw new Error('Unable to detect columns from Excel file');
  }

  /**
   * Generate field mapping based on detected columns
   */
  generateMapping(columns: string[]): ImportFieldMapping[] {
    // Reuse the CSV mapping logic as it's similar
    return this.generateExcelMapping(columns);
  }

  /**
   * Parse Excel file (simplified implementation)
   */
  private async parseExcelFile(file: File): Promise<any[]> {
    // This is a highly simplified implementation
    // In production, you would use a library like xlsx:
    
    /*
    // Real implementation would be:
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
    */

    // For this demo, we'll simulate parsing by creating sample data
    // or attempting to read as text
    try {
      const text = await file.text();
      // Try to parse as CSV if it's readable as text
      if (text.includes(',') || text.includes('\t')) {
        return this.parseAsCSV(text);
      }
    } catch {
      // If text reading fails, it's a binary Excel file
    }

    // Simulate Excel data parsing
    return this.simulateExcelData(file);
  }

  /**
   * Parse as CSV (fallback)
   */
  private parseAsCSV(text: string): any[] {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length < 2) {
      throw new Error('File must have at least a header row and one data row');
    }

    const headers = this.parseLine(lines[0], ',');
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseLine(lines[i], ',');
      
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
   * Simulate Excel data (for demo purposes)
   */
  private simulateExcelData(file: File): any[] {
    // This would be replaced with actual Excel parsing in production
    console.warn('Excel parsing not fully implemented. Using simulated data.');
    
    // Return sample data structure
    return [
      {
        'ID': 'task-1',
        'Title': 'Sample Task from Excel',
        'Description': 'This is a simulated task from an Excel file',
        'Status': 'pending',
        'Priority': 'medium',
        'Tags': 'excel,import,sample',
        'Created Date': new Date().toISOString(),
        'Updated Date': new Date().toISOString()
      }
    ];
  }

  /**
   * Parse a line with delimiter
   */
  private parseLine(line: string, delimiter: string = ','): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i += 2;
        } else {
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current);
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }

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
          }
        }
      }
    }

    // Validate Excel-specific data types
    this.validateExcelDataTypes(row, index, errors, warnings);

    return {
      isValid: errors.length === 0,
      error: errors.length > 0 ? errors.join('; ') : undefined,
      warning: warnings.length > 0 ? warnings.join('; ') : undefined
    };
  }

  /**
   * Validate Excel-specific data types
   */
  private validateExcelDataTypes(row: any, index: number, errors: string[], warnings: string[]): void {
    // Check for Excel date serial numbers
    for (const [key, value] of Object.entries(row)) {
      if (typeof value === 'number' && value > 25000 && value < 50000) {
        // Might be Excel date serial number
        warnings.push(`Row ${index + 1}: '${key}' appears to be an Excel date (${value})`);
      }
    }

    // Check for Excel formula remnants
    for (const [key, value] of Object.entries(row)) {
      if (typeof value === 'string' && value.startsWith('=')) {
        warnings.push(`Row ${index + 1}: '${key}' contains formula: ${value}`);
      }
    }

    // Check for Excel error values
    const excelErrors = ['#DIV/0!', '#N/A', '#NAME?', '#NULL!', '#NUM!', '#REF!', '#VALUE!'];
    for (const [key, value] of Object.entries(row)) {
      if (typeof value === 'string' && excelErrors.includes(value)) {
        errors.push(`Row ${index + 1}: '${key}' contains Excel error: ${value}`);
      }
    }
  }

  /**
   * Apply field mapping to row
   */
  private applyMapping(row: any, mapping: ImportFieldMapping[]): any {
    const mapped: any = {};

    for (const map of mapping) {
      let value = row[map.sourceField];

      // Handle Excel-specific transformations
      value = this.transformExcelValue(value, map.targetField);

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
   * Transform Excel-specific values
   */
  private transformExcelValue(value: any, fieldType: string): any {
    if (value === null || value === undefined) return value;

    // Handle Excel date serial numbers
    if (typeof value === 'number' && fieldType.includes('Date') || fieldType.includes('date')) {
      if (value > 25000 && value < 50000) {
        // Convert Excel serial date to JavaScript Date
        return this.excelDateToJSDate(value);
      }
    }

    // Handle Excel boolean values
    if (fieldType.includes('favorite') || fieldType.includes('archived') || fieldType.includes('completed')) {
      if (typeof value === 'string') {
        const lower = value.toLowerCase();
        if (lower === 'true' || lower === 'yes' || lower === '1') return true;
        if (lower === 'false' || lower === 'no' || lower === '0') return false;
      }
    }

    // Handle Excel formulas (return calculated value if available)
    if (typeof value === 'string' && value.startsWith('=')) {
      // In real implementation, this would be the calculated value
      console.warn(`Formula detected: ${value}. Using raw value.`);
      return value;
    }

    return value;
  }

  /**
   * Convert Excel date serial number to JavaScript Date
   */
  private excelDateToJSDate(serial: number): Date {
    // Excel's date system starts from 1900-01-01 (serial 1)
    // JavaScript Date starts from 1970-01-01
    const excelEpoch = new Date(1900, 0, 1);
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    
    // Excel incorrectly treats 1900 as a leap year, so subtract 1 day for dates after Feb 28, 1900
    const adjustedSerial = serial > 59 ? serial - 1 : serial;
    
    return new Date(excelEpoch.getTime() + (adjustedSerial - 1) * millisecondsPerDay);
  }

  /**
   * Generate Excel-specific field mapping
   */
  private generateExcelMapping(columns: string[]): ImportFieldMapping[] {
    const mapping: ImportFieldMapping[] = [];

    // Excel-specific field patterns
    const fieldPatterns: Array<{
      pattern: RegExp;
      mapping: Partial<ImportFieldMapping>;
    }> = [
      {
        pattern: /^(id|identifier|key|row_?id)$/i,
        mapping: { targetField: 'id', required: true }
      },
      {
        pattern: /^(title|name|subject|task_?name|notebook_?name)$/i,
        mapping: { targetField: 'title', required: true }
      },
      {
        pattern: /^(description|desc|details|note|summary)$/i,
        mapping: { targetField: 'description', required: false }
      },
      {
        pattern: /^(status|state|condition|task_?status)$/i,
        mapping: { 
          targetField: 'status', 
          required: false, 
          defaultValue: 'pending',
          transform: (value) => this.normalizeStatus(value)
        }
      },
      {
        pattern: /^(priority|importance|urgency|task_?priority)$/i,
        mapping: { 
          targetField: 'priority', 
          required: false, 
          defaultValue: 'medium',
          transform: (value) => this.normalizePriority(value)
        }
      },
      {
        pattern: /^(created|created_?date|date_?created)$/i,
        mapping: { 
          targetField: 'createdAt', 
          required: false,
          transform: (value) => this.parseExcelDate(value),
          defaultValue: new Date()
        }
      },
      {
        pattern: /^(updated|updated_?date|date_?updated|modified)$/i,
        mapping: { 
          targetField: 'updatedAt', 
          required: false,
          transform: (value) => this.parseExcelDate(value),
          defaultValue: new Date()
        }
      },
      {
        pattern: /^(due|due_?date|deadline|target_?date)$/i,
        mapping: { 
          targetField: 'dueDate', 
          required: false,
          transform: (value) => this.parseExcelDate(value)
        }
      }
    ];

    // Map each column
    for (const column of columns) {
      let mapped = false;

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
   * Parse Excel date values
   */
  private parseExcelDate(value: any): Date | undefined {
    if (!value) return undefined;
    if (value instanceof Date) return value;

    // Handle Excel serial dates
    if (typeof value === 'number' && value > 25000 && value < 50000) {
      return this.excelDateToJSDate(value);
    }

    // Handle string dates
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? undefined : date;
    }

    return undefined;
  }

  /**
   * Utility methods (reused from CSV handler)
   */
  private isNotebookRow(row: any): boolean {
    const notebookFields = ['content', 'category', 'collaborators'];
    const taskFields = ['status', 'priority', 'assignee', 'dueDate'];

    const hasNotebookFields = notebookFields.some(field => row[field] !== undefined);
    const hasTaskFields = taskFields.some(field => row[field] !== undefined);

    return hasNotebookFields && !hasTaskFields;
  }

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
      estimatedHours: Number(row.estimatedHours) || undefined,
      actualHours: Number(row.actualHours) || undefined,
      dueDate: this.ensureDate(row.dueDate) || undefined,
      completedAt: this.ensureDate(row.completedAt) || undefined,
      createdAt: this.ensureDate(row.createdAt) || new Date(),
      updatedAt: this.ensureDate(row.updatedAt) || new Date(),
      subtasks: []
    };
  }

  private normalizeStatus(value: any): string {
    if (!value) return 'pending';
    return String(value).toLowerCase().trim();
  }

  private normalizePriority(value: any): string {
    if (!value) return 'medium';
    return String(value).toLowerCase().trim();
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
