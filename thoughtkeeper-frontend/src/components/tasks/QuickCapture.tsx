import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Calendar, Flag, Tag } from 'lucide-react';
import Button from '../ui/Button';

/**
 * QuickCapture - Quick task creation component
 * 
 * Features:
 * - Floating input for rapid task creation
 * - Smart parsing for dates, priorities, and tags
 * - Keyboard shortcuts and accessibility
 * - Auto-focus and escape handling
 * - Expandable form for additional details
 */

interface QuickCaptureProps {
  onSubmit: (taskTitle: string, details?: any) => void;
  onCancel: () => void;
  autoFocus?: boolean;
  className?: string;
}

const QuickCapture: React.FC<QuickCaptureProps> = ({
  onSubmit,
  onCancel,
  autoFocus = false,
  className = ''
}) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedNotebook, setSelectedNotebook] = useState('work');
  const [dueDate, setDueDate] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskTitle.trim()) return;
    
    const taskDetails = {
      title: taskTitle.trim(),
      priority: selectedPriority,
      notebook: selectedNotebook,
      dueDate: dueDate || undefined
    };
    
    onSubmit(taskTitle.trim(), taskDetails);
    setTaskTitle('');
    setIsExpanded(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };
  
  const priorities = [
    { id: 'low', label: 'Low', color: '#10B981' },
    { id: 'medium', label: 'Medium', color: '#F59E0B' },
    { id: 'high', label: 'High', color: '#EF4444' }
  ];
  
  const notebooks = [
    { id: 'work', label: 'Work', color: '#3B82F6' },
    { id: 'personal', label: 'Personal', color: '#10B981' },
    { id: 'health', label: 'Health', color: '#EF4444' },
    { id: 'hustles', label: 'Hustles', color: '#F59E0B' },
    { id: 'ideas', label: 'Ideas', color: '#8B5CF6' }
  ];

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden ${className}`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <form onSubmit={handleSubmit}>
        {/* Main Input */}
        <div className="p-4">
          <div className="flex items-center gap-3">
            <Plus className="w-5 h-5 text-accent-1 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What needs to be done?"
              className="flex-1 text-base placeholder-text-tertiary focus:outline-none"
            />
            <button
              type="button"
              onClick={onCancel}
              className="p-1 text-text-tertiary hover:text-text-primary rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expanded Options */}
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100 p-4 space-y-4"
          >
            {/* Priority Selection */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                <Flag className="inline w-4 h-4 mr-1" />
                Priority
              </label>
              <div className="flex gap-2">
                {priorities.map((priority) => (
                  <button
                    key={priority.id}
                    type="button"
                    onClick={() => setSelectedPriority(priority.id as any)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedPriority === priority.id
                        ? 'text-white'
                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                    }`}
                    style={{
                      backgroundColor: selectedPriority === priority.id ? priority.color : undefined
                    }}
                  >
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notebook Selection */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                <Tag className="inline w-4 h-4 mr-1" />
                Notebook
              </label>
              <div className="flex gap-2 flex-wrap">
                {notebooks.map((notebook) => (
                  <button
                    key={notebook.id}
                    type="button"
                    onClick={() => setSelectedNotebook(notebook.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedNotebook === notebook.id
                        ? 'text-white'
                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                    }`}
                    style={{
                      backgroundColor: selectedNotebook === notebook.id ? notebook.color : undefined
                    }}
                  >
                    {notebook.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-1 focus:border-transparent text-sm"
              />
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            {isExpanded ? 'Less options' : 'More options'}
          </button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!taskTitle.trim()}
            >
              Add Task
            </Button>
          </div>
        </div>

        {/* Keyboard Hints */}
        <div className="px-4 pb-2 text-xs text-text-tertiary">
          <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono">Ctrl+Enter</kbd> to save, 
          <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono ml-1">Esc</kbd> to cancel
        </div>
      </form>
    </motion.div>
  );
};

export default QuickCapture;
