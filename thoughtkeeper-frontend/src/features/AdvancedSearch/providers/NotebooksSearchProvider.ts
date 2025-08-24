import type { Notebook } from '../../../types/notebook';
import type { SearchField, SearchIndex, SearchResultItem, SearchHighlight } from '../types';
import { BaseSearchProvider } from './BaseSearchProvider';
import { MockApiService } from '../../../mocks';

/**
 * Notebooks Search Provider
 * Specialized search provider for Notebook entities
 */
export class NotebooksSearchProvider extends BaseSearchProvider {
  private notebooks: Notebook[] = [];

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
        key: 'content',
        label: 'Content',
        type: 'text',
        searchable: true,
        filterable: false,
        sortable: false,
        placeholder: 'Search in content...'
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
        key: 'category',
        label: 'Category',
        type: 'select',
        searchable: false,
        filterable: true,
        sortable: true,
        options: [
          { value: 'personal', label: 'Personal', color: 'blue' },
          { value: 'work', label: 'Work', color: 'green' },
          { value: 'project', label: 'Project', color: 'purple' },
          { value: 'reference', label: 'Reference', color: 'gray' },
          { value: 'archive', label: 'Archive', color: 'yellow' }
        ]
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
        key: 'isFavorite',
        label: 'Is Favorite',
        type: 'boolean',
        searchable: false,
        filterable: true,
        sortable: false
      },
      {
        key: 'isArchived',
        label: 'Is Archived',
        type: 'boolean',
        searchable: false,
        filterable: true,
        sortable: false
      },
      {
        key: 'taskCount',
        label: 'Task Count',
        type: 'number',
        searchable: false,
        filterable: true,
        sortable: true
      },
      {
        key: 'collaborators',
        label: 'Collaborators',
        type: 'multi-select',
        searchable: true,
        filterable: true,
        sortable: false,
        placeholder: 'Filter by collaborators...'
      }
    ];

    super(
      'notebooks',
      'Notebooks',
      'Search and filter notebooks',
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
          { name: 'content', boost: 1.5, analyzer: 'text' },
          { name: 'tags', boost: 2.5, analyzer: 'keyword' }
        ],
        stopWords: ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were'],
        stemming: true,
        caseSensitive: false
      }
    );

    // Load initial data
    this.loadNotebooks();
  }

  /**
   * Load notebooks from the data store
   */
  private async loadNotebooks(): Promise<void> {
    try {
      const notebooks = await MockApiService.notebooks.getNotebooks();
      this.notebooks = notebooks;
      this.buildIndex();
    } catch (error) {
      console.error('Failed to load notebooks for search:', error);
      this.notebooks = [];
    }
  }

  /**
   * Get all searchable notebooks
   */
  protected getAllItems(): Notebook[] {
    return this.notebooks;
  }

  /**
   * Convert a notebook to search index entry
   */
  protected itemToIndex(notebook: Notebook): SearchIndex {
    const content = [
      notebook.title,
      notebook.description || '',
      notebook.content || '',
      notebook.tags?.join(' ') || '',
      ...(notebook.collaborators || [])
    ].join(' ');

    return {
      id: notebook.id,
      content: content.toLowerCase(),
      fields: {
        title: notebook.title,
        description: notebook.description || '',
        content: notebook.content || '',
        tags: notebook.tags || [],
        category: notebook.category || 'personal',
        createdAt: notebook.createdAt,
        updatedAt: notebook.updatedAt,
        isFavorite: notebook.isFavorite || false,
        isArchived: notebook.isArchived || false,
        taskCount: notebook.taskCount || 0,
        collaborators: notebook.collaborators || [],
        color: notebook.color || 'blue'
      },
      boost: this.calculateNotebookBoost(notebook),
      type: 'notebook',
      lastIndexed: new Date()
    };
  }

  /**
   * Calculate boost score for a notebook based on its properties
   */
  private calculateNotebookBoost(notebook: Notebook): number {
    let boost = 1.0;

    // Boost favorite notebooks
    if (notebook.isFavorite) {
      boost += 0.3;
    }

    // Boost recently updated notebooks
    const daysSinceUpdate = (Date.now() - new Date(notebook.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 1) {
      boost += 0.2;
    } else if (daysSinceUpdate < 7) {
      boost += 0.1;
    }

    // Boost notebooks with more tasks (active projects)
    const taskCount = notebook.taskCount || 0;
    if (taskCount > 10) {
      boost += 0.2;
    } else if (taskCount > 5) {
      boost += 0.1;
    }

    // Boost notebooks with collaborators (shared projects)
    if (notebook.collaborators && notebook.collaborators.length > 0) {
      boost += 0.15;
    }

    // Reduce boost for archived notebooks (but still searchable)
    if (notebook.isArchived) {
      boost *= 0.5;
    }

    // Boost by category importance
    switch (notebook.category) {
      case 'work':
      case 'project':
        boost += 0.1;
        break;
      case 'reference':
        boost += 0.05;
        break;
      default:
        break;
    }

    return Math.max(boost, 0.1); // Minimum boost
  }

  /**
   * Format a notebook as a search result item
   */
  protected formatResultItem(notebook: Notebook, score: number, highlights: SearchHighlight[]): SearchResultItem<Notebook> {
    const snippet = this.generateNotebookSnippet(notebook, highlights);
    const matchedFields = highlights.map(h => h.field);

    return {
      item: notebook,
      score,
      highlights,
      snippet,
      matchedFields
    };
  }

  /**
   * Generate a descriptive snippet for a notebook
   */
  private generateNotebookSnippet(notebook: Notebook, highlights: SearchHighlight[]): string {
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

      const contentHighlight = highlights.find(h => h.field === 'content');
      if (contentHighlight && contentHighlight.fragments.length > 0) {
        return contentHighlight.fragments[0];
      }
    }

    // Fall back to notebook description or truncated content
    if (notebook.description && notebook.description.length > 0) {
      return notebook.description.length > 150 
        ? notebook.description.substring(0, 147) + '...'
        : notebook.description;
    }

    if (notebook.content && notebook.content.length > 0) {
      return notebook.content.length > 150 
        ? notebook.content.substring(0, 147) + '...'
        : notebook.content;
    }

    return notebook.title;
  }

  /**
   * Find original notebook by ID
   */
  protected findOriginalItem(id: string): Notebook | null {
    return this.notebooks.find(notebook => notebook.id === id) || null;
  }

  /**
   * Get unique tag values for filtering
   */
  public getTagOptions(): Array<{ value: string; label: string; count: number }> {
    const tagCounts = new Map<string, number>();
    
    for (const notebook of this.notebooks) {
      if (notebook.tags) {
        for (const tag of notebook.tags) {
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
   * Get category distribution for faceted search
   */
  public getCategoryDistribution(): Array<{ value: string; label: string; count: number }> {
    const categoryCounts = new Map<string, number>();
    
    for (const notebook of this.notebooks) {
      const category = notebook.category || 'personal';
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    }

    const categoryLabels: Record<string, string> = {
      personal: 'Personal',
      work: 'Work',
      project: 'Project',
      reference: 'Reference',
      archive: 'Archive'
    };

    return Array.from(categoryCounts.entries())
      .map(([category, count]) => ({
        value: category,
        label: categoryLabels[category] || category,
        count
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get collaborator distribution for faceted search
   */
  public getCollaboratorOptions(): Array<{ value: string; label: string; count: number }> {
    const collaboratorCounts = new Map<string, number>();
    
    for (const notebook of this.notebooks) {
      if (notebook.collaborators) {
        for (const collaborator of notebook.collaborators) {
          collaboratorCounts.set(collaborator, (collaboratorCounts.get(collaborator) || 0) + 1);
        }
      }
    }

    return Array.from(collaboratorCounts.entries())
      .map(([collaborator, count]) => ({
        value: collaborator,
        label: collaborator,
        count
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get notebooks by activity level
   */
  public getActivityDistribution(): Array<{ range: string; label: string; count: number }> {
    const now = Date.now();
    const ranges = {
      'today': 1,
      'week': 7,
      'month': 30,
      'quarter': 90,
      'older': Infinity
    };

    const activityCounts: Record<string, number> = {
      today: 0,
      week: 0,
      month: 0,
      quarter: 0,
      older: 0
    };

    for (const notebook of this.notebooks) {
      const daysSinceUpdate = (now - new Date(notebook.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceUpdate <= ranges.today) {
        activityCounts.today++;
      } else if (daysSinceUpdate <= ranges.week) {
        activityCounts.week++;
      } else if (daysSinceUpdate <= ranges.month) {
        activityCounts.month++;
      } else if (daysSinceUpdate <= ranges.quarter) {
        activityCounts.quarter++;
      } else {
        activityCounts.older++;
      }
    }

    const activityLabels: Record<string, string> = {
      today: 'Updated Today',
      week: 'This Week',
      month: 'This Month',
      quarter: 'This Quarter',
      older: 'Older'
    };

    return Object.entries(activityCounts)
      .map(([range, count]) => ({
        range,
        label: activityLabels[range],
        count
      }))
      .filter(item => item.count > 0);
  }

  /**
   * Refresh the search index with latest data
   */
  public async refresh(): Promise<void> {
    await this.loadNotebooks();
  }

  /**
   * Get advanced search suggestions specific to notebooks
   */
  public async getNotebookSuggestions(input: string): Promise<string[]> {
    const baseSuggestions = await this.getSuggestions(input);
    const notebookSpecificSuggestions: string[] = [];

    // Add category-based suggestions
    const categorySuggestions = ['personal', 'work', 'project', 'reference', 'archive']
      .filter(category => category.includes(input.toLowerCase()));
    
    // Add tag-based suggestions
    const tags = this.getTagOptions();
    const tagSuggestions = tags
      .filter(tag => tag.label.toLowerCase().includes(input.toLowerCase()))
      .slice(0, 5)
      .map(tag => tag.label);

    // Add collaborator suggestions
    const collaborators = this.getCollaboratorOptions();
    const collaboratorSuggestions = collaborators
      .filter(collab => collab.label.toLowerCase().includes(input.toLowerCase()))
      .slice(0, 3)
      .map(collab => collab.label);

    return [
      ...notebookSpecificSuggestions,
      ...categorySuggestions,
      ...tagSuggestions,
      ...collaboratorSuggestions,
      ...baseSuggestions
    ].slice(0, 10);
  }

  /**
   * Search notebooks by content similarity
   */
  public async searchSimilarContent(notebookId: string, limit: number = 5): Promise<SearchResultItem<Notebook>[]> {
    const sourceNotebook = this.notebooks.find(nb => nb.id === notebookId);
    if (!sourceNotebook || !sourceNotebook.content) {
      return [];
    }

    // Create a query based on the source notebook's content
    const contentWords = this.tokenize(sourceNotebook.content.toLowerCase()).slice(0, 10);
    const searchQuery = {
      id: `similar-${notebookId}`,
      text: contentWords.join(' '),
      filters: [
        // Exclude the source notebook
        { field: 'id', operator: 'equals' as const, value: notebookId, enabled: true, negate: true }
      ],
      limit,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const results = await this.search(searchQuery);
    return results.items;
  }
}
