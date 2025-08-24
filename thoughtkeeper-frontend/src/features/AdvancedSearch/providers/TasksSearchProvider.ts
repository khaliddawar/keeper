import type { Task, TaskStatus, TaskPriority } from '../../../types/task';
import type { SearchField, SearchIndex, SearchResultItem, SearchHighlight } from '../types';
import { BaseSearchProvider } from './BaseSearchProvider';
import { MockApiService } from '../../../mocks';

/**
 * Tasks Search Provider
 * Specialized search provider for Task entities
 */
export class TasksSearchProvider extends BaseSearchProvider {
  private tasks: Task[] = [];

  constructor() {
    const fields: SearchField[] = [
      {
        key: 'title',
        label: 'Title',
        type: 'text',
        searchable: true,
        filterable: true,
        sortable: true,
        placeholder: 'Search by title...'
      },
      {
        key: 'description',
        label: 'Description',
        type: 'text',
        searchable: true,
        filterable: true,
        sortable: false,
        placeholder: 'Search by description...'
      },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        searchable: false,
        filterable: true,
        sortable: true,
        options: [
          { value: 'pending', label: 'Pending', color: 'gray' },
          { value: 'in_progress', label: 'In Progress', color: 'blue' },
          { value: 'completed', label: 'Completed', color: 'green' },
          { value: 'cancelled', label: 'Cancelled', color: 'red' }
        ]
      },
      {
        key: 'priority',
        label: 'Priority',
        type: 'select',
        searchable: false,
        filterable: true,
        sortable: true,
        options: [
          { value: 'low', label: 'Low', color: 'gray' },
          { value: 'medium', label: 'Medium', color: 'yellow' },
          { value: 'high', label: 'High', color: 'orange' },
          { value: 'urgent', label: 'Urgent', color: 'red' }
        ]
      },
      {
        key: 'tags',
        label: 'Tags',
        type: 'multi-select',
        searchable: true,
        filterable: true,
        sortable: false,
        placeholder: 'Filter by tags...'
      },
      {
        key: 'notebookId',
        label: 'Notebook',
        type: 'select',
        searchable: false,
        filterable: true,
        sortable: true,
        options: [] // Will be populated dynamically
      },
      {
        key: 'createdAt',
        label: 'Created Date',
        type: 'date',
        searchable: false,
        filterable: true,
        sortable: true
      },
      {
        key: 'updatedAt',
        label: 'Updated Date',
        type: 'date',
        searchable: false,
        filterable: true,
        sortable: true
      },
      {
        key: 'dueDate',
        label: 'Due Date',
        type: 'date',
        searchable: false,
        filterable: true,
        sortable: true
      },
      {
        key: 'completedAt',
        label: 'Completed Date',
        type: 'date',
        searchable: false,
        filterable: true,
        sortable: true
      },
      {
        key: 'isSubtask',
        label: 'Is Subtask',
        type: 'boolean',
        searchable: false,
        filterable: true,
        sortable: false
      }
    ];

    super(
      'tasks',
      'Tasks',
      'Search and filter tasks',
      fields,
      {
        fullText: true,
        facets: true,
        highlighting: true,
        fuzzySearch: true
      },
      {
        fields: [
          { name: 'title', boost: 3.0, analyzer: 'text' },
          { name: 'description', boost: 2.0, analyzer: 'text' },
          { name: 'tags', boost: 2.5, analyzer: 'keyword' },
          { name: 'notes', boost: 1.0, analyzer: 'text' }
        ],
        stopWords: ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were'],
        stemming: true,
        caseSensitive: false
      }
    );

    // Load initial data
    this.loadTasks();
  }

  /**
   * Load tasks from the data store
   */
  private async loadTasks(): Promise<void> {
    try {
      const response = await MockApiService.tasks.getTasks({ includeSubtasks: true });
      this.tasks = response.tasks;
      this.buildIndex();
    } catch (error) {
      console.error('Failed to load tasks for search:', error);
      this.tasks = [];
    }
  }

  /**
   * Get all searchable tasks
   */
  protected getAllItems(): Task[] {
    return this.tasks;
  }

  /**
   * Convert a task to search index entry
   */
  protected itemToIndex(task: Task): SearchIndex {
    const content = [
      task.title,
      task.description || '',
      task.tags?.join(' ') || '',
      task.notes || ''
    ].join(' ');

    return {
      id: task.id,
      content: content.toLowerCase(),
      fields: {
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        tags: task.tags || [],
        notebookId: task.notebookId,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        dueDate: task.dueDate,
        completedAt: task.completedAt,
        isSubtask: !!task.parentId,
        notes: task.notes || '',
        assignee: task.assignee || '',
        estimatedHours: task.estimatedHours || 0,
        actualHours: task.actualHours || 0
      },
      boost: this.calculateTaskBoost(task),
      type: 'task',
      lastIndexed: new Date()
    };
  }

  /**
   * Calculate boost score for a task based on its properties
   */
  private calculateTaskBoost(task: Task): number {
    let boost = 1.0;

    // Boost based on priority
    switch (task.priority) {
      case 'urgent':
        boost += 0.5;
        break;
      case 'high':
        boost += 0.3;
        break;
      case 'medium':
        boost += 0.1;
        break;
      default:
        break;
    }

    // Boost recently updated tasks
    const daysSinceUpdate = (Date.now() - new Date(task.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 1) {
      boost += 0.2;
    } else if (daysSinceUpdate < 7) {
      boost += 0.1;
    }

    // Boost tasks with due dates
    if (task.dueDate) {
      const daysUntilDue = (new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (daysUntilDue > 0 && daysUntilDue < 7) {
        boost += 0.3; // Due soon
      }
    }

    // Reduce boost for completed tasks (but still searchable)
    if (task.status === 'completed') {
      boost *= 0.7;
    }

    return Math.max(boost, 0.1); // Minimum boost
  }

  /**
   * Format a task as a search result item
   */
  protected formatResultItem(task: Task, score: number, highlights: SearchHighlight[]): SearchResultItem<Task> {
    const snippet = this.generateTaskSnippet(task, highlights);
    const matchedFields = highlights.map(h => h.field);

    return {
      item: task,
      score,
      highlights,
      snippet,
      matchedFields
    };
  }

  /**
   * Generate a descriptive snippet for a task
   */
  private generateTaskSnippet(task: Task, highlights: SearchHighlight[]): string {
    // Try to use highlighted content first
    if (highlights.length > 0) {
      const titleHighlight = highlights.find(h => h.field === 'title');
      if (titleHighlight && titleHighlight.fragments.length > 0) {
        return titleHighlight.fragments[0];
      }

      const descHighlight = highlights.find(h => h.field === 'description');
      if (descHighlight && descHighlight.fragments.length > 0) {
        return descHighlight.fragments[0];
      }
    }

    // Fall back to task description or truncated title
    if (task.description && task.description.length > 0) {
      return task.description.length > 150 
        ? task.description.substring(0, 147) + '...'
        : task.description;
    }

    return task.title;
  }

  /**
   * Find original task by ID
   */
  protected findOriginalItem(id: string): Task | null {
    return this.tasks.find(task => task.id === id) || null;
  }

  /**
   * Get unique tag values for filtering
   */
  public getTagOptions(): Array<{ value: string; label: string; count: number }> {
    const tagCounts = new Map<string, number>();
    
    for (const task of this.tasks) {
      if (task.tags) {
        for (const tag of task.tags) {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        }
      }
    }

    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({
        value: tag,
        label: tag,
        count
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get status distribution for faceted search
   */
  public getStatusDistribution(): Array<{ value: TaskStatus; label: string; count: number }> {
    const statusCounts = new Map<TaskStatus, number>();
    
    for (const task of this.tasks) {
      statusCounts.set(task.status, (statusCounts.get(task.status) || 0) + 1);
    }

    const statusLabels: Record<TaskStatus, string> = {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };

    return Array.from(statusCounts.entries())
      .map(([status, count]) => ({
        value: status,
        label: statusLabels[status],
        count
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get priority distribution for faceted search
   */
  public getPriorityDistribution(): Array<{ value: TaskPriority; label: string; count: number }> {
    const priorityCounts = new Map<TaskPriority, number>();
    
    for (const task of this.tasks) {
      priorityCounts.set(task.priority, (priorityCounts.get(task.priority) || 0) + 1);
    }

    const priorityLabels: Record<TaskPriority, string> = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent'
    };

    return Array.from(priorityCounts.entries())
      .map(([priority, count]) => ({
        value: priority,
        label: priorityLabels[priority],
        count
      }))
      .sort((a, b) => {
        const order = ['urgent', 'high', 'medium', 'low'];
        return order.indexOf(a.value) - order.indexOf(b.value);
      });
  }

  /**
   * Refresh the search index with latest data
   */
  public async refresh(): Promise<void> {
    await this.loadTasks();
  }

  /**
   * Get advanced search suggestions specific to tasks
   */
  public async getTaskSuggestions(input: string): Promise<string[]> {
    const baseSuggestions = await this.getSuggestions(input);
    const taskSpecificSuggestions: string[] = [];

    // Add status-based suggestions
    const statusSuggestions = ['pending', 'in progress', 'completed', 'cancelled']
      .filter(status => status.includes(input.toLowerCase()));
    
    // Add priority-based suggestions  
    const prioritySuggestions = ['low', 'medium', 'high', 'urgent']
      .filter(priority => priority.includes(input.toLowerCase()));

    // Add tag-based suggestions
    const tags = this.getTagOptions();
    const tagSuggestions = tags
      .filter(tag => tag.label.toLowerCase().includes(input.toLowerCase()))
      .slice(0, 5)
      .map(tag => tag.label);

    return [
      ...taskSpecificSuggestions,
      ...statusSuggestions,
      ...prioritySuggestions,
      ...tagSuggestions,
      ...baseSuggestions
    ].slice(0, 10);
  }
}
