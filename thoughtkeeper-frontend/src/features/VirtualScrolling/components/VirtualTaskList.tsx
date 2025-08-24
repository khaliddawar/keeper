import React, { useMemo, useCallback } from 'react';
import { VirtualList } from './VirtualList';
import type { VirtualItemProps, VirtualizedTaskList } from '../types';
import type { Task, TaskStatus, TaskPriority } from '../../../types/task';

/**
 * Virtual Task List Component
 * Virtualized task list with built-in task item rendering
 */
interface VirtualTaskListProps extends VirtualizedTaskList {
  height?: number | string;
  className?: string;
  itemHeight?: number;
  enableSelection?: boolean;
  showSubtasks?: boolean;
  showPriority?: boolean;
  showDueDate?: boolean;
  showTags?: boolean;
  emptyMessage?: string;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onTagClick?: (tag: string) => void;
}

export const VirtualTaskList: React.FC<VirtualTaskListProps> = ({
  tasks,
  onTaskClick,
  onTaskComplete,
  selectedTaskIds = new Set(),
  onTaskSelect,
  height = 400,
  className = '',
  itemHeight = 80,
  enableSelection = false,
  showSubtasks = true,
  showPriority = true,
  showDueDate = true,
  showTags = true,
  emptyMessage = 'No tasks found',
  onTaskEdit,
  onTaskDelete,
  onTagClick
}) => {
  /**
   * Calculate dynamic item height based on task content
   */
  const calculateItemHeight = useCallback((index: number, task: Task): number => {
    let baseHeight = 60; // Base height for title and basic info
    
    // Add height for description
    if (task.description && task.description.length > 0) {
      const descriptionLines = Math.ceil(task.description.length / 60);
      baseHeight += Math.min(descriptionLines * 16, 48); // Max 3 lines
    }
    
    // Add height for tags
    if (showTags && task.tags && task.tags.length > 0) {
      baseHeight += 28;
    }
    
    // Add height for subtasks
    if (showSubtasks && task.subtasks && task.subtasks.length > 0) {
      baseHeight += Math.min(task.subtasks.length * 20, 60); // Max 3 subtasks shown
    }
    
    // Add height for due date and priority
    if ((showDueDate && task.dueDate) || (showPriority && task.priority !== 'medium')) {
      baseHeight += 20;
    }
    
    return Math.max(baseHeight, 60); // Minimum height
  }, [showTags, showSubtasks, showDueDate, showPriority]);

  /**
   * Render individual task item
   */
  const renderTaskItem = useCallback(({ index, item: task, style, isVisible, isScrolling }: VirtualItemProps<Task>) => {
    const isSelected = selectedTaskIds.has(task.id);
    const isPending = task.status === 'pending';
    const isCompleted = task.status === 'completed';
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;
    
    const handleTaskClick = () => {
      onTaskClick(task);
    };
    
    const handleCompleteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onTaskComplete(task.id);
    };
    
    const handleSelectClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onTaskSelect?.(task.id, !isSelected);
    };
    
    const handleEditClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onTaskEdit?.(task);
    };
    
    const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onTaskDelete?.(task.id);
    };
    
    const handleTagClick = (e: React.MouseEvent, tag: string) => {
      e.stopPropagation();
      onTagClick?.(tag);
    };
    
    return (
      <div
        style={style}
        className={`virtual-task-item ${className} ${isSelected ? 'selected' : ''} ${isScrolling ? 'scrolling' : ''}`}
      >
        <div
          className={`task-card p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
            isCompleted ? 'bg-gray-50 dark:bg-gray-800 opacity-75' : 'bg-white dark:bg-gray-700'
          } ${
            isOverdue ? 'border-red-300 dark:border-red-600' : 'border-gray-200 dark:border-gray-600'
          } ${
            isSelected ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={handleTaskClick}
        >
          <div className="flex items-start space-x-3">
            {/* Checkbox for completion */}
            <button
              onClick={handleCompleteClick}
              className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                isCompleted
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
              }`}
            >
              {isCompleted && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            
            {/* Selection checkbox */}
            {enableSelection && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={handleSelectClick}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            
            {/* Task content */}
            <div className="flex-1 min-w-0">
              {/* Title and priority */}
              <div className="flex items-center space-x-2 mb-1">
                <h3 className={`font-medium text-gray-900 dark:text-gray-100 truncate ${
                  isCompleted ? 'line-through text-gray-500' : ''
                }`}>
                  {task.title}
                </h3>
                
                {showPriority && task.priority !== 'medium' && (
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    task.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    task.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    task.priority === 'low' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {task.priority}
                  </span>
                )}
                
                {isOverdue && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
                    Overdue
                  </span>
                )}
              </div>
              
              {/* Description */}
              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                  {task.description}
                </p>
              )}
              
              {/* Tags */}
              {showTags && task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {task.tags.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      onClick={(e) => handleTagClick(e, tag)}
                      className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      #{tag}
                    </span>
                  ))}
                  {task.tags.length > 5 && (
                    <span className="text-xs text-gray-500">+{task.tags.length - 5} more</span>
                  )}
                </div>
              )}
              
              {/* Subtasks preview */}
              {showSubtasks && task.subtasks && task.subtasks.length > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <span className="font-medium">{task.subtasks.filter(st => st.completed).length}</span>
                  <span> / </span>
                  <span>{task.subtasks.length}</span>
                  <span> subtasks completed</span>
                  
                  {/* Subtask progress bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{
                        width: `${(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}%`
                      }}
                    />
                  </div>
                </div>
              )}
              
              {/* Footer with due date and actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                  {showDueDate && task.dueDate && (
                    <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  
                  <span>
                    Updated: {new Date(task.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onTaskEdit && (
                    <button
                      onClick={handleEditClick}
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Edit task"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                  
                  {onTaskDelete && (
                    <button
                      onClick={handleDeleteClick}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete task"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [
    selectedTaskIds, onTaskClick, onTaskComplete, onTaskSelect, onTaskEdit, 
    onTaskDelete, onTagClick, enableSelection, showSubtasks, showPriority, 
    showDueDate, showTags, className
  ]);

  // Empty state
  if (tasks.length === 0) {
    return (
      <div 
        className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h2m0-13a2 2 0 012-2h11a2 2 0 012 2v11a2 2 0 01-2 2h-2m-9-4h9" />
          </svg>
          <p className="text-lg font-medium">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <VirtualList
      items={tasks}
      height={height}
      itemHeight={calculateItemHeight}
      renderItem={renderTaskItem}
      className={`virtual-task-list ${className}`}
      overscanCount={3}
      enableSmoothScrolling={true}
      maintainScrollPosition={true}
    />
  );
};

/**
 * Priority indicator component
 */
const PriorityIndicator: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  const config = {
    urgent: { color: 'bg-red-500', label: 'Urgent', icon: '🔥' },
    high: { color: 'bg-orange-500', label: 'High', icon: '⬆️' },
    medium: { color: 'bg-blue-500', label: 'Medium', icon: '➡️' },
    low: { color: 'bg-gray-500', label: 'Low', icon: '⬇️' }
  };
  
  const { color, label, icon } = config[priority];
  
  return (
    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-white text-xs ${color}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
};

/**
 * Status indicator component
 */
const StatusIndicator: React.FC<{ status: TaskStatus }> = ({ status }) => {
  const config = {
    pending: { color: 'bg-gray-500', label: 'Pending', icon: '⏳' },
    in_progress: { color: 'bg-blue-500', label: 'In Progress', icon: '🔄' },
    completed: { color: 'bg-green-500', label: 'Completed', icon: '✅' },
    cancelled: { color: 'bg-red-500', label: 'Cancelled', icon: '❌' }
  };
  
  const { color, label, icon } = config[status];
  
  return (
    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-white text-xs ${color}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
};

export default VirtualTaskList;
