/**
 * Search Providers Registry
 * Manages all search providers and provides unified search interface
 */

import type { SearchProvider, SearchQuery, SearchResults, SearchField } from '../types';
import { TasksSearchProvider } from './TasksSearchProvider';
import { NotebooksSearchProvider } from './NotebooksSearchProvider';
import { BaseSearchProvider } from './BaseSearchProvider';

/**
 * Search Provider Registry
 * Central registry for all search providers
 */
export class SearchProviderRegistry {
  private providers = new Map<string, SearchProvider>();
  private defaultProvider: string;

  constructor() {
    // Initialize default providers
    this.registerProvider(new TasksSearchProvider());
    this.registerProvider(new NotebooksSearchProvider());
    
    this.defaultProvider = 'tasks';
  }

  /**
   * Register a new search provider
   */
  public registerProvider(provider: SearchProvider): void {
    this.providers.set(provider.id, provider);
    console.log(`Registered search provider: ${provider.name} (${provider.id})`);
  }

  /**
   * Unregister a search provider
   */
  public unregisterProvider(providerId: string): boolean {
    const success = this.providers.delete(providerId);
    if (success) {
      console.log(`Unregistered search provider: ${providerId}`);
    }
    return success;
  }

  /**
   * Get a search provider by ID
   */
  public getProvider(providerId: string): SearchProvider | undefined {
    return this.providers.get(providerId);
  }

  /**
   * Get all registered providers
   */
  public getAllProviders(): SearchProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get provider IDs
   */
  public getProviderIds(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Get the default provider
   */
  public getDefaultProvider(): SearchProvider | undefined {
    return this.providers.get(this.defaultProvider);
  }

  /**
   * Set the default provider
   */
  public setDefaultProvider(providerId: string): boolean {
    if (this.providers.has(providerId)) {
      this.defaultProvider = providerId;
      return true;
    }
    return false;
  }

  /**
   * Search across all providers or a specific provider
   */
  public async search(
    query: SearchQuery,
    providerId?: string
  ): Promise<SearchResults> {
    const provider = providerId 
      ? this.getProvider(providerId)
      : this.getDefaultProvider();

    if (!provider) {
      throw new Error(
        providerId 
          ? `Search provider '${providerId}' not found`
          : 'No default search provider available'
      );
    }

    return provider.search(query);
  }

  /**
   * Search across multiple providers and combine results
   */
  public async searchMultiple(
    query: SearchQuery,
    providerIds: string[] = []
  ): Promise<{ [providerId: string]: SearchResults }> {
    const targetProviders = providerIds.length > 0 
      ? providerIds.filter(id => this.providers.has(id))
      : this.getProviderIds();

    const results: { [providerId: string]: SearchResults } = {};
    
    await Promise.all(
      targetProviders.map(async (providerId) => {
        try {
          const provider = this.getProvider(providerId);
          if (provider) {
            results[providerId] = await provider.search(query);
          }
        } catch (error) {
          console.error(`Search failed for provider ${providerId}:`, error);
          // Create empty result for failed provider
          results[providerId] = {
            items: [],
            totalCount: 0,
            totalPages: 0,
            currentPage: 1,
            hasMore: false,
            took: 0,
            query
          };
        }
      })
    );

    return results;
  }

  /**
   * Get aggregated search suggestions from all providers
   */
  public async getSuggestions(input: string, providerId?: string): Promise<string[]> {
    if (providerId) {
      const provider = this.getProvider(providerId);
      if (provider && 'getSuggestions' in provider) {
        return (provider as any).getSuggestions(input);
      }
      return [];
    }

    // Get suggestions from all providers
    const allSuggestions: string[] = [];
    
    await Promise.all(
      Array.from(this.providers.values()).map(async (provider) => {
        try {
          if ('getSuggestions' in provider) {
            const suggestions = await (provider as any).getSuggestions(input);
            allSuggestions.push(...suggestions);
          }
        } catch (error) {
          console.error(`Suggestions failed for provider ${provider.id}:`, error);
        }
      })
    );

    // Remove duplicates and limit results
    return [...new Set(allSuggestions)].slice(0, 15);
  }

  /**
   * Get all searchable fields from all providers
   */
  public getAllFields(): SearchField[] {
    const allFields: SearchField[] = [];
    const seenFields = new Set<string>();

    for (const provider of this.providers.values()) {
      for (const field of provider.fields) {
        const fieldKey = `${field.key}-${field.type}`;
        if (!seenFields.has(fieldKey)) {
          allFields.push({
            ...field,
            key: `${provider.id}.${field.key}` // Namespace the field key
          });
          seenFields.add(fieldKey);
        }
      }
    }

    return allFields;
  }

  /**
   * Get fields from a specific provider
   */
  public getProviderFields(providerId: string): SearchField[] {
    const provider = this.getProvider(providerId);
    return provider ? provider.fields : [];
  }

  /**
   * Check if a provider supports a specific feature
   */
  public providerSupports(providerId: string, feature: keyof SearchProvider): boolean {
    const provider = this.getProvider(providerId);
    if (!provider) return false;

    switch (feature) {
      case 'supportsFullText':
        return provider.supportsFullText;
      case 'supportsFacets':
        return provider.supportsFacets;
      case 'supportsHighlighting':
        return provider.supportsHighlighting;
      case 'supportsFuzzySearch':
        return provider.supportsFuzzySearch;
      default:
        return false;
    }
  }

  /**
   * Refresh all provider indexes
   */
  public async refreshAll(): Promise<void> {
    await Promise.all(
      Array.from(this.providers.values()).map(async (provider) => {
        try {
          if ('refresh' in provider) {
            await (provider as any).refresh();
          } else if ('buildIndex' in provider) {
            (provider as any).buildIndex();
          }
        } catch (error) {
          console.error(`Failed to refresh provider ${provider.id}:`, error);
        }
      })
    );
  }

  /**
   * Get provider statistics
   */
  public getStats(): Array<{
    providerId: string;
    name: string;
    indexSize: number;
    features: string[];
    fieldCount: number;
  }> {
    return Array.from(this.providers.values()).map(provider => {
      const features: string[] = [];
      if (provider.supportsFullText) features.push('Full Text');
      if (provider.supportsFacets) features.push('Facets');
      if (provider.supportsHighlighting) features.push('Highlighting');
      if (provider.supportsFuzzySearch) features.push('Fuzzy Search');

      return {
        providerId: provider.id,
        name: provider.name,
        indexSize: 'index' in provider ? (provider as any).index?.size || 0 : 0,
        features,
        fieldCount: provider.fields.length
      };
    });
  }

  /**
   * Create a unified search query that works across providers
   */
  public createUnifiedQuery(
    text?: string,
    filters: Array<{ providerId: string; field: string; operator: string; value: any }> = [],
    sort?: { providerId: string; field: string; direction: 'asc' | 'desc' }
  ): { [providerId: string]: SearchQuery } {
    const queries: { [providerId: string]: SearchQuery } = {};

    for (const providerId of this.getProviderIds()) {
      const providerFilters = filters
        .filter(f => f.providerId === providerId)
        .map(f => ({
          field: f.field,
          operator: f.operator as any,
          value: f.value,
          enabled: true
        }));

      const providerSort = sort && sort.providerId === providerId
        ? { field: sort.field, direction: sort.direction }
        : undefined;

      queries[providerId] = {
        id: `unified-${Date.now()}-${providerId}`,
        text,
        filters: providerFilters,
        sort: providerSort,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    return queries;
  }
}

// Export provider classes
export { BaseSearchProvider } from './BaseSearchProvider';
export { TasksSearchProvider } from './TasksSearchProvider';
export { NotebooksSearchProvider } from './NotebooksSearchProvider';

// Create and export singleton registry
export const searchRegistry = new SearchProviderRegistry();

// Development utilities
if (process.env.NODE_ENV === 'development') {
  (window as any).searchRegistry = searchRegistry;
  
  console.log('🔍 Search providers loaded:');
  searchRegistry.getStats().forEach(stat => {
    console.log(`  📚 ${stat.name}: ${stat.indexSize} items, ${stat.fieldCount} fields [${stat.features.join(', ')}]`);
  });
}
