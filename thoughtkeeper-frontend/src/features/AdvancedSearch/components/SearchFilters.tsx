import React, { useState, useCallback } from 'react';
import { useAdvancedSearch } from '../AdvancedSearchProvider';
import type { SearchFiltersProps, SearchFilter, SearchField, SearchOperator } from '../types';

/**
 * Search Filters Component
 * Advanced filtering interface with field-specific controls
 */
export const SearchFilters: React.FC<SearchFiltersProps> = ({
  fields,
  filters,
  facets = [],
  quickFilters = [],
  onFiltersChange,
  onQuickFilterToggle,
  className = ''
}) => {
  const [showAddFilter, setShowAddFilter] = useState(false);
  const [newFilter, setNewFilter] = useState<Partial<SearchFilter>>({
    field: '',
    operator: 'contains',
    value: '',
    enabled: true
  });

  /**
   * Add a new filter
   */
  const handleAddFilter = useCallback(() => {
    if (!newFilter.field || newFilter.value === '') return;

    const filter: SearchFilter = {
      field: newFilter.field!,
      operator: newFilter.operator!,
      value: newFilter.value!,
      enabled: true,
      negate: newFilter.negate || false
    };

    onFiltersChange([...filters, filter]);
    setNewFilter({
      field: '',
      operator: 'contains',
      value: '',
      enabled: true
    });
    setShowAddFilter(false);
  }, [newFilter, filters, onFiltersChange]);

  /**
   * Update an existing filter
   */
  const handleUpdateFilter = useCallback((index: number, updates: Partial<SearchFilter>) => {
    const updatedFilters = filters.map((filter, i) =>
      i === index ? { ...filter, ...updates } : filter
    );
    onFiltersChange(updatedFilters);
  }, [filters, onFiltersChange]);

  /**
   * Remove a filter
   */
  const handleRemoveFilter = useCallback((index: number) => {
    const updatedFilters = filters.filter((_, i) => i !== index);
    onFiltersChange(updatedFilters);
  }, [filters, onFiltersChange]);

  /**
   * Get available operators for a field type
   */
  const getOperatorsForField = useCallback((field: SearchField): SearchOperator[] => {
    switch (field.type) {
      case 'text':
        return ['contains', 'equals', 'startsWith', 'endsWith', 'regex'];
      case 'select':
      case 'multi-select':
        return ['equals'];
      case 'number':
        return ['equals'];
      case 'date':
        return ['equals'];
      case 'boolean':
        return ['equals'];
      default:
        return ['contains', 'equals'];
    }
  }, []);

  /**
   * Render value input based on field type
   */
  const renderValueInput = useCallback((
    field: SearchField,
    value: any,
    onChange: (value: any) => void,
    className: string = ''
  ) => {
    switch (field.type) {
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={className}
          >
            <option value="">Select {field.label.toLowerCase()}...</option>
            {field.options?.map(option => (
              <option key={String(option.value)} value={String(option.value)}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multi-select':
        return (
          <select
            multiple
            value={Array.isArray(value) ? value.map(String) : []}
            onChange={(e) => {
              const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
              onChange(selectedValues);
            }}
            className={`${className} h-20`}
          >
            {field.options?.map(option => (
              <option key={String(option.value)} value={String(option.value)}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : '')}
            placeholder={field.placeholder}
            className={className}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={className}
          />
        );

      case 'boolean':
        return (
          <select
            value={value === undefined ? '' : String(value)}
            onChange={(e) => onChange(e.target.value === 'true')}
            className={className}
          >
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={className}
          />
        );
    }
  }, []);

  return (
    <div className={`search-filters ${className}`}>
      {/* Quick Filters */}
      {quickFilters.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Quick Filters
          </h3>
          <div className="flex flex-wrap gap-2">
            {quickFilters.map(filter => (
              <button
                key={filter.id}
                onClick={() => onQuickFilterToggle?.(filter.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter.enabled
                    ? `bg-${filter.color || 'blue'}-100 text-${filter.color || 'blue'}-700 dark:bg-${filter.color || 'blue'}-900 dark:text-${filter.color || 'blue'}-300`
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                {filter.icon && <span className="mr-1">{filter.icon}</span>}
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Faceted Filters */}
      {facets.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Filter by Category
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facets.map(facet => (
              <div key={facet.field} className="space-y-2">
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {facet.label}
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {facet.values.map(value => (
                    <label key={`${value.value}`} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={value.selected || false}
                        onChange={(e) => {
                          // This would be handled by the parent component
                          console.log('Facet toggle:', facet.field, value.value, e.target.checked);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300 flex-1">
                        {value.label}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {value.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Advanced Filters
          </h3>
          <button
            onClick={() => setShowAddFilter(!showAddFilter)}
            className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          >
            Add Filter
          </button>
        </div>

        {/* Existing Filters */}
        {filters.length > 0 && (
          <div className="space-y-3">
            {filters.map((filter, index) => {
              const field = fields.find(f => f.key === filter.field);
              if (!field) return null;

              return (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  {/* Toggle Filter */}
                  <button
                    onClick={() => handleUpdateFilter(index, { enabled: !filter.enabled })}
                    className={`p-1 rounded ${
                      filter.enabled
                        ? 'text-green-600 hover:text-green-700'
                        : 'text-gray-400 hover:text-gray-500'
                    }`}
                    title={filter.enabled ? 'Filter enabled' : 'Filter disabled'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d={filter.enabled ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'} 
                      />
                    </svg>
                  </button>

                  {/* Field Name */}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-20">
                    {field.label}
                  </span>

                  {/* Negation Toggle */}
                  <button
                    onClick={() => handleUpdateFilter(index, { negate: !filter.negate })}
                    className={`px-2 py-1 text-xs rounded ${
                      filter.negate
                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {filter.negate ? 'NOT' : 'IS'}
                  </button>

                  {/* Operator */}
                  <select
                    value={filter.operator}
                    onChange={(e) => handleUpdateFilter(index, { operator: e.target.value as SearchOperator })}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
                  >
                    {getOperatorsForField(field).map(op => (
                      <option key={op} value={op}>
                        {op.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </option>
                    ))}
                  </select>

                  {/* Value Input */}
                  <div className="flex-1">
                    {renderValueInput(
                      field,
                      filter.value,
                      (value) => handleUpdateFilter(index, { value }),
                      'w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-700'
                    )}
                  </div>

                  {/* Remove Filter */}
                  <button
                    onClick={() => handleRemoveFilter(index)}
                    className="p-1 text-red-500 hover:text-red-600 transition-colors"
                    title="Remove filter"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Add New Filter Form */}
        {showAddFilter && (
          <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Field Selection */}
                <select
                  value={newFilter.field || ''}
                  onChange={(e) => setNewFilter({ ...newFilter, field: e.target.value, operator: 'contains' })}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700"
                >
                  <option value="">Select field...</option>
                  {fields.filter(f => f.filterable).map(field => (
                    <option key={field.key} value={field.key}>
                      {field.label}
                    </option>
                  ))}
                </select>

                {/* Operator Selection */}
                {newFilter.field && (
                  <select
                    value={newFilter.operator || 'contains'}
                    onChange={(e) => setNewFilter({ ...newFilter, operator: e.target.value as SearchOperator })}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700"
                  >
                    {getOperatorsForField(fields.find(f => f.key === newFilter.field)!).map(op => (
                      <option key={op} value={op}>
                        {op.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </option>
                    ))}
                  </select>
                )}

                {/* Negation Checkbox */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newFilter.negate || false}
                    onChange={(e) => setNewFilter({ ...newFilter, negate: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Negate (NOT)</span>
                </label>
              </div>

              {/* Value Input */}
              {newFilter.field && (
                <div>
                  {renderValueInput(
                    fields.find(f => f.key === newFilter.field)!,
                    newFilter.value,
                    (value) => setNewFilter({ ...newFilter, value }),
                    'w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700'
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAddFilter}
                  disabled={!newFilter.field || newFilter.value === ''}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
                >
                  Add Filter
                </button>
                <button
                  onClick={() => setShowAddFilter(false)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;
