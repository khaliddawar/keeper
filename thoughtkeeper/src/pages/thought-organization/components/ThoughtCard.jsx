import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const ThoughtCard = ({ 
  thought, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete, 
  onMove, 
  onTagUpdate,
  isDragging = false 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(thought?.content);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date?.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 168) { // 7 days
      return date?.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date?.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-error';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-success';
      default:
        return 'text-text-secondary';
    }
  };

  const handleSaveEdit = () => {
    if (editedContent?.trim() !== thought?.content) {
      onEdit(thought?.id, { content: editedContent?.trim() });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(thought?.content);
    setIsEditing(false);
  };

  return (
    <div
      className={`group relative bg-card border border-border rounded-lg p-4 transition-all duration-200 hover:shadow-soft ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      } ${isDragging ? 'opacity-50 scale-95' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      draggable
      onDragStart={(e) => {
        e?.dataTransfer?.setData('text/plain', thought?.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <Checkbox
          checked={isSelected}
          onChange={(e) => onSelect(thought?.id, e?.target?.checked)}
          size="sm"
        />
      </div>
      {/* Quick Actions */}
      {showActions && !isEditing && (
        <div className="absolute top-3 right-3 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
            className="w-6 h-6"
          >
            <Icon name="Edit" size={12} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(thought?.id)}
            className="w-6 h-6 text-destructive hover:text-destructive"
          >
            <Icon name="Trash2" size={12} />
          </Button>
        </div>
      )}
      {/* Content */}
      <div className="mt-2">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e?.target?.value)}
              className="w-full p-2 bg-input border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              rows={4}
              autoFocus
            />
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveEdit}
                disabled={!editedContent?.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-foreground leading-relaxed line-clamp-4 mb-3">
              {thought?.content}
            </p>

            {/* Tags */}
            {thought?.tags && thought?.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {thought?.tags?.slice(0, 3)?.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 bg-muted text-text-secondary text-xs rounded-full hover:bg-primary/10 hover:text-primary transition-micro cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
                {thought?.tags?.length > 3 && (
                  <span className="text-xs text-text-secondary px-2 py-1">
                    +{thought?.tags?.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <div className="flex items-center space-x-3">
                <span>{formatDate(thought?.createdAt)}</span>
                {thought?.priority && (
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${
                      thought?.priority === 'high' ? 'bg-error' :
                      thought?.priority === 'medium' ? 'bg-warning' : 'bg-success'
                    }`} />
                    <span className={getPriorityColor(thought?.priority)}>
                      {thought?.priority}
                    </span>
                  </div>
                )}
              </div>
              
              {thought?.isActionable && (
                <div className="flex items-center space-x-1 text-primary">
                  <Icon name="CheckSquare" size={12} />
                  <span>Task</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ThoughtCard;