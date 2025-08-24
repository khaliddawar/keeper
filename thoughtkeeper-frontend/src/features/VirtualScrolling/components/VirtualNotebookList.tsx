import React, { useMemo, useCallback } from 'react';
import { VirtualList } from './VirtualList';
import type { VirtualItemProps, VirtualizedNotebookList } from '../types';
import type { Notebook } from '../../../types/notebook';

/**
 * Virtual Notebook List Component
 * Virtualized notebook list with built-in notebook item rendering
 */
interface VirtualNotebookListProps extends VirtualizedNotebookList {
  height?: number | string;
  className?: string;
  itemHeight?: number;
  enableSelection?: boolean;
  showDescription?: boolean;
  showTaskCount?: boolean;
  showTags?: boolean;
  showCollaborators?: boolean;
  emptyMessage?: string;
  onNotebookEdit?: (notebook: Notebook) => void;
  onNotebookDelete?: (notebookId: string) => void;
  onTagClick?: (tag: string) => void;
}

export const VirtualNotebookList: React.FC<VirtualNotebookListProps> = ({
  notebooks,
  onNotebookClick,
  selectedNotebookIds = new Set(),
  onNotebookSelect,
  height = 400,
  className = '',
  itemHeight = 120,
  enableSelection = false,
  showDescription = true,
  showTaskCount = true,
  showTags = true,
  showCollaborators = true,
  emptyMessage = 'No notebooks found',
  onNotebookEdit,
  onNotebookDelete,
  onTagClick
}) => {
  /**
   * Calculate dynamic item height based on notebook content
   */
  const calculateItemHeight = useCallback((index: number, notebook: Notebook): number => {
    let baseHeight = 80; // Base height for title and basic info
    
    // Add height for description
    if (showDescription && notebook.description && notebook.description.length > 0) {
      const descriptionLines = Math.ceil(notebook.description.length / 80);
      baseHeight += Math.min(descriptionLines * 16, 48); // Max 3 lines
    }
    
    // Add height for tags
    if (showTags && notebook.tags && notebook.tags.length > 0) {
      baseHeight += 28;
    }
    
    // Add height for collaborators
    if (showCollaborators && notebook.collaborators && notebook.collaborators.length > 0) {
      baseHeight += 24;
    }
    
    return Math.max(baseHeight, 100); // Minimum height
  }, [showDescription, showTags, showCollaborators]);

  /**
   * Render individual notebook item
   */
  const renderNotebookItem = useCallback(({ index, item: notebook, style, isVisible, isScrolling }: VirtualItemProps<Notebook>) => {
    const isSelected = selectedNotebookIds.has(notebook.id);
    const isArchived = notebook.archived;
    const isFavorite = notebook.pinned;
    
    const handleNotebookClick = () => {
      onNotebookClick(notebook);
    };
    
    const handleSelectClick = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      onNotebookSelect?.(notebook.id, !isSelected);
    };
    
    const handleEditClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onNotebookEdit?.(notebook);
    };
    
    const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onNotebookDelete?.(notebook.id);
    };
    
    const handleTagClick = (e: React.MouseEvent, tag: string) => {
      e.stopPropagation();
      onTagClick?.(tag);
    };
    
    return (
      <div
        style={style}
        className={`virtual-notebook-item ${className} ${isSelected ? 'selected' : ''} ${isScrolling ? 'scrolling' : ''}`}
      >
        <div
          className={`notebook-card p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg group ${
            isArchived ? 'bg-gray-50 dark:bg-gray-800 opacity-60' : 'bg-white dark:bg-gray-700'
          } ${
            isSelected ? 'ring-2 ring-blue-500' : 'border-gray-200 dark:border-gray-600'
          } hover:border-gray-300 dark:hover:border-gray-500`}
          onClick={handleNotebookClick}
        >
          <div className="flex items-start space-x-4">
            {/* Notebook color indicator */}
            <div
              className={`w-4 h-4 rounded-full mt-1 flex-shrink-0 bg-${notebook.color || 'blue'}-500`}
              style={{
                backgroundColor: notebook.color ? `var(--color-${notebook.color}-500)` : '#3B82F6'
              }}
            />
            
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
            
            {/* Notebook content */}
            <div className="flex-1 min-w-0">
              {/* Header with title and actions */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <h3 className={`font-semibold text-lg text-gray-900 dark:text-gray-100 truncate ${
                    isArchived ? 'line-through text-gray-500' : ''
                  }`}>
                    {notebook.title}
                  </h3>
                  
                  {isFavorite && (
                    <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  )}
                  
                  {isArchived && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full">
                      Archived
                    </span>
                  )}
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onNotebookEdit && (
                    <button
                      onClick={handleEditClick}
                      className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      title="Edit notebook"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                  
                  {onNotebookDelete && (
                    <button
                      onClick={handleDeleteClick}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Delete notebook"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Description */}
              {showDescription && notebook.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                  {notebook.description}
                </p>
              )}
              
              {/* Tags */}
              {showTags && notebook.tags && notebook.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {notebook.tags.slice(0, 6).map((tag) => (
                    <span
                      key={tag}
                      onClick={(e) => handleTagClick(e, tag)}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                  {notebook.tags.length > 6 && (
                    <span className="text-xs text-gray-500 px-2 py-1">+{notebook.tags.length - 6} more</span>
                  )}
                </div>
              )}
              
              {/* Footer with stats and collaborators */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  {showTaskCount && (
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h2m0-13a2 2 0 012-2h11a2 2 0 012 2v11a2 2 0 01-2 2h-2m-9-4h9" />
                      </svg>
                      <span>{notebook.taskCount || 0} tasks</span>
                    </div>
                  )}
                  
                  <span>
                    Updated: {new Date(notebook.updatedAt).toLocaleDateString()}
                  </span>
                  
                  <span>
                    Created: {new Date(notebook.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Collaborators */}
                {showCollaborators && notebook.collaborators && notebook.collaborators.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <div className="flex -space-x-1">
                      {notebook.collaborators.slice(0, 3).map((collaborator, idx) => (
                        <div
                          key={`${collaborator.userId}-${idx}`}
                          className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white dark:border-gray-700"
                          title={`${collaborator.userId} (${collaborator.role})`}
                        >
                          {collaborator.userId.charAt(0).toUpperCase()}
                        </div>
                      ))}
                    </div>
                    {notebook.collaborators.length > 3 && (
                      <span className="text-xs text-gray-500 ml-1">
                        +{notebook.collaborators.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [
    selectedNotebookIds, onNotebookClick, onNotebookSelect, onNotebookEdit,
    onNotebookDelete, onTagClick, enableSelection, showDescription, showTaskCount,
    showTags, showCollaborators, className
  ]);

  // Empty state
  if (notebooks.length === 0) {
    return (
      <div 
        className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10.5v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg font-medium">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <VirtualList
      items={notebooks}
      height={height}
      itemHeight={calculateItemHeight}
      renderItem={renderNotebookItem}
      className={`virtual-notebook-list ${className}`}
      overscanCount={2}
      enableSmoothScrolling={true}
      maintainScrollPosition={true}
    />
  );
};

/**
 * Notebook category indicator component
 */
const CategoryIndicator: React.FC<{ category: string }> = ({ category }) => {
  const config: Record<string, { color: string; icon: string; label: string }> = {
    personal: { color: 'bg-blue-500', icon: '👤', label: 'Personal' },
    work: { color: 'bg-green-500', icon: '💼', label: 'Work' },
    project: { color: 'bg-purple-500', icon: '🚀', label: 'Project' },
    reference: { color: 'bg-gray-500', icon: '📚', label: 'Reference' },
    archive: { color: 'bg-yellow-500', icon: '📦', label: 'Archive' }
  };
  
  const { color, icon, label } = config[category] || config.personal;
  
  return (
    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-white text-xs ${color}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
};

/**
 * Notebook stats component
 */
const NotebookStats: React.FC<{ notebook: Notebook }> = ({ notebook }) => {
  const taskCount = notebook.taskCount || 0;
  const collaboratorCount = notebook.collaborators?.length || 0;
  const tagCount = notebook.tags?.length || 0;
  
  return (
    <div className="flex items-center space-x-3 text-xs text-gray-500">
      {taskCount > 0 && (
        <div className="flex items-center space-x-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h2m0-13a2 2 0 012-2h11a2 2 0 012 2v11a2 2 0 01-2 2h-2m-9-4h9" />
          </svg>
          <span>{taskCount} tasks</span>
        </div>
      )}
      
      {collaboratorCount > 0 && (
        <div className="flex items-center space-x-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <span>{collaboratorCount} collaborators</span>
        </div>
      )}
      
      {tagCount > 0 && (
        <div className="flex items-center space-x-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span>{tagCount} tags</span>
        </div>
      )}
    </div>
  );
};

export default VirtualNotebookList;
