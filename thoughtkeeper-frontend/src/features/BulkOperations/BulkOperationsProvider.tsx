import React, { createContext, useContext, useReducer, useRef, useCallback, useEffect } from 'react';
import { useUI } from '../../hooks/useUI';
import type {
  BulkOperationsContextState,
  BulkOperationsConfig,
  SelectionState,
  SelectionItem,
  BulkAction,
  BulkActionGroup,
  BulkActionResult,
  SelectionMode,
  SelectionEvent,
  BulkActionEvent,
  DEFAULT_BULK_OPERATIONS_CONFIG
} from './types';

/**
 * Bulk Operations Provider - Central state management for bulk operations
 * 
 * Features:
 * - Multi-selection management with different modes
 * - Bulk action registration and execution
 * - Keyboard shortcut handling
 * - Performance optimizations for large datasets
 * - Event-driven architecture for extensibility
 * - Undo/redo support for bulk operations
 */

// Action types for the reducer
type BulkOperationsAction =
  | { type: 'REGISTER_ITEM'; payload: { item: SelectionItem } }
  | { type: 'UNREGISTER_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<SelectionItem> } }
  | { type: 'SELECT_ITEM'; payload: { id: string } }
  | { type: 'DESELECT_ITEM'; payload: { id: string } }
  | { type: 'SELECT_RANGE'; payload: { startId: string; endId: string; itemIds: string[] } }
  | { type: 'SELECT_ALL' }
  | { type: 'DESELECT_ALL' }
  | { type: 'INVERT_SELECTION' }
  | { type: 'SET_SELECTION_MODE'; payload: { mode: SelectionMode } }
  | { type: 'SET_PROCESSING'; payload: { isProcessing: boolean } }
  | { type: 'SET_LAST_ACTION'; payload: { action: BulkAction | null; result: BulkActionResult | null } };

// Initial selection state
const initialSelectionState: SelectionState = {
  items: new Map(),
  selectedIds: new Set(),
  selectionMode: 'multiple',
  lastSelectedId: null,
  rangeStartId: null,
  totalCount: 0,
  selectedCount: 0,
  selectableCount: 0
};

// Selection reducer
const selectionReducer = (state: SelectionState, action: BulkOperationsAction): SelectionState => {
  switch (action.type) {
    case 'REGISTER_ITEM': {
      const newItems = new Map(state.items);
      newItems.set(action.payload.item.id, action.payload.item);
      
      return {
        ...state,
        items: newItems,
        totalCount: newItems.size,
        selectableCount: Array.from(newItems.values()).filter(item => item.selectable).length
      };
    }
    
    case 'UNREGISTER_ITEM': {
      const newItems = new Map(state.items);
      const newSelectedIds = new Set(state.selectedIds);
      
      newItems.delete(action.payload.id);
      newSelectedIds.delete(action.payload.id);
      
      return {
        ...state,
        items: newItems,
        selectedIds: newSelectedIds,
        totalCount: newItems.size,
        selectedCount: newSelectedIds.size,
        selectableCount: Array.from(newItems.values()).filter(item => item.selectable).length
      };
    }
    
    case 'UPDATE_ITEM': {
      const newItems = new Map(state.items);
      const existingItem = newItems.get(action.payload.id);
      
      if (existingItem) {
        newItems.set(action.payload.id, { ...existingItem, ...action.payload.updates });
      }
      
      return {
        ...state,
        items: newItems,
        selectableCount: Array.from(newItems.values()).filter(item => item.selectable).length
      };
    }
    
    case 'SELECT_ITEM': {
      const item = state.items.get(action.payload.id);
      if (!item || !item.selectable) return state;
      
      const newSelectedIds = new Set(state.selectedIds);
      newSelectedIds.add(action.payload.id);
      
      return {
        ...state,
        selectedIds: newSelectedIds,
        selectedCount: newSelectedIds.size,
        lastSelectedId: action.payload.id,
        rangeStartId: state.selectionMode === 'range' ? action.payload.id : state.rangeStartId
      };
    }
    
    case 'DESELECT_ITEM': {
      const newSelectedIds = new Set(state.selectedIds);
      newSelectedIds.delete(action.payload.id);
      
      return {
        ...state,
        selectedIds: newSelectedIds,
        selectedCount: newSelectedIds.size,
        lastSelectedId: newSelectedIds.size > 0 ? state.lastSelectedId : null
      };
    }
    
    case 'SELECT_RANGE': {
      const newSelectedIds = new Set(state.selectedIds);
      action.payload.itemIds.forEach(id => {
        const item = state.items.get(id);
        if (item && item.selectable) {
          newSelectedIds.add(id);
        }
      });
      
      return {
        ...state,
        selectedIds: newSelectedIds,
        selectedCount: newSelectedIds.size,
        lastSelectedId: action.payload.endId,
        rangeStartId: action.payload.startId
      };
    }
    
    case 'SELECT_ALL': {
      const newSelectedIds = new Set<string>();
      state.items.forEach((item, id) => {
        if (item.selectable) {
          newSelectedIds.add(id);
        }
      });
      
      return {
        ...state,
        selectedIds: newSelectedIds,
        selectedCount: newSelectedIds.size,
        lastSelectedId: Array.from(newSelectedIds)[newSelectedIds.size - 1] || null
      };
    }
    
    case 'DESELECT_ALL': {
      return {
        ...state,
        selectedIds: new Set(),
        selectedCount: 0,
        lastSelectedId: null,
        rangeStartId: null
      };
    }
    
    case 'INVERT_SELECTION': {
      const newSelectedIds = new Set<string>();
      state.items.forEach((item, id) => {
        if (item.selectable && !state.selectedIds.has(id)) {
          newSelectedIds.add(id);
        }
      });
      
      return {
        ...state,
        selectedIds: newSelectedIds,
        selectedCount: newSelectedIds.size,
        lastSelectedId: Array.from(newSelectedIds)[0] || null
      };
    }
    
    case 'SET_SELECTION_MODE': {
      return {
        ...state,
        selectionMode: action.payload.mode,
        // Clear range state when switching modes
        rangeStartId: action.payload.mode === 'range' ? state.rangeStartId : null
      };
    }
    
    default:
      return state;
  }
};

// Context creation
const BulkOperationsContext = createContext<BulkOperationsContextState | null>(null);

// Provider props interface
interface BulkOperationsProviderProps {
  children: React.ReactNode;
  config?: Partial<BulkOperationsConfig>;
  onSelectionChange?: (event: SelectionEvent) => void;
  onBulkAction?: (event: BulkActionEvent) => void;
}

export const BulkOperationsProvider: React.FC<BulkOperationsProviderProps> = ({
  children,
  config: userConfig = {},
  onSelectionChange,
  onBulkAction
}) => {
  // Merge user config with defaults
  const config: BulkOperationsConfig = {
    ...DEFAULT_BULK_OPERATIONS_CONFIG,
    ...userConfig,
    selection: {
      ...DEFAULT_BULK_OPERATIONS_CONFIG.selection,
      ...userConfig.selection
    },
    ui: {
      ...DEFAULT_BULK_OPERATIONS_CONFIG.ui,
      ...userConfig.ui
    },
    shortcuts: {
      ...DEFAULT_BULK_OPERATIONS_CONFIG.shortcuts,
      ...userConfig.shortcuts
    },
    performance: {
      ...DEFAULT_BULK_OPERATIONS_CONFIG.performance,
      ...userConfig.performance
    }
  };
  
  // State management
  const [selectionState, dispatch] = useReducer(selectionReducer, {
    ...initialSelectionState,
    selectionMode: config.selection.mode
  });
  
  const actionsRef = useRef<Map<string, BulkAction>>(new Map());
  const groupsRef = useRef<Map<string, BulkActionGroup>>(new Map());
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [lastAction, setLastAction] = React.useState<BulkAction | null>(null);
  const [lastResult, setLastResult] = React.useState<BulkActionResult | null>(null);
  
  // UI integration
  const { showSuccess, showError, showWarning } = useUI();
  
  // Performance optimization
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debounced dispatch for performance
  const debouncedDispatch = useCallback((action: BulkOperationsAction) => {
    if (config.performance.batchUpdates) {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      updateTimeoutRef.current = setTimeout(() => {
        dispatch(action);
      }, config.performance.debounceMs);
    } else {
      dispatch(action);
    }
  }, [config.performance.batchUpdates, config.performance.debounceMs]);
  
  // Event emission helpers
  const emitSelectionEvent = useCallback((event: SelectionEvent) => {
    onSelectionChange?.(event);
  }, [onSelectionChange]);
  
  const emitBulkActionEvent = useCallback((event: BulkActionEvent) => {
    onBulkAction?.(event);
  }, [onBulkAction]);
  
  // Item management
  const registerItem = useCallback((item: SelectionItem) => {
    dispatch({ type: 'REGISTER_ITEM', payload: { item } });
  }, []);
  
  const unregisterItem = useCallback((id: string) => {
    dispatch({ type: 'UNREGISTER_ITEM', payload: { id } });
  }, []);
  
  const updateItem = useCallback((id: string, updates: Partial<SelectionItem>) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { id, updates } });
  }, []);
  
  // Selection methods
  const selectItem = useCallback((id: string) => {
    dispatch({ type: 'SELECT_ITEM', payload: { id } });
    emitSelectionEvent({ type: 'item-selected', payload: { itemId: id } });
  }, [emitSelectionEvent]);
  
  const deselectItem = useCallback((id: string) => {
    dispatch({ type: 'DESELECT_ITEM', payload: { id } });
    emitSelectionEvent({ type: 'item-deselected', payload: { itemId: id } });
  }, [emitSelectionEvent]);
  
  const toggleItem = useCallback((id: string) => {
    if (selectionState.selectedIds.has(id)) {
      deselectItem(id);
    } else {
      selectItem(id);
    }
  }, [selectionState.selectedIds, selectItem, deselectItem]);
  
  const selectRange = useCallback((startId: string, endId: string) => {
    // Get ordered list of items
    const itemsArray = Array.from(selectionState.items.values());
    const startIndex = itemsArray.findIndex(item => item.id === startId);
    const endIndex = itemsArray.findIndex(item => item.id === endId);
    
    if (startIndex === -1 || endIndex === -1) return;
    
    const [min, max] = [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)];
    const rangeItems = itemsArray.slice(min, max + 1).map(item => item.id);
    
    dispatch({ type: 'SELECT_RANGE', payload: { startId, endId, itemIds: rangeItems } });
    emitSelectionEvent({ 
      type: 'range-selected', 
      payload: { startId, endId, items: rangeItems } 
    });
  }, [selectionState.items, emitSelectionEvent]);
  
  const selectAll = useCallback(() => {
    const selectableItems = Array.from(selectionState.items.values())
      .filter(item => item.selectable)
      .map(item => item.id);
    
    dispatch({ type: 'SELECT_ALL' });
    emitSelectionEvent({ type: 'all-selected', payload: { items: selectableItems } });
  }, [selectionState.items, emitSelectionEvent]);
  
  const deselectAll = useCallback(() => {
    dispatch({ type: 'DESELECT_ALL' });
    emitSelectionEvent({ type: 'all-deselected', payload: {} });
  }, [emitSelectionEvent]);
  
  const invertSelection = useCallback(() => {
    const previousSelection = Array.from(selectionState.selectedIds);
    dispatch({ type: 'INVERT_SELECTION' });
    
    // Calculate new selection for event
    const newSelection = Array.from(selectionState.items.values())
      .filter(item => item.selectable && !selectionState.selectedIds.has(item.id))
      .map(item => item.id);
    
    emitSelectionEvent({ 
      type: 'selection-inverted', 
      payload: { previousSelection, newSelection } 
    });
  }, [selectionState.selectedIds, selectionState.items, emitSelectionEvent]);
  
  const setSelectionMode = useCallback((mode: SelectionMode) => {
    dispatch({ type: 'SET_SELECTION_MODE', payload: { mode } });
  }, []);
  
  // Bulk action management
  const registerAction = useCallback((action: BulkAction) => {
    actionsRef.current.set(action.id, action);
  }, []);
  
  const unregisterAction = useCallback((id: string) => {
    actionsRef.current.delete(id);
  }, []);
  
  const registerGroup = useCallback((group: BulkActionGroup) => {
    groupsRef.current.set(group.id, group);
  }, []);
  
  // Execution
  const executeAction = useCallback(async (actionId: string): Promise<BulkActionResult> => {
    const action = actionsRef.current.get(actionId);
    if (!action) {
      throw new Error(`Action ${actionId} not found`);
    }
    
    const selectedItems = getSelectedItems();
    
    // Check if action can be executed
    if (!action.isEnabled(selectedItems)) {
      throw new Error(`Action ${actionId} is not enabled for current selection`);
    }
    
    setIsProcessing(true);
    setLastAction(action);
    
    emitBulkActionEvent({ 
      type: 'action-started', 
      payload: { actionId, itemCount: selectedItems.length } 
    });
    
    try {
      const result = await action.handler(selectedItems);
      
      setLastResult(result);
      
      // Show user feedback
      if (result.success) {
        showSuccess(result.message);
      } else {
        showError(result.message);
      }
      
      // Clear selection if action was successful and destructive
      if (result.success && ['delete', 'archive'].includes(action.type)) {
        deselectAll();
      }
      
      emitBulkActionEvent({ 
        type: 'action-completed', 
        payload: { actionId, result } 
      });
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showError(`Failed to execute ${action.label}: ${errorMessage}`);
      
      emitBulkActionEvent({ 
        type: 'action-failed', 
        payload: { actionId, error: errorMessage } 
      });
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [showSuccess, showError, deselectAll, emitBulkActionEvent]);
  
  const canExecuteAction = useCallback((actionId: string): boolean => {
    const action = actionsRef.current.get(actionId);
    if (!action) return false;
    
    const selectedItems = getSelectedItems();
    return action.isEnabled(selectedItems) && action.isVisible(selectedItems);
  }, []);
  
  // Utilities
  const getSelectedItems = useCallback((): SelectionItem[] => {
    return Array.from(selectionState.selectedIds)
      .map(id => selectionState.items.get(id))
      .filter(Boolean) as SelectionItem[];
  }, [selectionState.selectedIds, selectionState.items]);
  
  const getAvailableActions = useCallback((): BulkAction[] => {
    const selectedItems = getSelectedItems();
    return Array.from(actionsRef.current.values())
      .filter(action => action.isVisible(selectedItems))
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));
  }, [getSelectedItems]);
  
  const getActionsByGroup = useCallback((): Map<string, BulkAction[]> => {
    const availableActions = getAvailableActions();
    const grouped = new Map<string, BulkAction[]>();
    
    availableActions.forEach(action => {
      const groupId = action.groupId || 'default';
      if (!grouped.has(groupId)) {
        grouped.set(groupId, []);
      }
      grouped.get(groupId)!.push(action);
    });
    
    return grouped;
  }, [getAvailableActions]);
  
  // Keyboard shortcuts
  useEffect(() => {
    if (!config.shortcuts.enabled) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          (event.target as HTMLElement)?.isContentEditable) {
        return;
      }
      
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      
      // Select All (Ctrl+A / Cmd+A)
      if (config.shortcuts.keys.selectAll.some(shortcut => 
          shortcut.toLowerCase() === `${isCtrlOrCmd ? 'ctrl+' : ''}${key}` ||
          shortcut.toLowerCase() === `${isCtrlOrCmd ? 'cmd+' : ''}${key}`)) {
        event.preventDefault();
        selectAll();
        return;
      }
      
      // Deselect All (Escape)
      if (config.shortcuts.keys.deselectAll.includes(key)) {
        event.preventDefault();
        deselectAll();
        return;
      }
      
      // Invert Selection (Ctrl+Shift+A / Cmd+Shift+A)
      if (isCtrlOrCmd && event.shiftKey && key === 'a') {
        event.preventDefault();
        invertSelection();
        return;
      }
      
      // Delete (Delete/Backspace)
      if (config.shortcuts.keys.delete.includes(key) && selectionState.selectedCount > 0) {
        event.preventDefault();
        const deleteAction = Array.from(actionsRef.current.values())
          .find(action => action.type === 'delete');
        if (deleteAction && canExecuteAction(deleteAction.id)) {
          executeAction(deleteAction.id);
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [config.shortcuts, selectAll, deselectAll, invertSelection, selectionState.selectedCount, canExecuteAction, executeAction]);
  
  // Context value
  const contextValue: BulkOperationsContextState = {
    ...selectionState,
    config,
    actions: actionsRef.current,
    groups: groupsRef.current,
    
    // State
    isProcessing,
    lastAction,
    lastResult,
    
    // Actions
    registerItem,
    unregisterItem,
    updateItem,
    
    // Selection methods
    selectItem,
    deselectItem,
    toggleItem,
    selectRange,
    selectAll,
    deselectAll,
    invertSelection,
    setSelectionMode,
    
    // Bulk action management
    registerAction,
    unregisterAction,
    registerGroup,
    
    // Execution
    executeAction,
    canExecuteAction,
    
    // Utilities
    getSelectedItems,
    getAvailableActions,
    getActionsByGroup
  };
  
  return (
    <BulkOperationsContext.Provider value={contextValue}>
      {children}
    </BulkOperationsContext.Provider>
  );
};

// Hook to use bulk operations context
export const useBulkOperationsContext = (): BulkOperationsContextState => {
  const context = useContext(BulkOperationsContext);
  if (!context) {
    throw new Error('useBulkOperationsContext must be used within a BulkOperationsProvider');
  }
  return context;
};
