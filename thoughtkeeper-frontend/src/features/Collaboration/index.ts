// Barrel export for Collaboration feature

// Core functionality
export { CollaborationEngine } from './CollaborationEngine';
export { CollaborationProvider } from './CollaborationProvider';

// Hooks for consuming components
export {
  useCollaboration,
  usePresence,
  useCollaborativeEditing,
  useConflictResolution
} from './CollaborationProvider';

// Components
export * from './components';

// Demo component
export { CollaborationDemo } from './demo/CollaborationDemo';

// Types
export type * from './types';
