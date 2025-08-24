import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  CheckSquare, 
  Calendar, 
  Brain, 
  Settings,
  Briefcase,
  Heart,
  TrendingUp,
  Lightbulb,
  Smartphone,
  MessageSquare,
  Clock
} from 'lucide-react';

/**
 * Sidebar - Collapsible navigation component
 * 
 * Features:
 * - 64px collapsed → 240px expanded on hover
 * - Connection status indicator with real-time updates
 * - Main navigation sections (Dashboard, Tasks, Calendar, etc.)
 * - AI Agents section with status indicators
 * - Quick notebook access with icons and colors
 * - Optimized spacing and typography
 * - Smooth animations and transitions
 * - Custom scrollbar styling
 * - Mobile-safe behavior (no expansion on mobile)
 */

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  active?: boolean;
  badge?: number;
}

interface NotebookItem {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  taskCount: number;
}

interface AgentItem {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'processing';
  lastActivity?: string;
}

const Sidebar: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
  
  // Main navigation items
  const navigationItems: NavigationItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/', active: true },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, href: '/tasks', badge: 12 },
    { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/calendar' },
    { id: 'memories', label: 'Memories', icon: Brain, href: '/memories' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' }
  ];
  
  // AI Agents with status
  const agents: AgentItem[] = [
    { id: 'scheduler', name: 'Scheduler', status: 'connected', lastActivity: '2 min ago' },
    { id: 'classifier', name: 'Classifier', status: 'processing' },
    { id: 'memory', name: 'Memory', status: 'connected', lastActivity: '5 min ago' }
  ];
  
  // Quick notebook access
  const notebooks: NotebookItem[] = [
    { id: 'work', name: 'Work', icon: Briefcase, color: '#3B82F6', taskCount: 8 },
    { id: 'personal', name: 'Personal', icon: Home, color: '#10B981', taskCount: 5 },
    { id: 'health', name: 'Health', icon: Heart, color: '#EF4444', taskCount: 3 },
    { id: 'hustles', name: 'Hustles', icon: TrendingUp, color: '#F59E0B', taskCount: 4 },
    { id: 'ideas', name: 'Ideas', icon: Lightbulb, color: '#8B5CF6', taskCount: 7 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return '#10B981';
      case 'disconnected': return '#EF4444';
      case 'processing': return '#F59E0B';
      case 'reconnecting': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getStatusDotClass = (status: string) => {
    const baseClass = 'agent-dot';
    switch (status) {
      case 'connected': return `${baseClass}`;
      case 'disconnected': return `${baseClass} disconnected`;
      case 'processing': return `${baseClass} processing`;
      default: return baseClass;
    }
  };

  return (
    <motion.nav 
      className="sidebar"
      initial={{ x: -64 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Connection Status */}
      <div className="nav-section">
        <div className="nav-item status-connected cursor-default">
          <Smartphone className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs font-medium">Connected</span>
          <div 
            className={getStatusDotClass(connectionStatus)}
            style={{ backgroundColor: getStatusColor(connectionStatus) }}
          />
        </div>
      </div>

      {/* Main Navigation */}
      <div className="nav-section">
        <h3 className="section-title">Navigation</h3>
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <motion.a
              key={item.id}
              href={item.href}
              className={`nav-item ${item.active ? 'active' : ''}`}
              whileHover={{ backgroundColor: 'rgba(124, 58, 237, 0.08)' }}
              whileTap={{ scale: 0.98 }}
            >
              <IconComponent className="w-4 h-4" />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <motion.span
                  className="ml-auto bg-accent-1 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[20px] text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {item.badge}
                </motion.span>
              )}
            </motion.a>
          );
        })}
      </div>

      {/* AI Agents Section */}
      <div className="nav-section">
        <h3 className="section-title">AI Agents</h3>
        {agents.map((agent) => (
          <motion.div
            key={agent.id}
            className="nav-item cursor-pointer"
            whileHover={{ backgroundColor: 'rgba(124, 58, 237, 0.08)' }}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="font-medium">{agent.name}</span>
            <div className={getStatusDotClass(agent.status)} />
          </motion.div>
        ))}
      </div>

      {/* Quick Notebooks */}
      <div className="nav-section flex-1">
        <h3 className="section-title">Notebooks</h3>
        {notebooks.map((notebook) => {
          const IconComponent = notebook.icon;
          return (
            <motion.a
              key={notebook.id}
              href={`/notebooks/${notebook.id}`}
              className="nav-item"
              whileHover={{ backgroundColor: 'rgba(124, 58, 237, 0.08)' }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className="w-4 h-4 rounded flex items-center justify-center"
                style={{ backgroundColor: notebook.color }}
              >
                <IconComponent className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium">{notebook.name}</span>
              <span className="ml-auto text-xs text-text-tertiary font-medium">
                {notebook.taskCount}
              </span>
            </motion.a>
          );
        })}
      </div>

      {/* Bottom Status */}
      <div className="nav-section mt-auto">
        <div className="nav-item cursor-default opacity-75">
          <Clock className="w-4 h-4" />
          <span className="text-xs">Last sync: 2m ago</span>
        </div>
      </div>
    </motion.nav>
  );
};

export default Sidebar;
