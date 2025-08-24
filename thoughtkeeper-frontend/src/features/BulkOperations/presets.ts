import type { BulkAction, BulkActionGroup, SelectionItem, BulkActionResult } from './types';
import { MockApiService } from '../../mocks';

/**
 * Pre-built bulk actions for common ThoughtKeeper operations
 */

/**
 * Create bulk delete action
 */
export const createDeleteAction = (): BulkAction => ({
  id: 'bulk-delete',
  type: 'delete',
  label: 'Delete',
  icon: '🗑️',
  description: 'Permanently delete selected items',
  color: 'danger',
  groupId: 'primary',
  priority: 10,
  requiresConfirmation: true,
  shortcut: ['Delete'],
  
  isEnabled: (items: SelectionItem[]) => items.length > 0,
  isVisible: (items: SelectionItem[]) => items.length > 0,
  
  handler: async (items: SelectionItem[]): Promise<BulkActionResult> => {
    const results = await Promise.allSettled(
      items.map(async (item) => {
        if (item.type === 'task' || item.type === 'subtask') {
          await MockApiService.tasks.deleteTask(item.id);
        } else if (item.type === 'notebook') {
          await MockApiService.notebooks.deleteNotebook(item.id);
        }
        return { itemId: item.id, success: true };
      })
    );
    
    const successes = results.filter(r => r.status === 'fulfilled').length;
    const failures = results.filter(r => r.status === 'rejected').length;
    
    return {
      success: failures === 0,
      processedItems: successes,
      failedItems: failures,
      results: results.map((result, index) => ({
        itemId: items[index].id,
        success: result.status === 'fulfilled',
        error: result.status === 'rejected' ? result.reason.message : undefined
      })),
      message: failures === 0 
        ? `Successfully deleted ${successes} ${successes === 1 ? 'item' : 'items'}`
        : `Deleted ${successes} items, ${failures} failed`,
      undoable: false
    };
  }
});

/**
 * Create bulk archive action (for notebooks and tasks)
 */
export const createArchiveAction = (): BulkAction => ({
  id: 'bulk-archive',
  type: 'archive',
  label: 'Archive',
  icon: '📦',
  description: 'Archive selected items',
  color: 'secondary',
  groupId: 'organization',
  priority: 5,
  requiresConfirmation: false,
  
  isEnabled: (items: SelectionItem[]) => 
    items.length > 0 && items.some(item => !item.data?.archived),
  
  isVisible: (items: SelectionItem[]) => 
    items.some(item => ['task', 'notebook'].includes(item.type)),
  
  handler: async (items: SelectionItem[]): Promise<BulkActionResult> => {
    const archivableItems = items.filter(item => !item.data?.archived);
    
    const results = await Promise.allSettled(
      archivableItems.map(async (item) => {
        if (item.type === 'notebook') {
          await MockApiService.notebooks.archiveNotebook(item.id);
        } else if (item.type === 'task' || item.type === 'subtask') {
          // Tasks don't have archive in our API, so we'll use a status change
          await MockApiService.tasks.updateTask(item.id, { 
            status: 'cancelled' as any // Mock archived status
          });
        }
        return { itemId: item.id, success: true };
      })
    );
    
    const successes = results.filter(r => r.status === 'fulfilled').length;
    const failures = results.filter(r => r.status === 'rejected').length;
    
    return {
      success: failures === 0,
      processedItems: successes,
      failedItems: failures,
      results: results.map((result, index) => ({
        itemId: archivableItems[index].id,
        success: result.status === 'fulfilled',
        error: result.status === 'rejected' ? result.reason.message : undefined
      })),
      message: failures === 0 
        ? `Successfully archived ${successes} ${successes === 1 ? 'item' : 'items'}`
        : `Archived ${successes} items, ${failures} failed`
    };
  }
});

/**
 * Create bulk restore action
 */
export const createRestoreAction = (): BulkAction => ({
  id: 'bulk-restore',
  type: 'restore',
  label: 'Restore',
  icon: '↩️',
  description: 'Restore archived items',
  color: 'success',
  groupId: 'organization',
  priority: 6,
  requiresConfirmation: false,
  
  isEnabled: (items: SelectionItem[]) => 
    items.length > 0 && items.some(item => item.data?.archived || item.data?.status === 'cancelled'),
  
  isVisible: (items: SelectionItem[]) => 
    items.some(item => item.data?.archived || item.data?.status === 'cancelled'),
  
  handler: async (items: SelectionItem[]): Promise<BulkActionResult> => {
    const restorableItems = items.filter(item => 
      item.data?.archived || item.data?.status === 'cancelled'
    );
    
    const results = await Promise.allSettled(
      restorableItems.map(async (item) => {
        if (item.type === 'notebook') {
          await MockApiService.notebooks.restoreNotebook(item.id);
        } else if (item.type === 'task' || item.type === 'subtask') {
          await MockApiService.tasks.updateTask(item.id, { 
            status: 'pending' as any
          });
        }
        return { itemId: item.id, success: true };
      })
    );
    
    const successes = results.filter(r => r.status === 'fulfilled').length;
    const failures = results.filter(r => r.status === 'rejected').length;
    
    return {
      success: failures === 0,
      processedItems: successes,
      failedItems: failures,
      results: results.map((result, index) => ({
        itemId: restorableItems[index].id,
        success: result.status === 'fulfilled',
        error: result.status === 'rejected' ? result.reason.message : undefined
      })),
      message: failures === 0 
        ? `Successfully restored ${successes} ${successes === 1 ? 'item' : 'items'}`
        : `Restored ${successes} items, ${failures} failed`
    };
  }
});

/**
 * Create bulk complete action (for tasks)
 */
export const createCompleteAction = (): BulkAction => ({
  id: 'bulk-complete',
  type: 'complete',
  label: 'Mark Complete',
  icon: '✅',
  description: 'Mark selected tasks as complete',
  color: 'success',
  groupId: 'status',
  priority: 1,
  requiresConfirmation: false,
  shortcut: ['Ctrl', 'Enter'],
  
  isEnabled: (items: SelectionItem[]) => 
    items.length > 0 && 
    items.every(item => ['task', 'subtask'].includes(item.type)) &&
    items.some(item => item.data?.status !== 'completed'),
  
  isVisible: (items: SelectionItem[]) => 
    items.some(item => ['task', 'subtask'].includes(item.type)),
  
  handler: async (items: SelectionItem[]): Promise<BulkActionResult> => {
    const completableItems = items.filter(item => 
      ['task', 'subtask'].includes(item.type) && item.data?.status !== 'completed'
    );
    
    const results = await Promise.allSettled(
      completableItems.map(async (item) => {
        await MockApiService.tasks.updateTask(item.id, { 
          status: 'completed' as any,
          completedAt: new Date()
        });
        return { itemId: item.id, success: true };
      })
    );
    
    const successes = results.filter(r => r.status === 'fulfilled').length;
    const failures = results.filter(r => r.status === 'rejected').length;
    
    return {
      success: failures === 0,
      processedItems: successes,
      failedItems: failures,
      results: results.map((result, index) => ({
        itemId: completableItems[index].id,
        success: result.status === 'fulfilled',
        error: result.status === 'rejected' ? result.reason.message : undefined
      })),
      message: failures === 0 
        ? `Successfully completed ${successes} ${successes === 1 ? 'task' : 'tasks'}`
        : `Completed ${successes} tasks, ${failures} failed`
    };
  }
});

/**
 * Create bulk incomplete action (for tasks)
 */
export const createIncompleteAction = (): BulkAction => ({
  id: 'bulk-incomplete',
  type: 'incomplete',
  label: 'Mark Incomplete',
  icon: '⭕',
  description: 'Mark selected tasks as incomplete',
  color: 'warning',
  groupId: 'status',
  priority: 2,
  requiresConfirmation: false,
  
  isEnabled: (items: SelectionItem[]) => 
    items.length > 0 && 
    items.every(item => ['task', 'subtask'].includes(item.type)) &&
    items.some(item => item.data?.status === 'completed'),
  
  isVisible: (items: SelectionItem[]) => 
    items.some(item => ['task', 'subtask'].includes(item.type) && item.data?.status === 'completed'),
  
  handler: async (items: SelectionItem[]): Promise<BulkActionResult> => {
    const incompletableItems = items.filter(item => 
      ['task', 'subtask'].includes(item.type) && item.data?.status === 'completed'
    );
    
    const results = await Promise.allSettled(
      incompletableItems.map(async (item) => {
        await MockApiService.tasks.updateTask(item.id, { 
          status: 'pending' as any,
          completedAt: undefined
        });
        return { itemId: item.id, success: true };
      })
    );
    
    const successes = results.filter(r => r.status === 'fulfilled').length;
    const failures = results.filter(r => r.status === 'rejected').length;
    
    return {
      success: failures === 0,
      processedItems: successes,
      failedItems: failures,
      results: results.map((result, index) => ({
        itemId: incompletableItems[index].id,
        success: result.status === 'fulfilled',
        error: result.status === 'rejected' ? result.reason.message : undefined
      })),
      message: failures === 0 
        ? `Successfully marked ${successes} ${successes === 1 ? 'task' : 'tasks'} as incomplete`
        : `Updated ${successes} tasks, ${failures} failed`
    };
  }
});

/**
 * Create priority change action
 */
export const createPriorityChangeAction = (priority: 'low' | 'medium' | 'high' | 'urgent'): BulkAction => {
  const priorityIcons = {
    low: '⬇️',
    medium: '➡️',
    high: '⬆️',
    urgent: '🔥'
  };
  
  const priorityColors = {
    low: 'secondary' as const,
    medium: 'secondary' as const,
    high: 'warning' as const,
    urgent: 'danger' as const
  };
  
  return {
    id: `bulk-priority-${priority}`,
    type: 'priority-change',
    label: `Set ${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority`,
    icon: priorityIcons[priority],
    description: `Set priority to ${priority} for selected tasks`,
    color: priorityColors[priority],
    groupId: 'status',
    priority: priority === 'urgent' ? 0 : priority === 'high' ? 1 : priority === 'medium' ? 2 : 3,
    requiresConfirmation: false,
    
    isEnabled: (items: SelectionItem[]) => 
      items.length > 0 && 
      items.every(item => ['task', 'subtask'].includes(item.type)) &&
      items.some(item => item.data?.priority !== priority),
    
    isVisible: (items: SelectionItem[]) => 
      items.some(item => ['task', 'subtask'].includes(item.type)),
    
    handler: async (items: SelectionItem[]): Promise<BulkActionResult> => {
      const updateableItems = items.filter(item => 
        ['task', 'subtask'].includes(item.type) && item.data?.priority !== priority
      );
      
      const results = await Promise.allSettled(
        updateableItems.map(async (item) => {
          await MockApiService.tasks.updateTask(item.id, { priority: priority as any });
          return { itemId: item.id, success: true };
        })
      );
      
      const successes = results.filter(r => r.status === 'fulfilled').length;
      const failures = results.filter(r => r.status === 'rejected').length;
      
      return {
        success: failures === 0,
        processedItems: successes,
        failedItems: failures,
        results: results.map((result, index) => ({
          itemId: updateableItems[index].id,
          success: result.status === 'fulfilled',
          error: result.status === 'rejected' ? result.reason.message : undefined
        })),
        message: failures === 0 
          ? `Successfully set ${successes} ${successes === 1 ? 'task' : 'tasks'} to ${priority} priority`
          : `Updated ${successes} tasks, ${failures} failed`
      };
    }
  };
};

/**
 * Create export action
 */
export const createExportAction = (): BulkAction => ({
  id: 'bulk-export',
  type: 'export',
  label: 'Export',
  icon: '📤',
  description: 'Export selected items to file',
  color: 'primary',
  groupId: 'data',
  priority: 1,
  requiresConfirmation: false,
  
  isEnabled: (items: SelectionItem[]) => items.length > 0,
  isVisible: (items: SelectionItem[]) => items.length > 0,
  
  handler: async (items: SelectionItem[]): Promise<BulkActionResult> => {
    // This would typically integrate with an export service
    // For now, we'll simulate the export
    
    const exportData = items.map(item => ({
      id: item.id,
      type: item.type,
      title: item.metadata?.title,
      data: item.data,
      exportedAt: new Date().toISOString()
    }));
    
    // Simulate download
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `thoughtkeeper-export-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return {
      success: true,
      processedItems: items.length,
      failedItems: 0,
      results: items.map(item => ({
        itemId: item.id,
        success: true
      })),
      message: `Successfully exported ${items.length} ${items.length === 1 ? 'item' : 'items'}`
    };
  }
});

/**
 * Predefined action groups
 */
export const createDefaultActionGroups = (): BulkActionGroup[] => [
  {
    id: 'primary',
    label: 'Primary Actions',
    actions: [],
    priority: 1,
    collapsible: false
  },
  {
    id: 'status',
    label: 'Status Changes',
    actions: [],
    priority: 2,
    collapsible: true,
    collapsed: false
  },
  {
    id: 'organization',
    label: 'Organization',
    actions: [],
    priority: 3,
    collapsible: true,
    collapsed: true
  },
  {
    id: 'data',
    label: 'Data Operations',
    actions: [],
    priority: 4,
    collapsible: true,
    collapsed: true
  },
  {
    id: 'advanced',
    label: 'Advanced',
    actions: [],
    priority: 5,
    collapsible: true,
    collapsed: true
  }
];

/**
 * Get all common bulk actions
 */
export const getCommonBulkActions = (): BulkAction[] => [
  createDeleteAction(),
  createArchiveAction(),
  createRestoreAction(),
  createCompleteAction(),
  createIncompleteAction(),
  createPriorityChangeAction('urgent'),
  createPriorityChangeAction('high'),
  createPriorityChangeAction('medium'),
  createPriorityChangeAction('low'),
  createExportAction()
];

/**
 * Get task-specific bulk actions
 */
export const getTaskBulkActions = (): BulkAction[] => [
  createCompleteAction(),
  createIncompleteAction(),
  createPriorityChangeAction('urgent'),
  createPriorityChangeAction('high'),
  createPriorityChangeAction('medium'),
  createPriorityChangeAction('low'),
  createDeleteAction(),
  createExportAction()
];

/**
 * Get notebook-specific bulk actions
 */
export const getNotebookBulkActions = (): BulkAction[] => [
  createArchiveAction(),
  createRestoreAction(),
  createDeleteAction(),
  createExportAction()
];

/**
 * Create selection item from task
 */
export const createTaskSelectionItem = (task: any): SelectionItem => ({
  id: task.id,
  type: task.parentId ? 'subtask' : 'task',
  data: task,
  selected: false,
  selectable: true,
  metadata: {
    title: task.title,
    subtitle: `${task.status} • ${task.priority}`,
    lastModified: new Date(task.updatedAt)
  }
});

/**
 * Create selection item from notebook
 */
export const createNotebookSelectionItem = (notebook: any): SelectionItem => ({
  id: notebook.id,
  type: 'notebook',
  data: notebook,
  selected: false,
  selectable: true,
  metadata: {
    title: notebook.title,
    subtitle: notebook.description,
    lastModified: new Date(notebook.updatedAt)
  }
});
