import type { ExportHandler, ExportData, ExportConfig, ValidationResult, ExportFieldMapping } from '../types';

/**
 * Excel Export Handler
 * Handles exporting data to Excel format with multiple sheets and formatting
 */
export class ExcelExportHandler implements ExportHandler {
  public readonly format = 'excel' as const;
  public readonly name = 'Excel';
  public readonly description = 'Microsoft Excel format with multiple sheets and formatting';
  public readonly extensions = ['.xlsx'];
  public readonly mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  public readonly maxFileSize = 100 * 1024 * 1024; // 100MB

  /**
   * Export data to Excel format
   */
  async export(data: ExportData, config: ExportConfig): Promise<Blob> {
    try {
      // For now, we'll create a simplified Excel-like format using CSV
      // In a real implementation, you'd use a library like xlsx or exceljs
      const workbook = await this.createWorkbook(data, config);
      return this.generateExcelBlob(workbook);
    } catch (error) {
      throw new Error(`Excel export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate export configuration
   */
  validate(config: ExportConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check filename extension
    if (config.filename && !config.filename.endsWith('.xlsx')) {
      warnings.push('Filename should have .xlsx extension');
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
      format: 'excel',
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
      // Similar to CSV but with Excel-specific formatting
      { sourceField: 'id', targetField: 'ID', required: true },
      { sourceField: 'title', targetField: 'Title', required: true },
      { sourceField: 'description', targetField: 'Description', required: false },
      { sourceField: 'createdAt', targetField: 'Created Date', required: true, 
        transform: (date) => new Date(date) },
      { sourceField: 'updatedAt', targetField: 'Updated Date', required: true, 
        transform: (date) => new Date(date) }
    ];
  }

  /**
   * Create workbook structure
   */
  private async createWorkbook(data: ExportData, config: ExportConfig) {
    const workbook = {
      metadata: {
        title: 'ThoughtKeeper Export',
        creator: 'ThoughtKeeper',
        created: new Date(),
        modified: new Date()
      },
      sheets: [] as any[]
    };

    // Summary sheet
    if (config.includeMetadata) {
      workbook.sheets.push(this.createSummarySheet(data));
    }

    // Notebooks sheet
    if (data.notebooks.length > 0) {
      workbook.sheets.push(this.createNotebooksSheet(data.notebooks, config));
    }

    // Tasks sheet
    if (data.tasks.length > 0) {
      workbook.sheets.push(this.createTasksSheet(data.tasks, config));
    }

    // Subtasks sheet
    const allSubtasks = data.tasks.flatMap(task => 
      task.subtasks.map(subtask => ({ ...subtask, parentTaskId: task.id }))
    );
    
    if (allSubtasks.length > 0) {
      workbook.sheets.push(this.createSubtasksSheet(allSubtasks));
    }

    return workbook;
  }

  /**
   * Create summary sheet
   */
  private createSummarySheet(data: ExportData) {
    const rows = [
      ['ThoughtKeeper Export Summary'],
      [''],
      ['Export Date', new Date().toLocaleString()],
      ['Total Notebooks', data.notebooks.length],
      ['Total Tasks', data.tasks.length],
      ['Total Subtasks', data.tasks.reduce((sum, task) => sum + (task.subtasks?.length || 0), 0)],
      [''],
      ['Status Distribution'],
      ['Status', 'Count'],
      ...this.getStatusDistribution(data.tasks),
      [''],
      ['Priority Distribution'],
      ['Priority', 'Count'],
      ...this.getPriorityDistribution(data.tasks),
      [''],
      ['Category Distribution'],
      ['Category', 'Count'],
      ...this.getCategoryDistribution(data.notebooks)
    ];

    return {
      name: 'Summary',
      data: rows,
      style: {
        headers: [0, 7, 11, 15], // Row indices that should be styled as headers
        dateColumns: [2], // Columns containing dates
        numberColumns: [3, 4, 5] // Columns containing numbers
      }
    };
  }

  /**
   * Create notebooks sheet
   */
  private createNotebooksSheet(notebooks: any[], config: ExportConfig) {
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

    const rows = [headers];

    for (const notebook of notebooks) {
      if (!config.includeDeleted && notebook.isArchived) continue;

      rows.push([
        notebook.id,
        notebook.title,
        notebook.description || '',
        notebook.category || 'personal',
        (notebook.tags || []).join(', '),
        notebook.color || '',
        notebook.isFavorite ? 'Yes' : 'No',
        notebook.isArchived ? 'Yes' : 'No',
        notebook.taskCount || 0,
        (notebook.collaborators || []).join(', '),
        new Date(notebook.createdAt),
        new Date(notebook.updatedAt)
      ]);
    }

    return {
      name: 'Notebooks',
      data: rows,
      style: {
        headers: [0],
        dateColumns: [10, 11],
        numberColumns: [8],
        colorColumns: [5],
        freeze: { row: 1, col: 2 }
      }
    };
  }

  /**
   * Create tasks sheet
   */
  private createTasksSheet(tasks: any[], config: ExportConfig) {
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

    const rows = [headers];

    for (const task of tasks) {
      if (!config.includeDeleted && task.status === 'cancelled') continue;

      rows.push([
        task.id,
        task.title,
        task.description || '',
        task.notes || '',
        task.status,
        task.priority,
        (task.tags || []).join(', '),
        task.notebookId || '',
        task.parentId || '',
        task.assignee || '',
        task.estimatedHours || null,
        task.actualHours || null,
        task.dueDate ? new Date(task.dueDate) : null,
        task.completedAt ? new Date(task.completedAt) : null,
        task.subtasks?.length || 0,
        new Date(task.createdAt),
        new Date(task.updatedAt)
      ]);
    }

    return {
      name: 'Tasks',
      data: rows,
      style: {
        headers: [0],
        dateColumns: [12, 13, 15, 16],
        numberColumns: [10, 11, 14],
        statusColumns: [4],
        priorityColumns: [5],
        freeze: { row: 1, col: 2 }
      }
    };
  }

  /**
   * Create subtasks sheet
   */
  private createSubtasksSheet(subtasks: any[]) {
    const headers = [
      'ID',
      'Parent Task ID',
      'Title',
      'Completed',
      'Created Date',
      'Updated Date'
    ];

    const rows = [headers];

    for (const subtask of subtasks) {
      rows.push([
        subtask.id,
        subtask.parentTaskId,
        subtask.title,
        subtask.completed ? 'Yes' : 'No',
        new Date(subtask.createdAt),
        new Date(subtask.updatedAt)
      ]);
    }

    return {
      name: 'Subtasks',
      data: rows,
      style: {
        headers: [0],
        dateColumns: [4, 5],
        booleanColumns: [3],
        freeze: { row: 1, col: 2 }
      }
    };
  }

  /**
   * Generate Excel blob (simplified version)
   */
  private async generateExcelBlob(workbook: any): Promise<Blob> {
    // For a real implementation, you would use a library like xlsx or exceljs
    // Here we'll create a simple XML-based Excel file
    
    const xmlContent = this.generateExcelXML(workbook);
    return new Blob([xmlContent], { type: this.mimeType });
  }

  /**
   * Generate Excel XML (simplified)
   */
  private generateExcelXML(workbook: any): string {
    // This is a highly simplified Excel XML structure
    // In practice, you'd use a proper Excel library
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#E0E0E0" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Date">
      <NumberFormat ss:Format="mm/dd/yyyy hh:mm:ss"/>
    </Style>
    <Style ss:ID="Number">
      <NumberFormat ss:Format="0"/>
    </Style>
  </Styles>`;

    for (const sheet of workbook.sheets) {
      xml += this.generateSheetXML(sheet);
    }

    xml += '</Workbook>';
    return xml;
  }

  /**
   * Generate sheet XML
   */
  private generateSheetXML(sheet: any): string {
    let sheetXML = `<Worksheet ss:Name="${this.escapeXML(sheet.name)}">
      <Table>`;

    for (let rowIndex = 0; rowIndex < sheet.data.length; rowIndex++) {
      const row = sheet.data[rowIndex];
      const isHeader = sheet.style.headers?.includes(rowIndex);
      
      sheetXML += '<Row>';
      
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cell = row[colIndex];
        const isDate = sheet.style.dateColumns?.includes(colIndex);
        const isNumber = sheet.style.numberColumns?.includes(colIndex);
        
        let cellXML = '<Cell';
        
        if (isHeader) {
          cellXML += ' ss:StyleID="Header"';
        } else if (isDate) {
          cellXML += ' ss:StyleID="Date"';
        } else if (isNumber) {
          cellXML += ' ss:StyleID="Number"';
        }
        
        cellXML += '>';
        
        if (cell instanceof Date) {
          cellXML += `<Data ss:Type="DateTime">${cell.toISOString()}</Data>`;
        } else if (typeof cell === 'number') {
          cellXML += `<Data ss:Type="Number">${cell}</Data>`;
        } else {
          cellXML += `<Data ss:Type="String">${this.escapeXML(String(cell || ''))}</Data>`;
        }
        
        cellXML += '</Cell>';
        sheetXML += cellXML;
      }
      
      sheetXML += '</Row>';
    }

    sheetXML += '</Table></Worksheet>';
    return sheetXML;
  }

  /**
   * Escape XML characters
   */
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Get status distribution
   */
  private getStatusDistribution(tasks: any[]): Array<[string, number]> {
    const distribution = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (Object.entries(distribution) as Array<[string, number]>).sort(([, a], [, b]) => (b as number) - (a as number));
  }

  /**
   * Get priority distribution
   */
  private getPriorityDistribution(tasks: any[]): Array<[string, number]> {
    const distribution = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (Object.entries(distribution) as Array<[string, number]>).sort(([, a], [, b]) => (b as number) - (a as number));
  }

  /**
   * Get category distribution
   */
  private getCategoryDistribution(notebooks: any[]): Array<[string, number]> {
    const distribution = notebooks.reduce((acc, notebook) => {
      const category = notebook.category || 'personal';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (Object.entries(distribution) as Array<[string, number]>).sort(([, a], [, b]) => (b as number) - (a as number));
  }

  /**
   * Advanced Excel features (would be implemented with proper library)
   */
  public async exportWithAdvancedFeatures(data: ExportData, config: ExportConfig): Promise<Blob> {
    // This would implement:
    // - Charts and graphs
    // - Pivot tables
    // - Conditional formatting
    // - Data validation
    // - Formulas
    // - Multiple themes and styling
    
    // For now, fallback to basic export
    return this.export(data, config);
  }
}
