/**
 * Store Exports - Comprehensive State Management System
 * 
 * Provides centralized access to all Zustand stores with their initialization functions
 */

// Store exports
export { useNotebooksStore, initializeNotebooksStore } from './notebooksStore';
export { useTasksStore, initializeTasksStore } from './tasksStore';
export { useUIStore } from './uiStore';

// Legacy store exports for backwards compatibility (if needed)
export { useNotebookStore } from './notebookStore';
export { useTaskStore } from './taskStore';

// Type exports
export type { 
  Toast, 
  Modal, 
  KeyboardShortcut, 
  ThemeMode, 
  ViewMode 
} from './uiStore';

// Import the initialization functions directly
import { initializeNotebooksStore as initNotebooks } from './notebooksStore';
import { initializeTasksStore as initTasks } from './tasksStore';
import { useNotebooksStore as notebooksStore } from './notebooksStore';
import { useTasksStore as tasksStore } from './tasksStore';
import { useUIStore as uiStore } from './uiStore';

// Initialize all stores function
export const initializeStores = async () => {
  try {
    await Promise.all([
      initNotebooks(),
      initTasks()
    ]);
    console.log('✅ All stores initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize stores:', error);
  }
};

// Store cleanup function (useful for testing or hot reload)
export const cleanupStores = () => {
  // Clear any timeouts or subscriptions if needed
  console.log('🧹 Stores cleaned up');
};

// Development utilities
if (process.env.NODE_ENV === 'development') {
  (window as any).stores = {
    notebooks: notebooksStore,
    tasks: tasksStore,
    ui: uiStore,
    initializeAll: initializeStores,
    cleanup: cleanupStores
  };
  
  console.log('🛠️ Store utilities available at window.stores');
}