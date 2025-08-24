import React, { useState, useMemo } from 'react';
import { useBulkActions } from '../hooks/useBulkOperations';
import type { BulkAction, BulkActionGroup } from '../types';

/**
 * BulkActionToolbar Component - Main toolbar for bulk operations
 * 
 * Features:
 * - Displays available actions based on current selection
 * - Groups actions for better organization
 * - Confirmation dialogs for destructive actions
 * - Keyboard shortcuts display
 * - Responsive layout with collapsible groups
 * - Progress indication during execution
 */

interface BulkActionToolbarProps {
  className?: string;
  position?: 'top' | 'bottom' | 'floating';
  showWhenEmpty?: boolean;
  compactMode?: boolean;
  maxActions?: number;
}

export const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
  className = '',
  position = 'top',
  showWhenEmpty = false,
  compactMode = false,
  maxActions = 8
}) => {
  const {
    availableActions,
    actionsByGroup,
    executeAction,
    canExecuteAction,
    isProcessing,
    selectedItems,
    selectedCount,
    hasSelection
  } = useBulkActions();
  
  const [showConfirmation, setShowConfirmation] = useState<BulkAction | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['primary']));
  
  // Don't render if no selection and not configured to show when empty
  if (!hasSelection && !showWhenEmpty) {
    return null;
  }
  
  // Group actions by priority and visibility
  const groupedActions = useMemo(() => {
    const groups = new Map<string, BulkAction[]>();
    
    availableActions.forEach(action => {
      const groupId = action.groupId || 'default';
      if (!groups.has(groupId)) {
        groups.set(groupId, []);
      }
      groups.get(groupId)!.push(action);
    });
    
    // Sort actions within each group by priority
    groups.forEach(actions => {
      actions.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    });
    
    return groups;
  }, [availableActions]);
  
  // Handle action execution
  const handleActionClick = async (action: BulkAction) => {
    if (!canExecuteAction(action.id)) return;
    
    // Show confirmation for destructive actions
    if (action.requiresConfirmation) {
      setShowConfirmation(action);
      return;
    }
    
    try {
      await executeAction(action.id);
    } catch (error) {
      console.error('Failed to execute bulk action:', error);
    }
  };
  
  // Confirm and execute action
  const handleConfirmAction = async () => {
    if (!showConfirmation) return;
    
    try {
      await executeAction(showConfirmation.id);
      setShowConfirmation(null);
    } catch (error) {
      console.error('Failed to execute bulk action:', error);
    }
  };
  
  const handleCancelAction = () => {
    setShowConfirmation(null);
  };
  
  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };
  
  const getToolbarClasses = () => {
    const baseClasses = 'bg-white dark:bg-gray-800 border shadow-lg rounded-lg transition-all duration-200';
    const positionClasses = {
      top: 'border-b',
      bottom: 'border-t',
      floating: 'border shadow-xl'
    };
    
    return `${baseClasses} ${positionClasses[position]} ${className}`;
  };
  
  return (
    <>
      <div className={getToolbarClasses()} data-testid="bulk-action-toolbar">
        <div className="px-4 py-3">
          {/* Selection Summary */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
              </div>
              
              {/* Selection info */}
              {selectedCount > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedItems[0]?.type && (
                    <>• {selectedItems.length > 1 ? 'Multiple types' : selectedItems[0].type}</>
                  )}
                </div>
              )}
            </div>
            
            {/* Processing indicator */}
            {isProcessing && (
              <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                Processing...
              </div>
            )}
          </div>
          
          {/* Action Groups */}
          {groupedActions.size > 0 && (
            <div className="space-y-3">
              {Array.from(groupedActions.entries()).map(([groupId, actions]) => (
                <ActionGroup
                  key={groupId}
                  groupId={groupId}
                  actions={actions}
                  expanded={expandedGroups.has(groupId)}
                  onToggle={() => toggleGroup(groupId)}
                  onActionClick={handleActionClick}
                  canExecuteAction={canExecuteAction}
                  isProcessing={isProcessing}
                  compactMode={compactMode}
                  maxActions={maxActions}
                />
              ))}
            </div>
          )}
          
          {/* No actions available */}
          {groupedActions.size === 0 && hasSelection && (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
              No actions available for selected items
            </div>
          )}
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      {showConfirmation && (
        <ConfirmationDialog
          action={showConfirmation}
          selectedCount={selectedCount}
          onConfirm={handleConfirmAction}
          onCancel={handleCancelAction}
        />
      )}
    </>
  );
};

interface ActionGroupProps {
  groupId: string;
  actions: BulkAction[];
  expanded: boolean;
  onToggle: () => void;
  onActionClick: (action: BulkAction) => void;
  canExecuteAction: (actionId: string) => boolean;
  isProcessing: boolean;
  compactMode: boolean;
  maxActions: number;
}

const ActionGroup: React.FC<ActionGroupProps> = ({
  groupId,
  actions,
  expanded,
  onToggle,
  onActionClick,
  canExecuteAction,
  isProcessing,
  compactMode,
  maxActions
}) => {
  const visibleActions = expanded ? actions : actions.slice(0, maxActions);
  const hasMore = actions.length > maxActions;
  
  const getGroupLabel = (groupId: string) => {
    switch (groupId) {
      case 'primary': return 'Primary Actions';
      case 'status': return 'Status Changes';
      case 'organization': return 'Organization';
      case 'data': return 'Data Operations';
      case 'advanced': return 'Advanced';
      default: return 'Actions';
    }
  };
  
  return (
    <div className="action-group">
      {/* Group Header */}
      {actions.length > 3 && (
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            {getGroupLabel(groupId)}
          </h4>
          
          {hasMore && (
            <button
              onClick={onToggle}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              {expanded ? 'Show less' : `Show ${actions.length - maxActions} more`}
            </button>
          )}
        </div>
      )}
      
      {/* Actions */}
      <div className={`flex flex-wrap gap-2 ${compactMode ? 'gap-1' : 'gap-2'}`}>
        {visibleActions.map(action => (
          <ActionButton
            key={action.id}
            action={action}
            onClick={() => onActionClick(action)}
            disabled={!canExecuteAction(action.id) || isProcessing}
            compact={compactMode}
          />
        ))}
      </div>
    </div>
  );
};

interface ActionButtonProps {
  action: BulkAction;
  onClick: () => void;
  disabled: boolean;
  compact: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  action,
  onClick,
  disabled,
  compact
}) => {
  const getColorClasses = () => {
    const baseClasses = 'font-medium transition-colors duration-150';
    
    if (disabled) {
      return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500`;
    }
    
    switch (action.color) {
      case 'danger':
        return `${baseClasses} bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30`;
      case 'warning':
        return `${baseClasses} bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30`;
      case 'success':
        return `${baseClasses} bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30`;
      case 'primary':
        return `${baseClasses} bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600`;
    }
  };
  
  const sizeClasses = compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-1.5 rounded-md border-0
        ${getColorClasses()}
        ${sizeClasses}
      `}
      title={`${action.description}${action.shortcut ? ` (${action.shortcut.join('+')})` : ''}`}
      data-testid={`bulk-action-${action.id}`}
    >
      <span className="text-base">{action.icon}</span>
      {!compact && <span>{action.label}</span>}
      
      {action.shortcut && !compact && (
        <span className="ml-1 text-xs opacity-60">
          {action.shortcut.join('+')}
        </span>
      )}
    </button>
  );
};

interface ConfirmationDialogProps {
  action: BulkAction;
  selectedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  action,
  selectedCount,
  onConfirm,
  onCancel
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-xl
              ${action.color === 'danger' 
                ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
              }
            `}>
              {action.icon}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirm {action.label}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This action cannot be undone
              </p>
            </div>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Are you sure you want to {action.label.toLowerCase()} {selectedCount} {selectedCount === 1 ? 'item' : 'items'}?
          </p>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={onConfirm}
              className={`
                px-4 py-2 text-sm font-medium rounded-md transition-colors
                ${action.color === 'danger'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }
              `}
            >
              {action.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionToolbar;
