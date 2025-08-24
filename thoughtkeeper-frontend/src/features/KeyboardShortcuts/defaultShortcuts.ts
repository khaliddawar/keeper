import type { KeyboardShortcut, ShortcutHandler } from './types';

/**
 * Default Keyboard Shortcuts
 * Comprehensive set of built-in shortcuts for ThoughtKeeper
 */
export class DefaultShortcuts {
  
  /**
   * Navigation shortcuts
   */
  getNavigationShortcuts(): KeyboardShortcut[] {
    return [
      {
        id: 'navigate-home',
        name: 'Go to Home',
        description: 'Navigate to the main dashboard',
        category: 'navigation',
        key: 'h',
        modifiers: ['ctrl'],
        action: {
          type: 'navigate',
          handler: this.createNavigationHandler('/')
        },
        context: ['global'],
        enabled: true,
        global: true,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      },
      {
        id: 'navigate-tasks',
        name: 'Go to Tasks',
        description: 'Navigate to tasks view',
        category: 'navigation',
        key: 't',
        modifiers: ['ctrl'],
        action: {
          type: 'navigate',
          handler: this.createNavigationHandler('/tasks')
        },
        context: ['global'],
        enabled: true,
        global: true,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      },
      {
        id: 'navigate-notebooks',
        name: 'Go to Notebooks',
        description: 'Navigate to notebooks view',
        category: 'navigation',
        key: 'n',
        modifiers: ['ctrl'],
        action: {
          type: 'navigate',
          handler: this.createNavigationHandler('/notebooks')
        },
        context: ['global'],
        enabled: true,
        global: true,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      },
      {
        id: 'navigate-back',
        name: 'Go Back',
        description: 'Navigate back in history',
        category: 'navigation',
        key: 'ArrowLeft',
        modifiers: ['alt'],
        action: {
          type: 'navigate',
          handler: this.createHistoryHandler('back')
        },
        context: ['global'],
        enabled: true,
        global: true,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      },
      {
        id: 'navigate-forward',
        name: 'Go Forward',
        description: 'Navigate forward in history',
        category: 'navigation',
        key: 'ArrowRight',
        modifiers: ['alt'],
        action: {
          type: 'navigate',
          handler: this.createHistoryHandler('forward')
        },
        context: ['global'],
        enabled: true,
        global: true,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      },
      {
        id: 'focus-search',
        name: 'Focus Search',
        description: 'Focus the search input',
        category: 'navigation',
        key: '/',
        modifiers: [],
        action: {
          type: 'focus',
          handler: this.createFocusHandler('[data-testid="search-input"], input[type="search"]')
        },
        context: ['global'],
        enabled: true,
        global: true,
        priority: 15,
        preventDefault: true,
        stopPropagation: true,
        allowInInputs: false,
        customizable: true
      }
    ];
  }

  /**
   * Editing shortcuts
   */
  getEditingShortcuts(): KeyboardShortcut[] {
    return [
      {
        id: 'create-task',
        name: 'New Task',
        description: 'Create a new task',
        category: 'editing',
        key: 'n',
        modifiers: ['ctrl', 'shift'],
        action: {
          type: 'create',
          handler: this.createTaskHandler('create')
        },
        context: ['global', 'task-list'],
        enabled: true,
        global: true,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      },
      {
        id: 'create-notebook',
        name: 'New Notebook',
        description: 'Create a new notebook',
        category: 'editing',
        key: 'n',
        modifiers: ['ctrl', 'alt'],
        action: {
          type: 'create',
          handler: this.createNotebookHandler('create')
        },
        context: ['global', 'notebook-list'],
        enabled: true,
        global: true,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      },
      {
        id: 'edit-item',
        name: 'Edit Item',
        description: 'Edit the selected item',
        category: 'editing',
        key: 'Enter',
        modifiers: [],
        action: {
          type: 'edit',
          handler: this.createEditHandler()
        },
        context: ['task-list', 'notebook-list'],
        enabled: true,
        global: false,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      },
      {
        id: 'delete-item',
        name: 'Delete Item',
        description: 'Delete the selected item(s)',
        category: 'editing',
        key: 'Delete',
        modifiers: [],
        action: {
          type: 'delete',
          handler: this.createDeleteHandler()
        },
        context: ['task-list', 'notebook-list'],
        enabled: true,
        global: false,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      },
      {
        id: 'duplicate-item',
        name: 'Duplicate Item',
        description: 'Duplicate the selected item',
        category: 'editing',
        key: 'd',
        modifiers: ['ctrl'],
        action: {
          type: 'custom',
          handler: this.createDuplicateHandler()
        },
        context: ['task-list', 'notebook-list'],
        enabled: true,
        global: false,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      }
    ];
  }

  /**
   * Selection shortcuts
   */
  getSelectionShortcuts(): KeyboardShortcut[] {
    return [
      {
        id: 'select-all',
        name: 'Select All',
        description: 'Select all items in current view',
        category: 'selection',
        key: 'a',
        modifiers: ['ctrl'],
        action: {
          type: 'select',
          handler: this.createSelectionHandler('all')
        },
        context: ['task-list', 'notebook-list'],
        enabled: true,
        global: false,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      },
      {
        id: 'select-none',
        name: 'Deselect All',
        description: 'Deselect all selected items',
        category: 'selection',
        key: 'Escape',
        modifiers: [],
        action: {
          type: 'select',
          handler: this.createSelectionHandler('none')
        },
        context: ['task-list', 'notebook-list'],
        enabled: true,
        global: false,
        priority: 15,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      },
      {
        id: 'select-invert',
        name: 'Invert Selection',
        description: 'Invert the current selection',
        category: 'selection',
        key: 'i',
        modifiers: ['ctrl'],
        action: {
          type: 'select',
          handler: this.createSelectionHandler('invert')
        },
        context: ['task-list', 'notebook-list'],
        enabled: true,
        global: false,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      },
      {
        id: 'navigate-up',
        name: 'Move Up',
        description: 'Move selection up',
        category: 'selection',
        key: 'ArrowUp',
        modifiers: [],
        action: {
          type: 'navigate',
          handler: this.createArrowNavigationHandler('up')
        },
        context: ['task-list', 'notebook-list', 'search-results'],
        enabled: true,
        global: false,
        priority: 20,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: false
      },
      {
        id: 'navigate-down',
        name: 'Move Down',
        description: 'Move selection down',
        category: 'selection',
        key: 'ArrowDown',
        modifiers: [],
        action: {
          type: 'navigate',
          handler: this.createArrowNavigationHandler('down')
        },
        context: ['task-list', 'notebook-list', 'search-results'],
        enabled: true,
        global: false,
        priority: 20,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: false
      }
    ];
  }

  /**
   * View shortcuts
   */
  getViewShortcuts(): KeyboardShortcut[] {
    return [
      {
        id: 'toggle-sidebar',
        name: 'Toggle Sidebar',
        description: 'Show/hide the sidebar',
        category: 'view',
        key: 'b',
        modifiers: ['ctrl'],
        action: {
          type: 'toggle',
          handler: this.createToggleHandler('sidebar')
        },
        context: ['global'],
        enabled: true,
        global: true,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      },
      {
        id: 'toggle-theme',
        name: 'Toggle Theme',
        description: 'Switch between light and dark themes',
        category: 'view',
        key: 't',
        modifiers: ['ctrl', 'shift'],
        action: {
          type: 'toggle',
          handler: this.createToggleHandler('theme')
        },
        context: ['global'],
        enabled: true,
        global: true,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      },
      {
        id: 'toggle-view-mode',
        name: 'Toggle View Mode',
        description: 'Switch between list and grid view',
        category: 'view',
        key: 'v',
        modifiers: ['ctrl'],
        action: {
          type: 'toggle',
          handler: this.createToggleHandler('viewMode')
        },
        context: ['task-list', 'notebook-list'],
        enabled: true,
        global: false,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      },
      {
        id: 'zoom-in',
        name: 'Zoom In',
        description: 'Increase zoom level',
        category: 'view',
        key: '=',
        modifiers: ['ctrl'],
        action: {
          type: 'custom',
          handler: this.createZoomHandler('in')
        },
        context: ['global'],
        enabled: true,
        global: true,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      },
      {
        id: 'zoom-out',
        name: 'Zoom Out',
        description: 'Decrease zoom level',
        category: 'view',
        key: '-',
        modifiers: ['ctrl'],
        action: {
          type: 'custom',
          handler: this.createZoomHandler('out')
        },
        context: ['global'],
        enabled: true,
        global: true,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      }
    ];
  }

  /**
   * Search shortcuts
   */
  getSearchShortcuts(): KeyboardShortcut[] {
    return [
      {
        id: 'global-search',
        name: 'Global Search',
        description: 'Open global search',
        category: 'search',
        key: 'k',
        modifiers: ['ctrl'],
        action: {
          type: 'search',
          handler: this.createSearchHandler('global')
        },
        context: ['global'],
        enabled: true,
        global: true,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: true,
        customizable: true
      },
      {
        id: 'search-tasks',
        name: 'Search Tasks',
        description: 'Search within tasks',
        category: 'search',
        key: 'f',
        modifiers: ['ctrl', 'shift'],
        action: {
          type: 'search',
          handler: this.createSearchHandler('tasks')
        },
        context: ['task-list', 'global'],
        enabled: true,
        global: true,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      },
      {
        id: 'search-notebooks',
        name: 'Search Notebooks',
        description: 'Search within notebooks',
        category: 'search',
        key: 'f',
        modifiers: ['ctrl', 'alt'],
        action: {
          type: 'search',
          handler: this.createSearchHandler('notebooks')
        },
        context: ['notebook-list', 'global'],
        enabled: true,
        global: true,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      },
      {
        id: 'clear-search',
        name: 'Clear Search',
        description: 'Clear current search',
        category: 'search',
        key: 'Escape',
        modifiers: [],
        action: {
          type: 'search',
          handler: this.createSearchHandler('clear')
        },
        context: ['search-results'],
        enabled: true,
        global: false,
        priority: 15,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: true,
        customizable: true
      }
    ];
  }

  /**
   * Task-specific shortcuts
   */
  getTaskShortcuts(): KeyboardShortcut[] {
    return [
      {
        id: 'mark-complete',
        name: 'Mark Complete',
        description: 'Mark task as complete',
        category: 'tasks',
        key: 'x',
        modifiers: [],
        action: {
          type: 'toggle',
          handler: this.createTaskStatusHandler('completed')
        },
        context: ['task-list', 'task-detail'],
        enabled: true,
        global: false,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      },
      {
        id: 'mark-pending',
        name: 'Mark Pending',
        description: 'Mark task as pending',
        category: 'tasks',
        key: 'p',
        modifiers: [],
        action: {
          type: 'toggle',
          handler: this.createTaskStatusHandler('pending')
        },
        context: ['task-list', 'task-detail'],
        enabled: true,
        global: false,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      },
      {
        id: 'set-priority-high',
        name: 'Set High Priority',
        description: 'Set task priority to high',
        category: 'tasks',
        key: '1',
        modifiers: ['alt'],
        action: {
          type: 'custom',
          handler: this.createTaskPriorityHandler('high')
        },
        context: ['task-list', 'task-detail'],
        enabled: true,
        global: false,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      },
      {
        id: 'set-priority-medium',
        name: 'Set Medium Priority',
        description: 'Set task priority to medium',
        category: 'tasks',
        key: '2',
        modifiers: ['alt'],
        action: {
          type: 'custom',
          handler: this.createTaskPriorityHandler('medium')
        },
        context: ['task-list', 'task-detail'],
        enabled: true,
        global: false,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      },
      {
        id: 'set-priority-low',
        name: 'Set Low Priority',
        description: 'Set task priority to low',
        category: 'tasks',
        key: '3',
        modifiers: ['alt'],
        action: {
          type: 'custom',
          handler: this.createTaskPriorityHandler('low')
        },
        context: ['task-list', 'task-detail'],
        enabled: true,
        global: false,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      }
    ];
  }

  /**
   * Notebook-specific shortcuts
   */
  getNotebookShortcuts(): KeyboardShortcut[] {
    return [
      {
        id: 'favorite-notebook',
        name: 'Toggle Favorite',
        description: 'Add/remove notebook from favorites',
        category: 'notebooks',
        key: 'f',
        modifiers: [],
        action: {
          type: 'toggle',
          handler: this.createNotebookHandler('favorite')
        },
        context: ['notebook-list', 'notebook-detail'],
        enabled: true,
        global: false,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      },
      {
        id: 'archive-notebook',
        name: 'Archive Notebook',
        description: 'Archive the selected notebook',
        category: 'notebooks',
        key: 'a',
        modifiers: [],
        action: {
          type: 'toggle',
          handler: this.createNotebookHandler('archive')
        },
        context: ['notebook-list', 'notebook-detail'],
        enabled: true,
        global: false,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      }
    ];
  }

  /**
   * Global shortcuts
   */
  getGlobalShortcuts(): KeyboardShortcut[] {
    return [
      {
        id: 'show-help',
        name: 'Show Help',
        description: 'Show keyboard shortcuts help',
        category: 'global',
        key: '?',
        modifiers: [],
        action: {
          type: 'custom',
          handler: this.createHelpHandler()
        },
        context: ['global'],
        enabled: true,
        global: true,
        priority: 20,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: false
      },
      {
        id: 'show-shortcuts',
        name: 'Show Shortcuts',
        description: 'Show keyboard shortcuts modal',
        category: 'global',
        key: 'k',
        modifiers: ['ctrl', 'shift'],
        action: {
          type: 'custom',
          handler: this.createShortcutsModalHandler()
        },
        context: ['global'],
        enabled: true,
        global: true,
        priority: 20,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: true,
        customizable: true
      },
      {
        id: 'refresh-page',
        name: 'Refresh',
        description: 'Refresh the current page',
        category: 'global',
        key: 'r',
        modifiers: ['ctrl'],
        action: {
          type: 'custom',
          handler: this.createRefreshHandler()
        },
        context: ['global'],
        enabled: true,
        global: true,
        priority: 5,
        preventDefault: false,
        stopPropagation: false,
        allowInInputs: false,
        customizable: false
      },
      {
        id: 'export-data',
        name: 'Export Data',
        description: 'Open export dialog',
        category: 'global',
        key: 'e',
        modifiers: ['ctrl', 'shift'],
        action: {
          type: 'export',
          handler: this.createExportHandler()
        },
        context: ['global'],
        enabled: true,
        global: true,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      },
      {
        id: 'import-data',
        name: 'Import Data',
        description: 'Open import dialog',
        category: 'global',
        key: 'i',
        modifiers: ['ctrl', 'shift'],
        action: {
          type: 'import',
          handler: this.createImportHandler()
        },
        context: ['global'],
        enabled: true,
        global: true,
        priority: 10,
        preventDefault: true,
        stopPropagation: false,
        allowInInputs: false,
        customizable: true
      }
    ];
  }

  /**
   * Handler factory methods
   */
  private createNavigationHandler(path: string): ShortcutHandler {
    return async () => {
      // This would integrate with your router
      console.log(`Navigate to: ${path}`);
      if (typeof window !== 'undefined' && window.history) {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    };
  }

  private createHistoryHandler(direction: 'back' | 'forward'): ShortcutHandler {
    return async () => {
      if (typeof window !== 'undefined' && window.history) {
        if (direction === 'back') {
          window.history.back();
        } else {
          window.history.forward();
        }
      }
    };
  }

  private createFocusHandler(selector: string): ShortcutHandler {
    return async () => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        element.focus();
        if (element instanceof HTMLInputElement) {
          element.select();
        }
      }
    };
  }

  private createTaskHandler(action: string): ShortcutHandler {
    return async () => {
      console.log(`Task action: ${action}`);
      // This would integrate with your task management system
      // Example: dispatch action to create new task
    };
  }

  private createNotebookHandler(action: string): ShortcutHandler {
    return async () => {
      console.log(`Notebook action: ${action}`);
      // This would integrate with your notebook management system
    };
  }

  private createEditHandler(): ShortcutHandler {
    return async () => {
      // Find focused or selected item and enter edit mode
      const focusedElement = document.activeElement;
      if (focusedElement) {
        // Trigger edit action
        const editButton = focusedElement.querySelector('[data-action="edit"]') as HTMLElement;
        if (editButton) {
          editButton.click();
        }
      }
    };
  }

  private createDeleteHandler(): ShortcutHandler {
    return async () => {
      // Confirm and delete selected items
      if (window.confirm('Are you sure you want to delete the selected item(s)?')) {
        console.log('Delete confirmed');
        // This would integrate with your deletion logic
      }
    };
  }

  private createDuplicateHandler(): ShortcutHandler {
    return async () => {
      console.log('Duplicate item');
      // This would integrate with your duplication logic
    };
  }

  private createSelectionHandler(type: 'all' | 'none' | 'invert'): ShortcutHandler {
    return async () => {
      console.log(`Selection: ${type}`);
      // This would integrate with your selection management
      // Example: dispatch action to bulk operations system
    };
  }

  private createArrowNavigationHandler(direction: 'up' | 'down'): ShortcutHandler {
    return async (event) => {
      // Handle arrow key navigation in lists
      const currentElement = event.target as Element;
      const listContainer = currentElement.closest('[role="listbox"], [role="grid"], .task-list, .notebook-list');
      
      if (listContainer) {
        const items = Array.from(listContainer.querySelectorAll('[role="option"], [tabindex], .task-item, .notebook-item'));
        const currentIndex = items.indexOf(currentElement);
        
        if (currentIndex !== -1) {
          const nextIndex = direction === 'up' 
            ? Math.max(0, currentIndex - 1)
            : Math.min(items.length - 1, currentIndex + 1);
          
          const nextItem = items[nextIndex] as HTMLElement;
          if (nextItem) {
            nextItem.focus();
          }
        }
      }
    };
  }

  private createToggleHandler(type: string): ShortcutHandler {
    return async () => {
      console.log(`Toggle: ${type}`);
      // This would integrate with your UI state management
      // Example: dispatch action to toggle sidebar visibility
    };
  }

  private createZoomHandler(direction: 'in' | 'out'): ShortcutHandler {
    return async () => {
      const currentZoom = parseFloat((document.body.style as any).zoom) || 1;
      const increment = 0.1;
      const newZoom = direction === 'in' 
        ? Math.min(2, currentZoom + increment)
        : Math.max(0.5, currentZoom - increment);
      
      (document.body.style as any).zoom = newZoom.toString();
    };
  }

  private createSearchHandler(type: string): ShortcutHandler {
    return async () => {
      console.log(`Search: ${type}`);
      // This would integrate with your search system
      // Example: open search modal, focus search input, etc.
    };
  }

  private createTaskStatusHandler(status: string): ShortcutHandler {
    return async () => {
      console.log(`Task status: ${status}`);
      // This would integrate with your task status management
    };
  }

  private createTaskPriorityHandler(priority: string): ShortcutHandler {
    return async () => {
      console.log(`Task priority: ${priority}`);
      // This would integrate with your task priority management
    };
  }

  private createHelpHandler(): ShortcutHandler {
    return async () => {
      // Show help modal or tooltip
      console.log('Show help');
      // This would trigger help system
    };
  }

  private createShortcutsModalHandler(): ShortcutHandler {
    return async () => {
      // Show keyboard shortcuts modal
      console.log('Show shortcuts modal');
      // This would trigger shortcuts modal
    };
  }

  private createRefreshHandler(): ShortcutHandler {
    return async () => {
      // Let browser handle refresh, or implement custom refresh logic
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    };
  }

  private createExportHandler(): ShortcutHandler {
    return async () => {
      console.log('Open export dialog');
      // This would integrate with export/import system
    };
  }

  private createImportHandler(): ShortcutHandler {
    return async () => {
      console.log('Open import dialog');
      // This would integrate with export/import system
    };
  }
}
