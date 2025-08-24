import React, { useState } from 'react';

import Button from '../../../components/ui/Button';

const ThoughtCard = ({ thought, onEdit, onConvertToTask, onArchive, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date?.toLocaleDateString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-error';
      case 'medium':
        return 'border-l-warning';
      case 'low':
        return 'border-l-success';
      default:
        return 'border-l-border';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'work': 'bg-blue-100 text-blue-800',
      'personal': 'bg-green-100 text-green-800',
      'ideas': 'bg-purple-100 text-purple-800',
      'meeting': 'bg-orange-100 text-orange-800',
      'project': 'bg-indigo-100 text-indigo-800'
    };
    return colors?.[category] || 'bg-gray-100 text-gray-800';
  };

  const truncateText = (text, maxLength = 150) => {
    if (text?.length <= maxLength) return text;
    return text?.substring(0, maxLength) + '...';
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-4 hover:shadow-elevated transition-micro border-l-4 ${getPriorityColor(thought?.priority)}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {thought?.category && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(thought?.category)}`}>
              {thought?.category}
            </span>
          )}
          {thought?.priority && (
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                thought?.priority === 'high' ? 'bg-error' : 
                thought?.priority === 'medium' ? 'bg-warning' : 'bg-success'
              }`} />
              <span className="text-xs text-text-secondary capitalize">{thought?.priority}</span>
            </div>
          )}
        </div>
        <span className="text-xs text-text-secondary">{formatDate(thought?.createdAt)}</span>
      </div>
      {/* Content */}
      <div className="mb-3">
        <p className="text-foreground leading-relaxed">
          {isExpanded ? thought?.content : truncateText(thought?.content)}
        </p>
        {thought?.content?.length > 150 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary text-sm hover:underline mt-1"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
      {/* Tags */}
      {thought?.tags && thought?.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {thought?.tags?.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-muted text-text-secondary text-xs rounded-md hover:bg-secondary hover:text-secondary-foreground transition-micro cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            iconName="Edit"
            iconPosition="left"
            onClick={() => onEdit(thought)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName="CheckSquare"
            iconPosition="left"
            onClick={() => onConvertToTask(thought)}
          >
            To Task
          </Button>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            iconName="Archive"
            onClick={() => onArchive(thought)}
          />
          <Button
            variant="ghost"
            size="icon"
            iconName="Trash2"
            onClick={() => onDelete(thought)}
          />
        </div>
      </div>
    </div>
  );
};

export default ThoughtCard;