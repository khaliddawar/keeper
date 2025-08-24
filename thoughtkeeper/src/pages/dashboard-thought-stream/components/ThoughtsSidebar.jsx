import React, { useState } from 'react';

import Button from '../../../components/ui/Button';

const ThoughtsSidebar = ({ thoughts = [], onFilterChange, activeFilters = {} }) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  // Extract unique tags from thoughts
  const allTags = [...new Set(thoughts.flatMap(thought => thought.tags || []))];
  
  // Extract unique categories
  const allCategories = [...new Set(thoughts.map(thought => thought.category).filter(Boolean))];

  // Calculate statistics
  const stats = {
    total: thoughts?.length,
    today: thoughts?.filter(t => {
      const today = new Date()?.toDateString();
      return new Date(t.createdAt)?.toDateString() === today;
    })?.length,
    thisWeek: thoughts?.filter(t => {
      const weekAgo = new Date();
      weekAgo?.setDate(weekAgo?.getDate() - 7);
      return new Date(t.createdAt) >= weekAgo;
    })?.length,
    archived: thoughts?.filter(t => t?.archived)?.length
  };

  const handleTagToggle = (tag) => {
    const newSelectedTags = selectedTags?.includes(tag)
      ? selectedTags?.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newSelectedTags);
    onFilterChange({ ...activeFilters, tags: newSelectedTags });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    onFilterChange({ ...activeFilters, category });
  };

  const handlePriorityChange = (priority) => {
    setSelectedPriority(priority);
    onFilterChange({ ...activeFilters, priority });
  };

  const clearAllFilters = () => {
    setSelectedTags([]);
    setSelectedCategory('');
    setSelectedPriority('');
    onFilterChange({});
  };

  return (
    <div className="w-full h-full bg-surface border-l border-border">
      <div className="p-6 space-y-6">
        {/* Statistics */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Statistics</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-foreground">{stats?.total}</div>
              <div className="text-xs text-text-secondary">Total</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-primary">{stats?.today}</div>
              <div className="text-xs text-text-secondary">Today</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-accent">{stats?.thisWeek}</div>
              <div className="text-xs text-text-secondary">This Week</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-text-secondary">{stats?.archived}</div>
              <div className="text-xs text-text-secondary">Archived</div>
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Quick Filters</h3>
          <div className="space-y-2">
            <Button
              variant={selectedCategory === '' ? 'default' : 'ghost'}
              size="sm"
              fullWidth
              onClick={() => handleCategoryChange('')}
            >
              All Thoughts
            </Button>
            <Button
              variant={selectedCategory === 'work' ? 'default' : 'ghost'}
              size="sm"
              fullWidth
              onClick={() => handleCategoryChange('work')}
            >
              Work
            </Button>
            <Button
              variant={selectedCategory === 'personal' ? 'default' : 'ghost'}
              size="sm"
              fullWidth
              onClick={() => handleCategoryChange('personal')}
            >
              Personal
            </Button>
            <Button
              variant={selectedCategory === 'ideas' ? 'default' : 'ghost'}
              size="sm"
              fullWidth
              onClick={() => handleCategoryChange('ideas')}
            >
              Ideas
            </Button>
          </div>
        </div>

        {/* Priority Filter */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Priority</h3>
          <div className="space-y-2">
            {['high', 'medium', 'low']?.map((priority) => (
              <button
                key={priority}
                onClick={() => handlePriorityChange(selectedPriority === priority ? '' : priority)}
                className={`w-full flex items-center space-x-2 p-2 rounded-lg text-sm transition-micro ${
                  selectedPriority === priority 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  priority === 'high' ? 'bg-error' : 
                  priority === 'medium' ? 'bg-warning' : 'bg-success'
                }`} />
                <span className="capitalize">{priority}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        {allTags?.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Tags</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {allTags?.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-micro ${
                    selectedTags?.includes(tag) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <span>#{tag}</span>
                  <span className="text-xs opacity-70">
                    {thoughts?.filter(t => t?.tags?.includes(tag))?.length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Clear Filters */}
        {(selectedTags?.length > 0 || selectedCategory || selectedPriority) && (
          <div className="pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={clearAllFilters}
              iconName="X"
              iconPosition="left"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThoughtsSidebar;