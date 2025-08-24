import type { ExportHandler, ExportData, ExportConfig, ValidationResult, ExportFieldMapping } from '../types';

/**
 * Markdown Export Handler
 * Handles exporting data to Markdown format for documentation and sharing
 */
export class MarkdownExportHandler implements ExportHandler {
  public readonly format = 'markdown' as const;
  public readonly name = 'Markdown';
  public readonly description = 'Markdown format for documentation and sharing';
  public readonly extensions = ['.md'];
  public readonly mimeType = 'text/markdown';
  public readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  /**
   * Export data to Markdown format
   */
  async export(data: ExportData, config: ExportConfig): Promise<Blob> {
    try {
      let markdown = '';

      // Add title and metadata
      markdown += this.generateHeader(data, config);

      // Add table of contents if there's significant content
      if (data.notebooks.length > 0 || data.tasks.length > 0) {
        markdown += this.generateTableOfContents(data);
      }

      // Add summary section
      markdown += this.generateSummary(data);

      // Add notebooks section
      if (data.notebooks.length > 0) {
        markdown += this.generateNotebooksSection(data.notebooks, config);
      }

      // Add tasks section (organized by status)
      if (data.tasks.length > 0) {
        markdown += this.generateTasksSection(data.tasks, config);
      }

      // Add appendices
      markdown += this.generateAppendices(data);

      return new Blob([markdown], { type: this.mimeType });
    } catch (error) {
      throw new Error(`Markdown export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate export configuration
   */
  validate(config: ExportConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check filename extension
    if (config.filename && !config.filename.endsWith('.md')) {
      warnings.push('Filename should have .md extension');
    }

    // Markdown doesn't support compression
    if (config.compression !== 'none') {
      warnings.push('Markdown format does not support compression');
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
      format: 'markdown',
      includeMetadata: true,
      includeDeleted: false,
      compression: 'none',
      filters: []
    };
  }

  /**
   * Get field mappings (markdown is flexible)
   */
  getFieldMappings(): ExportFieldMapping[] {
    return [
      { sourceField: 'title', targetField: 'title', required: true },
      { sourceField: 'description', targetField: 'description', required: false },
      { sourceField: 'content', targetField: 'content', required: false },
      { sourceField: 'tags', targetField: 'tags', required: false },
      { sourceField: 'status', targetField: 'status', required: false },
      { sourceField: 'priority', targetField: 'priority', required: false },
      { sourceField: 'createdAt', targetField: 'created', required: false },
      { sourceField: 'updatedAt', targetField: 'updated', required: false }
    ];
  }

  /**
   * Generate header section
   */
  private generateHeader(data: ExportData, config: ExportConfig): string {
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    let header = `# ThoughtKeeper Export\n\n`;
    header += `**Generated:** ${date}\n`;
    header += `**Format:** Markdown\n`;
    
    if (data.metadata?.version) {
      header += `**Version:** ${data.metadata.version}\n`;
    }

    header += '\n---\n\n';

    // Add description if metadata is included
    if (config.includeMetadata) {
      header += `This document contains an export of your ThoughtKeeper data, including `;
      header += `${data.notebooks.length} notebook${data.notebooks.length !== 1 ? 's' : ''} and `;
      header += `${data.tasks.length} task${data.tasks.length !== 1 ? 's' : ''}.\n\n`;
    }

    return header;
  }

  /**
   * Generate table of contents
   */
  private generateTableOfContents(data: ExportData): string {
    let toc = `## Table of Contents\n\n`;

    toc += `- [Summary](#summary)\n`;

    if (data.notebooks.length > 0) {
      toc += `- [Notebooks](#notebooks) (${data.notebooks.length})\n`;
      
      // Add notebook links
      for (const notebook of data.notebooks.slice(0, 10)) { // Show first 10
        const slug = this.createSlug(notebook.title);
        toc += `  - [${notebook.title}](#notebook-${slug})\n`;
      }
      
      if (data.notebooks.length > 10) {
        toc += `  - ... and ${data.notebooks.length - 10} more\n`;
      }
    }

    if (data.tasks.length > 0) {
      toc += `- [Tasks](#tasks) (${data.tasks.length})\n`;
      toc += `  - [By Status](#tasks-by-status)\n`;
      toc += `  - [By Priority](#tasks-by-priority)\n`;
    }

    toc += `- [Appendices](#appendices)\n`;

    return toc + '\n';
  }

  /**
   * Generate summary section
   */
  private generateSummary(data: ExportData): string {
    let summary = `## Summary\n\n`;

    // Basic counts
    summary += `| Metric | Count |\n`;
    summary += `|--------|-------|\n`;
    summary += `| Notebooks | ${data.notebooks.length} |\n`;
    summary += `| Tasks | ${data.tasks.length} |\n`;
    summary += `| Subtasks | ${data.tasks.reduce((sum, task) => sum + (task.subtasks?.length || 0), 0)} |\n`;

    // Task status distribution
    if (data.tasks.length > 0) {
      summary += '\n### Task Status Distribution\n\n';
      const statusCounts = this.getStatusDistribution(data.tasks);
      
      summary += `| Status | Count | Percentage |\n`;
      summary += `|--------|-------|------------|\n`;
      
      for (const [status, count] of statusCounts) {
        const percentage = ((count / data.tasks.length) * 100).toFixed(1);
        summary += `| ${this.capitalizeFirst(status)} | ${count} | ${percentage}% |\n`;
      }
    }

    // Priority distribution
    if (data.tasks.length > 0) {
      summary += '\n### Task Priority Distribution\n\n';
      const priorityCounts = this.getPriorityDistribution(data.tasks);
      
      summary += `| Priority | Count | Percentage |\n`;
      summary += `|----------|-------|------------|\n`;
      
      for (const [priority, count] of priorityCounts) {
        const percentage = ((count / data.tasks.length) * 100).toFixed(1);
        const emoji = this.getPriorityEmoji(priority);
        summary += `| ${emoji} ${this.capitalizeFirst(priority)} | ${count} | ${percentage}% |\n`;
      }
    }

    return summary + '\n';
  }

  /**
   * Generate notebooks section
   */
  private generateNotebooksSection(notebooks: any[], config: ExportConfig): string {
    let section = `## Notebooks\n\n`;

    // Group notebooks by category
    const notebooksByCategory = this.groupNotebooksByCategory(notebooks, config);

    for (const [category, categoryNotebooks] of Object.entries(notebooksByCategory)) {
      if (categoryNotebooks.length === 0) continue;

      section += `### ${this.capitalizeFirst(category)} (${categoryNotebooks.length})\n\n`;

      for (const notebook of categoryNotebooks) {
        section += this.generateNotebookMarkdown(notebook);
      }
    }

    return section;
  }

  /**
   * Generate individual notebook markdown
   */
  private generateNotebookMarkdown(notebook: any): string {
    const slug = this.createSlug(notebook.title);
    let md = `#### ${notebook.title} {#notebook-${slug}}\n\n`;

    // Metadata table
    md += `| Property | Value |\n`;
    md += `|----------|-------|\n`;
    md += `| **ID** | \`${notebook.id}\` |\n`;
    md += `| **Category** | ${notebook.category || 'Personal'} |\n`;
    
    if (notebook.color) {
      md += `| **Color** | ${notebook.color} |\n`;
    }
    
    if (notebook.isFavorite) {
      md += `| **Favorite** | ⭐ Yes |\n`;
    }
    
    if (notebook.taskCount) {
      md += `| **Tasks** | ${notebook.taskCount} |\n`;
    }
    
    if (notebook.collaborators && notebook.collaborators.length > 0) {
      md += `| **Collaborators** | ${notebook.collaborators.join(', ')} |\n`;
    }
    
    md += `| **Created** | ${new Date(notebook.createdAt).toLocaleDateString()} |\n`;
    md += `| **Updated** | ${new Date(notebook.updatedAt).toLocaleDateString()} |\n`;

    // Description
    if (notebook.description) {
      md += '\n**Description:**\n\n';
      md += `${notebook.description}\n\n`;
    }

    // Content
    if (notebook.content) {
      md += '**Content:**\n\n';
      md += `${notebook.content}\n\n`;
    }

    // Tags
    if (notebook.tags && notebook.tags.length > 0) {
      md += '**Tags:** ';
      md += notebook.tags.map((tag: string) => `\`${tag}\``).join(', ') + '\n\n';
    }

    md += '---\n\n';
    return md;
  }

  /**
   * Generate tasks section
   */
  private generateTasksSection(tasks: any[], config: ExportConfig): string {
    let section = `## Tasks\n\n`;

    // Tasks by status
    section += `### Tasks by Status\n\n`;
    const tasksByStatus = this.groupTasksByStatus(tasks, config);

    for (const [status, statusTasks] of Object.entries(tasksByStatus)) {
      if (statusTasks.length === 0) continue;

      const emoji = this.getStatusEmoji(status);
      section += `#### ${emoji} ${this.capitalizeFirst(status)} (${statusTasks.length})\n\n`;

      for (const task of statusTasks) {
        section += this.generateTaskMarkdown(task);
      }
    }

    // Tasks by priority (high priority only)
    const highPriorityTasks = tasks.filter(task => 
      ['high', 'urgent'].includes(task.priority) && task.status !== 'completed'
    );

    if (highPriorityTasks.length > 0) {
      section += `### 🔥 High Priority Tasks (${highPriorityTasks.length})\n\n`;
      
      for (const task of highPriorityTasks) {
        section += this.generateTaskMarkdown(task, true);
      }
    }

    return section;
  }

  /**
   * Generate individual task markdown
   */
  private generateTaskMarkdown(task: any, compact = false): string {
    const statusEmoji = this.getStatusEmoji(task.status);
    const priorityEmoji = this.getPriorityEmoji(task.priority);
    
    let md = '';
    
    if (compact) {
      md += `- **${task.title}** (${priorityEmoji} ${task.priority})\n`;
      if (task.description) {
        md += `  ${task.description}\n`;
      }
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const isOverdue = dueDate < new Date() && task.status !== 'completed';
        md += `  📅 Due: ${dueDate.toLocaleDateString()}${isOverdue ? ' ⚠️ **OVERDUE**' : ''}\n`;
      }
      md += '\n';
    } else {
      const checkbox = task.status === 'completed' ? '[x]' : '[ ]';
      md += `- ${checkbox} **${task.title}** ${statusEmoji} ${priorityEmoji}\n`;
      
      if (task.description) {
        md += `  \n  ${task.description}\n`;
      }

      // Metadata
      const metadata = [];
      if (task.assignee) metadata.push(`👤 ${task.assignee}`);
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const isOverdue = dueDate < new Date() && task.status !== 'completed';
        metadata.push(`📅 ${dueDate.toLocaleDateString()}${isOverdue ? ' ⚠️' : ''}`);
      }
      if (task.estimatedHours) metadata.push(`⏱️ ${task.estimatedHours}h`);
      
      if (metadata.length > 0) {
        md += `  \n  ${metadata.join(' • ')}\n`;
      }

      // Tags
      if (task.tags && task.tags.length > 0) {
        md += `  \n  **Tags:** ${task.tags.map((tag: string) => `\`${tag}\``).join(', ')}\n`;
      }

      // Subtasks
      if (task.subtasks && task.subtasks.length > 0) {
        md += '  \n  **Subtasks:**\n';
        for (const subtask of task.subtasks) {
          const subCheckbox = subtask.completed ? '[x]' : '[ ]';
          md += `  - ${subCheckbox} ${subtask.title}\n`;
        }
      }

      md += '\n';
    }

    return md;
  }

  /**
   * Generate appendices
   */
  private generateAppendices(data: ExportData): string {
    let appendices = `## Appendices\n\n`;

    // All tags
    const allTags = new Set<string>();
    data.notebooks.forEach(nb => nb.tags?.forEach((tag: string) => allTags.add(tag)));
    data.tasks.forEach(task => task.tags?.forEach((tag: string) => allTags.add(tag)));

    if (allTags.size > 0) {
      appendices += `### All Tags\n\n`;
      const sortedTags = Array.from(allTags).sort();
      appendices += sortedTags.map(tag => `\`${tag}\``).join(', ') + '\n\n';
    }

    // Export metadata
    appendices += `### Export Information\n\n`;
    appendices += `- **Export Date:** ${new Date().toLocaleString()}\n`;
    appendices += `- **Format:** Markdown\n`;
    appendices += `- **Total Items:** ${data.notebooks.length + data.tasks.length}\n`;

    return appendices;
  }

  /**
   * Helper methods
   */
  private createSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  private getStatusEmoji(status: string): string {
    const emojis: Record<string, string> = {
      'pending': '⏳',
      'in_progress': '🔄',
      'completed': '✅',
      'cancelled': '❌',
      'blocked': '🚫',
      'review': '👀'
    };
    return emojis[status] || '📝';
  }

  private getPriorityEmoji(priority: string): string {
    const emojis: Record<string, string> = {
      'urgent': '🔥',
      'high': '⬆️',
      'medium': '➡️',
      'low': '⬇️'
    };
    return emojis[priority] || '➡️';
  }

  private getStatusDistribution(tasks: any[]): Array<[string, number]> {
    const distribution = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).sort(([,a], [,b]) => b - a);
  }

  private getPriorityDistribution(tasks: any[]): Array<[string, number]> {
    const distribution = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).sort(([,a], [,b]) => b - a);
  }

  private groupNotebooksByCategory(notebooks: any[], config: ExportConfig): Record<string, any[]> {
    const groups: Record<string, any[]> = {};
    
    for (const notebook of notebooks) {
      if (!config.includeDeleted && notebook.isArchived) continue;
      
      const category = notebook.category || 'personal';
      if (!groups[category]) groups[category] = [];
      groups[category].push(notebook);
    }

    // Sort each group by updated date (newest first)
    for (const category of Object.keys(groups)) {
      groups[category].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }

    return groups;
  }

  private groupTasksByStatus(tasks: any[], config: ExportConfig): Record<string, any[]> {
    const groups: Record<string, any[]> = {};
    
    for (const task of tasks) {
      if (!config.includeDeleted && task.status === 'cancelled') continue;
      
      if (!groups[task.status]) groups[task.status] = [];
      groups[task.status].push(task);
    }

    // Sort each group by priority and due date
    for (const status of Object.keys(groups)) {
      groups[status].sort((a, b) => {
        // Sort by priority first
        const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 2;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 2;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        // Then by due date
        const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        
        return aDue - bDue;
      });
    }

    return groups;
  }
}
