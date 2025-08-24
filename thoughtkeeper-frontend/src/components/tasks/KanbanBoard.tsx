import React from 'react';
import { motion } from 'framer-motion';
import { Columns, Plus } from 'lucide-react';

/**
 * KanbanBoard - Kanban view for tasks
 * 
 * Placeholder component for the kanban board view.
 * Will be fully implemented in next development phase.
 */

const KanbanBoard: React.FC = () => {
  const columns = [
    { id: 'todo', title: 'To Do', count: 5, color: '#F59E0B' },
    { id: 'progress', title: 'In Progress', count: 3, color: '#3B82F6' },
    { id: 'review', title: 'Review', count: 2, color: '#8B5CF6' },
    { id: 'done', title: 'Done', count: 8, color: '#10B981' }
  ];

  return (
    <div className="h-full p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        <div className="flex items-center gap-3 mb-6">
          <Columns className="w-6 h-6 text-accent-1" />
          <h3 className="text-lg font-semibold text-text-primary">Kanban Board</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
          {columns.map((column, index) => (
            <motion.div
              key={column.id}
              className="bg-gray-50 rounded-lg p-4 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  <h4 className="font-medium text-text-primary">{column.title}</h4>
                  <span 
                    className="px-2 py-1 text-xs font-bold rounded-full bg-white text-text-secondary"
                  >
                    {column.count}
                  </span>
                </div>
                
                <button className="p-1 hover:bg-white rounded text-text-secondary hover:text-text-primary">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {/* Column Content */}
              <div className="flex-1 space-y-3">
                {/* Placeholder cards */}
                {Array.from({ length: Math.min(column.count, 3) }).map((_, cardIndex) => (
                  <motion.div
                    key={cardIndex}
                    className="bg-white rounded-lg p-3 shadow-sm border border-gray-100"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: (index * 0.1) + (cardIndex * 0.05) }}
                  >
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                  </motion.div>
                ))}
                
                {column.count > 3 && (
                  <div className="text-xs text-text-tertiary text-center py-2">
                    +{column.count - 3} more tasks
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8 text-center text-text-secondary">
          <p className="text-sm">Kanban Board implementation in progress...</p>
          <p className="text-xs mt-1">Drag & drop functionality coming soon</p>
        </div>
      </motion.div>
    </div>
  );
};

export default KanbanBoard;
