import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import ThoughtCard from './ThoughtCard';

const ThoughtGrid = ({ 
  thoughts, 
  selectedThoughts, 
  onThoughtSelect, 
  onThoughtEdit, 
  onThoughtDelete, 
  onThoughtMove,
  onBulkSelect,
  viewMode = 'grid',
  onViewModeChange,
  sortBy,
  onSortChange
}) => {
  const [draggedThought, setDraggedThought] = useState(null);
  const [selectAll, setSelectAll] = useState(false);

  const sortOptions = [
    { value: 'created-desc', label: 'Newest First' },
    { value: 'created-asc', label: 'Oldest First' },
    { value: 'modified-desc', label: 'Recently Modified' },
    { value: 'priority-desc', label: 'High Priority First' },
    { value: 'alphabetical', label: 'Alphabetical' }
  ];

  useEffect(() => {
    setSelectAll(thoughts?.length > 0 && selectedThoughts?.length === thoughts?.length);
  }, [thoughts?.length, selectedThoughts?.length]);

  const handleSelectAll = (checked) => {
    if (checked) {
      onBulkSelect(thoughts?.map(t => t?.id));
    } else {
      onBulkSelect([]);
    }
  };

  const handleDragStart = (e, thought) => {
    setDraggedThought(thought);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedThought(null);
  };

  const getGridClasses = () => {
    switch (viewMode) {
      case 'list':
        return 'grid grid-cols-1 gap-3';
      case 'compact':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3';
      case 'grid':
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';
    }
  };

  if (thoughts?.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="FileText" size={32} className="text-text-secondary" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No thoughts found</h3>
          <p className="text-text-secondary mb-6">
            Start capturing your thoughts or adjust your filters to see content.
          </p>
          <Button variant="default" iconName="Plus" iconPosition="left">
            Capture First Thought
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface/50">
        <div className="flex items-center space-x-4">
          {/* Select All */}
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectAll}
              onChange={(e) => handleSelectAll(e?.target?.checked)}
              indeterminate={selectedThoughts?.length > 0 && selectedThoughts?.length < thoughts?.length}
            />
            <span className="text-sm text-text-secondary">
              {selectedThoughts?.length > 0 
                ? `${selectedThoughts?.length} selected`
                : `${thoughts?.length} thoughts`
              }
            </span>
          </div>

          {/* Sort */}
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={onSortChange}
            placeholder="Sort by"
            className="w-48"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="px-3"
          >
            <Icon name="List" size={16} />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="px-3"
          >
            <Icon name="Grid3X3" size={16} />
          </Button>
          <Button
            variant={viewMode === 'compact' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('compact')}
            className="px-3"
          >
            <Icon name="LayoutGrid" size={16} />
          </Button>
        </div>
      </div>
      {/* Thoughts Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className={getGridClasses()}>
          {thoughts?.map((thought) => (
            <ThoughtCard
              key={thought?.id}
              thought={thought}
              isSelected={selectedThoughts?.includes(thought?.id)}
              onSelect={onThoughtSelect}
              onEdit={onThoughtEdit}
              onDelete={onThoughtDelete}
              onMove={onThoughtMove}
              onTagUpdate={() => {}}
              isDragging={draggedThought?.id === thought?.id}
              onDragStart={(e) => handleDragStart(e, thought)}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThoughtGrid;