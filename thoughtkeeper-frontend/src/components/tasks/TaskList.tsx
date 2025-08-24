import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

/**
 * TaskList - List view for tasks
 * 
 * Placeholder component for the task list view.
 * Will be fully implemented in next development phase.
 */

const TaskList: React.FC = () => {
  // Mock task data for demonstration
  const mockTasks = [
    {
      id: '1',
      title: 'Review quarterly reports',
      description: 'Analyze Q4 performance metrics and prepare summary',
      priority: 'high',
      status: 'pending',
      dueDate: 'Today 4:00 PM',
      notebook: 'Work',
      notebookColor: '#3B82F6'
    },
    {
      id: '2',
      title: 'Schedule client meeting',
      description: 'Set up next week\'s strategy session',
      priority: 'medium',
      status: 'in-progress',
      dueDate: 'Tomorrow',
      notebook: 'Work',
      notebookColor: '#3B82F6'
    },
    {
      id: '3',
      title: 'Update fitness routine',
      description: 'Plan new workout schedule for next month',
      priority: 'low',
      status: 'pending',
      dueDate: 'Next week',
      notebook: 'Health',
      notebookColor: '#EF4444'
    }
  ];

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  return (
    <div className="h-full p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-text-primary mb-4">Task List View</h3>
        
        <div className="space-y-3">
          {mockTasks.map((task, index) => (
            <motion.div
              key={task.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getPriorityIcon(task.priority)}
                    <h4 className="font-medium text-text-primary">{task.title}</h4>
                    <span 
                      className="px-2 py-1 text-xs font-medium rounded-full"
                      style={{ 
                        backgroundColor: `${task.notebookColor}20`,
                        color: task.notebookColor
                      }}
                    >
                      {task.notebook}
                    </span>
                  </div>
                  
                  <p className="text-sm text-text-secondary mb-2">{task.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-text-tertiary">
                    <span>Due: {task.dueDate}</span>
                    <span className="capitalize">Status: {task.status.replace('-', ' ')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8 text-center text-text-secondary">
          <p className="text-sm">Task List implementation in progress...</p>
          <p className="text-xs mt-1">Full features coming in next development phase</p>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskList;
