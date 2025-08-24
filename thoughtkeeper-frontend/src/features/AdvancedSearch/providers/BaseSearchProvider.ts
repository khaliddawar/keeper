import type {
  SearchProvider,
  SearchQuery,
  SearchResults,
  SearchField,
  SearchFilter,
  SearchSort,
  SearchResultItem,
  SearchIndex,
  SearchIndexConfig
} from '../types';

/**
 * Base Search Provider
 * Abstract base class for all search providers
 */
export abstract class BaseSearchProvider implements SearchProvider {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly fields: SearchField[];
  public readonly supportsFullText: boolean;
  public readonly supportsFacets: boolean;
  public readonly supportsHighlighting: boolean;
  public readonly supportsFuzzySearch: boolean;

  protected index: Map<string, SearchIndex> = new Map();
  protected indexConfig: SearchIndexConfig;

  constructor(
    id: string,
    name: string,
    description: string,
    fields: SearchField[],
    features: {
      fullText?: boolean;
      facets?: boolean;
      highlighting?: boolean;
      fuzzySearch?: boolean;
    } = {},
    indexConfig?: Partial<SearchIndexConfig>
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.fields = fields;
    this.supportsFullText = features.fullText ?? true;
    this.supportsFacets = features.facets ?? true;
    this.supportsHighlighting = features.highlighting ?? true;
    this.supportsFuzzySearch = features.fuzzySearch ?? true;

    this.indexConfig = {
      fields: [
        { name: 'title', boost: 3.0, analyzer: 'text' },
        { name: 'content', boost: 1.0, analyzer: 'text' },
        { name: 'tags', boost: 2.0, analyzer: 'keyword' }
      ],
      stopWords: ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were'],
      stemming: true,
      caseSensitive: false,
      ...indexConfig
    };
  }

  /**
   * Abstract method to get all searchable items
   */
  protected abstract getAllItems(): any[];

  /**
   * Abstract method to convert an item to search index
   */
  protected abstract itemToIndex(item: any): SearchIndex;

  /**
   * Abstract method to format search result item
   */
  protected abstract formatResultItem(item: any, score: number, highlights: any[]): SearchResultItem;

  /**
   * Build or rebuild the search index
   */
  public buildIndex(): void {
    console.log(`Building search index for ${this.name}...`);
    const startTime = Date.now();
    
    this.index.clear();
    const items = this.getAllItems();
    
    for (const item of items) {
      const indexEntry = this.itemToIndex(item);
      this.index.set(indexEntry.id, indexEntry);
    }
    
    const buildTime = Date.now() - startTime;
    console.log(`Built index with ${this.index.size} entries in ${buildTime}ms`);
  }

  /**
   * Main search method
   */
  public async search(query: SearchQuery): Promise<SearchResults> {
    const startTime = Date.now();

    try {
      // Ensure index is built
      if (this.index.size === 0) {
        this.buildIndex();
      }

      let results: SearchResultItem[] = [];

      if (query.text) {
        // Full-text search
        results = await this.performTextSearch(query.text);
      } else {
        // Filter-only search
        results = await this.performFilterSearch();
      }

      // Apply additional filters
      if (query.filters.length > 0) {
        results = this.applyFilters(results, query.filters);
      }

      // Apply sorting
      if (query.sort) {
        results = this.applySort(results, query.sort);
      }

      // Apply pagination
      const { items: paginatedItems, totalCount } = this.applyPagination(results, query.limit, query.offset);

      const took = Date.now() - startTime;

      return {
        items: paginatedItems,
        totalCount,
        totalPages: Math.ceil(totalCount / (query.limit || 20)),
        currentPage: Math.floor((query.offset || 0) / (query.limit || 20)) + 1,
        hasMore: (query.offset || 0) + paginatedItems.length < totalCount,
        took,
        query
      };
    } catch (error) {
      console.error(`Search error in ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * Perform full-text search
   */
  protected async performTextSearch(searchText: string): Promise<SearchResultItem[]> {
    const normalizedQuery = this.normalizeText(searchText);
    const queryTerms = this.tokenize(normalizedQuery);
    const results: Array<{ item: any; score: number; highlights: any[] }> = [];

    for (const [id, indexEntry] of this.index) {
      const score = this.calculateRelevanceScore(indexEntry, queryTerms);
      
      if (score > 0) {
        const highlights = this.supportsHighlighting ? this.generateHighlights(indexEntry, queryTerms) : [];
        const originalItem = this.findOriginalItem(id);
        
        if (originalItem) {
          results.push({
            item: originalItem,
            score,
            highlights
          });
        }
      }
    }

    // Sort by relevance score
    results.sort((a, b) => b.score - a.score);

    return results.map(result => 
      this.formatResultItem(result.item, result.score, result.highlights)
    );
  }

  /**
   * Perform filter-only search (no text query)
   */
  protected async performFilterSearch(): Promise<SearchResultItem[]> {
    const results: SearchResultItem[] = [];
    
    for (const [id] of this.index) {
      const originalItem = this.findOriginalItem(id);
      if (originalItem) {
        results.push(this.formatResultItem(originalItem, 1.0, []));
      }
    }
    
    return results;
  }

  /**
   * Apply search filters to results
   */
  protected applyFilters(results: SearchResultItem[], filters: SearchFilter[]): SearchResultItem[] {
    return results.filter(result => {
      return filters.every(filter => {
        if (!filter.enabled) return true;
        
        const fieldValue = this.getFieldValue(result.item, filter.field);
        const matches = this.evaluateFilter(fieldValue, filter);
        
        return filter.negate ? !matches : matches;
      });
    });
  }

  /**
   * Apply sorting to results
   */
  protected applySort(results: SearchResultItem[], sort: SearchSort): SearchResultItem[] {
    return results.sort((a, b) => {
      const aValue = this.getFieldValue(a.item, sort.field);
      const bValue = this.getFieldValue(b.item, sort.field);
      
      let comparison = 0;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }
      
      return sort.direction === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * Apply pagination to results
   */
  protected applyPagination(
    results: SearchResultItem[], 
    limit?: number, 
    offset?: number
  ): { items: SearchResultItem[]; totalCount: number } {
    const totalCount = results.length;
    const startIndex = offset || 0;
    const endIndex = limit ? startIndex + limit : undefined;
    
    return {
      items: results.slice(startIndex, endIndex),
      totalCount
    };
  }

  /**
   * Calculate relevance score for an index entry
   */
  protected calculateRelevanceScore(indexEntry: SearchIndex, queryTerms: string[]): number {
    let score = 0;
    const content = indexEntry.content.toLowerCase();
    
    for (const term of queryTerms) {
      const termScore = this.calculateTermScore(content, term, indexEntry.fields);
      score += termScore;
    }
    
    // Apply boost factor
    score *= indexEntry.boost;
    
    return score;
  }

  /**
   * Calculate score for a specific term
   */
  protected calculateTermScore(content: string, term: string, fields: Record<string, any>): number {
    let score = 0;
    
    // Exact match bonus
    if (content.includes(term)) {
      score += 2.0;
    }
    
    // Fuzzy match
    if (this.supportsFuzzySearch) {
      const fuzzyScore = this.calculateFuzzyScore(content, term);
      score += fuzzyScore;
    }
    
    // Field-specific scoring
    for (const fieldConfig of this.indexConfig.fields) {
      const fieldValue = String(fields[fieldConfig.name] || '').toLowerCase();
      if (fieldValue.includes(term)) {
        score += fieldConfig.boost;
      }
    }
    
    return score;
  }

  /**
   * Calculate fuzzy matching score
   */
  protected calculateFuzzyScore(text: string, term: string): number {
    // Simple Levenshtein distance-based fuzzy matching
    const words = text.split(/\s+/);
    let maxScore = 0;
    
    for (const word of words) {
      const distance = this.levenshteinDistance(word, term);
      const similarity = 1 - (distance / Math.max(word.length, term.length));
      
      if (similarity > 0.6) { // Threshold for fuzzy match
        maxScore = Math.max(maxScore, similarity * 0.5); // Reduced weight for fuzzy matches
      }
    }
    
    return maxScore;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  protected levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Generate search highlights
   */
  protected generateHighlights(indexEntry: SearchIndex, queryTerms: string[]): any[] {
    const highlights: any[] = [];
    
    if (this.supportsHighlighting) {
      for (const fieldConfig of this.indexConfig.fields) {
        const fieldValue = String(indexEntry.fields[fieldConfig.name] || '');
        const fragments = this.highlightText(fieldValue, queryTerms);
        
        if (fragments.length > 0) {
          highlights.push({
            field: fieldConfig.name,
            fragments
          });
        }
      }
    }
    
    return highlights;
  }

  /**
   * Highlight query terms in text
   */
  protected highlightText(text: string, terms: string[]): string[] {
    let highlightedText = text;
    
    for (const term of terms) {
      const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    }
    
    // Extract fragments with highlights
    const fragments: string[] = [];
    const markedSegments = highlightedText.split(/(<mark>.*?<\/mark>)/);
    
    for (let i = 0; i < markedSegments.length; i++) {
      if (markedSegments[i].includes('<mark>')) {
        const start = Math.max(0, i - 1);
        const end = Math.min(markedSegments.length, i + 2);
        const fragment = markedSegments.slice(start, end).join('');
        
        if (fragment.trim()) {
          fragments.push(fragment.trim());
        }
      }
    }
    
    return fragments.length > 0 ? fragments : [text.substring(0, 150) + '...'];
  }

  /**
   * Utility methods
   */
  protected normalizeText(text: string): string {
    return this.indexConfig.caseSensitive ? text : text.toLowerCase();
  }

  protected tokenize(text: string): string[] {
    return text
      .split(/\s+/)
      .map(word => word.replace(/[^\w]/g, ''))
      .filter(word => word.length > 0 && !this.indexConfig.stopWords.includes(word));
  }

  protected escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  protected getFieldValue(item: any, fieldPath: string): any {
    return fieldPath.split('.').reduce((obj, key) => obj?.[key], item);
  }

  protected evaluateFilter(fieldValue: any, filter: SearchFilter): boolean {
    switch (filter.operator) {
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
      case 'equals':
        return fieldValue === filter.value;
      case 'startsWith':
        return String(fieldValue).toLowerCase().startsWith(String(filter.value).toLowerCase());
      case 'endsWith':
        return String(fieldValue).toLowerCase().endsWith(String(filter.value).toLowerCase());
      case 'regex':
        return new RegExp(filter.value, 'i').test(String(fieldValue));
      default:
        return true;
    }
  }

  protected abstract findOriginalItem(id: string): any | null;

  /**
   * Get search suggestions based on input
   */
  public async getSuggestions(input: string): Promise<string[]> {
    const suggestions: string[] = [];
    const normalizedInput = this.normalizeText(input);
    
    // Extract suggestions from index content
    for (const [, indexEntry] of this.index) {
      const content = indexEntry.content.toLowerCase();
      const words = this.tokenize(content);
      
      for (const word of words) {
        if (word.startsWith(normalizedInput) && !suggestions.includes(word)) {
          suggestions.push(word);
        }
      }
    }
    
    return suggestions.slice(0, 10); // Limit suggestions
  }
}
