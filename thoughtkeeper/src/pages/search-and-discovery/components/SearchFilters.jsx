import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const SearchFilters = ({ isVisible, onClose, onApplyFilters }) => {
  const [filters, setFilters] = useState({
    dateRange: 'all',
    contentTypes: ['all'],
    tags: [],
    folders: [],
    priority: 'all',
    sortBy: 'relevance'
  });

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'modified', label: 'Recently Modified' },
    { value: 'alphabetical', label: 'Alphabetical' }
  ];

  const contentTypes = [
    { id: 'all', label: 'All Content', count: 156 },
    { id: 'thoughts', label: 'Thoughts', count: 89 },
    { id: 'tasks', label: 'Tasks', count: 34 },
    { id: 'ideas', label: 'Ideas', count: 23 },
    { id: 'archived', label: 'Archived', count: 10 }
  ];

  const popularTags = [
    { id: 'work', label: 'work', count: 45 },
    { id: 'personal', label: 'personal', count: 32 },
    { id: 'project', label: 'project', count: 28 },
    { id: 'meeting', label: 'meeting', count: 19 },
    { id: 'idea', label: 'idea', count: 15 },
    { id: 'urgent', label: 'urgent', count: 12 },
    { id: 'planning', label: 'planning', count: 8 }
  ];

  const folders = [
    { id: 'work', label: 'Work', count: 67 },
    { id: 'personal', label: 'Personal', count: 43 },
    { id: 'projects', label: 'Projects', count: 29 },
    { id: 'archive', label: 'Archive', count: 17 }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleArrayFilterChange = (key, value, checked) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked 
        ? [...prev?.[key], value]
        : prev?.[key]?.filter(item => item !== value)
    }));
  };

  const resetFilters = () => {
    setFilters({
      dateRange: 'all',
      contentTypes: ['all'],
      tags: [],
      folders: [],
      priority: 'all',
      sortBy: 'relevance'
    });
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters?.dateRange !== 'all') count++;
    if (filters?.contentTypes?.length > 0 && !filters?.contentTypes?.includes('all')) count++;
    if (filters?.tags?.length > 0) count++;
    if (filters?.folders?.length > 0) count++;
    if (filters?.priority !== 'all') count++;
    return count;
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed right-0 top-32 bottom-0 w-80 bg-surface border-l border-border z-[900] animate-slide-in-right">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-foreground">Search Filters</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <Icon name="X" size={20} />
              </Button>
            </div>
            {getActiveFiltersCount() > 0 && (
              <div className="mt-2 text-sm text-text-secondary">
                {getActiveFiltersCount()} active filter{getActiveFiltersCount() !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Date Range */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Date Range</h3>
              <Select
                options={dateRangeOptions}
                value={filters?.dateRange}
                onChange={(value) => handleFilterChange('dateRange', value)}
                placeholder="Select date range"
              />
            </div>

            {/* Content Type */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Content Type</h3>
              <div className="space-y-2">
                {contentTypes?.map((type) => (
                  <div key={type?.id} className="flex items-center justify-between">
                    <Checkbox
                      label={type?.label}
                      checked={filters?.contentTypes?.includes(type?.id)}
                      onChange={(e) => handleArrayFilterChange('contentTypes', type?.id, e?.target?.checked)}
                    />
                    <span className="text-xs text-text-secondary">{type?.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Tags</h3>
              <div className="space-y-2">
                {popularTags?.map((tag) => (
                  <div key={tag?.id} className="flex items-center justify-between">
                    <Checkbox
                      label={`#${tag?.label}`}
                      checked={filters?.tags?.includes(tag?.id)}
                      onChange={(e) => handleArrayFilterChange('tags', tag?.id, e?.target?.checked)}
                    />
                    <span className="text-xs text-text-secondary">{tag?.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Folders */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Folders</h3>
              <div className="space-y-2">
                {folders?.map((folder) => (
                  <div key={folder?.id} className="flex items-center justify-between">
                    <Checkbox
                      label={folder?.label}
                      checked={filters?.folders?.includes(folder?.id)}
                      onChange={(e) => handleArrayFilterChange('folders', folder?.id, e?.target?.checked)}
                    />
                    <span className="text-xs text-text-secondary">{folder?.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Sort By</h3>
              <Select
                options={sortOptions}
                value={filters?.sortBy}
                onChange={(value) => handleFilterChange('sortBy', value)}
                placeholder="Sort results by"
              />
            </div>
          </div>

          <div className="p-6 border-t border-border">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" fullWidth onClick={resetFilters}>
                Reset
              </Button>
              <Button variant="default" size="sm" fullWidth onClick={applyFilters}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Drawer */}
      <div className="lg:hidden fixed inset-0 z-[1050] bg-black bg-opacity-50 animate-fade-in">
        <div className="fixed bottom-0 left-0 right-0 h-[90vh] bg-surface rounded-t-2xl animate-slide-up">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-foreground">Search Filters</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <Icon name="X" size={20} />
                </Button>
              </div>
              {getActiveFiltersCount() > 0 && (
                <div className="mt-2 text-sm text-text-secondary">
                  {getActiveFiltersCount()} active filter{getActiveFiltersCount() !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Same content as desktop but in mobile layout */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Date Range</h3>
                <Select
                  options={dateRangeOptions}
                  value={filters?.dateRange}
                  onChange={(value) => handleFilterChange('dateRange', value)}
                  placeholder="Select date range"
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Content Type</h3>
                <div className="grid grid-cols-2 gap-2">
                  {contentTypes?.map((type) => (
                    <div key={type?.id} className="flex items-center justify-between p-2 bg-input rounded-lg">
                      <Checkbox
                        label={type?.label}
                        checked={filters?.contentTypes?.includes(type?.id)}
                        onChange={(e) => handleArrayFilterChange('contentTypes', type?.id, e?.target?.checked)}
                      />
                      <span className="text-xs text-text-secondary">{type?.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags?.map((tag) => (
                    <button
                      key={tag?.id}
                      onClick={() => handleArrayFilterChange('tags', tag?.id, !filters?.tags?.includes(tag?.id))}
                      className={`px-3 py-1 rounded-full text-sm transition-micro ${
                        filters?.tags?.includes(tag?.id)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-input text-text-secondary hover:bg-muted'
                      }`}
                    >
                      #{tag?.label} ({tag?.count})
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Sort By</h3>
                <Select
                  options={sortOptions}
                  value={filters?.sortBy}
                  onChange={(value) => handleFilterChange('sortBy', value)}
                  placeholder="Sort results by"
                />
              </div>
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" fullWidth onClick={resetFilters}>
                  Reset
                </Button>
                <Button variant="default" size="sm" fullWidth onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchFilters;