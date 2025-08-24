import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  List, 
  Columns, 
  Calendar, 
  Smartphone,
  User,
  Bell,
  Search,
  Filter
} from 'lucide-react';

/**
 * TaskHeader - Main header for task management area
 * 
 * Features:
 * - "Tasks" title with task count badge (optimized typography)
 * - View mode toggles (List/Kanban/Calendar) with text-sm labels
 * - Telegram connection status indicator (text-xs)
 * - User profile and notification buttons
 * - Search and filter capabilities
 * - Responsive layout with proper spacing
 */

interface TaskHeaderProps {
  className?: string;
  totalTasks?: number;
  viewMode?: 'list' | 'kanban' | 'calendar';
  onViewModeChange?: (mode: 'list' | 'kanban' | 'calendar') => void;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({
  className = '',
  totalTasks = 24,
  viewMode = 'list',
  onViewModeChange
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
  
  const viewModes = [
    { id: 'list', label: 'List', icon: List },
    { id: 'kanban', label: 'Kanban', icon: Columns },
    { id: 'calendar', label: 'Calendar', icon: Calendar }
  ];

  const getTelegramStatusColor = () => {
    switch (telegramStatus) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-red-600';
      case 'reconnecting': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getTelegramStatusText = () => {
    switch (telegramStatus) {
      case 'connected': return 'Last: 2 min ago';
      case 'disconnected': return 'Disconnected';
      case 'reconnecting': return 'Reconnecting...';
      default: return 'Unknown';
    }
  };

  const handleViewModeClick = (mode: 'list' | 'kanban' | 'calendar') => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  return (
    <motion.div 
      className={`flex items-center justify-between p-6 ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Left Section - Title and View Controls */}
      <div className="flex items-center gap-4">
        {/* Task Title and Count */}
        <div className="flex items-center gap-3">
          <CheckSquare className="w-6 h-6 text-accent-1" />
          <h1 className="text-lg font-semibold text-text-primary">Tasks</h1>
          <motion.span 
            className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
          >
            {totalTasks}
          </motion.span>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center gap-2 ml-8">
          {viewModes.map((mode) => {
            const IconComponent = mode.icon;
            const isActive = viewMode === mode.id;
            
            return (
              <motion.button
                key={mode.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-accent-1 text-white shadow-sm' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-gray-100'
                }`}
                onClick={() => handleViewModeClick(mode.id as 'list' | 'kanban' | 'calendar')}
                whileHover={{ scale: isActive ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-sm">{mode.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Right Section - Status and Actions */}
      <div className="flex items-center gap-4">
        {/* Search Toggle */}
        <motion.button
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-lg"
          onClick={() => setSearchOpen(!searchOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Search className="w-5 h-5" />
        </motion.button>

        {/* Filter Button */}
        <motion.button
          className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Filter className="w-5 h-5" />
        </motion.button>

        {/* Telegram Status */}
        <motion.div 
          className={`flex items-center gap-2 text-xs font-medium ${getTelegramStatusColor()}`}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Smartphone className="w-4 h-4" />
          <span>{getTelegramStatusText()}</span>
        </motion.div>

        {/* User Actions */}
        <div className="flex items-center gap-2">
          <motion.button
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-full relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <User className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-full relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-5 h-5" />
            {/* Notification Badge */}
            <motion.span 
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
            />
          </motion.button>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <motion.div
          className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 p-4 z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-1 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TaskHeader;
