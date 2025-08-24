import { useCallback, useEffect, useMemo } from 'react';
import { useBulkOperationsContext } from '../BulkOperationsProvider';
import type { UseBulkOperationsReturn, SelectionItem, BulkAction } from '../types';

/**
 * useBulkOperations Hook - Main interface for bulk operations
 * 
 * Provides easy-to-use functions for selection management and bulk actions
 * with performance optimizations and accessibility support.
 */

export const useBulkOperations = (): UseBulkOperationsReturn => {
  const context = useBulkOperationsContext();
  
  // Memoized values for performance
  const selectedItems = useMemo(() => context.getSelectedItems(), [context]);
  
  const availableActions = useMemo(() => 
    context.getAvailableActions(), 
    [context, selectedItems] // Re-compute when selection changes
  );
  
  // Selection helpers
  const getSelectionProps = useCallback((itemId: string) => {
    const item = context.items.get(itemId);
    const isSelected = context.selectedIds.has(itemId);
    const isSelectable = item?.selectable ?? false;
    
    return {
      'data-item-id': itemId,
      'data-selectable': isSelectable,
      'data-selected': isSelected,
      'aria-selected': isSelected,
      role: 'option',
      tabIndex: isSelectable ? 0 : -1,
      
      // Event handlers
      onClick: (event: React.MouseEvent) => {
        if (!isSelectable) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        const isCtrlOrCmd = event.ctrlKey || event.metaKey;
        const isShift = event.shiftKey;
        
        if (context.config.selection.mode === 'single') {
          // Single selection mode
          if (!isSelected) {
            context.deselectAll();
            context.selectItem(itemId);
          }
        } else if (isShift && context.lastSelectedId && context.config.selection.mode === 'range') {
          // Range selection
          context.selectRange(context.lastSelectedId, itemId);
        } else if (isCtrlOrCmd || context.config.selection.mode === 'multiple') {
          // Toggle selection
          context.toggleItem(itemId);
        } else {
          // Default behavior - select this item only
          context.deselectAll();
          context.selectItem(itemId);
        }
      },
      
      onKeyDown: (event: React.KeyboardEvent) => {
        if (!isSelectable) return;
        
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          event.stopPropagation();
          context.toggleItem(itemId);
        }
      }
    };
  }, [context]);
  
  const isSelected = useCallback((itemId: string) => {
    return context.selectedIds.has(itemId);
  }, [context.selectedIds]);
  
  const isSelectable = useCallback((itemId: string) => {
    const item = context.items.get(itemId);
    return item?.selectable ?? false;
  }, [context.items]);
  
  return {
    // State
    selectedItems,
    selectedCount: context.selectedCount,
    totalCount: context.totalCount,
    isProcessing: context.isProcessing,
    
    // Selection methods
    selectItem: context.selectItem,
    deselectItem: context.deselectItem,
    toggleItem: context.toggleItem,
    selectAll: context.selectAll,
    deselectAll: context.deselectAll,
    invertSelection: context.invertSelection,
    
    // Actions
    availableActions,
    executeAction: context.executeAction,
    canExecuteAction: context.canExecuteAction,
    
    // UI helpers
    getSelectionProps,
    isSelected,
    isSelectable
  };
};

/**
 * useSelection Hook - Simplified selection management
 */
export const useSelection = () => {
  const context = useBulkOperationsContext();
  
  return {
    // Selection state
    selectedIds: context.selectedIds,
    selectedCount: context.selectedCount,
    totalCount: context.totalCount,
    selectionMode: context.selectionMode,
    
    // Selection actions
    selectItem: context.selectItem,
    deselectItem: context.deselectItem,
    toggleItem: context.toggleItem,
    selectRange: context.selectRange,
    selectAll: context.selectAll,
    deselectAll: context.deselectAll,
    invertSelection: context.invertSelection,
    
    // Utilities
    isSelected: (id: string) => context.selectedIds.has(id),
    isSelectable: (id: string) => context.items.get(id)?.selectable ?? false,
    getSelectionProps: (itemId: string) => ({
      'data-item-id': itemId,
      'data-selected': context.selectedIds.has(itemId),
      'aria-selected': context.selectedIds.has(itemId),
      onClick: () => context.toggleItem(itemId)
    })
  };
};

/**
 * useBulkActions Hook - Actions management only
 */
export const useBulkActions = () => {
  const context = useBulkOperationsContext();
  const selectedItems = useMemo(() => context.getSelectedItems(), [context]);
  
  return {
    // Available actions based on current selection
    availableActions: context.getAvailableActions(),
    actionsByGroup: context.getActionsByGroup(),
    
    // Execution
    executeAction: context.executeAction,
    canExecuteAction: context.canExecuteAction,
    
    // State
    isProcessing: context.isProcessing,
    lastAction: context.lastAction,
    lastResult: context.lastResult,
    
    // Selection context
    selectedItems,
    selectedCount: context.selectedCount,
    hasSelection: context.selectedCount > 0
  };
};

/**
 * useItemSelection Hook - Individual item selection management
 */
export const useItemSelection = (itemId: string, item: SelectionItem) => {
  const context = useBulkOperationsContext();
  
  // Register item on mount
  useEffect(() => {
    context.registerItem(item);
    return () => context.unregisterItem(itemId);
  }, [itemId, item, context]);
  
  // Update item when it changes
  useEffect(() => {
    context.updateItem(itemId, item);
  }, [itemId, item, context]);
  
  const isSelected = context.selectedIds.has(itemId);
  const isSelectable = item.selectable;
  
  return {
    isSelected,
    isSelectable,
    
    // Actions
    select: () => context.selectItem(itemId),
    deselect: () => context.deselectItem(itemId),
    toggle: () => context.toggleItem(itemId),
    
    // Props for easy integration
    checkboxProps: {
      checked: isSelected,
      disabled: !isSelectable,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();
        if (event.target.checked) {
          context.selectItem(itemId);
        } else {
          context.deselectItem(itemId);
        }
      }
    },
    
    itemProps: {
      'data-item-id': itemId,
      'data-selected': isSelected,
      'data-selectable': isSelectable,
      'aria-selected': isSelected,
      className: `
        ${isSelectable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
      `.trim(),
      onClick: (event: React.MouseEvent) => {
        if (!isSelectable) return;
        
        const isCtrlOrCmd = event.ctrlKey || event.metaKey;
        const isShift = event.shiftKey;
        
        if (isShift && context.lastSelectedId) {
          context.selectRange(context.lastSelectedId, itemId);
        } else if (isCtrlOrCmd) {
          context.toggleItem(itemId);
        } else {
          // Regular click - select only this item
          context.deselectAll();
          context.selectItem(itemId);
        }
      }
    }
  };
};

/**
 * useBulkActionRegistration Hook - Register bulk actions
 */
export const useBulkActionRegistration = (actions: BulkAction[]) => {
  const context = useBulkOperationsContext();
  
  useEffect(() => {
    // Register all actions
    actions.forEach(action => {
      context.registerAction(action);
    });
    
    // Cleanup on unmount
    return () => {
      actions.forEach(action => {
        context.unregisterAction(action.id);
      });
    };
  }, [actions, context]);
  
  return {
    registered: actions.length,
    registerAction: context.registerAction,
    unregisterAction: context.unregisterAction
  };
};
