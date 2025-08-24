/**
 * Drag & Drop Feature - Complete drag and drop system
 * 
 * Provides a comprehensive, accessible drag and drop solution with:
 * - Touch and keyboard support
 * - Visual feedback and animations
 * - Accessibility compliance
 * - Performance optimization
 * - Flexible configuration
 * 
 * Usage Example:
 * ```tsx
 * import { DragDropProvider, useDragDrop, DragPreview } from '@/features/DragDrop';
 * 
 * function App() {
 *   return (
 *     <DragDropProvider>
 *       <TaskList />
 *       <DragPreview />
 *     </DragDropProvider>
 *   );
 * }
 * 
 * function TaskList() {
 *   const { getDragProps, getDropProps } = useDragDrop();
 *   
 *   return (
 *     <div {...getDropProps(taskListDropZone)}>
 *       {tasks.map(task => (
 *         <div key={task.id} {...getDragProps(createTaskDragItem(task))}>
 *           {task.title}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

// Core provider and context
export { DragDropProvider, useDragDropContext } from './DragDropProvider';

// Main hook
export { useDragDrop } from './hooks/useDragDrop';

// Visual feedback components
export { DragPreview, TouchDragPreview } from './components/DragPreview';
export { 
  DropZoneIndicator, 
  DropZoneHighlight, 
  OrderedDropZone 
} from './components/DropZoneIndicator';

// Types and interfaces
export type {
  DragType,
  DropEffect,
  DropZoneType,
  DragItem,
  DropZone,
  DragState,
  DropResult,
  DragDropHandlers,
  KeyboardDragSupport,
  DragVisualFeedback,
  TouchDragSupport,
  DragDropConfig,
  DragDropContextState,
  UseDragDropReturn,
  TaskDragItem,
  NotebookDragItem,
  NotebookDropZone,
  TaskListDropZone
} from './types';

// Default configuration
export { DEFAULT_DRAG_DROP_CONFIG } from './types';

// Utility functions and helpers
export * from './utils';

// Pre-built drag item creators
export * from './presets';
