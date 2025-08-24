import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const TaskFilters = ({ filters, notebooks = [], onFiltersChange, onClearFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'overdue', label: 'Overdue' }
  ];

  const notebookOptions = [
    { value: 'all', label: 'All Notebooks' },
    ...notebooks?.map(notebook => ({
      value: notebook?.id,
      label: notebook?.name
    }))
  ];

  const dueDateOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'today', label: 'Due Today' },
    { value: 'tomorrow', label: 'Due Tomorrow' },
    { value: 'this-week', label: 'Due This Week' },
    { value: 'this-month', label: 'Due This Month' },
    { value: 'no-date', label: 'No Due Date' }
  ];

  const sortOptions = [
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'title', label: 'Title' },
    { value: 'status', label: 'Status' },
    { value: 'notebook', label: 'Notebook' },
    { value: 'created', label: 'Date Created' },
    { value: 'updated', label: 'Last Updated' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters?.priority !== 'all') count++;
    if (filters?.status !== 'all') count++;
    if (filters?.dueDate !== 'all') count++;
    if (filters?.notebook !== 'all') count++;
    if (filters?.showCompleted === false) count++;
    if (filters?.showArchived === false) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-surface border-b border-border">
      {/* Quick Filters Bar */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          {/* Quick Filter Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant={filters?.status === 'overdue' ? 'default' : 'outline'}
              size="sm"
              iconName="AlertTriangle"
              iconPosition="left"
              onClick={() => handleFilterChange('status', filters?.status === 'overdue' ? 'all' : 'overdue')}
            >
              Overdue
            </Button>
            <Button
              variant={filters?.dueDate === 'today' ? 'default' : 'outline'}
              size="sm"
              iconName="Calendar"
              iconPosition="left"
              onClick={() => handleFilterChange('dueDate', filters?.dueDate === 'today' ? 'all' : 'today')}
            >
              Due Today
            </Button>
            <Button
              variant={filters?.priority === 'high' ? 'default' : 'outline'}
              size="sm"
              iconName="Flag"
              iconPosition="left"
              onClick={() => handleFilterChange('priority', filters?.priority === 'high' ? 'all' : 'high')}
            >
              High Priority
            </Button>
          </div>

          {/* Active Filter Count */}
          {activeFilterCount > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-secondary">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-primary hover:text-primary/80"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Advanced Filters Toggle */}
        <Button
          variant="outline"
          size="sm"
          iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}
          iconPosition="right"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          More Filters
        </Button>
      </div>
      {/* Advanced Filters Panel */}
      {isExpanded && (
        <div className="border-t border-border p-4 bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Notebook Filter */}
            <Select
              label="Notebook"
              options={notebookOptions}
              value={filters?.notebook || 'all'}
              onChange={(value) => handleFilterChange('notebook', value)}
            />

            {/* Priority Filter */}
            <Select
              label="Priority"
              options={priorityOptions}
              value={filters?.priority || 'all'}
              onChange={(value) => handleFilterChange('priority', value)}
            />

            {/* Status Filter */}
            <Select
              label="Status"
              options={statusOptions}
              value={filters?.status || 'all'}
              onChange={(value) => handleFilterChange('status', value)}
            />

            {/* Due Date Filter */}
            <Select
              label="Due Date"
              options={dueDateOptions}
              value={filters?.dueDate || 'all'}
              onChange={(value) => handleFilterChange('dueDate', value)}
            />

            {/* Sort By */}
            <Select
              label="Sort By"
              options={sortOptions}
              value={filters?.sortBy || 'dueDate'}
              onChange={(value) => handleFilterChange('sortBy', value)}
            />
          </div>

          {/* Additional Options */}
          <div className="flex flex-wrap items-center gap-6">
            <Checkbox
              label="Show completed tasks"
              checked={filters?.showCompleted !== false}
              onChange={(e) => handleFilterChange('showCompleted', e?.target?.checked)}
            />
            <Checkbox
              label="Show archived tasks"
              checked={filters?.showArchived === true}
              onChange={(e) => handleFilterChange('showArchived', e?.target?.checked)}
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                label="Sort descending"
                checked={filters?.sortOrder === 'desc'}
                onChange={(e) => handleFilterChange('sortOrder', e?.target?.checked ? 'desc' : 'asc')}
              />
            </div>
          </div>

          {/* Custom Date Range */}
          {filters?.dueDate === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">From Date</label>
                <input
                  type="date"
                  value={filters?.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e?.target?.value)}
                  className="w-full p-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">To Date</label>
                <input
                  type="date"
                  value={filters?.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e?.target?.value)}
                  className="w-full p-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskFilters;