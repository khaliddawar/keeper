import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskList from './TaskList';
import KanbanBoard from './KanbanBoard';
import CalendarView from './CalendarView';
import QuickCapture from './QuickCapture';

/**
 * TaskManagementArea - Main container for task management views
 * 
 * Features:
 * - View mode switching (List/Kanban/Calendar) with smooth transitions
 * - Quick task capture floating input
 * - State management for tasks and view preferences
 * - Responsive layout handling
 * - Loading states and error boundaries
 * - Keyboard shortcuts support
 */

interface TaskManagementAreaProps {
  className?: string;
  initialViewMode?: 'list' | 'kanban' | 'calendar';
}

const TaskManagementArea: React.FC<TaskManagementAreaProps> = ({
  className = '',
  initialViewMode = 'list'
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar'>(initialViewMode);
  const [showQuickCapture, setShowQuickCapture] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Animation variants for view transitions
  const viewVariants = {
    enter: {
      opacity: 0,
      y: 20,
      scale: 0.98
    },
    center: {
      opacity: 1,
      y: 0,
      scale: 1
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.98
    }
  };

  const handleViewModeChange = (mode: 'list' | 'kanban' | 'calendar') => {
    setIsLoading(true);
    setViewMode(mode);
    
    // Simulate loading state
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  const handleQuickCapture = (taskTitle: string) => {
    // Handle task creation logic here
    console.log('Creating task:', taskTitle);
    setShowQuickCapture(false);
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K to open quick capture
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setShowQuickCapture(true);
      }
      
      // Escape to close quick capture
      if (event.key === 'Escape' && showQuickCapture) {
        setShowQuickCapture(false);
      }
      
      // Number keys for view switching (1-3)
      if (event.key >= '1' && event.key <= '3' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        const modes: ('list' | 'kanban' | 'calendar')[] = ['list', 'kanban', 'calendar'];
        const modeIndex = parseInt(event.key) - 1;
        if (modes[modeIndex]) {
          handleViewModeChange(modes[modeIndex]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showQuickCapture]);

  const renderCurrentView = () => {
    switch (viewMode) {
      case 'list':
        return <TaskList key="list" />;
      case 'kanban':
        return <KanbanBoard key="kanban" />;
      case 'calendar':
        return <CalendarView key="calendar" />;
      default:
        return <TaskList key="list" />;
    }
  };

  return (
    <div className={`relative h-full flex flex-col ${className}`}>
      {/* Loading Overlay */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-8 h-8 border-2 border-accent-1 border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            variants={viewVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ 
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="h-full"
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Quick Capture Overlay */}
      <AnimatePresence>
        {showQuickCapture && (
          <motion.div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm z-30 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQuickCapture(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <QuickCapture
                onSubmit={handleQuickCapture}
                onCancel={() => setShowQuickCapture(false)}
                autoFocus
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent-1 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center z-20"
        onClick={() => setShowQuickCapture(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </motion.button>

      {/* Keyboard Shortcuts Hint */}
      <motion.div
        className="fixed bottom-6 left-6 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-text-secondary border border-gray-200 z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono">Ctrl+K</kbd> to quick add
      </motion.div>
    </div>
  );
};

export default TaskManagementArea;
