import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TaskCard = ({ task, onStatusChange, onEdit, onDelete, onViewDetails }) => {
  const [isDragging, setIsDragging] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-error bg-error/5';
      case 'medium':
        return 'border-l-warning bg-warning/5';
      case 'low':
        return 'border-l-success bg-success/5';
      default:
        return 'border-l-border bg-card';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return 'AlertTriangle';
      case 'medium':
        return 'Clock';
      case 'low':
        return 'CheckCircle';
      default:
        return 'Circle';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'in-progress':
        return 'text-warning';
      case 'overdue':
        return 'text-error';
      default:
        return 'text-text-secondary';
    }
  };

  const formatDueDate = (date) => {
    const today = new Date();
    const dueDate = new Date(date);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return dueDate?.toLocaleDateString();
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    e?.dataTransfer?.setData('text/plain', JSON.stringify(task));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`
        ${getPriorityColor(task?.priority)}
        border-l-4 bg-card border border-border rounded-lg p-4 mb-3 cursor-move
        transition-all duration-200 hover:shadow-elevated
        ${isDragging ? 'opacity-50 rotate-2' : ''}
      `}
    >
      {/* Task Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon 
            name={getPriorityIcon(task?.priority)} 
            size={16} 
            className={`${
              task?.priority === 'high' ? 'text-error' :
              task?.priority === 'medium' ? 'text-warning' :
              task?.priority === 'low' ? 'text-success' : 'text-text-secondary'
            }`}
          />
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
            {task?.priority} Priority
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(task)}
            className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Icon name="Edit2" size={12} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(task?.id)}
            className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity text-error hover:text-error"
          >
            <Icon name="Trash2" size={12} />
          </Button>
        </div>
      </div>
      {/* Task Title */}
      <h3 
        className="text-sm font-medium text-foreground mb-2 line-clamp-2 cursor-pointer hover:text-primary"
        onClick={() => onViewDetails(task)}
      >
        {task?.title}
      </h3>
      {/* Task Description */}
      {task?.description && (
        <p className="text-xs text-text-secondary mb-3 line-clamp-2">
          {task?.description}
        </p>
      )}
      {/* Progress Bar */}
      {task?.progress !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-secondary">Progress</span>
            <span className="text-xs font-medium text-foreground">{task?.progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${task?.progress}%` }}
            />
          </div>
        </div>
      )}
      {/* Tags */}
      {task?.tags && task?.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task?.tags?.slice(0, 3)?.map((tag) => (
            <span 
              key={tag}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-text-secondary"
            >
              #{tag}
            </span>
          ))}
          {task?.tags?.length > 3 && (
            <span className="text-xs text-text-secondary">+{task?.tags?.length - 3} more</span>
          )}
        </div>
      )}
      {/* Task Footer */}
      <div className="flex items-center justify-between">
        {/* Due Date */}
        {task?.dueDate && (
          <div className="flex items-center space-x-1">
            <Icon name="Calendar" size={12} className="text-text-secondary" />
            <span className={`text-xs ${getStatusColor(task?.status)}`}>
              {formatDueDate(task?.dueDate)}
            </span>
          </div>
        )}

        {/* Original Thought Link */}
        {task?.originalThought && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(task)}
            className="text-xs text-primary hover:text-primary/80 p-1 h-auto"
          >
            <Icon name="Link" size={12} className="mr-1" />
            View thought
          </Button>
        )}
      </div>
      {/* Time Estimate */}
      {task?.timeEstimate && (
        <div className="flex items-center space-x-1 mt-2 pt-2 border-t border-border">
          <Icon name="Clock" size={12} className="text-text-secondary" />
          <span className="text-xs text-text-secondary">
            Est. {task?.timeEstimate}
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskCard;