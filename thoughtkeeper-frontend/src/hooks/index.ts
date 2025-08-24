/**
 * Hooks Module
 * Central export for all custom hooks in ThoughtKeeper
 */

// Core hooks
export { useNotebooks } from './useNotebooks';
export { useTasks } from './useTasks';
export { useUI } from './useUI';

// Feature hooks will be added as they're implemented
// These will be imported from their respective feature modules when needed:
// export { useDragDrop } from '../features/DragDrop';
// export { useBulkOperations } from '../features/BulkOperations';
// export { useAdvancedSearch } from '../features/AdvancedSearch';

export type {
  // Add hook return types here if needed
} from '../types';
