import type { 
  TaskDragItem, 
  NotebookDragItem, 
  NotebookDropZone, 
  TaskListDropZone,
  DropZone 
} from './types';
import type { Task } from '../../types/task';
import type { Notebook } from '../../types/notebook';

/**
 * Pre-built drag item creators for common ThoughtKeeper entities
 */

/**
 * Create a drag item for a task
 */
export const createTaskDragItem = (task: Task): TaskDragItem => {
  const isSubtask = !!task.parentId;
  
  return {
    id: task.id,
    type: isSubtask ? 'subtask' : 'task',
    data: {
      id: task.id,
      title: task.title,
      notebookId: task.notebookId!,
      parentId: task.parentId,
      status: task.status,
      priority: task.priority
    },
    preview: {
      title: task.title,
      subtitle: isSubtask ? `Subtask • ${task.priority}` : `${task.status} • ${task.priority}`,
      icon: getTaskIcon(task.status, task.priority, isSubtask)
    },
    constraints: {
      allowedDropZones: isSubtask 
        ? ['task-list', 'subtask-container', 'trash']
        : ['notebook', 'task-list', 'subtask-container', 'trash'],
      requiresConfirmation: false
    }
  };
};

/**
 * Create a drag item for a notebook
 */
export const createNotebookDragItem = (notebook: Notebook): NotebookDragItem => {
  return {
    id: notebook.id,
    type: 'notebook',
    data: {
      id: notebook.id,
      title: notebook.title,
      taskCount: 0, // Would get from actual data
      status: notebook.status
    },
    preview: {
      title: notebook.title,
      subtitle: `${notebook.status} • ${0} tasks`, // Would get actual count
      icon: getNotebookIcon(notebook.status)
    },
    constraints: {
      allowedDropZones: ['task-list'], // For reordering notebooks
      requiresConfirmation: false
    }
  };
};

/**
 * Create a notebook drop zone
 */
export const createNotebookDropZone = (
  notebook: Notebook,
  options: {
    allowSubtasks?: boolean;
    position?: number;
  } = {}
): NotebookDropZone => {
  return {
    id: `notebook-${notebook.id}`,
    type: 'notebook',
    accepts: ['task', 'subtask'],
    data: {
      notebookId: notebook.id,
      allowSubtasks: options.allowSubtasks ?? true,
      position: options.position
    },
    visual: {
      highlightColor: 'rgba(99, 102, 241, 0.1)',
      borderStyle: 'dashed',
      showDropIndicator: true
    }
  };
};

/**
 * Create a task list drop zone
 */
export const createTaskListDropZone = (
  options: {
    notebookId?: string;
    parentTaskId?: string;
    insertionPosition?: number;
    id?: string;
  } = {}
): TaskListDropZone => {
  const id = options.id || `task-list-${Date.now()}`;
  const isSubtaskList = !!options.parentTaskId;
  
  return {
    id,
    type: 'task-list',
    accepts: isSubtaskList ? ['subtask'] : ['task', 'subtask'],
    data: {
      notebookId: options.notebookId,
      parentTaskId: options.parentTaskId,
      insertPosition: options.insertionPosition
    },
    visual: {
      highlightColor: isSubtaskList 
        ? 'rgba(34, 197, 94, 0.1)' 
        : 'rgba(59, 130, 246, 0.1)',
      borderStyle: 'dashed',
      showDropIndicator: true
    },
    constraints: {
      allowDuplicates: false
    }
  };
};

/**
 * Create a trash/delete drop zone
 */
export const createTrashDropZone = (): DropZone => {
  return {
    id: 'trash-zone',
    type: 'trash',
    accepts: ['task', 'subtask', 'notebook'],
    visual: {
      highlightColor: 'rgba(239, 68, 68, 0.1)',
      borderStyle: 'solid',
      showDropIndicator: true,
      customClassName: 'trash-drop-zone'
    },
    constraints: {
      requiresPermission: true
    }
  };
};

/**
 * Create a subtask container drop zone
 */
export const createSubtaskDropZone = (parentTask: Task): DropZone => {
  return {
    id: `subtasks-${parentTask.id}`,
    type: 'subtask-container',
    accepts: ['task', 'subtask'],
    data: {
      parentTaskId: parentTask.id,
      notebookId: parentTask.notebookId
    },
    visual: {
      highlightColor: 'rgba(34, 197, 94, 0.1)',
      borderStyle: 'dashed',
      showDropIndicator: true
    }
  };
};

/**
 * Helper function to get task icon based on status and priority
 */
function getTaskIcon(status: string, priority: string, isSubtask: boolean): string {
  if (isSubtask) {
    return '→';
  }
  
  switch (status) {
    case 'completed':
      return '✅';
    case 'in-progress':
      return '🔄';
    case 'pending':
      return priority === 'urgent' ? '🔥' : priority === 'high' ? '⚡' : '📝';
    case 'cancelled':
      return '❌';
    default:
      return '📝';
  }
}

/**
 * Helper function to get notebook icon based on status
 */
function getNotebookIcon(status: string): string {
  switch (status) {
    case 'active':
      return '📓';
    case 'archived':
      return '📚';
    case 'draft':
      return '📄';
    default:
      return '📓';
  }
}

/**
 * Batch create drag items for multiple tasks
 */
export const createTaskDragItems = (tasks: Task[]): TaskDragItem[] => {
  return tasks.map(createTaskDragItem);
};

/**
 * Batch create drag items for multiple notebooks
 */
export const createNotebookDragItems = (notebooks: Notebook[]): NotebookDragItem[] => {
  return notebooks.map(createNotebookDragItem);
};

/**
 * Create drop zones for a complete notebook view
 */
export const createNotebookViewDropZones = (
  notebook: Notebook,
  tasks: Task[]
): DropZone[] => {
  const dropZones: DropZone[] = [];
  
  // Main notebook drop zone
  dropZones.push(createNotebookDropZone(notebook));
  
  // Task list drop zone
  dropZones.push(createTaskListDropZone({ 
    notebookId: notebook.id,
    id: `notebook-${notebook.id}-tasks`
  }));
  
  // Subtask drop zones for parent tasks
  const parentTasks = tasks.filter(task => !task.parentId);
  parentTasks.forEach(parentTask => {
    dropZones.push(createSubtaskDropZone(parentTask));
  });
  
  // Trash drop zone
  dropZones.push(createTrashDropZone());
  
  return dropZones;
};

/**
 * Drag operation presets for common scenarios
 */
export const DragOperationPresets = {
  /**
   * Move task between notebooks
   */
  moveTaskToNotebook: {
    description: 'Move task to a different notebook',
    dragTypes: ['task', 'subtask'],
    dropZones: ['notebook'],
    requiresConfirmation: true,
    successMessage: (taskTitle: string, notebookTitle: string) => 
      `Moved "${taskTitle}" to "${notebookTitle}"`
  },
  
  /**
   * Convert task to subtask
   */
  convertToSubtask: {
    description: 'Convert task to subtask of another task',
    dragTypes: ['task'],
    dropZones: ['subtask-container'],
    requiresConfirmation: false,
    successMessage: (taskTitle: string, parentTitle: string) =>
      `Converted "${taskTitle}" to subtask of "${parentTitle}"`
  },
  
  /**
   * Reorder tasks in list
   */
  reorderTasks: {
    description: 'Reorder tasks within a list',
    dragTypes: ['task', 'subtask'],
    dropZones: ['task-list'],
    requiresConfirmation: false,
    successMessage: (taskTitle: string) =>
      `Reordered "${taskTitle}"`
  },
  
  /**
   * Delete items
   */
  deleteItems: {
    description: 'Delete tasks or notebooks',
    dragTypes: ['task', 'subtask', 'notebook'],
    dropZones: ['trash'],
    requiresConfirmation: true,
    successMessage: (itemTitle: string) =>
      `Deleted "${itemTitle}"`
  }
};

/**
 * Validation helpers
 */
export const DragValidators = {
  /**
   * Check if a task can be moved to a notebook
   */
  canMoveTaskToNotebook: (task: Task, targetNotebookId: string): boolean => {
    // Don't allow moving to the same notebook
    if (task.notebookId === targetNotebookId) {
      return false;
    }
    
    // Add other business logic as needed
    return true;
  },
  
  /**
   * Check if a task can become a subtask
   */
  canConvertToSubtask: (task: Task, parentTask: Task): boolean => {
    // Don't allow converting to subtask of itself
    if (task.id === parentTask.id) {
      return false;
    }
    
    // Don't allow creating circular dependencies
    if (task.parentId === parentTask.id) {
      return false;
    }
    
    // Don't allow subtasks to have subtasks (keep it simple for now)
    if (task.parentId) {
      return false;
    }
    
    return true;
  },
  
  /**
   * Check if items can be reordered
   */
  canReorderInList: (dragItem: TaskDragItem, targetListId: string): boolean => {
    // Add reordering business logic
    return true;
  }
};
