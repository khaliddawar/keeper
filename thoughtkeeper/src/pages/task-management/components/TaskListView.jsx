import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const TaskListView = ({ tasks, onTaskUpdate, onTaskEdit, onTaskDelete, onTaskView, onBulkAction }) => {
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSelectTask = (taskId) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected?.has(taskId)) {
      newSelected?.delete(taskId);
    } else {
      newSelected?.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTasks?.size === tasks?.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(tasks.map(task => task.id)));
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedTasks = [...tasks]?.sort((a, b) => {
    let aValue = a?.[sortBy];
    let bValue = b?.[sortBy];

    if (sortBy === 'dueDate') {
      aValue = aValue ? new Date(aValue) : new Date('9999-12-31');
      bValue = bValue ? new Date(bValue) : new Date('9999-12-31');
    }

    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      aValue = priorityOrder?.[aValue] || 0;
      bValue = priorityOrder?.[bValue] || 0;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-error bg-error/10';
      case 'medium':
        return 'text-warning bg-warning/10';
      case 'low':
        return 'text-success bg-success/10';
      default:
        return 'text-text-secondary bg-muted';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success bg-success/10';
      case 'in-progress':
        return 'text-warning bg-warning/10';
      case 'overdue':
        return 'text-error bg-error/10';
      default:
        return 'text-text-secondary bg-muted';
    }
  };

  const formatDueDate = (date) => {
    if (!date) return 'No due date';
    const today = new Date();
    const dueDate = new Date(date);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return dueDate?.toLocaleDateString();
  };

  const SortButton = ({ field, children }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-text-secondary hover:text-foreground"
    >
      <span>{children}</span>
      {sortBy === field && (
        <Icon 
          name={sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
          size={14} 
        />
      )}
    </Button>
  );

  return (
    <div className="flex-1 bg-background">
      {/* Bulk Actions Bar */}
      {selectedTasks?.size > 0 && (
        <div className="bg-primary/10 border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-foreground">
                {selectedTasks?.size} task{selectedTasks?.size !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTasks(new Set())}
              >
                Clear selection
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                iconName="CheckSquare"
                iconPosition="left"
                onClick={() => onBulkAction('complete', Array.from(selectedTasks))}
              >
                Mark Complete
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="Archive"
                iconPosition="left"
                onClick={() => onBulkAction('archive', Array.from(selectedTasks))}
              >
                Archive
              </Button>
              <Button
                variant="destructive"
                size="sm"
                iconName="Trash2"
                iconPosition="left"
                onClick={() => onBulkAction('delete', Array.from(selectedTasks))}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Table Header */}
      <div className="bg-muted border-b border-border p-4">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-1">
            <Checkbox
              checked={selectedTasks?.size === tasks?.length && tasks?.length > 0}
              onChange={handleSelectAll}
              indeterminate={selectedTasks?.size > 0 && selectedTasks?.size < tasks?.length}
            />
          </div>
          <div className="col-span-4">
            <SortButton field="title">Task</SortButton>
          </div>
          <div className="col-span-2">
            <SortButton field="priority">Priority</SortButton>
          </div>
          <div className="col-span-2">
            <SortButton field="status">Status</SortButton>
          </div>
          <div className="col-span-2">
            <SortButton field="dueDate">Due Date</SortButton>
          </div>
          <div className="col-span-1">
            <span className="text-sm font-medium text-text-secondary">Actions</span>
          </div>
        </div>
      </div>
      {/* Task List */}
      <div className="divide-y divide-border">
        {sortedTasks?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Icon name="CheckSquare" size={64} className="text-text-secondary mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No tasks found</h3>
            <p className="text-text-secondary text-center max-w-md">
              Create your first task or adjust your filters to see tasks here.
            </p>
          </div>
        ) : (
          sortedTasks?.map((task) => (
            <div
              key={task?.id}
              className="grid grid-cols-12 gap-4 items-center p-4 hover:bg-muted/50 transition-colors"
            >
              {/* Checkbox */}
              <div className="col-span-1">
                <Checkbox
                  checked={selectedTasks?.has(task?.id)}
                  onChange={() => handleSelectTask(task?.id)}
                />
              </div>

              {/* Task Info */}
              <div className="col-span-4">
                <div className="space-y-1">
                  <h4 
                    className="text-sm font-medium text-foreground cursor-pointer hover:text-primary line-clamp-1"
                    onClick={() => onTaskView(task)}
                  >
                    {task?.title}
                  </h4>
                  {task?.description && (
                    <p className="text-xs text-text-secondary line-clamp-1">
                      {task?.description}
                    </p>
                  )}
                  {task?.tags && task?.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {task?.tags?.slice(0, 2)?.map((tag) => (
                        <span 
                          key={tag}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-muted text-text-secondary"
                        >
                          #{tag}
                        </span>
                      ))}
                      {task?.tags?.length > 2 && (
                        <span className="text-xs text-text-secondary">+{task?.tags?.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Priority */}
              <div className="col-span-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task?.priority)}`}>
                  {task?.priority}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task?.status)}`}>
                  {task?.status?.replace('-', ' ')}
                </span>
              </div>

              {/* Due Date */}
              <div className="col-span-2">
                <span className={`text-sm ${
                  task?.dueDate && new Date(task.dueDate) < new Date() && task?.status !== 'completed'
                    ? 'text-error font-medium' :'text-text-secondary'
                }`}>
                  {formatDueDate(task?.dueDate)}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-1">
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onTaskEdit(task)}
                    className="w-6 h-6"
                  >
                    <Icon name="Edit2" size={12} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onTaskDelete(task?.id)}
                    className="w-6 h-6 text-error hover:text-error"
                  >
                    <Icon name="Trash2" size={12} />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskListView;