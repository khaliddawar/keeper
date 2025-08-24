import type { ExportHandler, ExportData, ExportConfig, ValidationResult, ExportFieldMapping } from '../types';

/**
 * CSV Export Handler
 * Handles exporting data to CSV format with separate sheets for different data types
 */
export class CSVExportHandler implements ExportHandler {
  public readonly format = 'csv' as const;
  public readonly name = 'CSV';
  public readonly description = 'Comma Separated Values - Universal spreadsheet format';
  public readonly extensions = ['.csv'];
  public readonly mimeType = 'text/csv';
  public readonly maxFileSize = 50 * 1024 * 1024; // 50MB

  /**
   * Export data to CSV format
   */
  async export(data: ExportData, config: ExportConfig): Promise<Blob> {
    try {
      let csvContent = '';

      // Add metadata header if requested
      if (config.includeMetadata && data.metadata) {
        csvContent += this.generateMetadataSection(data.metadata);
        csvContent += '\n\n';
      }

      // Export notebooks
      if (data.notebooks.length > 0) {
        csvContent += 'NOTEBOOKS\n';
        csvContent += this.generateNotebooksCSV(data.notebooks, config);
        csvContent += '\n\n';
      }

      // Export tasks
      if (data.tasks.length > 0) {
        csvContent += 'TASKS\n';
        csvContent += this.generateTasksCSV(data.tasks, config);
        csvContent += '\n\n';
      }

      // Export subtasks separately
      const allSubtasks = data.tasks.flatMap(task => 
        task.subtasks.map(subtask => ({ ...subtask, parentTaskId: task.id }))
      );
      
      if (allSubtasks.length > 0) {
        csvContent += 'SUBTASKS\n';
        csvContent += this.generateSubtasksCSV(allSubtasks);
      }

      return new Blob([csvContent], { type: this.mimeType });
    } catch (error) {
      throw new Error(`CSV export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate export configuration
   */
  validate(config: ExportConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check filename extension
    if (config.filename && !config.filename.endsWith('.csv')) {
      warnings.push('Filename should have .csv extension');
    }

    // CSV doesn't support compression
    if (config.compression !== 'none') {
      warnings.push('CSV format does not support compression');
    }

    return {
      isValid: errors.length === 0,
      error: errors.length > 0 ? errors.join(', ') : undefined,
      warning: warnings.length > 0 ? warnings.join(', ') : undefined
    };
  }

  /**
   * Get default configuration
   */
  getDefaultConfig(): Partial<ExportConfig> {
    return {
      format: 'csv',
      includeMetadata: true,
      includeDeleted: false,
      compression: 'none',
      filters: []
    };
  }

  /**
   * Get field mappings
   */
  getFieldMappings(): ExportFieldMapping[] {
    return [
      // Notebook fields
      { sourceField: 'id', targetField: 'ID', required: true },
      { sourceField: 'title', targetField: 'Title', required: true },
      { sourceField: 'description', targetField: 'Description', required: false },
      { sourceField: 'category', targetField: 'Category', required: false },
      { sourceField: 'tags', targetField: 'Tags', required: false, transform: (tags) => Array.isArray(tags) ? tags.join(';') : '' },
      { sourceField: 'isFavorite', targetField: 'Is Favorite', required: false, transform: (val) => val ? 'Yes' : 'No' },
      { sourceField: 'isArchived', targetField: 'Is Archived', required: false, transform: (val) => val ? 'Yes' : 'No' },
      { sourceField: 'taskCount', targetField: 'Task Count', required: false },
      { sourceField: 'collaborators', targetField: 'Collaborators', required: false, transform: (collab) => Array.isArray(collab) ? collab.join(';') : '' },
      { sourceField: 'createdAt', targetField: 'Created Date', required: true, transform: (date) => new Date(date).toLocaleString() },
      { sourceField: 'updatedAt', targetField: 'Updated Date', required: true, transform: (date) => new Date(date).toLocaleString() }
    ];
  }

  /**
   * Generate metadata section
   */
  private generateMetadataSection(metadata: any): string {
    const lines = [
      'EXPORT METADATA',
      `Export Date,${metadata.exportedAt || new Date().toLocaleString()}`,
      `Version,${metadata.version || '1.0.0'}`,
      `Format,${metadata.format || 'csv'}`,
      `Source,${metadata.source || 'ThoughtKeeper'}`,
      `Total Notebooks,${metadata.itemCounts?.notebooks || 0}`,
      `Total Tasks,${metadata.itemCounts?.tasks || 0}`,
      `Total Subtasks,${metadata.itemCounts?.subtasks || 0}`
    ];
    
    return lines.join('\n');
  }

  /**
   * Generate notebooks CSV
   */
  private generateNotebooksCSV(notebooks: any[], config: ExportConfig): string {
    if (notebooks.length === 0) return '';

    const headers = [
      'ID',
      'Title',
      'Description',
      'Category',
      'Tags',
      'Color',
      'Is Favorite',
      'Is Archived',
      'Task Count',
      'Collaborators',
      'Created Date',
      'Updated Date'
    ];

    const rows = [headers.join(',')];

    for (const notebook of notebooks) {
      if (!config.includeDeleted && notebook.isArchived) {
        continue;
      }

      const row = [
        this.escapeCSVField(notebook.id),
        this.escapeCSVField(notebook.title),
        this.escapeCSVField(notebook.description || ''),
        this.escapeCSVField(notebook.category || 'personal'),
        this.escapeCSVField((notebook.tags || []).join(';')),
        this.escapeCSVField(notebook.color || ''),
        notebook.isFavorite ? 'Yes' : 'No',
        notebook.isArchived ? 'Yes' : 'No',
        notebook.taskCount || 0,
        this.escapeCSVField((notebook.collaborators || []).join(';')),
        this.escapeCSVField(new Date(notebook.createdAt).toLocaleString()),
        this.escapeCSVField(new Date(notebook.updatedAt).toLocaleString())
      ];

      rows.push(row.join(','));
    }

    return rows.join('\n');
  }

  /**
   * Generate tasks CSV
   */
  private generateTasksCSV(tasks: any[], config: ExportConfig): string {
    if (tasks.length === 0) return '';

    const headers = [
      'ID',
      'Title',
      'Description',
      'Notes',
      'Status',
      'Priority',
      'Tags',
      'Notebook ID',
      'Parent Task ID',
      'Assignee',
      'Estimated Hours',
      'Actual Hours',
      'Due Date',
      'Completed Date',
      'Subtask Count',
      'Created Date',
      'Updated Date'
    ];

    const rows = [headers.join(',')];

    for (const task of tasks) {
      if (!config.includeDeleted && task.status === 'cancelled') {
        continue;
      }

      const row = [
        this.escapeCSVField(task.id),
        this.escapeCSVField(task.title),
        this.escapeCSVField(task.description || ''),
        this.escapeCSVField(task.notes || ''),
        this.escapeCSVField(task.status),
        this.escapeCSVField(task.priority),
        this.escapeCSVField((task.tags || []).join(';')),
        this.escapeCSVField(task.notebookId || ''),
        this.escapeCSVField(task.parentId || ''),
        this.escapeCSVField(task.assignee || ''),
        task.estimatedHours || '',
        task.actualHours || '',
        task.dueDate ? this.escapeCSVField(new Date(task.dueDate).toLocaleString()) : '',
        task.completedAt ? this.escapeCSVField(new Date(task.completedAt).toLocaleString()) : '',
        task.subtasks?.length || 0,
        this.escapeCSVField(new Date(task.createdAt).toLocaleString()),
        this.escapeCSVField(new Date(task.updatedAt).toLocaleString())
      ];

      rows.push(row.join(','));
    }

    return rows.join('\n');
  }

  /**
   * Generate subtasks CSV
   */
  private generateSubtasksCSV(subtasks: any[]): string {
    if (subtasks.length === 0) return '';

    const headers = [
      'ID',
      'Parent Task ID',
      'Title',
      'Completed',
      'Created Date',
      'Updated Date'
    ];

    const rows = [headers.join(',')];

    for (const subtask of subtasks) {
      const row = [
        this.escapeCSVField(subtask.id),
        this.escapeCSVField(subtask.parentTaskId),
        this.escapeCSVField(subtask.title),
        subtask.completed ? 'Yes' : 'No',
        this.escapeCSVField(new Date(subtask.createdAt).toLocaleString()),
        this.escapeCSVField(new Date(subtask.updatedAt).toLocaleString())
      ];

      rows.push(row.join(','));
    }

    return rows.join('\n');
  }

  /**
   * Escape CSV field (handle quotes, commas, newlines)
   */
  private escapeCSVField(field: any): string {
    let str = String(field || '');
    
    // If field contains comma, quote, or newline, wrap in quotes and escape quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      str = '"' + str.replace(/"/g, '""') + '"';
    }
    
    return str;
  }

  /**
   * Flatten array fields for CSV compatibility
   */
  private flattenArrayField(arr: any[], separator = ';'): string {
    if (!Array.isArray(arr)) return '';
    return arr.map(item => String(item).replace(/[,;"]/g, '')).join(separator);
  }

  /**
   * Format date for CSV
   */
  private formatDateForCSV(date: Date | string | null | undefined): string {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleString();
    } catch {
      return String(date);
    }
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(data: ExportData): string {
    const lines = [
      'SUMMARY',
      `Total Records: ${data.notebooks.length + data.tasks.length}`,
      `Notebooks: ${data.notebooks.length}`,
      `Tasks: ${data.tasks.length}`,
      `Subtasks: ${data.tasks.reduce((sum, task) => sum + (task.subtasks?.length || 0), 0)}`,
      '',
      'Status Distribution:',
      ...this.getStatusDistribution(data.tasks).map(([status, count]) => `${status}: ${count}`),
      '',
      'Priority Distribution:',
      ...this.getPriorityDistribution(data.tasks).map(([priority, count]) => `${priority}: ${count}`)
    ];

    return lines.join('\n');
  }

  /**
   * Get status distribution for summary
   */
  private getStatusDistribution(tasks: any[]): Array<[string, number]> {
    const distribution = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).sort(([,a], [,b]) => b - a);
  }

  /**
   * Get priority distribution for summary
   */
  private getPriorityDistribution(tasks: any[]): Array<[string, number]> {
    const distribution = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).sort(([,a], [,b]) => b - a);
  }

  /**
   * Create separate CSV files for different entity types
   */
  async exportSeparateFiles(data: ExportData, config: ExportConfig): Promise<{ [key: string]: Blob }> {
    const files: { [key: string]: Blob } = {};

    // Notebooks CSV
    if (data.notebooks.length > 0) {
      const notebooksCSV = this.generateNotebooksCSV(data.notebooks, config);
      files['notebooks.csv'] = new Blob([notebooksCSV], { type: this.mimeType });
    }

    // Tasks CSV
    if (data.tasks.length > 0) {
      const tasksCSV = this.generateTasksCSV(data.tasks, config);
      files['tasks.csv'] = new Blob([tasksCSV], { type: this.mimeType });
    }

    // Subtasks CSV
    const allSubtasks = data.tasks.flatMap(task => 
      task.subtasks.map(subtask => ({ ...subtask, parentTaskId: task.id }))
    );
    
    if (allSubtasks.length > 0) {
      const subtasksCSV = this.generateSubtasksCSV(allSubtasks);
      files['subtasks.csv'] = new Blob([subtasksCSV], { type: this.mimeType });
    }

    return files;
  }
}
