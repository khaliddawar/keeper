/**
 * BulkOperations Feature
 * Provides multi-selection and batch operations functionality
 */

// Components
export { default as BulkOperationsProvider } from './BulkOperationsProvider';
export { default as BulkActionToolbar } from './components/BulkActionToolbar';
export { default as SelectionCheckbox } from './components/SelectionCheckbox';

// Hooks
export { useBulkOperations } from './hooks/useBulkOperations';

// Types
export type {
  SelectableItem,
  SelectionItem,
  BulkAction,
  BulkActionGroup,
  BulkActionResult,
  BulkOperationContext,
  BulkOperationsConfig
} from './types';

// Presets and Utilities
export {
  createDeleteAction,
  createArchiveAction,
  createRestoreAction,
  createCompleteAction,
  createIncompleteAction,
  createPriorityChangeAction,
  createExportAction,
  createDefaultActionGroups,
  getCommonBulkActions,
  getTaskBulkActions,
  getNotebookBulkActions,
  createTaskSelectionItem,
  createNotebookSelectionItem
} from './presets';
