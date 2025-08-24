import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Plus
} from 'lucide-react';

/**
 * NotebookDetail - Detailed view for a specific notebook
 * 
 * Features:
 * - Notebook statistics and progress indicators
 * - Recent activity timeline
 * - Quick actions and task creation
 * - Visual progress bars and charts
 * - Responsive layout for different screen sizes
 * - Smooth animations and transitions
 */

interface NotebookDetailProps {
  notebook: {
    id: string;
    name: string;
    notebookType: string;
    icon: React.ComponentType<any>;
    color: string;
    taskCount: number;
    urgentCount: number;
    isActive: boolean;
  };
}

const NotebookDetail: React.FC<NotebookDetailProps> = ({ notebook }) => {
  const IconComponent = notebook.icon;
  
  // Mock data for demonstration
  const stats = {
    total: notebook.taskCount,
    completed: Math.floor(notebook.taskCount * 0.6),
    pending: Math.floor(notebook.taskCount * 0.3),
    urgent: notebook.urgentCount,
    overdue: Math.floor(notebook.urgentCount * 0.5)
  };
  
  const progress = Math.round((stats.completed / stats.total) * 100);
  
  const recentActivity = [
    { id: 1, action: 'completed', task: 'Review quarterly reports', time: '2 hours ago' },
    { id: 2, action: 'created', task: 'Schedule client meeting', time: '4 hours ago' },
    { id: 3, action: 'updated', task: 'Update project timeline', time: '6 hours ago' }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Notebook Header */}
      <div className="flex-shrink-0 p-6 pb-4">
        <motion.div 
          className="flex items-center gap-3 mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: notebook.color }}
          >
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">{notebook.name}</h3>
            <p className="text-sm text-text-secondary">{stats.total} tasks total</p>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-secondary">Progress</span>
            <span className="text-sm font-bold text-text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="h-2 rounded-full"
              style={{ backgroundColor: notebook.color }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          className="grid grid-cols-2 gap-3 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-text-secondary">Completed</span>
            </div>
            <span className="text-lg font-bold text-text-primary">{stats.completed}</span>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-medium text-text-secondary">Pending</span>
            </div>
            <span className="text-lg font-bold text-text-primary">{stats.pending}</span>
          </div>
          
          {stats.urgent > 0 && (
            <div className="bg-red-50 rounded-lg p-3 col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-xs font-medium text-red-600">Urgent Tasks</span>
              </div>
              <span className="text-lg font-bold text-red-600">{stats.urgent}</span>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="flex gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <button className="flex-1 flex items-center justify-center gap-2 bg-accent-1 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Task
          </button>
          <button className="flex items-center justify-center gap-2 bg-gray-100 text-text-primary py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            <Calendar className="w-4 h-4" />
            Schedule
          </button>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Recent Activity
            </h4>
            
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    activity.action === 'completed' ? 'bg-green-500' :
                    activity.action === 'created' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary font-medium truncate">
                      {activity.task}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {activity.action} • {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NotebookDetail;
