import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Home, 
  Heart, 
  TrendingUp, 
  Lightbulb,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import FileTabs from '../notebooks/FileTabs';
import NotebookDetail from '../notebooks/NotebookDetail';

/**
 * RightPanel - File tab navigation and notebook details
 * 
 * Features:
 * - Professional file tab system with stacking effect
 * - Color-coded tabs per notebook type
 * - Smooth tab transitions and animations
 * - Notebook detail view with statistics
 * - Responsive behavior (collapsible on mobile)
 * - Overflow handling for many tabs
 * - Active tab prominence with enhanced shadows
 */

interface TabData {
  id: string;
  name: string;
  notebookType: 'work' | 'personal' | 'health' | 'hustles' | 'ideas';
  icon: React.ComponentType<any>;
  color: string;
  taskCount: number;
  urgentCount: number;
  isActive: boolean;
}

const RightPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('work');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  
  // Tab data matching our notebook system
  const tabs: TabData[] = [
    {
      id: 'work',
      name: 'Work',
      notebookType: 'work',
      icon: Briefcase,
      color: '#3B82F6',
      taskCount: 12,
      urgentCount: 3,
      isActive: activeTab === 'work'
    },
    {
      id: 'personal',
      name: 'Personal',
      notebookType: 'personal',
      icon: Home,
      color: '#10B981',
      taskCount: 8,
      urgentCount: 1,
      isActive: activeTab === 'personal'
    },
    {
      id: 'health',
      name: 'Health',
      notebookType: 'health',
      icon: Heart,
      color: '#EF4444',
      taskCount: 5,
      urgentCount: 2,
      isActive: activeTab === 'health'
    },
    {
      id: 'hustles',
      name: 'Hustles',
      notebookType: 'hustles',
      icon: TrendingUp,
      color: '#F59E0B',
      taskCount: 15,
      urgentCount: 5,
      isActive: activeTab === 'hustles'
    },
    {
      id: 'ideas',
      name: 'Ideas',
      notebookType: 'ideas',
      icon: Lightbulb,
      color: '#8B5CF6',
      taskCount: 22,
      urgentCount: 0,
      isActive: activeTab === 'ideas'
    }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  if (isCollapsed) {
    return (
      <motion.aside 
        className="w-12 bg-bg-secondary border-l border-gray-100 flex flex-col items-center py-4"
        initial={{ width: 320 }}
        animate={{ width: 48 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <motion.button
          className="p-2 hover:bg-gray-100 rounded-lg"
          onClick={() => setIsCollapsed(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MoreHorizontal className="w-5 h-5 text-text-secondary" />
        </motion.button>
      </motion.aside>
    );
  }

  return (
    <motion.aside 
      className="w-80 bg-bg-secondary border-l border-gray-100 flex flex-col"
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
    >
      {/* Tab Navigation */}
      <div className="flex-shrink-0 p-4 pb-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Notebooks</h2>
          <div className="flex items-center gap-2">
            <motion.button
              className="p-1.5 hover:bg-gray-100 rounded-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4 text-text-secondary" />
            </motion.button>
            <motion.button
              className="p-1.5 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsCollapsed(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MoreHorizontal className="w-4 h-4 text-text-secondary" />
            </motion.button>
          </div>
        </div>
        
        {/* File Tabs */}
        <FileTabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabClick={handleTabClick} 
        />
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTabData && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <NotebookDetail notebook={activeTabData} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};

export default RightPanel;
