import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterSidebar = ({ 
  isVisible, 
  onClose, 
  filters, 
  onFiltersChange,
  availableTags = []
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

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
    { value: 'created-desc', label: 'Newest First' },
    { value: 'created-asc', label: 'Oldest First' },
    { value: 'modified-desc', label: 'Recently Modified' },
    { value: 'modified-asc', label: 'Least Recently Modified' },
    { value: 'priority-desc', label: 'High Priority First' },
    { value: 'priority-asc', label: 'Low Priority First' },
    { value: 'alphabetical', label: 'Alphabetical' }
  ];

  const priorityOptions = [
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleTagToggle = (tag, checked) => {
    const currentTags = localFilters?.tags || [];
    const newTags = checked 
      ? [...currentTags, tag]
      : currentTags?.filter(t => t !== tag);
    handleFilterChange('tags', newTags);
  };

  const handlePriorityToggle = (priority, checked) => {
    const currentPriorities = localFilters?.priorities || [];
    const newPriorities = checked
      ? [...currentPriorities, priority]
      : currentPriorities?.filter(p => p !== priority);
    handleFilterChange('priorities', newPriorities);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters = {
      dateRange: 'all',
      sortBy: 'created-desc',
      searchTerm: '',
      tags: [],
      priorities: [],
      isActionable: null,
      hasAttachments: false
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed right-0 top-16 bottom-0 w-80 bg-surface border-l border-border z-[900] animate-slide-in-right">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-foreground">Filters & Sort</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <Icon name="X" size={20} />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Search */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Search</h3>
              <Input
                type="search"
                placeholder="Search within thoughts..."
                value={localFilters?.searchTerm || ''}
                onChange={(e) => handleFilterChange('searchTerm', e?.target?.value)}
              />
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Date Range</h3>
              <Select
                options={dateRangeOptions}
                value={localFilters?.dateRange || 'all'}
                onChange={(value) => handleFilterChange('dateRange', value)}
                placeholder="Select date range"
              />
            </div>

            {/* Sort By */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Sort By</h3>
              <Select
                options={sortOptions}
                value={localFilters?.sortBy || 'created-desc'}
                onChange={(value) => handleFilterChange('sortBy', value)}
                placeholder="Sort thoughts by"
              />
            </div>

            {/* Priority Filter */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Priority</h3>
              <div className="space-y-2">
                {priorityOptions?.map((priority) => (
                  <div key={priority?.value} className="flex items-center space-x-2">
                    <Checkbox
                      checked={(localFilters?.priorities || [])?.includes(priority?.value)}
                      onChange={(e) => handlePriorityToggle(priority?.value, e?.target?.checked)}
                    />
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        priority?.value === 'high' ? 'bg-error' :
                        priority?.value === 'medium' ? 'bg-warning' : 'bg-success'
                      }`} />
                      <span className="text-sm text-foreground">{priority?.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Tags</h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {availableTags?.map((tag) => (
                  <Checkbox
                    key={tag}
                    label={`#${tag}`}
                    checked={(localFilters?.tags || [])?.includes(tag)}
                    onChange={(e) => handleTagToggle(tag, e?.target?.checked)}
                  />
                ))}
              </div>
            </div>

            {/* Content Type */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Content Type</h3>
              <div className="space-y-2">
                <Checkbox
                  label="Actionable Items Only"
                  checked={localFilters?.isActionable === true}
                  onChange={(e) => handleFilterChange('isActionable', e?.target?.checked ? true : null)}
                />
                <Checkbox
                  label="Has Attachments"
                  checked={localFilters?.hasAttachments || false}
                  onChange={(e) => handleFilterChange('hasAttachments', e?.target?.checked)}
                />
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-border">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" fullWidth onClick={handleResetFilters}>
                Reset
              </Button>
              <Button variant="default" size="sm" fullWidth onClick={handleApplyFilters}>
                Apply Filters
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
                <h2 className="text-lg font-medium text-foreground">Filters & Sort</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <Icon name="X" size={20} />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Same content as desktop but in mobile layout */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Search</h3>
                <Input
                  type="search"
                  placeholder="Search within thoughts..."
                  value={localFilters?.searchTerm || ''}
                  onChange={(e) => handleFilterChange('searchTerm', e?.target?.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-foreground">Date Range</h3>
                  <Select
                    options={dateRangeOptions}
                    value={localFilters?.dateRange || 'all'}
                    onChange={(value) => handleFilterChange('dateRange', value)}
                    placeholder="Select date range"
                  />
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-foreground">Sort By</h3>
                  <Select
                    options={sortOptions}
                    value={localFilters?.sortBy || 'created-desc'}
                    onChange={(value) => handleFilterChange('sortBy', value)}
                    placeholder="Sort thoughts by"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Priority</h3>
                <div className="grid grid-cols-2 gap-2">
                  {priorityOptions?.map((priority) => (
                    <div key={priority?.value} className="flex items-center space-x-2">
                      <Checkbox
                        checked={(localFilters?.priorities || [])?.includes(priority?.value)}
                        onChange={(e) => handlePriorityToggle(priority?.value, e?.target?.checked)}
                      />
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          priority?.value === 'high' ? 'bg-error' :
                          priority?.value === 'medium' ? 'bg-warning' : 'bg-success'
                        }`} />
                        <span className="text-sm text-foreground">{priority?.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Tags</h3>
                <div className="max-h-32 overflow-y-auto grid grid-cols-2 gap-2">
                  {availableTags?.slice(0, 10)?.map((tag) => (
                    <Checkbox
                      key={tag}
                      label={`#${tag}`}
                      checked={(localFilters?.tags || [])?.includes(tag)}
                      onChange={(e) => handleTagToggle(tag, e?.target?.checked)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" fullWidth onClick={handleResetFilters}>
                  Reset
                </Button>
                <Button variant="default" size="sm" fullWidth onClick={handleApplyFilters}>
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

export default FilterSidebar;